import type { Metadata, Viewport } from 'next'
import './globals.css'
import './polish.css'
import './header-portal.css'
import './theme-polish.css'
import './assets-polish.css'

export const metadata: Metadata = {
  title: {
    default: 'Miftahul Mubin — Portal Masjid',
    template: '%s — Miftahul Mubin',
  },
  description: 'Portal informasi, kegiatan, berita, keislaman, kepengurusan, dokumentasi, dan transparansi Masjid Miftahul Mubin.',
  applicationName: 'Miftahul Mubin',
  keywords: ['Miftahul Mubin', 'masjid', 'berita masjid', 'kegiatan masjid', 'keislaman', 'transparansi masjid'],
  authors: [{ name: 'Miftahul Mubin' }],
  creator: 'Miftahul Mubin',
  metadataBase: new URL('https://xygritte.github.io/miftahul-mubin/'),
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Miftahul Mubin',
    title: 'Miftahul Mubin — Portal Masjid',
    description: 'Portal informasi dan kegiatan Masjid Miftahul Mubin.',
  },
  twitter: {
    card: 'summary',
    title: 'Miftahul Mubin — Portal Masjid',
    description: 'Portal informasi dan kegiatan Masjid Miftahul Mubin.',
  },
}

export const viewport: Viewport = {
  themeColor: '#083d31',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

const themeBootstrap = `(() => { try { const saved = localStorage.getItem('mm-theme'); document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light'; } catch (_) { document.documentElement.dataset.theme = 'light'; } })()`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
