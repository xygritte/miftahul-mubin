import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'

const news = [
  ['Kegiatan Masjid','Miftahul Mubin Gelar Kajian Akbar untuk Jamaah dan Warga Sekitar','30 Agustus 2026','https://images.unsplash.com/photo-1542816417-0983676b0c9f?auto=format&fit=crop&w=1200&q=80'],
  ['Keislaman','Menjaga Ukhuwah di Tengah Kesibukan Kehidupan','28 Agustus 2026','https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=900&q=80'],
  ['Sosial','Program Santunan Miftahul Mubin Kembali Digelar','26 Agustus 2026','https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80'],
  ['Pengumuman','Pendaftaran Relawan Kegiatan Sosial Masjid Dibuka','24 Agustus 2026','https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=900&q=80'],
  ['Pendidikan','Kelas Al-Qur’an untuk Anak dan Remaja Dimulai September','22 Agustus 2026','https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80'],
  ['Masjid','Persiapan Fasilitas Masjid Menjelang Agenda Akhir Bulan','20 Agustus 2026','https://images.unsplash.com/photo-1594156596782-656c93e4d504?auto=format&fit=crop&w=900&q=80'],
]

export default function BeritaPage(){return <SiteShell><main id="main-content" className="inner-page"><div className="container"><PageIntro eyebrow="Portal Berita" title="Berita Miftahul Mubin" description="Kabar terbaru, pengumuman, cerita kegiatan, dan informasi yang hadir dari lingkungan Masjid Miftahul Mubin."/><div className="filter-row"><span>Semua</span><span>Masjid</span><span>Kegiatan</span><span>Keislaman</span><span>Sosial</span><span>Pendidikan</span><span>Pengumuman</span></div><div className="news-page-grid">{news.map(([category,title,date,image],index)=><article className={index===0?'news-page-card featured':'news-page-card'} key={title}><img src={image} alt={title}/><div><span className="tag static">{category}</span><small>{date}</small><h2>{title}</h2><p>Informasi kegiatan dan perkembangan terbaru Miftahul Mubin untuk jamaah dan masyarakat sekitar.</p><Link href="/berita/">Baca selengkapnya <ArrowRight size={16}/></Link></div></article>)}</div></div></main></SiteShell>}
