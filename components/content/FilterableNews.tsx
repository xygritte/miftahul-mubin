'use client'

import { ArrowRight } from 'lucide-react'
import { sitePath, type NewsItem } from '@/lib/data/presentation'
import { useMemo, useState } from 'react'

const filters = ['Semua', 'Masjid', 'Kegiatan', 'Keislaman', 'Sosial', 'Pendidikan', 'Pengumuman']

function matches(category: string, filter: string) {
  if (filter === 'Semua') return true
  if (filter === 'Masjid') return category === 'Masjid'
  if (filter === 'Kegiatan') return category === 'Kegiatan Masjid' || category === 'Kegiatan'
  return category === filter
}

export default function FilterableNews({ items }: { items: NewsItem[] }) {
  const [filter, setFilter] = useState('Semua')
  const filtered = useMemo(() => items.filter((item) => matches(item.category, filter)), [items, filter])

  return (
    <>
      <div className="filter-row filter-row-interactive" role="group" aria-label="Filter berita">
        {filters.map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="editorial-list" aria-live="polite">
        {filtered.map((item, i) => (
          <article className={i === 0 ? 'editorial-card lead' : 'editorial-card'} key={item.slug}>
            <div className="editorial-number">{String(i + 1).padStart(2, '0')}</div>
            <div>
              <span>{item.category}</span>
              <h2><a href={sitePath(`/berita/${item.slug}/`)}>{item.title}</a></h2>
              <small>{item.date}</small>
              <p>{item.excerpt}</p>
              <a href={sitePath(`/berita/${item.slug}/`)}>Baca berita <ArrowRight size={15} /></a>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state"><strong>Belum ada berita</strong><p>Belum tersedia berita pada kategori ini.</p></div>}
    </>
  )
}
