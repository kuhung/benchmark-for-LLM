'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Endpoint } from '@/lib/benchmark/types'
import { checkConnectivity, fetchModels } from '@/lib/benchmark/runner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Wifi, WifiOff, Loader2, ChevronDown, Search, Server } from 'lucide-react'

const PRESETS = [
  { label: 'Ollama', baseUrl: 'http://localhost:11434', modelId: 'llama3.2' },
  { label: 'LM Studio', baseUrl: 'http://localhost:1234', modelId: 'default' },
  { label: 'MLX', baseUrl: 'http://localhost:8080', modelId: 'default' },
]

interface EndpointConfigProps {
  endpoints: Endpoint[]
  onChange: (endpoints: Endpoint[]) => void
}

function ModelIdSelector({
  value,
  baseUrl,
  apiKey,
  onChange,
}: {
  value: string
  baseUrl: string
  apiKey?: string
  onChange: (modelId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const discover = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await fetchModels(baseUrl, apiKey)
    setLoading(false)
    if (result.ok) {
      setModels(result.models)
      if (result.models.length === 0) {
        setError('未发现可用模型')
      }
    } else {
      setModels([])
      setError(result.error ?? '请求失败')
    }
  }, [baseUrl, apiKey])

  const handleToggle = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    setFilter('')
    await discover()
  }

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = models.filter(m =>
    m.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-1">
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="llama3.2"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={handleToggle}
          title="发现可用模型"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="搜索模型..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                正在发现模型...
              </div>
            )}
            {!loading && error && (
              <div className="px-3 py-3 text-xs text-destructive text-center">{error}</div>
            )}
            {!loading && !error && filtered.length === 0 && models.length > 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground text-center">无匹配结果</div>
            )}
            {!loading &&
              filtered.map(m => (
                <button
                  key={m}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
                    m === value ? 'bg-accent font-medium' : ''
                  }`}
                  onClick={() => {
                    onChange(m)
                    setOpen(false)
                  }}
                >
                  {m}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function EndpointConfig({ endpoints, onChange }: EndpointConfigProps) {
  const [connectStatus, setConnectStatus] = useState<Record<string, 'checking' | 'ok' | 'error'>>({})

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: crypto.randomUUID(),
      name: `Endpoint ${endpoints.length + 1}`,
      baseUrl: 'http://localhost:11434',
      modelId: 'llama3.2',
    }
    onChange([...endpoints, newEndpoint])
  }

  const updateEndpoint = (id: string, patch: Partial<Endpoint>) => {
    onChange(endpoints.map(ep => (ep.id === id ? { ...ep, ...patch } : ep)))
  }

  const removeEndpoint = (id: string) => {
    onChange(endpoints.filter(ep => ep.id !== id))
  }

  const applyPreset = (id: string, preset: (typeof PRESETS)[number]) => {
    updateEndpoint(id, { name: preset.label, baseUrl: preset.baseUrl, modelId: preset.modelId })
  }

  const testConnection = async (endpoint: Endpoint) => {
    setConnectStatus(s => ({ ...s, [endpoint.id]: 'checking' }))
    const result = await checkConnectivity(endpoint)
    setConnectStatus(s => ({ ...s, [endpoint.id]: result.ok ? 'ok' : 'error' }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            模型端点配置
          </span>
          <Button variant="outline" size="sm" onClick={addEndpoint}>
            <Plus className="h-4 w-4" /> 添加端点
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoints.map(ep => (
          <div key={ep.id} className="rounded-lg border border-border bg-background p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <div className="flex gap-1 flex-wrap">
                {PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => applyPreset(ep.id, preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEndpoint(ep.id)} title="删除端点">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">显示名称</label>
                <Input value={ep.name} onChange={e => updateEndpoint(ep.id, { name: e.target.value })} placeholder="My Model" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Base URL</label>
                <Input value={ep.baseUrl} onChange={e => updateEndpoint(ep.id, { baseUrl: e.target.value })} placeholder="http://localhost:11434" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Model ID</label>
                <ModelIdSelector
                  value={ep.modelId}
                  baseUrl={ep.baseUrl}
                  apiKey={ep.apiKey}
                  onChange={modelId => updateEndpoint(ep.id, { modelId })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">API Key (可选)</label>
                <Input type="password" value={ep.apiKey || ''} onChange={e => updateEndpoint(ep.id, { apiKey: e.target.value || undefined })} placeholder="sk-..." />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">使用 `/v1/models` 检查 CORS、鉴权和服务可达性。</p>
              <Button variant="outline" size="sm" onClick={() => testConnection(ep)} disabled={connectStatus[ep.id] === 'checking'} className="shrink-0">
              {connectStatus[ep.id] === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
              {connectStatus[ep.id] === 'ok' && <Wifi className="h-3 w-3 text-green-500" />}
              {connectStatus[ep.id] === 'error' && <WifiOff className="h-3 w-3 text-destructive" />}
              {!connectStatus[ep.id] && <Wifi className="h-3 w-3" />}
              检测连通性
              </Button>
            </div>
          </div>
        ))}
        {endpoints.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            点击"添加端点"开始配置模型 API
          </p>
        )}
      </CardContent>
    </Card>
  )
}
