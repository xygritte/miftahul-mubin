'use client'

import { ArrowRight } from 'lucide-react'
import { sitePath } from '@/lib/data/presentation'
import type { NewsItem } from '@/lib/content'
import { useMemo, useState } from 'react'

const filters = ['Semua', 'Masjid', 'Kegiatan', 'Keislaman', 'Sosial', 'Pendidikan', 'Pengumuman']

function matches(category: string, filter: string) {
  if (filter === 'Semua') return true
  if (filter === 'Masjid') return category === 'Masjid'
  if (filter === 'Kegiatan') return category === 'Kegiatan Masjid'
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
      <div className="news-page-grid" aria-live="polite">
        {filtered.map((item, index) => (
          <article className={index === 0 ? 'news-page-card featured' : 'news-page-card'} key={item.slug}>
            <a href={sitePath(`/berita/${item.slug}/`)} className="news-page-image-link"><img src={item.image} alt={item.title} /></a>
            <div>
              <span className="tag static">{item.category}</span>
              <small>{item.date}</small>
              <h2><a href={sitePath(`/berita/${item.slug}/`)}>{item.title}</a></h2>
              <p>{item.excerpt}</p>
              <a href={sitePath(`/berita/${item.slug}/`)}>Baca selengkapnya <ArrowRight size={16} /></a>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state"><strong>Belum ada berita</strong><p>Belum tersedia berita pada kategori ini.</p></div>}
    </>
  )
}
