'use client'

import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const primaryLinks = [
  ['Beranda', '#top'],
  ['Berita', '#berita'],
  ['Keislaman', '#keislaman'],
  ['Kegiatan', '#kegiatan'],
  ['Kepengurusan', '#kepengurusan'],
  ['Keuangan', '#keuangan'],
  ['Profil', '#profil'],
  ['Kontak', '#kontak'],
] as const

const categoryLinks = [
  ['Pengumuman', '#pengumuman'],
  ['Khutbah', '#keislaman'],
  ['Dokumentasi', '#dokumentasi'],
  ['Kepengurusan', '#kepengurusan'],
  ['Pendidikan', '#kegiatan'],
  ['Sosial', '#kegiatan'],
] as const

export default function Header({ searchItems }: { searchItems: string[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, searchOpen])

  const results = searchItems.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)

  const closeAll = () => {
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <div className="utility-bar" id="top">
        <div className="container utility-inner">
          <span>Portal Informasi Masjid Miftahul Mubin</span>
          <span className="utility-right"><span>30 Agustus 2026</span><span aria-hidden="true">•</span><a href="#kontak">Kontak Pengurus</a></span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <a href="#top" className="brand" aria-label="Miftahul Mubin, kembali ke beranda">
            <span className="brand-mark" aria-hidden="true">MM</span>
            <span><strong>Miftahul Mubin</strong><small>Masjid & Pusat Kegiatan Umat</small></span>
          </a>

          <nav className="desktop-nav" aria-label="Navigasi utama">
            {primaryLinks.map(([label, href]) => <a key={label} className={label === 'Beranda' ? 'active' : ''} href={href}>{label}</a>)}
          </nav>

          <div className="header-actions">
            <button className="search-btn" type="button" aria-label="Buka pencarian" aria-expanded={searchOpen} onClick={() => setSearchOpen(true)}><Search size={20} /></button>
            <button className="menu-btn" type="button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className="category-bar">
          <nav className="container category-scroll" aria-label="Kategori">
            {categoryLinks.map(([label, href]) => <a key={label} href={href} onClick={closeAll}>{label}</a>)}
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu utama">
          <div className="mobile-menu-inner container">
            <p className="mobile-menu-label">Menu Miftahul Mubin</p>
            {primaryLinks.map(([label, href]) => <a key={label} className="mobile-menu-link" href={href} onClick={closeAll}>{label}<span aria-hidden="true">›</span></a>)}
            <div className="mobile-menu-categories">
              <p>Kategori</p>
              {categoryLinks.map(([label, href]) => <a key={label} href={href} onClick={closeAll}>{label}</a>)}
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian">
          <div className="search-panel">
            <div className="search-panel-head">
              <div><span className="eyebrow">Pencarian</span><h2>Cari informasi Miftahul Mubin</h2></div>
              <button className="close-btn" type="button" aria-label="Tutup pencarian" onClick={closeAll}><X size={22} /></button>
            </div>
            <label className="search-field">
              <Search size={21} aria-hidden="true" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari berita, kegiatan, atau artikel..." />
            </label>
            <div className="search-results" aria-live="polite">
              {!query && <p className="search-helper">Ketik kata kunci untuk mencari konten pada portal.</p>}
              {query && results.length === 0 && <p className="search-helper">Tidak ada hasil untuk “{query}”.</p>}
              {results.map((result) => <a key={result} href="#berita" onClick={closeAll}><span>{result}</span><span aria-hidden="true">›</span></a>)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
