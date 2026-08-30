import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><div className="footer-brand">Miftahul Mubin</div><p>Portal informasi dan kegiatan Masjid Miftahul Mubin.</p></div>
        <div><h3>Navigasi</h3><Link href="/berita/">Berita</Link><Link href="/kegiatan/">Kegiatan</Link><Link href="/keislaman/">Keislaman</Link><Link href="/keuangan/">Keuangan</Link></div>
        <div><h3>Masjid</h3><Link href="/profil/">Profil</Link><Link href="/kepengurusan/">Kepengurusan</Link><Link href="/dokumentasi/">Dokumentasi</Link><Link href="/kontak/">Kontak</Link></div>
        <div><h3>Hubungi Kami</h3><p>Jl. Masjid Miftahul Mubin<br />Ponorogo, Jawa Timur</p><p>info@miftahulmubin.id</p></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 Miftahul Mubin. Semua hak dilindungi.</span><span>Dibangun untuk pelayanan umat.</span></div>
    </footer>
  )
}
