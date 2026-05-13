'use client'

import { BenchmarkConfig } from '@/lib/benchmark/types'
import { PROMPT_PRESETS } from '@/lib/prompts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BenchmarkSettingsProps {
  config: BenchmarkConfig
  onChange: (config: BenchmarkConfig) => void
}

export function BenchmarkSettings({ config, onChange }: BenchmarkSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>测评参数</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">测试 Prompt</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {PROMPT_PRESETS.map(preset => (
              <Button
                key={preset.id}
                variant={config.prompt === preset.content ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...config, prompt: preset.content })}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <textarea
            className="w-full h-24 rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            value={config.prompt}
            onChange={e => onChange({ ...config, prompt: e.target.value })}
            placeholder="输入自定义 Prompt..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">最大输出 Tokens</label>
            <Input
              type="number"
              value={config.maxTokens}
              onChange={e => onChange({ ...config, maxTokens: Number(e.target.value) || 256 })}
              min={16}
              max={4096}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">重复次数</label>
            <Input
              type="number"
              value={config.repeatCount}
              onChange={e => onChange({ ...config, repeatCount: Number(e.target.value) || 5 })}
              min={1}
              max={50}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">并发级别</label>
            <div className="flex gap-1 pt-1">
              {[1, 2, 4, 8].map(level => (
                <Button
                  key={level}
                  variant={config.concurrencyLevels.includes(level) ? 'default' : 'outline'}
                  size="sm"
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
      </CardContent>
    </Card>
  )
}
