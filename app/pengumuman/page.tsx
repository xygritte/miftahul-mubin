import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { contentRepository } from '@/lib/data'
import { formatIndonesianDate } from '@/lib/data/presentation'

export default async function PengumumanPage() {
  const notices = await contentRepository.listAnnouncements()

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Informasi Resmi" title="Pengumuman" description="Informasi resmi, pemberitahuan, dan pengumuman terbaru dari pengurus Masjid Miftahul Mubin." />
    <div className="notice-list">
      {notices.map((notice, index) => <article key={notice.id ?? notice.title}>
        <div className="notice-index">{String(index + 1).padStart(2, '0')}</div>
        <div><span>Informasi Resmi</span><h2>{notice.title}</h2><small>{formatIndonesianDate(notice.publishedAt)}</small><p>{notice.content}</p></div>
      </article>)}
    </div>
    {notices.length === 0 && <div className="empty-state"><strong>Belum ada pengumuman</strong><p>Belum tersedia pengumuman yang dipublikasikan.</p></div>}
  </div></main></SiteShell>
}
