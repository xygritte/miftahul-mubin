'use client'

import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react'
import { sitePath } from '@/lib/data/presentation'
import { useMemo, useState } from 'react'
import type { EventItem } from '@/lib/content'

const filters = ['Semua', 'Kajian', 'Sosial', 'Pendidikan', 'Pengurus']

export default function FilterableEvents({ items }: { items: EventItem[] }) {
  const [filter, setFilter] = useState('Semua')
  const filtered = useMemo(() => filter === 'Semua' ? items : items.filter((event) => event.category === filter), [items, filter])

  return (
    <>
      <div className="filter-row filter-row-interactive" role="group" aria-label="Filter kegiatan">
        {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="event-list-page" aria-live="polite">
        {filtered.map((event) => <article className="event-row" key={event.slug}>
          <div className="event-date large" aria-hidden="true"><strong>{event.day}</strong><span>{event.month}</span></div>
          <div className="event-row-content"><span className="event-label">{event.category}</span><h2><a href={sitePath(`/kegiatan/${event.slug}/`)}>{event.title}</a></h2><div className="event-details"><span><CalendarDays size={15}/>{event.date}</span><span><Clock3 size={15}/>{event.time}</span><span><MapPin size={15}/>{event.place}</span></div></div>
          <a className="event-status" href={sitePath(`/kegiatan/${event.slug}/`)} aria-label={`Detail ${event.title}`}>Detail <ArrowRight size={13}/></a>
        </article>)}
      </div>
      {filtered.length === 0 && <div className="empty-state"><strong>Belum ada kegiatan</strong><p>Belum tersedia agenda pada kategori ini.</p></div>}
    </>
  )
}
