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
        setImportError(err instanceof Error ? err.message : '导入失败，请检查 JSON 格式')
      }
    }
    input.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>历史记录</span>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4" /> 导入 JSON
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {importError && (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {importError}
          </div>
        )}
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            暂无历史记录。完成一次测评后保存即可在此查看。
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(session.timestamp).toLocaleString('zh-CN')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.results.length} 个端点 | {session.config.repeatCount} 次重复 | 并发 {session.config.concurrencyLevels.join('/')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(session)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(session)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
