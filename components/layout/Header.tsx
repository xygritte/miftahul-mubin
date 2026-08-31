'use client'

import Link from 'next/link'
import { ChevronDown, ChevronRight, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { events, news } from '@/lib/content'
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
  ...events.map((item) => ({ title: item.title, href: `/kegiatan/${item.slug}/`, category: item.category })),
  { title: 'Pendaftaran Relawan Kegiatan Sosial', href: '/pengumuman/', category: 'Pengumuman' },
  { title: 'Struktur Kepengurusan Masjid Miftahul Mubin', href: '/kepengurusan/', category: 'Kepengurusan' },
  { title: 'Profil dan Sejarah Masjid Miftahul Mubin', href: '/profil/', category: 'Profil' },
  { title: 'Dokumentasi Kegiatan Miftahul Mubin', href: '/dokumentasi/', category: 'Dokumentasi' },
  { title: 'Transparansi Keuangan Masjid Miftahul Mubin', href: '/keuangan/', category: 'Keuangan' },
  { title: 'Hubungi Pengurus Miftahul Mubin', href: '/kontak/', category: 'Kontak' },
]

const logoSrc = '/miftahul-mubin/logo.svg'

function formatToday() {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

export default function Header() {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem('mm-theme')
    const initial = saved === 'dark'
    setDark(initial)
    document.documentElement.dataset.theme = initial ? 'dark' : 'light'
    setToday(formatToday())
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen, searchOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false); setSearchOpen(false); setLanguageOpen(false); setQuery('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, ''))
  const results = useMemo(() => searchItems.filter((item) => {
    const q = query.trim().toLowerCase()
    if (!q) return false
    return `${item.title} ${item.category}`.toLowerCase().includes(q)
  }).slice(0, 10), [query])
  const closeAll = () => { setMenuOpen(false); setSearchOpen(false); setLanguageOpen(false); setQuery('') }
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    window.localStorage.setItem('mm-theme', next ? 'dark' : 'light')
  }

  return <>
    <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
    <header className="mm-header">
      <div className="container mm-header-top">
        <Link href="/" className="mm-brand" aria-label="Miftahul Mubin, kembali ke beranda">
          <img className="mm-brand-logo" src={logoSrc} alt="Miftahul Mubin" />
        </Link>
        <div className="mm-header-tools">
          <button className="mm-search-trigger" type="button" aria-label="Cari informasi" aria-expanded={searchOpen} onClick={() => { setMenuOpen(false); setLanguageOpen(false); setSearchOpen(true) }}><Search size={21}/><span>Cari Berita</span></button>
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
          {primaryLinks.map(([label, href]) => <Link key={label} className={isActive(href) ? 'active' : ''} aria-current={isActive(href) ? 'page' : undefined} href={href}>{label}</Link>)}
        </nav>
      </div>
      <div className="mm-secondary-row">
        <div className="container mm-secondary-inner">
          <nav className="mm-secondary-nav" aria-label="Kategori portal">{categoryLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
          <time className="mm-date" dateTime={new Date().toISOString().slice(0, 10)}>{today || 'Hari ini'}</time>
        </div>
      </div>
    </header>
    {menuOpen && <div className="mm-mobile-menu" id="mm-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu utama"><div className="container mm-mobile-inner"><p className="mm-mobile-label">Navigasi Miftahul Mubin</p>{primaryLinks.map(([label, href]) => <Link key={label} className={isActive(href) ? 'active' : ''} aria-current={isActive(href) ? 'page' : undefined} href={href} onClick={closeAll}><span>{label}</span><ChevronRight size={19}/></Link>)}<div className="mm-mobile-categories"><p>Kategori</p><div>{categoryLinks.map(([label, href]) => <Link key={label} href={href} onClick={closeAll}>{label}</Link>)}</div></div><button className="mm-mobile-theme" type="button" onClick={toggleTheme}><span>{dark ? <Sun size={17}/> : <Moon size={17}/>}<span>{dark ? 'Mode terang' : 'Mode gelap'}</span></span><span aria-hidden="true">{dark ? '☀' : '◐'}</span></button></div></div>}
    {searchOpen && <div className="mm-search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAll() }}><div className="mm-search-panel"><div className="mm-search-head"><div><span className="eyebrow">Pencarian</span><h2>Cari informasi Miftahul Mubin</h2></div><button className="mm-close-btn" type="button" aria-label="Tutup pencarian" onClick={closeAll}><X size={21}/></button></div><label className="mm-search-field"><Search size={21}/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari berita, kegiatan, pengumuman, atau informasi..."/></label><div className="mm-search-results" aria-live="polite">{!query && <p className="search-helper">Cari berita, kegiatan, keislaman, pengurus, keuangan, atau halaman portal lainnya.</p>}{query && results.length === 0 && <p className="search-helper">Tidak ada hasil untuk “{query}”.</p>}{results.map((result) => <Link key={result.href + result.title} href={result.href} onClick={closeAll}><span><small>{result.category}</small>{result.title}</span><ChevronRight size={17}/></Link>)}</div></div></div>}
  </>
}
