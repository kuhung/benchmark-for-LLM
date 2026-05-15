function extractContent(json: unknown): string | undefined {
  const obj = json as Record<string, unknown>
  const choices = obj?.choices as Array<Record<string, unknown>> | undefined
  if (!choices || choices.length === 0) return undefined

  const first = choices[0]
  const delta = first?.delta as Record<string, unknown> | undefined
  const message = first?.message as Record<string, unknown> | undefined

  return (
    (delta?.content as string) ??
    (message?.content as string) ??
    (delta?.text as string) ??
    (message?.text as string) ??
    (first?.text as string)
  ) || undefined
}

export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  let yieldedAny = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

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

      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed)
          const content = extractContent(parsed)
          if (content) {
            yieldedAny = true
            yield content
          }
        } catch {
          // not valid NDJSON line
        }
      }
    }
  }

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
        const content = extractContent(parsed)
        if (content) {
          yieldedAny = true
          yield content
        }
      } catch {
        // skip
      }
    }
  }

  if (!yieldedAny) {
    console.warn('[sse-parser] No content chunks were extracted from the stream response.')
  }
}
