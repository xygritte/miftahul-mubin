import { ChevronRight, Clock3, MapPin, Megaphone, WalletCards } from 'lucide-react'
import Header from '../components/layout/Header'

const news = [
  { category: 'Kegiatan Masjid', title: 'Miftahul Mubin Gelar Kajian Akbar untuk Jamaah dan Warga Sekitar', date: '30 Agustus 2026', image: 'https://images.unsplash.com/photo-1542816417-0983676b0c9f?auto=format&fit=crop&w=1200&q=80' },
  { category: 'Keislaman', title: 'Menjaga Ukhuwah di Tengah Kesibukan Kehidupan', date: '28 Agustus 2026', image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80' },
  { category: 'Sosial', title: 'Program Santunan Miftahul Mubin Kembali Digelar', date: '26 Agustus 2026', image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80' },
  { category: 'Pengumuman', title: 'Pendaftaran Relawan Kegiatan Sosial Masjid Dibuka', date: '24 Agustus 2026', image: 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=900&q=80' },
  { category: 'Pendidikan', title: 'Kelas Al-Qur’an untuk Anak dan Remaja Dimulai September', date: '22 Agustus 2026', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80' },
  { category: 'Masjid', title: 'Persiapan Fasilitas Masjid Menjelang Agenda Akhir Bulan', date: '20 Agustus 2026', image: 'https://images.unsplash.com/photo-1594156596782-656c93e4d504?auto=format&fit=crop&w=900&q=80' },
]

const popular = [
  'Jadwal Kajian Miftahul Mubin Bulan September',
  'Laporan Keuangan dan Transparansi Bulan Agustus',
  'Program Santunan Anak Yatim dan Dhuafa',
  'Jadwal Imam dan Khatib Jumat',
  'Pendaftaran Kelas Al-Qur’an untuk Anak',
]

const events = [
  { day: '03', month: 'SEP', title: 'Kajian Rutin Kamis', time: '19.30 WIB', place: 'Aula Masjid Miftahul Mubin' },
  { day: '05', month: 'SEP', title: 'Santunan Yatim & Dhuafa', time: '09.00 WIB', place: 'Halaman Masjid' },
  { day: '07', month: 'SEP', title: 'Kajian Ahad Pagi', time: '07.30 WIB', place: 'Ruang Utama Masjid' },
]

const management = [
  { role: 'Ketua Takmir', name: 'H. Ahmad Fauzi', initials: 'AF' },
  { role: 'Sekretaris', name: 'Muhammad Fikri', initials: 'MF' },
  { role: 'Bendahara', name: 'Abdul Rahman', initials: 'AR' },
  { role: 'Divisi Dakwah', name: 'Ust. Ahmad Hidayat', initials: 'AH' },
  { role: 'Divisi Pendidikan', name: 'Nurul Huda', initials: 'NH' },
  { role: 'Divisi Sosial', name: 'M. Rizki Pratama', initials: 'RP' },
]

const searchItems = [...popular, ...news.map((item) => item.title)]

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {href && <a href={href}>Lihat semua <ChevronRight size={17} /></a>}
    </div>
  )
}

function NewsCard({ item, featured = false }: { item: (typeof news)[number]; featured?: boolean }) {
  return (
    <article className={featured ? 'news-card featured' : 'news-card'}>
      <a href="#berita" className="news-image-wrap" aria-label={`Baca ${item.title}`}>
        <img src={item.image} alt={item.title} className="news-image" />
        <span className="tag">{item.category}</span>
      </a>
      <div className="news-body">
        <span className="meta">{item.date}</span>
        <h3><a href="#berita">{item.title}</a></h3>
      </div>
    </article>
  )
}

export default function Home() {
  return (
    <main id="main-content">
      <Header searchItems={searchItems} />

      <div className="container page-space">
        <section className="headline-grid">
          <h1 className="visually-hidden">Informasi terbaru Masjid Miftahul Mubin</h1>
          <NewsCard item={news[0]} featured />
          <div className="headline-side"><NewsCard item={news[1]} /><NewsCard item={news[2]} /></div>
        </section>

        <section id="pengumuman" className="announcement-strip" aria-label="Pengumuman penting">
          <div className="announcement-icon"><Megaphone size={19} aria-hidden="true" /></div>
          <div><span>Pengumuman</span><strong>Jadwal kajian dan agenda September telah diperbarui.</strong></div>
          <a href="#kegiatan" className="announcement-link">Lihat agenda <ChevronRight size={16} aria-hidden="true" /></a>
        </section>

        <section className="popular-strip" aria-label="Konten terpopuler">
          <SectionHeader title="Terpopuler" href="#berita" />
          <div className="popular-grid">
            {popular.map((item, index) => <a href="#berita" className="popular-item" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></a>)}
          </div>
        </section>

        <section id="berita" aria-label="Berita terkini">
          <SectionHeader title="Berita Terkini" href="#berita" />
          <div className="news-grid">{news.slice(1).map(item => <NewsCard key={item.title} item={item} />)}</div>
        </section>

        <section id="kegiatan" className="events-section" aria-label="Agenda terdekat">
          <SectionHeader title="Agenda Terdekat" href="#kegiatan" />
          <div className="events-grid">
            {events.map(event => (
              <article className="event-card" key={event.title}>
                <div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div>
                <div><span className="event-label">Akan Datang</span><h3>{event.title}</h3><p><Clock3 size={15} aria-hidden="true" /> {event.time}</p><p><MapPin size={15} aria-hidden="true" /> {event.place}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section id="kepengurusan" className="management-section" aria-label="Struktur kepengurusan">
          <SectionHeader title="Struktur Kepengurusan" href="#kepengurusan" />
          <div className="management-intro">
            <div>
              <span className="eyebrow">Pengurus Miftahul Mubin</span>
              <h2>Melayani jamaah melalui kerja bersama.</h2>
              <p>Struktur kepengurusan menjadi bagian dari keterbukaan informasi masjid. Setiap bidang memiliki peran dalam ibadah, pendidikan, kegiatan sosial, dan pelayanan jamaah.</p>
            </div>
            <a href="#kepengurusan" className="read-link">Lihat kepengurusan lengkap <ChevronRight size={16} /></a>
          </div>
          <div className="management-tree">
            <div className="management-lead">
              <span className="management-avatar">{management[0].initials}</span>
              <div><span>{management[0].role}</span><strong>{management[0].name}</strong></div>
            </div>
            <div className="management-connector" aria-hidden="true" />
            <div className="management-board">
              {management.slice(1).map(member => <article className="management-card" key={member.role}><span className="management-avatar small">{member.initials}</span><div><span>{member.role}</span><strong>{member.name}</strong></div></article>)}
            </div>
          </div>
          <p className="demo-note">Data pengurus di atas merupakan data contoh untuk Fase 1 dan akan dikelola melalui dashboard pada fase berikutnya.</p>
        </section>

        <section id="keislaman" className="editorial-split" aria-label="Konten keislaman">
          <div>
            <SectionHeader title="Keislaman" href="#keislaman" />
            <article className="islamic-feature">
              <img src="https://images.unsplash.com/photo-1594156596782-656c93e4d504?auto=format&fit=crop&w=1200&q=80" alt="Masjid untuk kegiatan keislaman" />
              <div><span className="tag green">Artikel</span><h2>Menjadikan Masjid sebagai Pusat Ilmu dan Pembinaan Umat</h2><p>Ruang masjid bukan hanya tempat beribadah, tetapi juga tempat tumbuhnya ilmu, kepedulian, dan kebersamaan.</p><a href="#keislaman" className="read-link">Baca selengkapnya <ChevronRight size={16} /></a></div>
            </article>
          </div>
          <div className="islamic-list">
            <article><span>Khutbah</span><h3>Menjaga Ukhuwah dan Adab Bermasyarakat</h3><small>27 Agustus 2026</small></article>
            <article><span>Kajian</span><h3>Keutamaan Sedekah dan Kepedulian Sosial</h3><small>25 Agustus 2026</small></article>
            <article><span>Al-Qur’an</span><h3>Membiasakan Interaksi dengan Al-Qur’an di Rumah</h3><small>21 Agustus 2026</small></article>
          </div>
        </section>

        <section id="dokumentasi" className="media-section" aria-label="Dokumentasi kegiatan">
          <SectionHeader title="Dokumentasi" href="#dokumentasi" />
          <div className="media-grid">
            <a href="#dokumentasi" className="media-large"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80" alt="Dokumentasi Kajian Akbar Miftahul Mubin" /><span>Galeri Kajian Akbar Miftahul Mubin</span></a>
            <a href="#dokumentasi" className="media-item"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" alt="Kegiatan pemuda masjid" /><span>Kegiatan Pemuda Masjid</span></a>
            <a href="#dokumentasi" className="media-item"><img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80" alt="Penyaluran bantuan sosial" /><span>Penyaluran Bantuan Sosial</span></a>
          </div>
        </section>

        <section id="keuangan" className="finance-section" aria-label="Transparansi keuangan">
          <div className="finance-copy"><span className="eyebrow">Transparansi</span><h2>Keuangan Masjid</h2><p>Laporan ringkas keuangan Miftahul Mubin sebagai bentuk keterbukaan kepada jamaah dan masyarakat.</p><a href="#keuangan-detail" className="button-link">Lihat laporan lengkap <ChevronRight size={17} /></a></div>
          <div className="finance-cards">
            <div><WalletCards size={22} aria-hidden="true" /><span>Total Pemasukan</span><strong>Rp 12.500.000</strong></div>
            <div><WalletCards size={22} aria-hidden="true" /><span>Total Pengeluaran</span><strong>Rp 7.200.000</strong></div>
            <div className="balance"><WalletCards size={22} aria-hidden="true" /><span>Saldo</span><strong>Rp 15.300.000</strong></div>
          </div>
        </section>
        <div id="keuangan-detail" className="finance-detail-note">Preview Fase 1: detail transaksi, grafik, dan unduhan laporan akan tersedia setelah modul keuangan terhubung ke database.</div>

        <section id="profil" className="about-section" aria-label="Tentang Masjid Miftahul Mubin">
          <div><span className="eyebrow">Tentang Masjid</span><h2>Miftahul Mubin</h2><p>Miftahul Mubin hadir sebagai pusat ibadah, pembelajaran, pelayanan, dan kegiatan sosial untuk masyarakat sekitar.</p><a href="#kontak" className="read-link">Mengenal lebih dekat <ChevronRight size={16} /></a></div>
          <div className="about-stat"><strong>2026</strong><span>Periode informasi</span></div><div className="about-stat"><strong>24+</strong><span>Kegiatan tahun ini</span></div>
        </section>

        <section id="kontak" className="contact-section" aria-label="Kontak dan lokasi">
          <div><span className="eyebrow">Hubungi Masjid</span><h2>Miftahul Mubin di tengah masyarakat.</h2><p>Informasi alamat, kontak pengurus, dan layanan masjid akan dikelola secara terpusat pada versi final.</p></div>
          <div className="contact-list"><div><strong>Lokasi</strong><span>Jl. Masjid Miftahul Mubin, Ponorogo</span></div><div><strong>Email</strong><span>info@miftahulmubin.id</span></div><div><strong>Layanan</strong><span>Informasi kegiatan & kepengurusan</span></div></div>
        </section>
      </div>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div><div className="footer-brand">Miftahul Mubin</div><p>Portal informasi dan kegiatan Masjid Miftahul Mubin.</p></div>
          <div><h3>Navigasi</h3><a href="#berita">Berita</a><a href="#kegiatan">Kegiatan</a><a href="#keislaman">Keislaman</a><a href="#keuangan">Keuangan</a></div>
          <div><h3>Masjid</h3><a href="#profil">Profil</a><a href="#kepengurusan">Kepengurusan</a><a href="#dokumentasi">Dokumentasi</a><a href="#kontak">Kontak</a></div>
          <div><h3>Informasi</h3><p>Portal ini masih dalam tahap Fase 1. Data yang tampil merupakan data contoh untuk pengembangan antarmuka.</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Miftahul Mubin. Semua hak dilindungi.</span><a href="#top">Kembali ke atas ↑</a></div>
      </footer>
    </main>
  )
}
