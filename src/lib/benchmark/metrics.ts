import { RawResult, SingleMetrics, AggregatedMetrics, StatsSummary, StreamingDetails } from './types'

export function computeSingleMetrics(raw: RawResult): SingleMetrics | null {
  if (raw.status !== 'success' || raw.tokenTimestamps.length === 0) return null

  const ttft = raw.tokenTimestamps[0] - raw.requestStart
  const firstToken = raw.tokenTimestamps[0]
  const requestEnd = raw.requestEnd ?? raw.tokenTimestamps[raw.tokenTimestamps.length - 1]
  const decodeDurationSeconds = Math.max((requestEnd - firstToken) / 1000, 0)
  const tps = decodeDurationSeconds > 0 ? raw.outputTokenCount / decodeDurationSeconds : 0

  const itl: number[] = []
  for (let i = 1; i < raw.tokenTimestamps.length; i++) {
    itl.push(raw.tokenTimestamps[i] - raw.tokenTimestamps[i - 1])
  }

  const e2eLatency = requestEnd - raw.requestStart

  return { ttft, tps, itl, e2eLatency }
}

export function aggregateMetrics(rawResults: RawResult[]): AggregatedMetrics {
  const successful = rawResults.filter(r => r.status === 'success')
  const metrics = successful.map(r => computeSingleMetrics(r)).filter(Boolean) as SingleMetrics[]

  if (metrics.length === 0) {
    return {
      ttft: emptyStats(),
      tps: emptyStats(),
      itl: emptyStats(),
      e2eLatency: emptyStats(),
      successRate: rawResults.length > 0 ? (successful.length / rawResults.length) * 100 : 0,
      totalRequests: rawResults.length,
    }
  }

  const allItl = metrics.flatMap(m => m.itl)

  return {
    ttft: computeStats(metrics.map(m => m.ttft)),
    tps: computeStats(metrics.map(m => m.tps)),
    itl: computeStats(allItl),
    e2eLatency: computeStats(metrics.map(m => m.e2eLatency)),
    successRate: (successful.length / rawResults.length) * 100,
    totalRequests: rawResults.length,
  }
}

export function computeStats(values: number[]): StatsSummary {
  if (values.length === 0) return emptyStats()

  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const mean = sorted.reduce((a, b) => a + b, 0) / n

  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n
  const stdDev = Math.sqrt(variance)

  return {
    mean,
    median: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    min: sorted[0],
    max: sorted[n - 1],
    stdDev,
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  if (sorted.length === 1) return sorted[0]
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

function emptyStats(): StatsSummary {
  return { mean: 0, median: 0, p75: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0, stdDev: 0 }
}

export function extractColdStartTtft(rawResults: RawResult[]): number | undefined {
  const firstSuccess = rawResults.find(r => r.status === 'success' && r.tokenTimestamps.length > 0)
  if (!firstSuccess) return undefined
  return firstSuccess.tokenTimestamps[0] - firstSuccess.requestStart
}

export function computeStreamingDetails(rawResults: RawResult[]): StreamingDetails | undefined {
  const successful = rawResults.filter(r => r.status === 'success' && r.tokenTimestamps.length > 1)
  if (successful.length === 0) return undefined

  let totalChunks = 0
  let totalChars = 0
  const allIntervals: number[] = []

  for (const raw of successful) {
    totalChunks += raw.tokenTimestamps.length
    if (raw.chunkSizes) {
      totalChars += raw.chunkSizes.reduce((a, b) => a + b, 0)
    }
    for (let i = 1; i < raw.tokenTimestamps.length; i++) {
      allIntervals.push(raw.tokenTimestamps[i] - raw.tokenTimestamps[i - 1])
    }
  }

  const avgCharsPerChunk = totalChunks > 0 && totalChars > 0 ? totalChars / totalChunks : 0
  const avgChunkInterval = allIntervals.length > 0
    ? allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length
    : 0

  return {
    chunkCount: Math.round(totalChunks / successful.length),
    avgCharsPerChunk: Number(avgCharsPerChunk.toFixed(1)),
    avgChunkInterval: Number(avgChunkInterval.toFixed(1)),
  }
}
