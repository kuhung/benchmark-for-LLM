import { BenchmarkSession } from './benchmark/types'

export function exportCSV(session: BenchmarkSession): string {
  const headers = [
    'Endpoint',
    'Model',
    'Cold Start TTFT (ms)',
    'TTFT P50 (ms)',
    'TTFT P95 (ms)',
    'TTFT P99 (ms)',
    'TPS P50',
    'TPS P95',
    'ITL P50 (ms)',
    'ITL P95 (ms)',
    'ITL P99 (ms)',
    'E2E P50 (ms)',
    'Success Rate (%)',
    'Total Requests',
  ]

  const rows = session.results.map(r => {
    const m = r.singleConcurrency
    return [
      csvEscape(r.endpoint.name),
      csvEscape(r.endpoint.modelId),
      r.coldStartTtft != null ? r.coldStartTtft.toFixed(1) : '',
      m.ttft.median.toFixed(1),
      m.ttft.p95.toFixed(1),
      m.ttft.p99.toFixed(1),
      m.tps.median.toFixed(1),
      m.tps.p95.toFixed(1),
      m.itl.median.toFixed(1),
      m.itl.p95.toFixed(1),
      m.itl.p99.toFixed(1),
      m.e2eLatency.median.toFixed(1),
      m.successRate.toFixed(1),
      m.totalRequests.toString(),
    ]
  })

  const concurrencyHeaders = [
    '',
    '',
    'Concurrency',
    'Req Throughput (req/s)',
    'Token Throughput (t/s)',
    'TPS P50',
    'TTFT P50 (ms)',
    'Success Rate (%)',
  ]

  const concurrencyRows: string[][] = []
  for (const r of session.results) {
    for (const cr of r.concurrencyResults) {
      concurrencyRows.push([
        csvEscape(r.endpoint.name),
        csvEscape(r.endpoint.modelId),
        cr.concurrency.toString(),
        cr.requestThroughput.toFixed(2),
        cr.tokenThroughput.toFixed(1),
        cr.metrics.tps.median.toFixed(1),
        cr.metrics.ttft.median.toFixed(0),
        cr.metrics.successRate.toFixed(1),
      ])
    }
  }

  let csv = headers.join(',') + '\n'
  csv += rows.map(row => row.join(',')).join('\n')

  if (concurrencyRows.length > 0) {
    csv += '\n\n'
    csv += concurrencyHeaders.join(',') + '\n'
    csv += concurrencyRows.map(row => row.join(',')).join('\n')
  }

  return csv
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
