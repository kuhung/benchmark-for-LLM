'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Endpoint } from '@/lib/benchmark/types'
import { checkConnectivity, fetchModels } from '@/lib/benchmark/runner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Wifi, WifiOff, Loader2, ChevronDown, Search, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export const PRESETS = [
  { label: 'Ollama', baseUrl: 'http://localhost:11434', modelId: 'default' },
  { label: 'LM Studio', baseUrl: 'http://localhost:1234', modelId: 'default' },
  { label: 'oMLX', baseUrl: 'http://localhost:8000', modelId: 'default' },
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
  const { t } = useI18n()
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
        setError('noModelsFound') // will be translated later
      }
    } else {
      setModels([])
      setError(result.error ?? 'requestFailed')
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
      <div className="flex gap-1.5">
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="llama3.2"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleToggle}
          title={t('discoverModels')}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          )}
        </Button>
      </div>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg animate-fade-in" style={{ animationDuration: '150ms' }}>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground/50"
              placeholder={t('searchModel')}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('discoveringModels')}
              </div>
            )}
            {!loading && error && (
              <div className="px-3 py-3 text-xs text-destructive text-center font-mono">{t(error as any)}</div>
            )}
            {!loading && !error && filtered.length === 0 && models.length > 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground text-center">{t('noMatch')}</div>
            )}
            {!loading &&
              filtered.map(m => (
                <button
                  key={m}
                  className={`w-full text-left px-3 py-2 text-sm font-mono hover:bg-accent transition-colors flex items-center gap-2 ${
                    m === value ? 'text-primary font-medium' : 'text-foreground'
                  }`}
                  onClick={() => {
                    onChange(m)
                    setOpen(false)
                  }}
                >
                  {m === value && <Check className="h-3 w-3 shrink-0" />}
                  <span className={m === value ? '' : 'ml-5'}>{m}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function EndpointConfig({ endpoints, onChange }: EndpointConfigProps) {
  const { t } = useI18n()
  const [connectStatus, setConnectStatus] = useState<Record<string, 'checking' | 'ok' | 'error'>>({})

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: crypto.randomUUID(),
      name: `${t('defaultEndpointName')} ${endpoints.length + 1}`,
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
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t('endpoints')}</h2>
        <Button variant="outline" size="sm" onClick={addEndpoint}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> {t('add')}
        </Button>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div
            key={ep.id}
            className="rounded-md border border-border bg-background p-4 space-y-4"
          >
            {/* Preset 快捷选择 + 删除 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant={ep.name === preset.label ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => applyPreset(ep.id, preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeEndpoint(ep.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* 核心配置字段 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t('name')}</label>
                <Input value={ep.name} onChange={e => updateEndpoint(ep.id, { name: e.target.value })} placeholder="My Model" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t('baseUrl')}</label>
                <Input value={ep.baseUrl} onChange={e => updateEndpoint(ep.id, { baseUrl: e.target.value })} placeholder="http://localhost:11434" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t('modelId')}</label>
                <ModelIdSelector
                  value={ep.modelId}
                  baseUrl={ep.baseUrl}
                  apiKey={ep.apiKey}
                  onChange={modelId => updateEndpoint(ep.id, { modelId })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t('apiKeyOptional')}</label>
                <Input type="password" value={ep.apiKey || ''} onChange={e => updateEndpoint(ep.id, { apiKey: e.target.value || undefined })} placeholder="sk-..." />
              </div>
            </div>

            {/* 连通性测试 */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection(ep)}
                disabled={connectStatus[ep.id] === 'checking'}
                className={`transition-colors ${
                  connectStatus[ep.id] === 'ok' ? 'border-green-500/50 text-green-500' :
                  connectStatus[ep.id] === 'error' ? 'border-destructive/50 text-destructive' : ''
                }`}
              >
                {connectStatus[ep.id] === 'checking' && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                {connectStatus[ep.id] === 'ok' && <Wifi className="h-3.5 w-3.5 mr-1.5" />}
                {connectStatus[ep.id] === 'error' && <WifiOff className="h-3.5 w-3.5 mr-1.5" />}
                {!connectStatus[ep.id] && <Wifi className="h-3.5 w-3.5 mr-1.5 opacity-50" />}
                {t('testConnection')}
              </Button>
            </div>
          </div>
        ))}

        {endpoints.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('noEndpoints')}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t('clickAdd')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
