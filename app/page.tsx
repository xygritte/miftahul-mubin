import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import SiteShell from '@/components/layout/SiteShell'
import LiveNews from '@/components/live/LiveNews'
import LiveEvents from '@/components/live/LiveEvents'
import LiveIslamic from '@/components/live/LiveIslamic'
import LiveAnnouncements from '@/components/live/LiveAnnouncements'
import LivePopularNews from '@/components/live/LivePopularNews'
import { contentRepository } from '@/lib/data'
import { eventRecordToLegacy, islamicRecordToLegacy, newsRecordToLegacy } from '@/lib/data/presentation'

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

export default async function Home() {
  const [newsRecords, eventRecords, islamicRecords, announcements] = await Promise.all([
    contentRepository.listNews(),
    contentRepository.listEvents(),
    contentRepository.listIslamic(),
    contentRepository.listAnnouncements(),
  ])
  const news = newsRecords.map(newsRecordToLegacy)
  const events = eventRecords.map(eventRecordToLegacy)
  const islamicItems = islamicRecords.map(islamicRecordToLegacy)

  return <SiteShell>
    <main id="main-content">
      <section className="home-hero"><div className="container home-hero-grid"><div className="home-hero-copy"><span className="eyebrow hero-eyebrow">Masjid &amp; Pusat Kegiatan Umat</span><h1>Miftahul Mubin</h1><p>Tempat ibadah, ruang ilmu, pelayanan masyarakat, dan titik temu untuk membangun kebersamaan yang tumbuh dari masjid.</p><div className="hero-actions"><Link className="button-link" href="/profil/">Mengenal Masjid <ArrowRight size={17} /></Link><Link className="hero-secondary" href="/kegiatan/">Lihat Agenda <ArrowRight size={17} /></Link></div></div><div className="home-hero-card"><div className="hero-card-top"><span className="eyebrow">Informasi Utama</span><Sparkles size={17} aria-hidden="true" /></div><strong>Portal resmi Miftahul Mubin</strong><p>Temukan berita, kegiatan, keislaman, kepengurusan, dokumentasi, dan laporan keuangan dalam satu tempat.</p><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15} /></Link></div></div></section>
      <section className="home-highlights container" aria-label="Pintu informasi utama">{highlights.map((item) => <Link className="home-highlight" key={item.title} href={item.href}><span className="eyebrow">{item.kicker}</span><h2>{item.title}</h2><p>{item.text}</p><strong>Jelajahi <ArrowRight size={16} /></strong></Link>)}</section>
      <section className="home-news container" aria-labelledby="berita-terbaru"><div className="home-section-heading"><div><span className="eyebrow">Kabar Terkini</span><h2 id="berita-terbaru">Berita Miftahul Mubin</h2></div><Link href="/berita/">Semua berita <ArrowRight size={16} /></Link></div><LiveNews initialItems={news} /></section>
      <section className="home-editorial container" aria-labelledby="pengumuman-terpopuler"><div className="home-editorial-grid"><div><div className="home-section-heading compact"><div><span className="eyebrow">Informasi</span><h2 id="pengumuman-terpopuler">Pengumuman</h2></div><Link href="/pengumuman/">Lihat semua <ArrowRight size={15} /></Link></div><LiveAnnouncements initialItems={announcements.slice(0,3)} limit={3} /></div><div><div className="home-section-heading compact"><div><span className="eyebrow">Pilihan Jamaah</span><h2>Terpopuler</h2></div><Link href="/berita/">Semua berita <ArrowRight size={15} /></Link></div><LivePopularNews initialItems={newsRecords.slice().sort((a,b)=>b.viewCount-a.viewCount).slice(0,4)} /></div></div></section>
      <section className="home-agenda container" aria-labelledby="agenda-terdekat"><div className="home-section-heading"><div><span className="eyebrow">Agenda</span><h2 id="agenda-terdekat">Kegiatan Terdekat</h2></div><Link href="/kegiatan/">Semua kegiatan <ArrowRight size={16} /></Link></div><LiveEvents initialItems={events.slice(0,3)} limit={3} /></section>
      <section className="home-islamic container" aria-labelledby="ruang-keislaman"><div className="home-section-heading"><div><span className="eyebrow">Ruang Keislaman</span><h2 id="ruang-keislaman">Kajian &amp; Hikmah</h2></div><Link href="/keislaman/">Semua materi <ArrowRight size={16} /></Link></div><LiveIslamic initialItems={islamicItems.slice(0,3)} limit={3} /></section>
      <section className="home-services container" aria-labelledby="layanan-masjid"><div className="home-section-heading"><div><span className="eyebrow">Peran Masjid</span><h2 id="layanan-masjid">Ruang untuk Bertumbuh</h2></div></div><div className="service-grid">{services.map(([title,text,href],index)=><Link className="service-card" key={title} href={href}><span>0{index+1}</span><div><h3>{title}</h3><p>{text}</p><strong>Selengkapnya <ArrowRight size={15}/></strong></div></Link>)}</div></section>
      <section className="home-closing container"><span className="eyebrow">Portal Miftahul Mubin</span><h2>Satu pintu untuk informasi masjid.</h2><p>Berita, kegiatan, keislaman, dokumentasi, kepengurusan, dan laporan keuangan tersedia dalam halaman khusus agar informasi lebih terstruktur, mudah ditemukan, dan nyaman dibaca.</p><div className="home-links"><Link href="/kepengurusan/">Lihat kepengurusan <ArrowRight size={16}/></Link><Link href="/keuangan/">Lihat transparansi <ArrowRight size={16}/></Link><Link href="/kontak/">Hubungi pengurus <ArrowRight size={16}/></Link></div></section>
    </main>
  </SiteShell>
}