import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SiteShell from '@/components/layout/SiteShell'

export default function NotFound(){return <SiteShell><main id="main-content" className="inner-page"><div className="container not-found-page"><span className="eyebrow">404</span><h1>Halaman tidak ditemukan.</h1><p>Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p><Link className="button-link" href="/"><ArrowLeft size={16}/> Kembali ke beranda</Link></div></main></SiteShell>}
