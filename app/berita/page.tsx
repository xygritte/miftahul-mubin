import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveNewsList from '@/components/live/LiveNewsList'
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
          <LiveNewsList initialItems={items} />
        </div>
      </main>
    </SiteShell>
  )
}
