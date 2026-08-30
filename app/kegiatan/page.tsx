import Link from 'next/link'
import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { CalendarDays, Clock3, MapPin, ArrowRight } from 'lucide-react'
import { events } from '@/lib/content'

export default function KegiatanPage() {
  return <SiteShell><main id="main-content" className="inner-page"><div className="container"><PageIntro eyebrow="Agenda Masjid" title="Kegiatan Miftahul Mubin" description="Agenda ibadah, kajian, pendidikan, kegiatan sosial, dan program kemasyarakatan Masjid Miftahul Mubin." /><div className="filter-row"><span>Semua</span><span>Kajian</span><span>Sosial</span><span>Pendidikan</span><span>Pengurus</span></div><div className="event-list-page">{events.map((event) => <article className="event-row" key={event.slug}><div className="event-date large"><strong>{event.day}</strong><span>{event.month}</span></div><div><span className="event-label">{event.category}</span><h2><Link href={`/kegiatan/${event.slug}/`}>{event.title}</Link></h2><div className="event-details"><span><CalendarDays size={15}/>{event.date}</span><span><Clock3 size={15}/>{event.time}</span><span><MapPin size={15}/>{event.place}</span></div></div><Link className="event-status" href={`/kegiatan/${event.slug}/`}>Detail <ArrowRight size={13}/></Link></article>)}</div></div></main></SiteShell>
}
