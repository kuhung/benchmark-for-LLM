import { AggregatedMetrics, ConcurrencyResult, RadarScore } from './types'

const THRESHOLDS = {
  speed: { min: 5, max: 100 },
  responsiveness: { best: 100, worst: 2000 },
  smoothness: { best: 20, worst: 200 },
  scalability: { min: 0.15, max: 1.0 },
  stability: { best: 0.05, worst: 1.0 },
} as const

export function computeRadarScore(
  singleMetrics: AggregatedMetrics,
  concurrencyResults: ConcurrencyResult[]
): RadarScore {
  // When no requests succeeded, all dimension metrics are meaningless zeros --
  // return an all-zero score instead of the misleading values that
  // inverseLinearScore(0, ...) would produce.
  if (singleMetrics.successRate === 0) {
    return { speed: 0, responsiveness: 0, smoothness: 0, scalability: 0, stability: 0, overall: 0 }
  }

  const speed = linearScore(singleMetrics.tps.median, THRESHOLDS.speed.min, THRESHOLDS.speed.max)

  const responsiveness = inverseLinearScore(
    singleMetrics.ttft.median,
    THRESHOLDS.responsiveness.best,
    THRESHOLDS.responsiveness.worst
  )

  const smoothness = inverseLinearScore(
    singleMetrics.itl.p95,
    THRESHOLDS.smoothness.best,
    THRESHOLDS.smoothness.worst
  )

  let scalability = 50
  if (concurrencyResults.length >= 2) {
    const c1 = concurrencyResults.find(r => r.concurrency === 1)
    const cMax = concurrencyResults.find(r => r.concurrency === 8) || concurrencyResults[concurrencyResults.length - 1]
    if (c1 && cMax && c1.metrics.tps.median > 0) {
      const ratio = cMax.metrics.tps.median / c1.metrics.tps.median
      scalability = linearScore(ratio, THRESHOLDS.scalability.min, THRESHOLDS.scalability.max)
    }
  }

  const cv = singleMetrics.ttft.mean > 0
    ? singleMetrics.ttft.stdDev / singleMetrics.ttft.mean
    : 0
  const latencyConsistency = inverseLinearScore(cv, THRESHOLDS.stability.best, THRESHOLDS.stability.worst)
  const successFactor = singleMetrics.successRate / 100
  const stability = latencyConsistency * 0.7 + successFactor * 100 * 0.3

  const overall = Math.round((speed + responsiveness + smoothness + scalability + stability) / 5)

  return {
    speed: Math.round(speed),
    responsiveness: Math.round(responsiveness),
    smoothness: Math.round(smoothness),
    scalability: Math.round(scalability),
    stability: Math.round(stability),
    overall,
  }
}

function linearScore(value: number, min: number, max: number): number {
  return clamp(((value - min) / (max - min)) * 100, 0, 100)
}

function inverseLinearScore(value: number, best: number, worst: number): number {
  return clamp(((worst - value) / (worst - best)) * 100, 0, 100)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
