'use client'

import { BenchmarkConfig } from '@/lib/benchmark/types'
import { PROMPT_PRESETS } from '@/lib/prompts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

interface BenchmarkSettingsProps {
  config: BenchmarkConfig
  onChange: (config: BenchmarkConfig) => void
  compact?: boolean
}

export function BenchmarkSettings({ config, onChange }: BenchmarkSettingsProps) {
  const { t, lang } = useI18n()

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div>
        <label className="mb-1.5 block text-xs text-muted-foreground">{t('testPrompt')}</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {PROMPT_PRESETS.map(preset => {
            const isActive = config.promptId === preset.id || (
              !config.promptId && typeof config.prompt !== 'string' && config.prompt.en === preset.content.en && config.prompt.zh === preset.content.zh
            )
            return (
              <Button
                key={preset.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onChange({ ...config, prompt: { ...preset.content }, promptId: preset.id })}
                className="h-7 px-2.5 text-xs"
                title={preset.description[lang]}
              >
                {preset.label[lang]}
              </Button>
            )
          })}
        </div>
        <textarea
          className="h-24 w-full resize-none rounded-md border border-border bg-background p-3 text-sm font-mono leading-relaxed transition-colors placeholder:text-muted-foreground/40 focus-visible:border-primary focus-visible:outline-none"
          value={typeof config.prompt === 'string' ? config.prompt : config.prompt[lang]}
          onChange={e => {
            if (typeof config.prompt === 'string') {
              onChange({ ...config, prompt: e.target.value, promptId: undefined })
            } else {
              const newPrompt = { ...config.prompt, [lang]: e.target.value }
              const matchedPreset = PROMPT_PRESETS.find(p => p.content.en === newPrompt.en && p.content.zh === newPrompt.zh)
              onChange({ ...config, prompt: newPrompt, promptId: matchedPreset?.id })
            }
          }}
          placeholder={t('enterPrompt')}
        />
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">{t('maxTokens')}</label>
          <Input
            type="number"
            value={config.maxTokens}
            onChange={e => onChange({ ...config, maxTokens: Number(e.target.value) || 256 })}
            min={16}
            max={4096}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">{t('repeatCount')}</label>
          <Input
            type="number"
            value={config.repeatCount}
            onChange={e => onChange({ ...config, repeatCount: Number(e.target.value) || 5 })}
            min={1}
            max={50}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">{t('concurrency')}</label>
          <div className="flex gap-1.5">
            {[1, 2, 4, 8].map(level => (
              <Button
                key={level}
                variant={config.concurrencyLevels.includes(level) ? 'default' : 'outline'}
                size="sm"
                className="h-9 flex-1 px-2 font-mono text-xs"
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

      {/* Thinking Mode */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">{t('thinkingMode')}</label>
          <button
            type="button"
            role="switch"
            aria-checked={config.thinkingEnabled ?? false}
            onClick={() => onChange({ ...config, thinkingEnabled: !(config.thinkingEnabled ?? false) })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
              config.thinkingEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                config.thinkingEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground/70 leading-relaxed">
          {t('thinkingDesc')}
        </p>
      </div>
    </div>
  )
}
