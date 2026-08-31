import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Keep the 404 page independent from SiteShell/content data so Next.js can
 * always generate it during a static production build, including builds where
 * public Supabase environment variables are not available.
 */
export default function NotFound() {
  return (
    <>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link className="brand" href="/" aria-label="Miftahul Mubin">
            Miftahul Mubin
          </Link>
        </div>
      </header>
      <main id="main-content" className="inner-page">
        <div className="container not-found-page">
          <span className="eyebrow">404</span>
          <h1>Halaman tidak ditemukan.</h1>
          <p>Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p>
          <Link className="button-link" href="/">
            <ArrowLeft size={16} />
            Kembali ke beranda
          </Link>
        </div>
      </main>
    </>
  )
}
