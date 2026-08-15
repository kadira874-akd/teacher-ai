import './globals.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

// Single, self-hosted, non-render-blocking font strategy.
// Replaces the old dual-font setup (Inter via next/font + Plus Jakarta Sans
// via render-blocking @import in globals.css, which also referenced an
// undefined --font-plus-jakarta CSS variable). This removes FOUT/layout
// shift on first paint and unifies typography across the whole app.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata = {
  title: 'TeacherAI - Sistem Rapor Digital',
  description: 'Sistem Rapor Digital untuk Wali Kelas Indonesia',
  applicationName: 'TeacherAI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TeacherAI',
  },
  formatDetection: {
    telephone: false,
  },
}

// Next 14/15/16: viewport must be its own export, not part of `metadata`.
// `viewportFit: 'cover'` is critical here — without it, iOS Safari never
// populates env(safe-area-inset-*), so every safe-area-bottom / notch rule
// already written in globals.css silently does nothing on iPhone.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className={plusJakarta.className}>
        {children}
      </body>
    </html>
  )
}
