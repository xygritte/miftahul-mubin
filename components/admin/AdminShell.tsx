'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, CalendarDays, FileText, GalleryVerticalEnd, LayoutDashboard, LogOut, Megaphone, Settings2, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const items = [
  { href: '/admin/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/berita/', label: 'Berita', icon: FileText },
  { href: '/admin/kegiatan/', label: 'Kegiatan', icon: CalendarDays },
  { href: '/admin/keislaman/', label: 'Keislaman', icon: ShieldCheck },
  { href: '/admin/pengumuman/', label: 'Pengumuman', icon: Megaphone },
  { href: '/admin/kepengurusan/', label: 'Kepengurusan', icon: Users },
  { href: '/admin/dokumentasi/', label: 'Dokumentasi', icon: GalleryVerticalEnd },
  { href: '/admin/keuangan/', label: 'Keuangan', icon: WalletCards },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.replace('/admin/login/')
  }

  return <div className="admin-app">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="eyebrow">Portal Pengelola</span><strong>Miftahul Mubin</strong><small>Admin Console</small></div>
      <nav aria-label="Navigasi admin">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin/' ? pathname === '/admin/' : pathname.startsWith(href)
          return <Link className={`admin-nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} key={href} href={href}><Icon size={17} /><span>{label}</span></Link>
        })}
      </nav>
      <div className="admin-sidebar-bottom"><Link className="admin-nav-item" href="/"><BarChart3 size={17} /><span>Lihat Website</span></Link><button className="admin-nav-item admin-logout" disabled={signingOut} onClick={signOut}><LogOut size={17} /><span>{signingOut ? 'Keluar…' : 'Keluar'}</span></button></div>
    </aside>
    <div className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">Miftahul Mubin</span><strong>Panel Pengelola</strong></div><span className="admin-session-status"><Settings2 size={15} /> Supabase Auth</span></header><main className="admin-content">{children}</main></div>
  </div>
}
