import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import FilterableNews from '@/components/content/FilterableNews'
import { news } from '@/lib/content'

export default function BeritaPage() {
  return (
    <SiteShell>
      <main id="main-content" className="inner-page">
        <div className="container">
          <PageIntro eyebrow="Portal Berita" title="Berita Miftahul Mubin" description="Kabar terbaru, cerita kegiatan, pengumuman, dan informasi dari lingkungan Masjid Miftahul Mubin." />
          <FilterableNews items={news} />
        </div>
      </main>
    </SiteShell>
  )
}
