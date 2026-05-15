export interface LocalizedString {
  en: string
  zh: string
}

export interface PromptPreset {
  id: string
  label: LocalizedString
  description: LocalizedString
  content: LocalizedString
}

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'short',
    label: { en: 'Short', zh: '短文本' },
    description: {
      en: '~20 tokens input, suitable for measuring pure decode speed',
      zh: '~20 tokens input, 适合测量纯 decode 速度',
    },
    content: {
      en: 'Write a haiku about programming.',
      zh: '写一首关于编程的俳句。',
    },
  },
  {
    id: 'medium',
    label: { en: 'Medium', zh: '中等文本' },
    description: {
      en: '~100 tokens input, simulates common chat scenarios',
      zh: '~100 tokens input, 模拟常见对话',
    },
    content: {
      en: 'Explain the difference between TCP and UDP protocols. Include their use cases, advantages and disadvantages. Format your response with clear headings and bullet points.',
      zh: '请解释 TCP 和 UDP 协议的区别。包括它们的使用场景、优缺点。请使用清晰的标题和无序列表来格式化你的回答。',
    },
  },
  {
    id: 'long',
    label: { en: 'Long', zh: '长文本' },
    description: {
      en: '~300 tokens input, stresses the prefill phase',
      zh: '~300 tokens input, 压测 prefill 阶段',
    },
    content: {
      en: `You are a senior software architect. Please analyze the following requirements and provide a detailed system design:

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
      zh: `你是一个资深软件架构师。请分析以下需求并提供详细的系统设计：

我们需要构建一个实时协作的文档编辑系统（类似腾讯文档）。系统需要支持：
1. 多用户同时编辑同一文档
2. 实时光标位置同步
3. 并发编辑的冲突解决
4. 版本历史与回滚功能
5. 支持离线编辑，在重连时同步
6. 支持富文本格式

请提供：
- 顶层架构图描述
- 关键技术选型及理由
- 数据模型设计
- 应对百万并发用户的扩容策略`,
    },
  },
]

export const DEFAULT_PROMPT = PROMPT_PRESETS[1].content
