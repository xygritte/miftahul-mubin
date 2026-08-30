import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react'
import type { EventItem } from '@/lib/content'

export default function EventDetail({ event }: { event: EventItem }) {
  return (
    <main id="main-content" className="inner-page">
      <div className="container article-layout">
        <article className="event-detail">
          <Link className="back-link" href="/kegiatan/"><ArrowLeft size={15}/> Kembali ke kegiatan</Link>
          <div className="article-kicker"><span>{event.category}</span><span>•</span><span>Akan datang</span></div>
          <h1>{event.title}</h1>
          <p className="article-lead">{event.description}</p>
          <div className="event-info-grid">
            <div><CalendarDays size={20}/><span>Tanggal</span><strong>{event.date}</strong></div>
            <div><Clock3 size={20}/><span>Waktu</span><strong>{event.time}</strong></div>
            <div><MapPin size={20}/><span>Lokasi</span><strong>{event.place}</strong></div>
          </div>
          <div className="event-detail-note"><span className="eyebrow">Informasi</span><p>Jamaah dipersilakan hadir sesuai waktu yang tertera. Informasi teknis dapat berubah mengikuti keputusan panitia dan akan diumumkan melalui kanal resmi masjid.</p></div>
          <div className="article-share"><span>Catat agenda ini dalam kalender Anda.</span><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></div>
        </article>
        <aside className="article-sidebar">
          <div className="sidebar-card"><span className="eyebrow">Agenda Lain</span><h2>Temukan kegiatan lainnya</h2><Link href="/kegiatan/">Semua kegiatan <ArrowRight size={15}/></Link><Link href="/pengumuman/">Pengumuman <ArrowRight size={15}/></Link><Link href="/dokumentasi/">Dokumentasi <ArrowRight size={15}/></Link></div>
        </aside>
      </div>
    </main>
  )
}
