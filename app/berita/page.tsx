import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { news } from '@/lib/content'

export default function BeritaPage() {
  return (
    <SiteShell>
      <main id="main-content" className="inner-page">
        <div className="container">
          <PageIntro eyebrow="Portal Berita" title="Berita Miftahul Mubin" description="Kabar terbaru, cerita kegiatan, pengumuman, dan informasi dari lingkungan Masjid Miftahul Mubin." />
          <div className="filter-row"><span>Semua</span><span>Masjid</span><span>Kegiatan</span><span>Keislaman</span><span>Sosial</span><span>Pendidikan</span><span>Pengumuman</span></div>
          <div className="news-page-grid">
            {news.map((item, index) => (
              <article className={index === 0 ? 'news-page-card featured' : 'news-page-card'} key={item.slug}>
                <Link href={`/berita/${item.slug}/`} className="news-page-image-link"><img src={item.image} alt={item.title} /></Link>
                <div>
                  <span className="tag static">{item.category}</span>
                  <small>{item.date}</small>
                  <h2><Link href={`/berita/${item.slug}/`}>{item.title}</Link></h2>
                  <p>{item.excerpt}</p>
                  <Link href={`/berita/${item.slug}/`}>Baca selengkapnya <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </SiteShell>
  )
}
