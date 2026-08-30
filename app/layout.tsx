import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Miftahul Mubin — Portal Masjid',
  description: 'Portal informasi, kegiatan, berita, dan transparansi Masjid Miftahul Mubin.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
