import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveDocumentation from '@/components/live/LiveDocumentation'
import { contentRepository } from '@/lib/data'

export default async function DokumentasiPage() {
  const [albums, items] = await Promise.all([
    contentRepository.listMediaAlbums(),
    contentRepository.listMediaItems(),
  ])
  const album = albums[0]

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Arsip Kegiatan" title="Dokumentasi" description={album?.title ? `${album.title} dan arsip momen pelayanan jamaah Masjid Miftahul Mubin.` : 'Kumpulan foto kegiatan dan momen pelayanan jamaah Masjid Miftahul Mubin.'} />
    <LiveDocumentation initialItems={items} />
  </div></main></SiteShell>
}
