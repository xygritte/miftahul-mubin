'use client'

import { useMemo, useState } from 'react'

type DocumentationItem = { id?: string; url: string; title?: string | null; sortOrder: number }

const filters = ['Semua', 'Kajian', 'Sosial', 'Pendidikan', 'Pemuda', 'Pengurus']

export default function FilterableDocumentation({ items }: { items: DocumentationItem[] }) {
  const [filter, setFilter] = useState('Semua')
  const mapped = useMemo(() => items.map((item) => {
    const parts = (item.title ?? '').split(' · ')
    return { ...item, displayTitle: parts[0] || 'Dokumentasi Miftahul Mubin', category: parts[1] || 'Umum' }
  }), [items])
  const filtered = useMemo(() => filter === 'Semua' ? mapped : mapped.filter((item) => item.category === filter), [filter, mapped])

  return <>
    <div className="filter-row filter-row-interactive" role="group" aria-label="Filter dokumentasi">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="gallery-page" aria-live="polite">
      {filtered.map((item) => <article key={item.id ?? item.url} className="gallery-card"><div className="gallery-image-wrap"><img src={item.url} alt={item.displayTitle} loading="lazy" /></div><div><span>{item.category}</span><h2>{item.displayTitle}</h2><small>Dokumentasi Miftahul Mubin</small></div></article>)}
    </div>
    {filtered.length === 0 && <div className="empty-state"><strong>Belum ada dokumentasi</strong><p>Belum tersedia dokumentasi pada kategori ini.</p></div>}
  </>
}
