import { RawResult, SingleMetrics, AggregatedMetrics, StatsSummary } from './types'

export function computeSingleMetrics(raw: RawResult): SingleMetrics | null {
  if (raw.status !== 'success' || raw.tokenTimestamps.length < 2) return null

  const ttft = raw.tokenTimestamps[0] - raw.requestStart
  const lastToken = raw.tokenTimestamps[raw.tokenTimestamps.length - 1]
  const firstToken = raw.tokenTimestamps[0]
  const tps = raw.outputTokenCount / ((lastToken - firstToken) / 1000)

  const itl: number[] = []
  for (let i = 1; i < raw.tokenTimestamps.length; i++) {
    itl.push(raw.tokenTimestamps[i] - raw.tokenTimestamps[i - 1])
  }

  const e2eLatency = lastToken - raw.requestStart

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
      successRate: 0,
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
  return { mean: 0, median: 0, p95: 0, p99: 0, min: 0, max: 0, stdDev: 0 }
}
