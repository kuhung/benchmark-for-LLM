'use client'

import { useEffect, useState } from 'react'
import { BenchmarkSession } from '@/lib/benchmark/types'
import { getAllSessions, deleteSession, exportSession, importSession } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Trash2, Download, Upload, Eye, Clock, Archive } from 'lucide-react'

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
      <div className="terminal-header justify-between">
        <div className="flex items-center gap-2">
          <span className="terminal-dot bg-[#ff5f57]" />
          <span className="terminal-dot bg-[#febc2e]" />
          <span className="terminal-dot bg-[#28c840]" />
          <span className="ml-2 font-mono text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">SYS.HISTORY</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleImport} className="h-7 text-[10px]">
          <Upload className="h-3.5 w-3.5 mr-1.5" /> IMPORT
        </Button>
      </div>
      <div className="p-4 sm:p-6">
        {importError && (
          <div className="mb-4 border-2 border-destructive/60 bg-destructive/5 px-4 py-3 text-xs font-bold text-destructive uppercase font-mono animate-fade-in">
            [ERROR] {importError}
          </div>
        )}
        {sessions.length === 0 ? (
          <div className="border-2 border-dashed border-border/40 p-10 text-center animate-fade-in">
            <Archive className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-xs font-mono text-muted-foreground/40 tracking-wider">
              [ NO_HISTORY ]
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/25 mt-1">
              Run a benchmark or import results
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 border-2 border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between hover:border-primary/30 hover:shadow-[0_0_16px_rgba(204,255,0,0.03)] transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="hidden sm:flex flex-col items-center gap-1 pt-0.5">
                    <Clock className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground font-mono tabular-nums">
                      {new Date(session.timestamp).toLocaleString('zh-CN')}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/50 mt-1 tracking-wider">
                      <span className="text-primary/60">&gt;</span> {session.results.length} ENDPOINTS | {session.config.repeatCount}x | CONC: {session.config.concurrencyLevels.join('/')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[10px]"
                    onClick={() => onView(session)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> VIEW
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleExport(session)}
                    title="Export"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive hover:border-destructive/50"
                    onClick={() => handleDelete(session.id)}
                    title="Delete"
                  >
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
