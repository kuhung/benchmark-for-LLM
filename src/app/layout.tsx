import type { Metadata } from 'next'
import { Chakra_Petch, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const chakra = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'LLM Inference Benchmark',
  description: 'Lightweight LLM inference performance benchmark tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${chakra.variable} ${jetbrains.variable} min-h-screen antialiased font-sans`}>
        <div className="scanline-overlay" />
        <div className="noise-overlay" />
        {children}
        <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2">
          <div className="gradient-line flex-1 opacity-30" />
          <span className="shrink-0 px-3 text-[10px] text-muted-foreground/50 font-mono tracking-widest uppercase">
            v{process.env.NEXT_PUBLIC_GIT_VERSION || 'dev'} // kuhung.me
          </span>
          <div className="gradient-line flex-1 opacity-30" />
        </footer>
      </body>
    </html>
  )
}
