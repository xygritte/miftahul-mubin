import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Miftahul Mubin — Portal Masjid',
  description: 'Portal informasi, kegiatan, berita, dan transparansi Masjid Miftahul Mubin.',
}

export const viewport: Viewport = {
  themeColor: '#083d31',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
