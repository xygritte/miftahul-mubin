import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import FilterableEvents from '@/components/content/FilterableEvents'
import { contentRepository } from '@/lib/data'
import { eventRecordToLegacy } from '@/lib/data/presentation'

export default async function KegiatanPage() {
  const records = await contentRepository.listEvents()
  const items = records.map(eventRecordToLegacy)

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Agenda Masjid" title="Kegiatan Miftahul Mubin" description="Agenda ibadah, kajian, pendidikan, kegiatan sosial, dan program kemasyarakatan Masjid Miftahul Mubin." />
    <FilterableEvents items={items} />
  </div></main></SiteShell>
}
