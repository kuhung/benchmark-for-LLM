import { Endpoint, RawResult } from './types'
import { parseSSEStream } from './sse-parser'

const DEFAULT_TIMEOUT = 60_000

export async function runSingleBenchmark(
  endpoint: Endpoint,
  prompt: string,
  maxTokens: number,
  signal?: AbortSignal,
  onToken?: (timestamp: number) => void
): Promise<RawResult> {
  const tokenTimestamps: number[] = []
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

    const response = await fetch(`${endpoint.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: endpoint.modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        endpointId: endpoint.id,
        requestStart,
        tokenTimestamps: [],
        outputTokenCount: 0,
        status: 'error',
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const reader = response.body!.getReader()
    for await (const _token of parseSSEStream(reader)) {
      const ts = performance.now()
      tokenTimestamps.push(ts)
      onToken?.(ts)
    }

    return {
      endpointId: endpoint.id,
      requestStart,
      tokenTimestamps,
      outputTokenCount: tokenTimestamps.length,
      status: 'success',
    }
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === 'AbortError'
    return {
      endpointId: endpoint.id,
      requestStart,
      tokenTimestamps,
      outputTokenCount: tokenTimestamps.length,
      status: isTimeout ? 'timeout' : 'error',
      error: err instanceof Error ? err.message : String(err),
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
