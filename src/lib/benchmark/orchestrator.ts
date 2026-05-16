import {
  Endpoint,
  BenchmarkConfig,
  BenchmarkProgress,
  RawResult,
  EndpointResult,
  ConcurrencyResult,
  BenchmarkSession,
} from './types'
import { runSingleBenchmark } from './runner'
import { aggregateMetrics, computeSingleMetrics, computeStreamingDetails, extractColdStartTtft } from './metrics'
import { computeRadarScore } from './scoring'

export class BenchmarkOrchestrator {
  private abortController: AbortController | null = null
  private progress: BenchmarkProgress = { status: 'idle', completedTasks: 0, totalTasks: 0 }
  private onProgress?: (progress: BenchmarkProgress) => void

  constructor(onProgress?: (progress: BenchmarkProgress) => void) {
    this.onProgress = onProgress
  }

  getProgress(): BenchmarkProgress {
    return { ...this.progress }
  }

  cancel(): void {
    this.abortController?.abort()
    this.progress.status = 'cancelled'
    this.emitProgress()
  }

  async run(endpoints: Endpoint[], config: BenchmarkConfig): Promise<BenchmarkSession> {
    this.abortController = new AbortController()
    const totalTasks = endpoints.length * config.concurrencyLevels.length * config.repeatCount
    this.progress = { status: 'running', completedTasks: 0, totalTasks }
    this.emitProgress()

    const results: EndpointResult[] = []

    for (const endpoint of endpoints) {
      if (this.abortController.signal.aborted) break

      this.progress.currentEndpoint = endpoint.name
      this.emitProgress()

      const endpointResult = await this.benchmarkEndpoint(endpoint, config)
      results.push(endpointResult)
    }

    this.progress.status = this.abortController.signal.aborted ? 'cancelled' : 'completed'
    this.emitProgress()

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config,
      results,
    }
  }

  private async benchmarkEndpoint(endpoint: Endpoint, config: BenchmarkConfig): Promise<EndpointResult> {
    const allRawResults: RawResult[] = []
    const concurrencyResults: ConcurrencyResult[] = []

    for (const concurrency of config.concurrencyLevels) {
      if (this.abortController!.signal.aborted) break

      this.progress.currentConcurrency = concurrency
      this.emitProgress()

      const roundResults = await this.runConcurrencyLevel(endpoint, config, concurrency)
      allRawResults.push(...roundResults)

      const wallClockStart = roundResults.length > 0 ? Math.min(...roundResults.map(r => r.requestStart)) : 0
      const wallClockEnd = roundResults.length > 0 ? Math.max(...roundResults.map(r => r.requestEnd ?? r.requestStart)) : 0
      const wallClockTime = (wallClockEnd - wallClockStart) / 1000

      const totalTokens = roundResults.reduce((sum, r) => sum + r.outputTokenCount, 0)
      const completedRequests = roundResults.filter(r => r.status === 'success').length

      concurrencyResults.push({
        concurrency,
        requestThroughput: wallClockTime > 0 ? completedRequests / wallClockTime : 0,
        tokenThroughput: wallClockTime > 0 ? totalTokens / wallClockTime : 0,
        metrics: aggregateMetrics(roundResults),
      })
    }

    const singleConcurrency = concurrencyResults.find(r => r.concurrency === 1)?.metrics
      || aggregateMetrics(allRawResults.filter(r => r.status === 'success').slice(0, config.repeatCount))

    const score = computeRadarScore(singleConcurrency, concurrencyResults)
    const streamingDetails = computeStreamingDetails(allRawResults)
    const coldStartTtft = extractColdStartTtft(allRawResults)

    return {
      endpoint,
      singleConcurrency,
      concurrencyResults,
      rawResults: allRawResults,
      score,
      streamingDetails,
      coldStartTtft,
    }
  }

  private async runConcurrencyLevel(
    endpoint: Endpoint,
    config: BenchmarkConfig,
    concurrency: number
  ): Promise<RawResult[]> {
    const results: RawResult[] = []
    const batches = Math.ceil(config.repeatCount / concurrency)

    for (let batch = 0; batch < batches; batch++) {
      if (this.abortController!.signal.aborted) break

      const batchSize = Math.min(concurrency, config.repeatCount - batch * concurrency)
      this.progress.currentRound = batch * concurrency + 1
      this.progress.totalRounds = config.repeatCount
      this.emitProgress()

      const promises = Array.from({ length: batchSize }, () =>
        runSingleBenchmark(
          endpoint,
          typeof config.prompt === 'string' ? config.prompt : (config.prompt.zh || config.prompt.en),
          config.maxTokens,
          this.abortController!.signal,
          () => undefined,
          { thinkingEnabled: config.thinkingEnabled ?? false }
        )
      )

      const batchResults = await Promise.all(promises)
      results.push(...batchResults)
      const latestMetrics = batchResults
        .map(result => computeSingleMetrics(result))
        .find((metric): metric is NonNullable<typeof metric> => metric !== null)
      if (latestMetrics) {
        this.progress.liveMetrics = {
          ttft: latestMetrics.ttft,
          tps: latestMetrics.tps,
          e2eLatency: latestMetrics.e2eLatency,
        }
      }
      this.progress.completedTasks += batchSize
      this.emitProgress()
    }

    return results
  }

  private emitProgress(): void {
    this.onProgress?.({ ...this.progress })
  }
}
