'use client'

import Link from 'next/link'
import { ChevronDown, ChevronRight, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { news } from '@/lib/content'
import { islamicItems } from '@/lib/islamic'

const primaryLinks = [
  ['Beranda', '/'], ['Berita', '/berita/'], ['Keislaman', '/keislaman/'], ['Kegiatan', '/kegiatan/'],
  ['Kepengurusan', '/kepengurusan/'], ['Keuangan', '/keuangan/'], ['Profil', '/profil/'], ['Kontak', '/kontak/'],
] as const

const categoryLinks = [
  ['Pengumuman', '/pengumuman/'], ['Khutbah', '/keislaman/'], ['Dokumentasi', '/dokumentasi/'],
  ['Kepengurusan', '/kepengurusan/'], ['Pendidikan', '/kegiatan/'], ['Sosial', '/kegiatan/'],
] as const

const searchItems = [
  ...news.map((item) => ({ title: item.title, href: `/berita/${item.slug}/`, category: item.category })),
  ...islamicItems.map((item) => ({ title: item.title, href: `/keislaman/${item.slug}/`, category: item.category })),
  { title: 'Jadwal Kajian Miftahul Mubin Bulan September', href: '/kegiatan/', category: 'Kegiatan' },
  { title: 'Laporan Keuangan dan Transparansi Bulan Agustus', href: '/keuangan/', category: 'Keuangan' },
]

export default function Header() {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem('mm-theme')
    const initial = saved === 'dark'
    setDark(initial)
    document.documentElement.dataset.theme = initial ? 'dark' : 'light'
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, searchOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
        setLanguageOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, ''))
  const results = useMemo(() => searchItems.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8), [query])
  const closeAll = () => { setMenuOpen(false); setSearchOpen(false); setLanguageOpen(false); setQuery('') }
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    window.localStorage.setItem('mm-theme', next ? 'dark' : 'light')
  }

  return <>
    <a className="skip-link" href="#main-content">Lewati ke konten utama</a>

    <div className="mm-utility-bar">
      <div className="container mm-utility-inner">
        <span>Portal Informasi Masjid Miftahul Mubin</span>
        <div className="mm-utility-right"><Link href="/kontak/">Kontak Pengurus</Link><span aria-hidden="true">•</span><time dateTime="2026-08-30">Minggu, 30 Agustus 2026</time></div>
      </div>
    </div>

    <header className="mm-header">
      <div className="container mm-header-top">
        <Link href="/" className="mm-brand" aria-label="Miftahul Mubin, kembali ke beranda">
          <span className="mm-brand-mark" aria-hidden="true"><span className="mm-mark-dome"/><span className="mm-mark-minaret left"/><span className="mm-mark-minaret right"/><span className="mm-mark-star">✦</span></span>
          <span className="mm-brand-copy"><strong>Miftahul Mubin</strong><small>Masjid &amp; Pusat Kegiatan Umat</small></span>
        </Link>

        <div className="mm-header-tools">
          <button className="mm-search-trigger" type="button" aria-label="Cari berita dan informasi" aria-expanded={searchOpen} onClick={() => { setMenuOpen(false); setLanguageOpen(false); setSearchOpen(true) }}><Search size={21}/><span>Cari Berita</span></button>
          <button className="mm-theme-toggle" type="button" aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} aria-pressed={dark} onClick={toggleTheme}><span className="mm-theme-knob">{dark ? <Sun size={13}/> : <Moon size={13}/>}</span></button>
          <div className="mm-language">
            <button className="mm-language-btn" type="button" aria-label="Pilih bahasa" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}><span className="mm-flag" aria-hidden="true">🇮🇩</span><ChevronDown size={17}/></button>
            {languageOpen && <div className="mm-language-menu" role="menu"><button type="button" className="active" role="menuitem">🇮🇩 Indonesia</button><button type="button" disabled role="menuitem">🇬🇧 English <small>Segera</small></button></div>}
          </div>
          <button className="mm-mobile-menu-btn" type="button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="mm-mobile-menu" onClick={() => { setSearchOpen(false); setLanguageOpen(false); setMenuOpen((open) => !open) }}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
        </div>
      </div>

      <div className="container mm-primary-wrap">
        <nav className="mm-primary-nav" aria-label="Navigasi utama">
          {primaryLinks.map(([label, href]) => <Link key={label} className={isActive(href) ? 'active' : ''} href={href}>{label}</Link>)}
        </nav>
      </div>

      <div className="mm-secondary-row">
        <div className="container mm-secondary-inner">
          <nav className="mm-secondary-nav" aria-label="Kategori portal">{categoryLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
          <time className="mm-date" dateTime="2026-08-30">Minggu, 30 Agustus 2026</time>
        </div>
      </div>
    </header>

    {menuOpen && <div className="mm-mobile-menu" id="mm-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu utama"><div className="container mm-mobile-inner"><p className="mm-mobile-label">Navigasi Miftahul Mubin</p>{primaryLinks.map(([label, href]) => <Link key={label} className={isActive(href) ? 'active' : ''} href={href} onClick={closeAll}><span>{label}</span><ChevronRight size={19}/></Link>)}<div className="mm-mobile-categories"><p>Kategori</p><div>{categoryLinks.map(([label, href]) => <Link key={label} href={href} onClick={closeAll}>{label}</Link>)}</div></div><button className="mm-mobile-theme" type="button" onClick={toggleTheme}><span>{dark ? <Sun size={17}/> : <Moon size={17}/><span>{dark ? 'Mode terang' : 'Mode gelap'}</span></span><span aria-hidden="true">{dark ? '☀' : '◐'}</span></button></div></div>}

    {searchOpen && <div className="mm-search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian"><div className="mm-search-panel"><div className="mm-search-head"><div><span className="eyebrow">Pencarian</span><h2>Cari informasi Miftahul Mubin</h2></div><button className="mm-close-btn" type="button" aria-label="Tutup pencarian" onClick={closeAll}><X size={21}/></button></div><label className="mm-search-field"><Search size={21}/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari berita, kegiatan, atau artikel..."/></label><div className="mm-search-results" aria-live="polite">{!query && <p className="search-helper">Ketik kata kunci untuk mencari konten pada portal.</p>}{query && results.length === 0 && <p className="search-helper">Tidak ada hasil untuk “{query}”.</p>}{results.map((result) => <Link key={result.href + result.title} href={result.href} onClick={closeAll}><span><small>{result.category}</small>{result.title}</span><ChevronRight size={17}/></Link>)}</div></div></div>}
  </>
}
