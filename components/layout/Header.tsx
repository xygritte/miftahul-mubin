'use client'

import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  ...news.map((item) => ({ title: item.title, href: `/berita/${item.slug}/` })),
  ...islamicItems.map((item) => ({ title: item.title, href: `/keislaman/${item.slug}/` })),
  { title: 'Jadwal Kajian Miftahul Mubin Bulan September', href: '/kegiatan/' },
  { title: 'Laporan Keuangan dan Transparansi Bulan Agustus', href: '/keuangan/' },
]

export default function Header() {
  const pathname = usePathname() || '/'
  const [menuOpen, setMenuOpen] = useState(false), [searchOpen, setSearchOpen] = useState(false), [query, setQuery] = useState('')
  useEffect(() => { document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [menuOpen, searchOpen])
  useEffect(() => { const onKeyDown=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenuOpen(false);setSearchOpen(false);setQuery('')}}; window.addEventListener('keydown',onKeyDown); return()=>window.removeEventListener('keydown',onKeyDown)},[])
  const isActive=(href:string)=>href==='/' ? pathname==='/' : pathname.startsWith(href.replace(/\/$/,''))
  const results=searchItems.filter(item=>item.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0,8)
  const closeAll=()=>{setMenuOpen(false);setSearchOpen(false);setQuery('')}
  return <>
    <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
    <div className="utility-bar"><div className="container utility-inner"><span>Portal Informasi Masjid Miftahul Mubin</span><span className="utility-right"><span>30 Agustus 2026</span><span aria-hidden="true">•</span><Link href="/kontak/">Kontak Pengurus</Link></span></div></div>
    <header className="site-header"><div className="container header-main">
      <Link href="/" className="brand" aria-label="Miftahul Mubin, kembali ke beranda"><span className="brand-mark" aria-hidden="true">MM</span><span><strong>Miftahul Mubin</strong><small>Masjid & Pusat Kegiatan Umat</small></span></Link>
      <nav className="desktop-nav" aria-label="Navigasi utama">{primaryLinks.map(([label,href])=><Link key={label} className={isActive(href)?'active':''} href={href}>{label}</Link>)}</nav>
      <div className="header-actions"><button className="search-btn" type="button" aria-label="Buka pencarian" aria-expanded={searchOpen} onClick={()=>{setMenuOpen(false);setSearchOpen(true)}}><Search size={20}/></button><button className="menu-btn" type="button" aria-label={menuOpen?'Tutup menu':'Buka menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={()=>{setSearchOpen(false);setMenuOpen(o=>!o)}}>{menuOpen?<X size={24}/>:<Menu size={24}/>}</button></div>
    </div><div className="category-bar"><nav className="container category-scroll" aria-label="Kategori">{categoryLinks.map(([label,href])=><Link key={label} href={href} onClick={closeAll}>{label}</Link>)}</nav></div></header>
    {menuOpen&&<div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu utama"><div className="mobile-menu-inner container"><p className="mobile-menu-label">Menu Miftahul Mubin</p>{primaryLinks.map(([label,href])=><Link key={label} className="mobile-menu-link" href={href} onClick={closeAll}>{label}<span aria-hidden="true">›</span></Link>)}<div className="mobile-menu-categories"><p>Kategori</p>{categoryLinks.map(([label,href])=><Link key={label} href={href} onClick={closeAll}>{label}</Link>)}</div></div></div>}
    {searchOpen&&<div className="search-overlay" role="dialog" aria-modal="true" aria-label="Pencarian"><div className="search-panel"><div className="search-panel-head"><div><span className="eyebrow">Pencarian</span><h2>Cari informasi Miftahul Mubin</h2></div><button className="close-btn" type="button" aria-label="Tutup pencarian" onClick={closeAll}><X size={22}/></button></div><label className="search-field"><Search size={21} aria-hidden="true"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari berita, kegiatan, atau artikel..."/></label><div className="search-results" aria-live="polite">{!query&&<p className="search-helper">Ketik kata kunci untuk mencari konten pada portal.</p>}{query&&results.length===0&&<p className="search-helper">Tidak ada hasil untuk “{query}”.</p>}{results.map(result=><Link key={result.href + result.title} href={result.href} onClick={closeAll}><span>{result.title}</span><span aria-hidden="true">›</span></Link>)}</div></div></div>}
  </>
}
