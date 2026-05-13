export interface PromptPreset {
  id: string
  label: string
  description: string
  content: string
}

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'short',
    label: '短文本',
    description: '~20 tokens input, 适合测量纯 decode 速度',
    content: 'Write a haiku about programming.',
  },
  {
    id: 'medium',
    label: '中等文本',
    description: '~100 tokens input, 模拟常见对话',
    content:
      'Explain the difference between TCP and UDP protocols. Include their use cases, advantages and disadvantages. Format your response with clear headings and bullet points.',
  },
  {
    id: 'long',
    label: '长文本',
    description: '~300 tokens input, 压测 prefill 阶段',
    content: `You are a senior software architect. Please analyze the following requirements and provide a detailed system design:

We need to build a real-time collaborative document editing system (like Google Docs). The system should support:
1. Multiple users editing the same document simultaneously
2. Real-time cursor position synchronization
3. Conflict resolution for concurrent edits
4. Version history and rollback capability
5. Offline editing with sync when reconnecting
6. Support for rich text formatting

Please provide:
- High-level architecture diagram description
- Key technology choices with justification
- Data model design
- Scaling strategy for 1M concurrent users`,
  },
]

export const DEFAULT_PROMPT = PROMPT_PRESETS[1].content
