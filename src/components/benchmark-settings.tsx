'use client'

import { BenchmarkConfig } from '@/lib/benchmark/types'
import { PROMPT_PRESETS } from '@/lib/prompts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BenchmarkSettingsProps {
  config: BenchmarkConfig
  onChange: (config: BenchmarkConfig) => void
  compact?: boolean
}

export function BenchmarkSettings({ config, onChange, compact = false }: BenchmarkSettingsProps) {
  return (
    <div className={compact ? 'h-full flex flex-col' : 'space-y-5'}>
      <div className="flex-1 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Test Prompt</label>
          <div className="mb-3 flex flex-wrap gap-2">
            {PROMPT_PRESETS.map(preset => (
              <Button
                key={preset.id}
                variant={config.prompt === preset.content ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...config, prompt: preset.content })}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <textarea
            className={`${compact ? 'h-32' : 'h-24'} w-full resize-none border-2 border-border bg-background p-3 text-sm font-mono leading-6 transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-0`}
            value={config.prompt}
            onChange={e => onChange({ ...config, prompt: e.target.value })}
            placeholder="Enter custom prompt..."
          />
        </div>
        <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'md:grid-cols-3 gap-5'}`}>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Max Tokens</label>
            <Input
              type="number"
              value={config.maxTokens}
              onChange={e => onChange({ ...config, maxTokens: Number(e.target.value) || 256 })}
              min={16}
              max={4096}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Repeat Count</label>
            <Input
              type="number"
              value={config.repeatCount}
              onChange={e => onChange({ ...config, repeatCount: Number(e.target.value) || 5 })}
              min={1}
              max={50}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Concurrency</label>
            <div className="flex gap-2 bg-background">
              {[1, 2, 4, 8].map(level => (
                <Button
                  key={level}
                  variant={config.concurrencyLevels.includes(level) ? 'default' : 'outline'}
                  size="sm"
                  className="h-10 flex-1 px-2 font-mono"
                  onClick={() => {
                    const levels = config.concurrencyLevels.includes(level)
                      ? config.concurrencyLevels.filter(l => l !== level)
                      : [...config.concurrencyLevels, level].sort((a, b) => a - b)
                    if (levels.length > 0) onChange({ ...config, concurrencyLevels: levels })
                  }}
                >
                  {level}x
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
