import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import FilterableIslamic from '@/components/content/FilterableIslamic'
import { islamicItems } from '@/lib/islamic'

export default function KeislamanPage() {
  return (
    <SiteShell>
      <main id="main-content" className="inner-page">
        <div className="container">
          <PageIntro eyebrow="Ruang Keislaman" title="Keislaman" description="Kumpulan artikel, kajian, khutbah, dan materi keislaman yang dipublikasikan untuk jamaah dan masyarakat." />
          <FilterableIslamic items={islamicItems} />
        </div>
      </main>
    </SiteShell>
  )
}
