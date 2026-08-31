import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveAnnouncements from '@/components/live/LiveAnnouncements'
import { contentRepository } from '@/lib/data'

export default async function PengumumanPage() {
  const notices = await contentRepository.listAnnouncements()

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Informasi Resmi" title="Pengumuman" description="Informasi resmi, pemberitahuan, dan pengumuman terbaru dari pengurus Masjid Miftahul Mubin." />
    <LiveAnnouncements initialItems={notices} />
  </div></main></SiteShell>
}
