import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveManagement from '@/components/live/LiveManagement'
import { contentRepository } from '@/lib/data'

export default async function KepengurusanPage() {
  const periods = await contentRepository.listManagementPeriods()
  const activePeriod = periods.find((period) => period.isActive) ?? periods[0] ?? null
  const members = activePeriod ? await contentRepository.listManagementMembers(activePeriod.id) : []

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Profil Organisasi" title="Kepengurusan Miftahul Mubin" description="Informasi struktur pengurus dan bidang pelayanan yang menjalankan kegiatan Masjid Miftahul Mubin." />
    <LiveManagement initialPeriod={activePeriod} initialMembers={members} />
  </div></main></SiteShell>
}
