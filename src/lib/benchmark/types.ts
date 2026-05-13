export interface Endpoint {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  modelId: string
}

export interface RawResult {
  endpointId: string
  requestStart: number
  requestEnd: number
  tokenTimestamps: number[]
  outputTokenCount: number
  status: 'success' | 'error' | 'timeout'
  error?: string
}

export interface SingleMetrics {
  ttft: number
  tps: number
  itl: number[]
  e2eLatency: number
}

export interface AggregatedMetrics {
  ttft: StatsSummary
  tps: StatsSummary
  itl: StatsSummary
  e2eLatency: StatsSummary
  successRate: number
  totalRequests: number
}

export interface StatsSummary {
  mean: number
  median: number
  p95: number
  p99: number
  min: number
  max: number
  stdDev: number
}

export interface ConcurrencyResult {
  concurrency: number
  requestThroughput: number
  tokenThroughput: number
  metrics: AggregatedMetrics
}

export interface EndpointResult {
  endpoint: Endpoint
  singleConcurrency: AggregatedMetrics
  concurrencyResults: ConcurrencyResult[]
  rawResults: RawResult[]
  score?: RadarScore
}

export interface RadarScore {
  speed: number
  responsiveness: number
  smoothness: number
  scalability: number
  stability: number
  overall: number
}

export interface BenchmarkConfig {
  prompt: string
  maxTokens: number
  repeatCount: number
  concurrencyLevels: number[]
}

export interface BenchmarkSession {
  id: string
  timestamp: number
  config: BenchmarkConfig
  results: EndpointResult[]
}

export type BenchmarkStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error'

export interface BenchmarkProgress {
  status: BenchmarkStatus
  currentEndpoint?: string
  currentRound?: number
  totalRounds?: number
  currentConcurrency?: number
  completedTasks: number
  totalTasks: number
  liveMetrics?: Partial<SingleMetrics>
}
