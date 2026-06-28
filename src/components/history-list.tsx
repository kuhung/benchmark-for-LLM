'use client'

import { useEffect, useState } from 'react'
import { BenchmarkSession } from '@/lib/benchmark/types'
import { getAllSessions, deleteSession, exportSession, importSession } from '@/lib/store'
import { exportCSV } from '@/lib/export-csv'
import { generateMarkdownReport } from '@/lib/report'
import { PROMPT_PRESETS } from '@/lib/prompts'
import { Button } from '@/components/ui/button'
import { Trash2, Download, Upload, Eye, GitCompare, FileSpreadsheet, FileText } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

function getPromptLabel(session: BenchmarkSession, lang: 'en' | 'zh'): string {
  if (session.config.promptId) {
    const preset = PROMPT_PRESETS.find(p => p.id === session.config.promptId)
    if (preset) return preset.label[lang]
  }
  const promptStr = typeof session.config.prompt === 'string'
    ? session.config.prompt
    : session.config.prompt[lang] || session.config.prompt.en
  for (const preset of PROMPT_PRESETS) {
    if (preset.content.en === promptStr || preset.content.zh === promptStr ||
        (typeof session.config.prompt !== 'string' &&
         preset.content.en === session.config.prompt.en &&
         preset.content.zh === session.config.prompt.zh)) {
      return preset.label[lang]
    }
  }
  return lang === 'zh' ? '自定义' : 'Custom'
}

function getModelsSummary(session: BenchmarkSession): string[] {
  return session.results.map(r => {
    const framework = r.endpoint.name
    const model = r.endpoint.modelId
    return framework === model ? model : `${framework} / ${model}`
  })
}

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

  const downloadBlob = (content: string, mime: string, session: BenchmarkSession, ext: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${new Date(session.timestamp).toISOString().slice(0, 10)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async (session: BenchmarkSession) => {
    const json = await exportSession(session)
    downloadBlob(json, 'application/json', session, 'json')
  }

  const handleExportCSV = (session: BenchmarkSession) => {
    downloadBlob(exportCSV(session), 'text/csv;charset=utf-8', session, 'csv')
  }

  const handleExportMarkdown = (session: BenchmarkSession) => {
    downloadBlob(generateMarkdownReport(session), 'text/markdown;charset=utf-8', session, 'md')
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
              const models = getModelsSummary(session)
              const promptLabel = getPromptLabel(session, lang)
              const bestScore = Math.max(...session.results.map(r => r.score?.overall ?? 0))
              return (
                <div
                  key={session.id}
                  className={`rounded-md border bg-background p-4 transition-colors ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {onCompare && (
                      <button
                        onClick={() => toggleSelect(session.id)}
                        className={`mt-1 h-4 w-4 shrink-0 rounded border transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/40 hover:border-primary'
                        }`}
                        aria-label={isSelected ? t('deselect') : t('select')}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {/* Primary: model names - most important info */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {models.map((m, i) => (
                          <span key={i} className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium font-mono truncate max-w-[240px]">
                            {m}
                          </span>
                        ))}
                        {bestScore > 0 && (
                          <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-mono font-semibold tabular-nums text-foreground">
                            {t('score')}: {bestScore}
                          </span>
                        )}
                      </div>
                      {/* Secondary: prompt scenario + test params */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {t('promptLabel')}: <span className="text-foreground font-medium">{promptLabel}</span>
                        </span>
                        <span>{session.config.repeatCount}x {t('repeats')}</span>
                        <span>{t('concurrency')} {session.config.concurrencyLevels.join(',')}</span>
                        <span className="tabular-nums">
                          {new Date(session.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => onView(session)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> {t('view')}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(session)} title={`${t('export')} JSON`}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExportCSV(session)} title={`${t('export')} CSV`}>
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExportMarkdown(session)} title={`${t('export')} ${t('report')}`}>
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(session.id)} title={t('delete')}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
