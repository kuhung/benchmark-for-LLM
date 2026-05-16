function nonEmptyString(val: unknown): string | undefined {
  return typeof val === 'string' && val.length > 0 ? val : undefined
}

function extractContent(json: unknown): string | undefined {
  if (!json || typeof json !== 'object') return undefined
  const obj = json as Record<string, unknown>

  // OpenAI standard: choices[0].delta.content / choices[0].message.content
  const choices = obj.choices as Array<Record<string, unknown>> | undefined
  if (choices && choices.length > 0) {
    const first = choices[0]
    const delta = first?.delta as Record<string, unknown> | undefined
    const message = first?.message as Record<string, unknown> | undefined

    const content =
      nonEmptyString(delta?.content) ??
      nonEmptyString(message?.content) ??
      nonEmptyString(delta?.text) ??
      nonEmptyString(message?.text) ??
      nonEmptyString(first?.text)
    if (content) return content

    // Reasoning models may put output into reasoning/reasoning_content
    // while content stays empty.
    // Ollama uses "reasoning", LM Studio uses "reasoning_content" (lmstudio#1602)
    const reasoning =
      nonEmptyString(delta?.reasoning) ??
      nonEmptyString(delta?.reasoning_content) ??
      nonEmptyString(message?.reasoning) ??
      nonEmptyString(message?.reasoning_content)
    if (reasoning) return reasoning
  }

  // Ollama native format: top-level message.content
  const topMessage = obj.message as Record<string, unknown> | undefined
  const topMsgContent =
    nonEmptyString(topMessage?.content) ??
    nonEmptyString(topMessage?.reasoning) ??
    nonEmptyString(topMessage?.reasoning_content)
  if (topMsgContent) return topMsgContent

  // Ollama native /api/generate: top-level response field
  if (nonEmptyString(obj.response)) return obj.response as string

  // LM Studio event data: top-level content / delta.content
  if (nonEmptyString(obj.content)) return obj.content as string
  const topDelta = obj.delta as Record<string, unknown> | undefined
  if (nonEmptyString(topDelta?.content)) return topDelta!.content as string

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
          // Detect inline error objects (some providers return errors with HTTP 200)
          if (parsed?.error) {
            const errMsg = parsed.error?.message ?? parsed.error?.type ?? JSON.stringify(parsed.error)
            throw new Error(`API returned error: ${errMsg}`)
          }
          const content = extractContent(parsed)
          if (content) {
            yieldedAny = true
            yield content
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('API returned error:')) throw e
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

      // Detect error responses returned with HTTP 200
      const errObj = parsed?.error as Record<string, unknown> | undefined
      if (errObj) {
        const errMsg = (errObj.message ?? errObj.type ?? JSON.stringify(errObj)) as string
        throw new Error(`API returned error: ${errMsg}`)
      }

      const content = extractContent(parsed)
      if (content) {
        console.log('[sse-parser] Recovered content from non-streaming JSON response')
        yield content
        return
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('API returned error:')) throw e
      // Not a valid single JSON
    }

    const preview = rawOutput.slice(0, MAX_RAW_LENGTH)
    console.error('[sse-parser] No content chunks extracted. Raw response preview:\n' + preview)
    throw new Error(`No content chunks extracted. Raw response: ${preview || '<empty>'}`)
  }
}
