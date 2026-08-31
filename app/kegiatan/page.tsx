'use client'

import Link from 'next/link'
import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { CalendarDays, Clock3, MapPin, ArrowRight } from 'lucide-react'
import { events } from '@/lib/content'
import { useMemo, useState } from 'react'

const filters = ['Semua', 'Kajian', 'Sosial', 'Pendidikan', 'Pengurus']

export default function KegiatanPage() {
  const [filter, setFilter] = useState('Semua')
  const filtered = useMemo(
    () => filter === 'Semua' ? events : events.filter((event) => event.category === filter),
    [filter],
  )

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Agenda Masjid" title="Kegiatan Miftahul Mubin" description="Agenda ibadah, kajian, pendidikan, kegiatan sosial, dan program kemasyarakatan Masjid Miftahul Mubin." />
    <div className="filter-row filter-row-interactive" role="group" aria-label="Filter kegiatan">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="event-list-page" aria-live="polite">
      {filtered.map((event) => <article className="event-row" key={event.slug}>
        <div className="event-date large" aria-hidden="true"><strong>{event.day}</strong><span>{event.month}</span></div>
        <div className="event-row-content"><span className="event-label">{event.category}</span><h2><Link href={`/kegiatan/${event.slug}/`}>{event.title}</Link></h2><div className="event-details"><span><CalendarDays size={15}/>{event.date}</span><span><Clock3 size={15}/>{event.time}</span><span><MapPin size={15}/>{event.place}</span></div></div>
        <Link className="event-status" href={`/kegiatan/${event.slug}/`} aria-label={`Detail ${event.title}`}>Detail <ArrowRight size={13}/></Link>
      </article>)}
    </div>
    {filtered.length === 0 && <div className="empty-state"><strong>Belum ada kegiatan</strong><p>Belum tersedia agenda pada kategori ini.</p></div>}
  </div></main></SiteShell>
}
