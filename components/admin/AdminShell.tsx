'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, CalendarDays, FileText, GalleryVerticalEnd, HardDrive, LayoutDashboard, LogOut, Mail, Megaphone, Moon, ShieldCheck, Sun, Users, WalletCards, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { signOutAndRedirect } from '@/lib/admin/auth'
import { sitePath } from '@/lib/data/presentation'

const items = [
  { href: '/admin/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/berita/', label: 'Berita', icon: FileText },
  { href: '/admin/kegiatan/', label: 'Kegiatan', icon: CalendarDays },
  { href: '/admin/keislaman/', label: 'Keislaman', icon: ShieldCheck },
  { href: '/admin/pengumuman/', label: 'Pengumuman', icon: Megaphone },
  { href: '/admin/kepengurusan/', label: 'Kepengurusan', icon: Users },
  { href: '/admin/dokumentasi/', label: 'Dokumentasi', icon: GalleryVerticalEnd },
  { href: '/admin/keuangan/', label: 'Keuangan', icon: WalletCards },
  { href: '/admin/profil/', label: 'Profil', icon: UserRound },
  { href: '/admin/kontak/', label: 'Kontak', icon: Mail },
  { href: '/admin/storage/', label: 'Storage', icon: HardDrive },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => { setDark(document.documentElement.dataset.theme === 'dark') }, [])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    await signOutAndRedirect(router)
  }

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    window.localStorage.setItem('mm-theme', next ? 'dark' : 'light')
  }

  return <div className="admin-app">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="eyebrow">Portal Pengelola</span><strong>Miftahul Mubin</strong><small>Admin Console</small></div>
      <nav aria-label="Navigasi admin">
        {items.map(({ href, label, icon: Icon }) => {
          const resolvedHref = sitePath(href)
          const active = href === '/admin/' ? pathname === resolvedHref : pathname.startsWith(resolvedHref)
          return <Link className={`admin-nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} key={href} href={href}><Icon size={17} /><span>{label}</span></Link>
        })}
      </nav>
      <div className="admin-sidebar-bottom"><Link className="admin-nav-item" href="/"><BarChart3 size={17} /><span>Lihat Website</span></Link><button className="admin-nav-item admin-logout" disabled={signingOut} onClick={() => void signOut()}><LogOut size={17} /><span>{signingOut ? 'Keluar…' : 'Keluar'}</span></button></div>
    </aside>
    <div className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">Miftahul Mubin</span><strong>Panel Pengelola</strong></div><span className="admin-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="admin-session-status">Supabase Auth + Storage</span><button className="admin-theme-toggle" type="button" aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} aria-pressed={dark} onClick={toggleTheme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></span></header><main className="admin-content">{children}</main></div>
  </div>
}
