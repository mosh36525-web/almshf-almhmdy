import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Amiri } from 'next/font/google'
import './globals.css'

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'المصحف المحمدي',
  description: 'منصة لعرض سور وآيات القرآن الكريم',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1f6b4a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
