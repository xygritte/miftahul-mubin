import Link from 'next/link'
import { ArrowRight, Bell, CalendarDays, ChevronRight, MapPin, Sparkles } from 'lucide-react'
import SiteShell from '@/components/layout/SiteShell'
import { events, news } from '@/lib/content'
import { islamicItems } from '@/lib/islamic'

const highlights = [
  { kicker: 'Kabar Masjid', title: 'Berita Miftahul Mubin', text: 'Ikuti kabar, pengumuman, dan cerita kegiatan terbaru dari masjid.', href: '/berita/' },
  { kicker: 'Jadwal Umat', title: 'Agenda Kegiatan', text: 'Temukan kajian, kegiatan sosial, pendidikan, dan agenda jamaah.', href: '/kegiatan/' },
  { kicker: 'Amanah Bersama', title: 'Transparansi Keuangan', text: 'Lihat ringkasan pengelolaan dana masjid secara terbuka dan terstruktur.', href: '/keuangan/' },
]

const services = [
  ['Kajian & Dakwah', 'Materi dan agenda untuk menumbuhkan ilmu serta kebersamaan.', '/keislaman/'],
  ['Pendidikan', 'Program pembelajaran Al-Qur’an dan kegiatan pendidikan jamaah.', '/kegiatan/'],
  ['Pelayanan Sosial', 'Ruang kolaborasi untuk santunan, bakti sosial, dan kepedulian warga.', '/kegiatan/'],
  ['Dokumentasi', 'Arsip kegiatan dan momen kebersamaan Miftahul Mubin.', '/dokumentasi/'],
] as const

const announcements = [
  { date: '24 Agustus 2026', title: 'Pendaftaran Relawan Kegiatan Sosial Masjid Dibuka', href: '/pengumuman/' },
  { date: '22 Agustus 2026', title: 'Kelas Al-Qur’an untuk Anak dan Remaja Dimulai September', href: '/berita/kelas-al-quran-anak-remaja/' },
  { date: '20 Agustus 2026', title: 'Persiapan Fasilitas Masjid Menjelang Agenda Akhir Bulan', href: '/berita/persiapan-fasilitas-masjid-akhir-bulan/' },
]

export default function Home() {
  const featured = news[0]
  const latest = news.slice(1, 4)
  const popular = news.slice(1, 5)
  const upcoming = events.slice(0, 3)
  const islamicHighlights = islamicItems.slice(0, 3)

  return (
    <SiteShell>
      <main id="main-content">
        <section className="home-hero">
          <div className="container home-hero-grid">
            <div className="home-hero-copy">
              <span className="eyebrow hero-eyebrow">Masjid &amp; Pusat Kegiatan Umat</span>
              <h1>Miftahul Mubin</h1>
              <p>Tempat ibadah, ruang ilmu, pelayanan masyarakat, dan titik temu untuk membangun kebersamaan yang tumbuh dari masjid.</p>
              <div className="hero-actions">
                <Link className="button-link" href="/profil/">Mengenal Masjid <ArrowRight size={17} /></Link>
                <Link className="hero-secondary" href="/kegiatan/">Lihat Agenda <ArrowRight size={17} /></Link>
              </div>
            </div>
            <div className="home-hero-card">
              <div className="hero-card-top"><span className="eyebrow">Informasi Utama</span><Sparkles size={17} aria-hidden="true" /></div>
              <strong>Portal resmi Miftahul Mubin</strong>
              <p>Temukan berita, kegiatan, keislaman, kepengurusan, dokumentasi, dan laporan keuangan dalam satu tempat.</p>
              <Link href="/kontak/">Hubungi pengurus <ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>

        <section className="home-highlights container" aria-label="Pintu informasi utama">
          {highlights.map((item) => <Link className="home-highlight" key={item.title} href={item.href}><span className="eyebrow">{item.kicker}</span><h2>{item.title}</h2><p>{item.text}</p><strong>Jelajahi <ArrowRight size={16} /></strong></Link>)}
        </section>

        <section className="home-news container" aria-labelledby="berita-terbaru">
          <div className="home-section-heading"><div><span className="eyebrow">Kabar Terkini</span><h2 id="berita-terbaru">Berita Miftahul Mubin</h2></div><Link href="/berita/">Semua berita <ArrowRight size={16} /></Link></div>
          <div className="home-news-layout">
            <Link className="home-featured-news" href={`/berita/${featured.slug}/`}>
              <div className="home-news-image"><img src={featured.image} alt={featured.title} /><span className="tag">{featured.category}</span></div>
              <div className="home-news-copy"><span className="meta">{featured.date}</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><span className="read-link">Baca selengkapnya <ArrowRight size={15} /></span></div>
            </Link>
            <div className="home-latest-list">
              {latest.map((item, index) => <Link className="home-latest-item" key={item.slug} href={`/berita/${item.slug}/`}><span className="latest-number">0{index + 2}</span><div><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><span className="meta">{item.date}</span></div><ArrowRight size={16} aria-hidden="true" /></Link>)}
            </div>
          </div>
        </section>

        <section className="home-editorial container" aria-labelledby="pengumuman-terpopuler">
          <div className="home-editorial-grid">
            <div>
              <div className="home-section-heading compact"><div><span className="eyebrow">Informasi</span><h2 id="pengumuman-terpopuler">Pengumuman</h2></div><Link href="/pengumuman/">Lihat semua <ArrowRight size={15} /></Link></div>
              <div className="announcement-list">
                {announcements.map((item) => <Link key={item.title} href={item.href}><span><small>{item.date}</small><strong>{item.title}</strong></span><ArrowRight size={16} /></Link>)}
              </div>
            </div>
            <div>
              <div className="home-section-heading compact"><div><span className="eyebrow">Pilihan Jamaah</span><h2>Terpopuler</h2></div><Link href="/berita/">Semua berita <ArrowRight size={15} /></Link></div>
              <div className="popular-list">
                {popular.map((item, index) => <Link key={item.slug} href={`/berita/${item.slug}/`}><span className="popular-rank">0{index + 1}</span><span><small>{item.category}</small><strong>{item.title}</strong></span><ChevronRight size={16} /></Link>)}
              </div>
            </div>
          </div>
        </section>

        <section className="home-agenda container" aria-labelledby="agenda-terdekat">
          <div className="home-section-heading"><div><span className="eyebrow">Agenda</span><h2 id="agenda-terdekat">Kegiatan Terdekat</h2></div><Link href="/kegiatan/">Semua kegiatan <ArrowRight size={16} /></Link></div>
          <div className="events-grid">{upcoming.map((event) => <Link className="event-card" key={event.slug} href={`/kegiatan/${event.slug}/`}><div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div><div><span className="event-label">{event.category}</span><h3>{event.title}</h3><p><CalendarDays size={15} /> {event.time}</p><p><MapPin size={15} /> {event.place}</p></div></Link>)}</div>
        </section>

        <section className="home-islamic container" aria-labelledby="ruang-keislaman">
          <div className="home-section-heading"><div><span className="eyebrow">Ruang Keislaman</span><h2 id="ruang-keislaman">Kajian &amp; Hikmah</h2></div><Link href="/keislaman/">Semua materi <ArrowRight size={16} /></Link></div>
          <div className="islamic-home-grid">
            {islamicHighlights.map((item, index) => <Link className="islamic-home-card" key={item.slug} href={`/keislaman/${item.slug}/`}><span className="islamic-index">0{index + 1}</span><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><strong>Pelajari <ArrowRight size={15} /></strong></Link>)}
          </div>
        </section>

        <section className="home-services container" aria-labelledby="layanan-masjid">
          <div className="home-section-heading"><div><span className="eyebrow">Peran Masjid</span><h2 id="layanan-masjid">Ruang untuk Bertumbuh</h2></div></div>
          <div className="service-grid">{services.map(([title, text, href], index) => <Link className="service-card" key={title} href={href}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p><strong>Selengkapnya <ArrowRight size={15} /></strong></div></Link>)}</div>
        </section>

        <section className="home-closing container">
          <span className="eyebrow">Portal Miftahul Mubin</span>
          <h2>Satu pintu untuk informasi masjid.</h2>
          <p>Berita, kegiatan, keislaman, dokumentasi, kepengurusan, dan laporan keuangan tersedia dalam halaman khusus agar informasi lebih terstruktur, mudah ditemukan, dan nyaman dibaca.</p>
          <div className="home-links"><Link href="/kepengurusan/">Lihat kepengurusan <ArrowRight size={16} /></Link><Link href="/keuangan/">Lihat transparansi <ArrowRight size={16} /></Link><Link href="/kontak/">Hubungi pengurus <ArrowRight size={16} /></Link></div>
        </section>
      </main>
    </SiteShell>
  )
}
