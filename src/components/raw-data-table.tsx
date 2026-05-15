'use client'

import { EndpointResult } from '@/lib/benchmark/types'
import { useI18n } from '@/lib/i18n'

interface RawDataTableProps {
  results: EndpointResult[]
}

type RankDirection = 'asc' | 'desc'

function rankColor(value: number, allValues: number[], direction: RankDirection): string {
  if (allValues.length <= 1) return ''
  const sorted = [...allValues].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  if (max === min) return ''

  const ratio = (value - min) / (max - min)
  const t = direction === 'asc' ? ratio : 1 - ratio

  if (t <= 0.33) return 'text-red-400'
  if (t >= 0.67) return 'text-emerald-400'
  return 'text-yellow-400'
}

export function RawDataTable({ results }: RawDataTableProps) {
  const { t } = useI18n()
  const hasStreamingDetails = results.some(r => r.streamingDetails)
  const ttftValues = results.map(r => r.singleConcurrency.ttft.median)
  const tpsValues = results.map(r => r.singleConcurrency.tps.median)
  const itlValues = results.map(r => r.singleConcurrency.itl.p95)
  const e2eValues = results.map(r => r.singleConcurrency.e2eLatency.median)
  const successValues = results.map(r => r.singleConcurrency.successRate)

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">{t('rawData')}</h3>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="data-table w-full min-w-[640px] text-sm font-mono">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('endpoint')}</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('ttftMs')}</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('tps')}</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('itlP95')}</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('e2eMs')}</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('success')}</th>
              {hasStreamingDetails && (
                <>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('charsPerChunk')}</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">{t('chunkInterval')}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.endpoint.id} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-3 font-medium text-foreground">
                  <div className="flex flex-col">
                    <span>{r.endpoint.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">{r.endpoint.modelId}</span>
                  </div>
                </td>
                <td className={`px-3 py-3 text-right tabular-nums ${rankColor(r.singleConcurrency.ttft.median, ttftValues, 'desc')}`}>
                  {r.singleConcurrency.ttft.median.toFixed(0)}
                </td>
                <td className={`px-3 py-3 text-right tabular-nums ${rankColor(r.singleConcurrency.tps.median, tpsValues, 'asc')}`}>
                  {r.singleConcurrency.tps.median.toFixed(1)}
                </td>
                <td className={`px-3 py-3 text-right tabular-nums ${rankColor(r.singleConcurrency.itl.p95, itlValues, 'desc')}`}>
                  {r.singleConcurrency.itl.p95.toFixed(1)}
                </td>
                <td className={`px-3 py-3 text-right tabular-nums ${rankColor(r.singleConcurrency.e2eLatency.median, e2eValues, 'desc')}`}>
                  {r.singleConcurrency.e2eLatency.median.toFixed(0)}
                </td>
                <td className={`px-3 py-3 text-right font-medium tabular-nums ${rankColor(r.singleConcurrency.successRate, successValues, 'asc')}`}>
                  {r.singleConcurrency.successRate.toFixed(0)}%
                </td>
                {hasStreamingDetails && (
                  <>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {r.streamingDetails ? r.streamingDetails.avgCharsPerChunk.toFixed(1) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {r.streamingDetails ? `${r.streamingDetails.avgChunkInterval.toFixed(1)} ms` : '-'}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
