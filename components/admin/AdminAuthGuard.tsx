'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'
import { signOutAndRedirect } from '@/lib/admin/auth'

type AdminAuthGuardProps = { children: ReactNode }

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [state, setState] = useState<'loading' | 'authorized' | 'denied'>('loading')
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    if (loggingOut) return
    setLoggingOut(true)
    await signOutAndRedirect({ replace: (path) => window.location.assign(sitePath(path)) })
  }

  useEffect(() => {
    let active = true
    let checking = false

    const redirectToLogin = () => {
      window.location.assign(sitePath('/admin/login/'))
    }

    const checkAccess = async () => {
      if (checking) return
      checking = true
      setState('loading')

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          if (active) redirectToLogin()
          return
        }

        const { data, error } = await supabase.rpc('has_admin_access')
        if (error) {
          console.error('Admin access check failed:', error)
          if (active) setState('denied')
          return
        }

        if (active) setState(data === true ? 'authorized' : 'denied')
      } finally {
        checking = false
      }
    }

    void checkAccess()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        if (active) redirectToLogin()
        return
      }

      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        window.setTimeout(() => { void checkAccess() }, 0)
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Miftahul Mubin</span><strong>Memeriksa akses…</strong><p>Menyiapkan sesi pengelola.</p></div></div>
  }

  if (state === 'denied') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Akses ditolak</span><h1>Akun belum memiliki peran pengelola.</h1><p>Sesi berhasil dikenali, tetapi akun ini tidak memiliki role pengelola yang diizinkan.</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="admin-button secondary" onClick={() => window.location.assign(sitePath('/'))}>Kembali ke website</button><button className="admin-button primary" onClick={() => void logout()} disabled={loggingOut}>{loggingOut ? <><Loader2 className="spin" size={16}/> Keluar…</> : <><LogOut size={16}/> Keluar</>}</button></div></div></div>
  }

  return <>{children}</>
}
