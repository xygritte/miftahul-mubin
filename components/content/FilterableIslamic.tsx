'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { IslamicItem } from '@/lib/islamic'

const filters = ['Semua', 'Khutbah', 'Kajian', 'Al-Qur’an', 'Fiqih', 'Akhlak', 'Pendidikan']

export default function FilterableIslamic({ items }: { items: IslamicItem[] }) {
  const [filter, setFilter] = useState('Semua')
  const filtered = useMemo(() => filter === 'Semua' ? items : items.filter((item) => item.category === filter), [items, filter])

  return (
    <>
      <div className="filter-row filter-row-interactive" role="tablist" aria-label="Filter materi keislaman">
        {filters.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
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
              <h2><Link href={`/keislaman/${item.slug}/`}>{item.title}</Link></h2>
              <small>{item.date}</small>
              <p>{item.excerpt}</p>
              <Link href={`/keislaman/${item.slug}/`}>Baca artikel <ArrowRight size={15} /></Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state"><strong>Belum ada materi</strong><p>Belum tersedia artikel pada kategori ini.</p></div>}
    </>
  )
}
