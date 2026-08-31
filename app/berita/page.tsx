import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import FilterableNews from '@/components/content/FilterableNews'
import { contentRepository } from '@/lib/data'
import { newsRecordToLegacy } from '@/lib/data/presentation'

export default async function BeritaPage() {
  const records = await contentRepository.listNews()
  const items = records.map(newsRecordToLegacy)

  return (
    <SiteShell>
      <main id="main-content" className="inner-page">
        <div className="container">
          <PageIntro eyebrow="Portal Berita" title="Berita Miftahul Mubin" description="Kabar terbaru, cerita kegiatan, pengumuman, dan informasi dari lingkungan Masjid Miftahul Mubin." />
          <FilterableNews items={items} />
        </div>
      </main>
    </SiteShell>
  )
}
