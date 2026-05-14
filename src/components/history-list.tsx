'use client'

import { useEffect, useState } from 'react'
import { BenchmarkSession } from '@/lib/benchmark/types'
import { getAllSessions, deleteSession, exportSession, importSession } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Trash2, Download, Upload, Eye } from 'lucide-react'

interface HistoryListProps {
  onView: (session: BenchmarkSession) => void
  refreshTrigger?: number
}

export function HistoryList({ onView, refreshTrigger }: HistoryListProps) {
  const [sessions, setSessions] = useState<BenchmarkSession[]>([])
  const [importError, setImportError] = useState<string | null>(null)

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
        setImportError(err instanceof Error ? err.message : 'Import failed')
      }
    }
    input.click()
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">History</h2>
        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Import
        </Button>
      </div>

      <div className="p-4">
        {importError && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive">
            {importError}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No history yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Run a benchmark or import results</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between hover:border-primary/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium font-mono tabular-nums">
                    {new Date(session.timestamp).toLocaleString('zh-CN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.results.length} endpoints / {session.config.repeatCount}x / concurrency {session.config.concurrencyLevels.join(', ')}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => onView(session)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(session)} title="Export">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(session.id)} title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
