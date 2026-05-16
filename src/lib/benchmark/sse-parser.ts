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
  const debugLines: string[] = []
  const MAX_DEBUG_LINES = 5

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (debugLines.length < MAX_DEBUG_LINES) {
        debugLines.push(trimmed.slice(0, 200))
      }

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

    if (debugLines.length < MAX_DEBUG_LINES) {
      debugLines.push(`[buffer] ${trimmed.slice(0, 200)}`)
    }

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
    console.warn(
      '[sse-parser] No content chunks extracted. First lines of response:\n' +
      debugLines.map((l, i) => `  ${i + 1}: ${l}`).join('\n')
    )
  }
}
