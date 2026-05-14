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
        {children}
        <footer className="fixed bottom-2 right-3 text-xs text-muted-foreground opacity-60 font-mono">
          v{process.env.NEXT_PUBLIC_GIT_VERSION || 'dev'}
        </footer>
      </body>
    </html>
  )
}
