'use client'

import { useEffect, useState } from 'react'
import { BenchmarkSession } from '@/lib/benchmark/types'
import { getAllSessions, deleteSession, exportSession, importSession } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Trash2, Download, Upload, Eye, GitCompare } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface HistoryListProps {
  onView: (session: BenchmarkSession) => void
  onCompare?: (sessions: BenchmarkSession[]) => void
  refreshTrigger?: number
}

export function HistoryList({ onView, onCompare, refreshTrigger }: HistoryListProps) {
  const { t, lang } = useI18n()
  const [sessions, setSessions] = useState<BenchmarkSession[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      return next
    })
  }

  const handleCompare = () => {
    const selected = sessions.filter(s => selectedIds.has(s.id))
    if (selected.length >= 2) {
      onCompare?.(selected)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [refreshTrigger])

  const loadSessions = async () => {
    const all = await getAllSessions()
    setSessions(all)
  }

  const handleDelete = async (id: string) => {
    await deleteSession(id)
    await loadSessions()
  }

  const handleExport = async (session: BenchmarkSession) => {
    const json = await exportSession(session)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${new Date(session.timestamp).toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        await importSession(text)
        setImportError(null)
        await loadSessions()
      } catch (err) {
        setImportError(err instanceof Error ? err.message : t('importFailed'))
      }
    }
    input.click()
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{t('history')}</h2>
        <div className="flex gap-2">
          {selectedIds.size >= 2 && onCompare && (
            <Button variant="outline" size="sm" onClick={handleCompare}>
              <GitCompare className="h-3.5 w-3.5 mr-1.5" /> {t('compare')} ({selectedIds.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> {t('import')}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {importError && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive">
            {importError}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">{t('noHistory')}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t('runOrImport')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {onCompare && sessions.length >= 2 && (
              <p className="text-xs text-muted-foreground mb-2">
                {t('selectCompare')}
              </p>
            )}
            {sessions.map((session) => {
              const isSelected = selectedIds.has(session.id)
              return (
                <div
                  key={session.id}
                  className={`flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {onCompare && (
                      <button
                        onClick={() => toggleSelect(session.id)}
                        className={`h-4 w-4 shrink-0 rounded border transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/40 hover:border-primary'
                        }`}
                        aria-label={isSelected ? t('deselect') : t('select')}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium font-mono tabular-nums">
                        {new Date(session.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.results.length} {t('endpointCount')} / {session.config.repeatCount} {t('repeats')} / {t('concurrency')} {session.config.concurrencyLevels.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onView(session)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> {t('view')}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(session)} title={t('export')}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(session.id)} title={t('delete')}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
