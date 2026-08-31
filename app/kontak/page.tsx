import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react'

const mapQuery = 'Masjid Miftahul Mubin, Ponorogo, Jawa Timur'
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`

export default function KontakPage(){
  return <SiteShell><main id="main-content" className="inner-page"><div className="container"><PageIntro eyebrow="Hubungi Kami" title="Kontak Miftahul Mubin" description="Temukan lokasi masjid dan kanal komunikasi yang dapat digunakan jamaah dan masyarakat."/>
    <div className="contact-grid-page">
      <a className="contact-card-page" href={mapLinkUrl} target="_blank" rel="noopener noreferrer"><MapPin size={24}/><span>Alamat</span><h2>Masjid Miftahul Mubin</h2><p>Jl. Masjid Miftahul Mubin<br/>Ponorogo, Jawa Timur</p><strong>Buka di Google Maps <ExternalLink size={14}/></strong></a>
      <a className="contact-card-page" href="tel:+6280000000000"><Phone size={24}/><span>Telepon Pengurus</span><h2>Kontak Masjid</h2><p>+62 8xx-xxxx-xxxx<br/>Senin–Sabtu · 08.00–17.00 WIB</p><strong>Hubungi melalui telepon <ExternalLink size={14}/></strong></a>
      <a className="contact-card-page" href="mailto:info@miftahulmubin.id"><Mail size={24}/><span>Email</span><h2>info@miftahulmubin.id</h2><p>Untuk pertanyaan, informasi kegiatan, dan komunikasi resmi masjid.</p><strong>Kirim email <ExternalLink size={14}/></strong></a>
    </div>
    <section className="map-embed-card" aria-label="Peta lokasi Masjid Miftahul Mubin"><div className="map-embed-head"><div><span className="eyebrow">Lokasi</span><h2>Temukan Masjid di Peta</h2></div><a href={mapLinkUrl} target="_blank" rel="noopener noreferrer">Buka peta <ExternalLink size={14}/></a></div><div className="map-embed-frame"><iframe title="Lokasi Masjid Miftahul Mubin" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div><p className="map-embed-note">Lokasi menggunakan pencarian alamat “{mapQuery}”. Pengurus dapat mengganti alamat ini ketika titik lokasi resmi sudah ditetapkan.</p></section>
  </div></main></SiteShell>
}
