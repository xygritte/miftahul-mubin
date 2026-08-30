import { CalendarDays, ChevronRight, Clock3, MapPin, Search, WalletCards } from 'lucide-react'

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
  { role: 'Ketua Takmir', name: 'H. Ahmad Fauzi' },
  { role: 'Sekretaris', name: 'Muhammad Fikri' },
  { role: 'Bendahara', name: 'Abdul Rahman' },
  { role: 'Divisi Dakwah', name: 'Ust. Ahmad Hidayat' },
  { role: 'Divisi Pendidikan', name: 'Nurul Huda' },
  { role: 'Divisi Sosial', name: 'M. Rizki Pratama' },
]

function SectionHeader({ title, href = '#' }: { title: string; href?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      <a href={href}>Lihat semua <ChevronRight size={17} /></a>
    </div>
  )
}

function NewsCard({ item, featured = false }: { item: (typeof news)[number]; featured?: boolean }) {
  return (
    <article className={featured ? 'news-card featured' : 'news-card'}>
      <a href="#" className="news-image-wrap">
        <img src={item.image} alt={item.title} className="news-image" />
        <span className="tag">{item.category}</span>
      </a>
      <div className="news-body">
        <span className="meta">{item.date}</span>
        <h3><a href="#">{item.title}</a></h3>
      </div>
    </article>
  )
}

export default function Home() {
  return (
    <main>
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>Portal Informasi Masjid Miftahul Mubin</span>
          <span className="utility-right"><span>Senin, 30 Agustus 2026</span><span>•</span><span>Kontak Pengurus</span></span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <a href="#" className="brand" aria-label="Miftahul Mubin">
            <span className="brand-mark">MM</span>
            <span><strong>Miftahul Mubin</strong><small>Masjid & Pusat Kegiatan Umat</small></span>
          </a>
          <nav className="desktop-nav">
            <a className="active" href="#">Beranda</a><a href="#berita">Berita</a><a href="#keislaman">Keislaman</a><a href="#kegiatan">Kegiatan</a><a href="#kepengurusan">Kepengurusan</a><a href="#keuangan">Keuangan</a><a href="#profil">Profil</a>
          </nav>
          <button className="search-btn" aria-label="Cari"><Search size={20} /></button>
        </div>
        <div className="category-bar">
          <div className="container category-scroll">
            <a href="#">Pengumuman</a><a href="#">Khutbah</a><a href="#dokumentasi">Dokumentasi</a><a href="#kepengurusan">Kepengurusan</a><a href="#">Pendidikan</a><a href="#">Sosial</a>
          </div>
        </div>
      </header>

      <div className="container page-space">
        <section className="headline-grid">
          <NewsCard item={news[0]} featured />
          <div className="headline-side"><NewsCard item={news[1]} /><NewsCard item={news[2]} /></div>
        </section>

        <section className="popular-strip">
          <SectionHeader title="Terpopuler" />
          <div className="popular-grid">
            {popular.map((item, index) => (
              <a href="#" className="popular-item" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></a>
            ))}
          </div>
        </section>

        <section id="berita">
          <SectionHeader title="Berita Terkini" />
          <div className="news-grid">{news.slice(1).map(item => <NewsCard key={item.title} item={item} />)}</div>
        </section>

        <section id="kegiatan" className="events-section">
          <SectionHeader title="Agenda Terdekat" />
          <div className="events-grid">
            {events.map(event => (
              <article className="event-card" key={event.title}>
                <div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div>
                <div><span className="event-label">Akan Datang</span><h3>{event.title}</h3><p><Clock3 size={15} /> {event.time}</p><p><MapPin size={15} /> {event.place}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section id="kepengurusan" className="management-section">
          <SectionHeader title="Struktur Kepengurusan" href="#kepengurusan" />
          <div className="management-intro">
            <div>
              <span className="eyebrow">Pengurus Miftahul Mubin</span>
              <h2>Melayani jamaah melalui kerja bersama.</h2>
              <p>Struktur kepengurusan Miftahul Mubin menjadi bagian dari keterbukaan informasi masjid. Setiap bidang memiliki peran dalam mengelola ibadah, pendidikan, kegiatan sosial, dan pelayanan jamaah.</p>
            </div>
            <a href="#" className="read-link">Lihat kepengurusan lengkap <ChevronRight size={16} /></a>
          </div>
          <div className="management-tree">
            <div className="management-lead">
              <span className="management-avatar">AF</span>
              <div><span>Ketua Takmir</span><strong>{management[0].name}</strong></div>
            </div>
            <div className="management-connector" aria-hidden="true" />
            <div className="management-board">
              {management.slice(1).map(member => (
                <article className="management-card" key={member.role}>
                  <span className="management-avatar small">{member.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>
                  <div><span>{member.role}</span><strong>{member.name}</strong></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="keislaman" className="editorial-split">
          <div>
            <SectionHeader title="Keislaman" />
            <article className="islamic-feature">
              <img src="https://images.unsplash.com/photo-1594156596782-656c93e4d504?auto=format&fit=crop&w=1200&q=80" alt="Masjid dan kegiatan keislaman" />
              <div><span className="tag green">Artikel</span><h3>Menjadikan Masjid sebagai Pusat Ilmu dan Pembinaan Umat</h3><p>Ruang masjid bukan hanya tempat beribadah, tetapi juga tempat tumbuhnya ilmu, kepedulian, dan kebersamaan.</p><a href="#" className="read-link">Baca selengkapnya <ChevronRight size={16} /></a></div>
            </article>
          </div>
          <div className="islamic-list">
            <article><span>Khutbah</span><h3>Menjaga Ukhuwah dan Adab Bermasyarakat</h3><small>27 Agustus 2026</small></article>
            <article><span>Kajian</span><h3>Keutamaan Sedekah dan Kepedulian Sosial</h3><small>25 Agustus 2026</small></article>
            <article><span>Al-Qur’an</span><h3>Membiasakan Interaksi dengan Al-Qur’an di Rumah</h3><small>21 Agustus 2026</small></article>
          </div>
        </section>

        <section id="dokumentasi" className="media-section">
          <SectionHeader title="Dokumentasi" />
          <div className="media-grid">
            <a href="#" className="media-large"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80" alt="Dokumentasi kegiatan" /><span>Galeri Kajian Akbar Miftahul Mubin</span></a>
            <a href="#" className="media-item"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" alt="Kegiatan pemuda" /><span>Kegiatan Pemuda Masjid</span></a>
            <a href="#" className="media-item"><img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80" alt="Kegiatan sosial" /><span>Penyaluran Bantuan Sosial</span></a>
          </div>
        </section>

        <section id="keuangan" className="finance-section">
          <div className="finance-copy"><span className="eyebrow">Transparansi</span><h2>Keuangan Masjid</h2><p>Laporan ringkas keuangan Miftahul Mubin sebagai bentuk keterbukaan kepada jamaah dan masyarakat.</p><a href="#" className="button-link">Lihat laporan lengkap <ChevronRight size={17} /></a></div>
          <div className="finance-cards">
            <div><WalletCards size={22} /><span>Total Pemasukan</span><strong>Rp 12.500.000</strong></div>
            <div><WalletCards size={22} /><span>Total Pengeluaran</span><strong>Rp 7.200.000</strong></div>
            <div className="balance"><WalletCards size={22} /><span>Saldo</span><strong>Rp 15.300.000</strong></div>
          </div>
        </section>

        <section id="profil" className="about-section">
          <div><span className="eyebrow">Tentang Masjid</span><h2>Miftahul Mubin</h2><p>Miftahul Mubin hadir sebagai pusat ibadah, pembelajaran, pelayanan, dan kegiatan sosial untuk masyarakat sekitar.</p><a href="#" className="read-link">Mengenal lebih dekat <ChevronRight size={16} /></a></div>
          <div className="about-stat"><strong>2026</strong><span>Periode informasi</span></div><div className="about-stat"><strong>24+</strong><span>Kegiatan tahun ini</span></div>
        </section>
      </div>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div><div className="footer-brand">Miftahul Mubin</div><p>Portal informasi dan kegiatan Masjid Miftahul Mubin.</p></div>
          <div><h3>Navigasi</h3><a href="#">Berita</a><a href="#">Kegiatan</a><a href="#">Keislaman</a><a href="#">Keuangan</a></div>
          <div><h3>Masjid</h3><a href="#">Profil</a><a href="#kepengurusan">Kepengurusan</a><a href="#dokumentasi">Dokumentasi</a><a href="#">Kontak</a></div>
          <div><h3>Hubungi Kami</h3><p>Jl. Masjid Miftahul Mubin<br />Ponorogo, Jawa Timur</p><p>info@miftahulmubin.id</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Miftahul Mubin. Semua hak dilindungi.</span><span>Dibangun untuk pelayanan umat.</span></div>
      </footer>
    </main>
  )
}
