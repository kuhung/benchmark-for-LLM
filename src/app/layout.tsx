import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
        <footer className="fixed bottom-2 right-3 text-xs text-muted-foreground opacity-60">
          v{process.env.NEXT_PUBLIC_GIT_VERSION || 'dev'}
        </footer>
      </body>
    </html>
  )
}
