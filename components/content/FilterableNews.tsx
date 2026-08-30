'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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
            <Link href={`/berita/${item.slug}/`} className="news-page-image-link"><img src={item.image} alt={item.title} /></Link>
            <div>
              <span className="tag static">{item.category}</span>
              <small>{item.date}</small>
              <h2><Link href={`/berita/${item.slug}/`}>{item.title}</Link></h2>
              <p>{item.excerpt}</p>
              <Link href={`/berita/${item.slug}/`}>Baca selengkapnya <ArrowRight size={16} /></Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state"><strong>Belum ada berita</strong><p>Belum tersedia berita pada kategori ini.</p></div>}
    </>
  )
}
