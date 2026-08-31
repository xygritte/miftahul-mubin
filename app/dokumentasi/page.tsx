'use client'

import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { contentRepository } from '@/lib/data'
import { useMemo, useState } from 'react'

const filters = ['Semua', 'Kajian', 'Sosial', 'Pendidikan', 'Pemuda', 'Pengurus']

export default async function DokumentasiPage() {
  const [albums, items] = await Promise.all([
    contentRepository.listMediaAlbums(),
    contentRepository.listMediaItems(),
  ])
  const album = albums[0]
  const mapped = items.map((item) => {
    const parts = (item.title ?? '').split(' · ')
    return { ...item, displayTitle: parts[0] || 'Dokumentasi Miftahul Mubin', category: parts[1] || 'Umum' }
  })

  return <DokumentasiContent items={mapped} albumTitle={album?.title} />
}

function DokumentasiContent({ items, albumTitle }: { items: Array<{ id?: string; title?: string | null; url: string; sortOrder: number; displayTitle: string; category: string }>; albumTitle?: string }) {
  const [filter, setFilter] = useState('Semua')
  const filtered = useMemo(() => filter === 'Semua' ? items : items.filter((item) => item.category === filter), [items, filter])

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Arsip Kegiatan" title="Dokumentasi" description={albumTitle ? `${albumTitle} dan arsip momen pelayanan jamaah Masjid Miftahul Mubin.` : 'Kumpulan foto kegiatan dan momen pelayanan jamaah Masjid Miftahul Mubin.'} />
    <div className="filter-row filter-row-interactive" role="group" aria-label="Filter dokumentasi">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="gallery-page" aria-live="polite">
      {filtered.map((item) => <article key={item.id ?? item.url} className="gallery-card"><div className="gallery-image-wrap"><img src={item.url} alt={item.displayTitle} loading="lazy" /></div><div><span>{item.category}</span><h2>{item.displayTitle}</h2><small>Dokumentasi Miftahul Mubin</small></div></article>)}
    </div>
    {filtered.length === 0 && <div className="empty-state"><strong>Belum ada dokumentasi</strong><p>Belum tersedia dokumentasi pada kategori ini.</p></div>}
  </div></main></SiteShell>
}
