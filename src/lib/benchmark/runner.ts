import { Endpoint, RawResult } from './types'
import { parseSSEStream } from './sse-parser'

const DEFAULT_TIMEOUT = 60_000

export interface RunOptions {
  thinkingEnabled?: boolean
}

export async function runSingleBenchmark(
  endpoint: Endpoint,
  prompt: string,
  maxTokens: number,
  signal?: AbortSignal,
  onToken?: (timestamp: number) => void,
  options?: RunOptions
): Promise<RawResult> {
  const tokenTimestamps: number[] = []
  const chunkSizes: number[] = []
  const requestStart = performance.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

    if (signal) {
      signal.addEventListener('abort', () => controller.abort())
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (endpoint.apiKey) {
      headers['Authorization'] = `Bearer ${endpoint.apiKey}`
    }

    const body: Record<string, unknown> = {
      model: endpoint.modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      stream: true,
    }
    // Ollama: "think" (top-level); OpenAI: "reasoning_effort"
    if (options?.thinkingEnabled === false) {
      body.think = false
      body.reasoning_effort = 'none'
    }

    const response = await fetch(`${endpoint.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorBody = ''
      try { errorBody = await response.text() } catch { /* ignore */ }
      const requestEnd = performance.now()
      return {
        endpointId: endpoint.id,
        requestStart,
        requestEnd,
        tokenTimestamps: [],
        outputTokenCount: 0,
        status: 'error',
        error: `HTTP ${response.status}: ${response.statusText}${errorBody ? ` - ${errorBody.slice(0, 200)}` : ''}`,
      }
    }

    const contentType = response.headers.get('content-type') || ''

    if (response.body) {
      const reader = response.body.getReader()
      for await (const chunk of parseSSEStream(reader)) {
        const ts = performance.now()
        tokenTimestamps.push(ts)
        chunkSizes.push(chunk.length)
        onToken?.(ts)
      }
    }

    return {
      endpointId: endpoint.id,
      requestStart,
      requestEnd: performance.now(),
      tokenTimestamps,
      outputTokenCount: tokenTimestamps.length,
      chunkSizes,
      status: 'success',
    }
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === 'AbortError'
    const requestEnd = performance.now()
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.warn(`[benchmark] ${endpoint.name} (${endpoint.modelId}): ${isTimeout ? 'timeout' : 'error'} - ${errorMsg}`)
    return {
      endpointId: endpoint.id,
      requestStart,
      requestEnd,
      tokenTimestamps,
      outputTokenCount: tokenTimestamps.length,
      status: isTimeout ? 'timeout' : 'error',
      error: errorMsg,
    }
  }
}

export async function checkConnectivity(endpoint: Endpoint): Promise<{ ok: boolean; error?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (endpoint.apiKey) headers['Authorization'] = `Bearer ${endpoint.apiKey}`

    const response = await fetch(`${endpoint.baseUrl}/v1/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10_000),
    })

    if (response.ok) return { ok: true }
    return { ok: false, error: `HTTP ${response.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function fetchModels(
  baseUrl: string,
  apiKey?: string
): Promise<{ ok: boolean; models: string[]; error?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const response = await fetch(`${baseUrl}/v1/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return { ok: false, models: [], error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    const models: string[] = (data.data ?? [])
      .map((m: { id?: string }) => m.id)
      .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)

    return { ok: true, models }
  } catch (err) {
    return { ok: false, models: [], error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
