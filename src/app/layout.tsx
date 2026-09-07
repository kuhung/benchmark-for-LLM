import type { Metadata } from 'next'
import { Chakra_Petch, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/lib/i18n'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const chakra = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

const SITE_URL = 'https://benchmark-for-llm.kuhung.me'

export const metadata: Metadata = {
  title: 'LLM Inference Benchmark - Measure TTFT, TPS & Latency for Local LLM Servers',
  description:
    'Free browser-based benchmark tool for LLM inference performance. Measure Time to First Token (TTFT), Tokens Per Second (TPS), Inter-Token Latency (ITL), and concurrency scaling across Ollama, vLLM, llama.cpp, LM Studio, and MLX. Compare models side-by-side with interactive charts.',
  keywords: [
    'LLM benchmark', 'LLM inference', 'TTFT', 'TPS', 'tokens per second',
    'inter-token latency', 'Ollama benchmark', 'vLLM benchmark', 'llama.cpp benchmark',
    'LM Studio', 'MLX', 'local LLM', 'inference performance', 'AI benchmark',
    'large language model', 'model comparison', 'concurrency scaling',
  ],
  authors: [{ name: 'kuhung', url: 'https://kuhung.me' }],
  creator: 'kuhung',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'LLM Inference Benchmark - Measure TTFT, TPS & Latency',
    description:
      'Free browser-based tool to benchmark local LLM inference. Compare Ollama, vLLM, llama.cpp, LM Studio & MLX with real-time TTFT, TPS, and concurrency metrics.',
    siteName: 'LLM Inference Benchmark',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM Inference Benchmark - Measure TTFT, TPS & Latency',
    description:
      'Free browser-based tool to benchmark local LLM inference. Compare Ollama, vLLM, llama.cpp & more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LLM Inference Benchmark',
  url: SITE_URL,
  description:
    'Free browser-based benchmark tool for measuring LLM inference performance including TTFT, TPS, ITL, and concurrency scaling.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'kuhung', url: 'https://kuhung.me' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is TTFT (Time to First Token)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TTFT measures the time from sending a request to receiving the first output token (in milliseconds). It reflects the prompt processing (prefill) speed. A TTFT under 200ms feels instant, 200-500ms is acceptable, and over 1 second causes noticeable delay.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is TPS (Tokens Per Second)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TPS is the decode rate from the first token to the last token. It measures how fast the model generates output. Human reading speed is about 4 t/s, a fluent chat experience needs 30+ t/s, and Apple M4 Max local inference can reach 60-80 t/s.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which LLM inference frameworks are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any service compatible with the OpenAI /v1/chat/completions streaming API works, including Ollama, LM Studio, llama.cpp, vLLM, and MLX LM.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I fix CORS issues when benchmarking local servers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enable CORS on your inference server (e.g., OLLAMA_ORIGINS="*" ollama serve), run LLM Inference Benchmark locally via npm run dev, or use the Python CLI runner to bypass the browser entirely.',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-S9K4XS0DZ6" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-S9K4XS0DZ6');
        ` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className={`${chakra.variable} ${jetbrains.variable} min-h-screen antialiased font-sans bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            {children}
            <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4 py-2 pointer-events-none">
              <span className="text-[11px] text-muted-foreground/40 font-mono">
                v{process.env.NEXT_PUBLIC_GIT_VERSION || 'dev'}
              </span>
            </footer>
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

