'use client'

import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LangToggle() {
  const { lang, setLang } = useI18n()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      title={lang === 'en' ? '切换到中文' : 'Switch to English'}
    >
      <Languages className="h-4 w-4" />
    </Button>
  )
}
