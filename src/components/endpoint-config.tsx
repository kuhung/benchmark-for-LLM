'use client'

import { useState } from 'react'
import { Endpoint } from '@/lib/benchmark/types'
import { checkConnectivity } from '@/lib/benchmark/runner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Wifi, WifiOff, Loader2 } from 'lucide-react'

const PRESETS = [
  { label: 'Ollama', baseUrl: 'http://localhost:11434', modelId: 'llama3.2' },
  { label: 'llama.cpp', baseUrl: 'http://localhost:8080', modelId: 'default' },
  { label: 'vLLM', baseUrl: 'http://localhost:8000', modelId: 'default' },
  { label: 'MLX', baseUrl: 'http://localhost:8080', modelId: 'default' },
]

interface EndpointConfigProps {
  endpoints: Endpoint[]
  onChange: (endpoints: Endpoint[]) => void
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
          <span>模型端点配置</span>
          <Button variant="outline" size="sm" onClick={addEndpoint}>
            <Plus className="h-4 w-4" /> 添加端点
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoints.map(ep => (
          <div key={ep.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-wrap">
                {PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => applyPreset(ep.id, preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEndpoint(ep.id)}>
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
                <Input value={ep.modelId} onChange={e => updateEndpoint(ep.id, { modelId: e.target.value })} placeholder="llama3.2" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">API Key (可选)</label>
                <Input type="password" value={ep.apiKey || ''} onChange={e => updateEndpoint(ep.id, { apiKey: e.target.value || undefined })} placeholder="sk-..." />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => testConnection(ep)} disabled={connectStatus[ep.id] === 'checking'}>
              {connectStatus[ep.id] === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
              {connectStatus[ep.id] === 'ok' && <Wifi className="h-3 w-3 text-green-500" />}
              {connectStatus[ep.id] === 'error' && <WifiOff className="h-3 w-3 text-destructive" />}
              {!connectStatus[ep.id] && <Wifi className="h-3 w-3" />}
              检测连通性
            </Button>
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
