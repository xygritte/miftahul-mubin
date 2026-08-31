'use client'

import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { useMemo, useState } from 'react'

const media = [
  ['Kajian Akbar Miftahul Mubin', 'Kajian', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'],
  ['Kegiatan Pemuda Masjid', 'Pemuda', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'],
  ['Penyaluran Bantuan Sosial', 'Sosial', 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80'],
  ['Kelas Al-Qur’an Anak', 'Pendidikan', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80'],
  ['Kerja Bakti Lingkungan', 'Sosial', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80'],
  ['Rapat Pengurus', 'Pengurus', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80'],
] as const

const filters = ['Semua', 'Kajian', 'Sosial', 'Pendidikan', 'Pemuda', 'Pengurus']

export default function DokumentasiPage() {
  const [filter, setFilter] = useState('Semua')
  const filtered = useMemo(() => filter === 'Semua' ? media : media.filter(([, category]) => category === filter), [filter])

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Arsip Kegiatan" title="Dokumentasi" description="Kumpulan foto kegiatan dan momen pelayanan jamaah Masjid Miftahul Mubin." />
    <div className="filter-row filter-row-interactive" role="group" aria-label="Filter dokumentasi">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="gallery-page" aria-live="polite">
      {filtered.map(([title, category, image]) => <article key={title} className="gallery-card">
        <div className="gallery-image-wrap"><img src={image} alt={title} loading="lazy" /></div>
        <div><span>{category}</span><h2>{title}</h2><small>Dokumentasi Miftahul Mubin · 2026</small></div>
      </article>)}
    </div>
    {filtered.length === 0 && <div className="empty-state"><strong>Belum ada dokumentasi</strong><p>Belum tersedia dokumentasi pada kategori ini.</p></div>}
  </div></main></SiteShell>
}
