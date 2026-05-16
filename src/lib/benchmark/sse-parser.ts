function extractContent(json: unknown): string | undefined {
  if (!json || typeof json !== 'object') return undefined
  const obj = json as Record<string, unknown>

  // OpenAI standard: choices[0].delta.content / choices[0].message.content
  const choices = obj.choices as Array<Record<string, unknown>> | undefined
  if (choices && choices.length > 0) {
    const first = choices[0]
    const delta = first?.delta as Record<string, unknown> | undefined
    const message = first?.message as Record<string, unknown> | undefined
    const content = (
      (delta?.content as string) ??
      (message?.content as string) ??
      (delta?.text as string) ??
      (message?.text as string) ??
      (first?.text as string)
    )
    if (content) return content
  }

  // Ollama native format: top-level message.content
  const topMessage = obj.message as Record<string, unknown> | undefined
  if (topMessage?.content && typeof topMessage.content === 'string') {
    return topMessage.content
  }

  // Ollama native /api/generate: top-level response field
  if (obj.response && typeof obj.response === 'string') {
    return obj.response as string
  }

  // LM Studio event data: top-level content / delta.content
  if (obj.content && typeof obj.content === 'string') {
    return obj.content as string
  }
  const topDelta = obj.delta as Record<string, unknown> | undefined
  if (topDelta?.content && typeof topDelta.content === 'string') {
    return topDelta.content as string
  }

  return undefined
}

export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  let yieldedAny = false
  let rawOutput = ''
  const MAX_RAW_LENGTH = 2000

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunkStr = decoder.decode(value, { stream: true })
    if (rawOutput.length < MAX_RAW_LENGTH) {
      rawOutput += chunkStr
    }
    buffer += chunkStr
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Skip SSE event type declarations (LM Studio named events: "event: message.delta")
      if (trimmed.startsWith('event:') || trimmed.startsWith(':')) continue

      if (trimmed.startsWith('data:')) {
        const data = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = extractContent(parsed)
          if (content) {
            yieldedAny = true
            yield content
          }
        } catch {
          // skip malformed SSE JSON
        }
        continue
      }

      // NDJSON: bare JSON lines without data: prefix (Ollama format)
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed)
          // Ollama uses "done":true to signal end
          if (parsed.done === true) return
          const content = extractContent(parsed)
          if (content) {
            yieldedAny = true
            yield content
          }
        } catch {
          // not valid NDJSON line, might be partial - ignore
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.trim()) {
    const trimmed = buffer.trim()

    if (trimmed.startsWith('data:')) {
      const data = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5)
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data)
          const content = extractContent(parsed)
          if (content) {
            yieldedAny = true
            yield content
          }
        } catch {
          // skip
        }
      }
    } else if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed.done !== true) {
          const content = extractContent(parsed)
          if (content) {
            yieldedAny = true
            yield content
          }
        }
      } catch {
        // skip
      }
    }
  }

  if (!yieldedAny) {
    // Try to parse the entire raw output as a single JSON object (in case stream: true was ignored)
    try {
      const parsed = JSON.parse(rawOutput)
      const content = extractContent(parsed)
      if (content) {
        console.log('[sse-parser] Recovered content from non-streaming JSON response')
        yield content
        return
      }
    } catch {
      // Not a valid single JSON
    }

    const preview = rawOutput.slice(0, MAX_RAW_LENGTH)
    console.error('[sse-parser] No content chunks extracted. Raw response preview:\n' + preview)
    throw new Error(`No content chunks extracted. Raw response: ${preview || '<empty>'}`)
  }
}
