'use client'

import { useEffect, useState } from 'react'
import { BenchmarkSession } from '@/lib/benchmark/types'
import { getAllSessions, deleteSession, exportSession, importSession } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        setImportError(err instanceof Error ? err.message : 'Import failed. Check JSON format.')
      }
    }
    input.click()
  }

  return (
    <div className="brutalist-border bg-card p-0">
      <div className="border-b-2 border-border bg-muted px-4 py-3 flex items-center justify-between">
        <span className="font-bold uppercase tracking-widest text-sm">SYS.HISTORY</span>
        <Button variant="outline" size="sm" onClick={handleImport} className="h-8">
          <Upload className="h-4 w-4 mr-2" /> IMPORT_JSON
        </Button>
      </div>
      <div className="p-4 sm:p-6">
        {importError && (
          <div className="mb-4 border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive uppercase">
            [ERROR] {importError}
          </div>
        )}
        {sessions.length === 0 ? (
          <div className="border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm font-mono text-muted-foreground">
              [ NO_HISTORY_FOUND ]
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="flex flex-col gap-4 border-2 border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between hover:border-primary/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-foreground font-mono">
                    {new Date(session.timestamp).toLocaleString('zh-CN')}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    &gt; {session.results.length} ENDPOINTS | {session.config.repeatCount}x REPEATS | CONC: {session.config.concurrencyLevels.join('/')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => onView(session)} title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => handleExport(session)} title="Export">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-10 w-10" onClick={() => handleDelete(session.id)} title="Delete">
                    <Trash2 className="h-4 w-4" />
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
