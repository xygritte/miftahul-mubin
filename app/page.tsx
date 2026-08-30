import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import SiteShell from '@/components/layout/SiteShell'

const highlights = [
  { title: 'Berita Miftahul Mubin', text: 'Ikuti kabar, pengumuman, dan cerita kegiatan terbaru dari masjid.', href: '/berita/' },
  { title: 'Agenda Kegiatan', text: 'Temukan jadwal kajian, kegiatan sosial, pendidikan, dan agenda jamaah.', href: '/kegiatan/' },
  { title: 'Transparansi Keuangan', text: 'Lihat ringkasan dan laporan keuangan masjid secara terbuka.', href: '/keuangan/' },
]

const upcoming = [
  { day: '03', month: 'SEP', title: 'Kajian Rutin Kamis', time: '19.30 WIB', place: 'Aula Masjid Miftahul Mubin' },
  { day: '05', month: 'SEP', title: 'Santunan Yatim & Dhuafa', time: '09.00 WIB', place: 'Halaman Masjid' },
  { day: '07', month: 'SEP', title: 'Kajian Ahad Pagi', time: '07.30 WIB', place: 'Ruang Utama Masjid' },
]

export default function Home() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="home-hero">
          <div className="container home-hero-inner">
            <span className="eyebrow">Selamat Datang</span>
            <h1>Miftahul Mubin</h1>
            <p>Masjid dan pusat kegiatan umat yang menjadi ruang ibadah, ilmu, pelayanan, dan kebersamaan masyarakat.</p>
            <div className="hero-actions"><Link className="button-link" href="/profil/">Mengenal Masjid <ArrowRight size={17} /></Link><Link className="hero-secondary" href="/kegiatan/">Lihat Kegiatan <ArrowRight size={17} /></Link></div>
          </div>
        </section>

        <section className="home-highlights container">
          {highlights.map((item) => <Link className="home-highlight" key={item.title} href={item.href}><span className="eyebrow">Miftahul Mubin</span><h2>{item.title}</h2><p>{item.text}</p><strong>Jelajahi <ArrowRight size={16} /></strong></Link>)}
        </section>

        <section className="home-agenda container">
          <div className="home-section-heading"><div><span className="eyebrow">Agenda</span><h2>Kegiatan Terdekat</h2></div><Link href="/kegiatan/">Semua kegiatan <ArrowRight size={16} /></Link></div>
          <div className="events-grid">{upcoming.map((event) => <article className="event-card" key={event.title}><div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div><div><span className="event-label">Akan Datang</span><h3>{event.title}</h3><p><CalendarDays size={15} /> {event.time}</p><p><MapPin size={15} /> {event.place}</p></div></article>)}</div>
        </section>

        <section className="home-closing container">
          <span className="eyebrow">Portal Miftahul Mubin</span>
          <h2>Satu pintu untuk informasi masjid.</h2>
          <p>Berita, kegiatan, keislaman, dokumentasi, kepengurusan, dan laporan keuangan tersedia dalam halaman khusus agar informasi lebih terstruktur dan mudah ditemukan.</p>
          <div className="home-links"><Link href="/berita/">Berita <ArrowRight size={16} /></Link><Link href="/keislaman/">Keislaman <ArrowRight size={16} /></Link><Link href="/kepengurusan/">Kepengurusan <ArrowRight size={16} /></Link><Link href="/keuangan/">Keuangan <ArrowRight size={16} /></Link></div>
        </section>
      </main>
    </SiteShell>
  )
}
