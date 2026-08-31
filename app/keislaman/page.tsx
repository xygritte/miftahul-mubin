import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveIslamic from '@/components/live/LiveIslamic'
import { contentRepository } from '@/lib/data'
import { islamicRecordToLegacy } from '@/lib/data/presentation'

export default async function KeislamanPage() {
  const records = await contentRepository.listIslamic()
  const items = records.map(islamicRecordToLegacy)

  return (
    <SiteShell>
      <main id="main-content" className="inner-page">
        <div className="container">
          <PageIntro eyebrow="Ruang Keislaman" title="Keislaman" description="Kumpulan artikel, kajian, khutbah, dan materi keislaman yang dipublikasikan untuk jamaah dan masyarakat." />
          <LiveIslamic initialItems={items} />
        </div>
      </main>
    </SiteShell>
  )
}
