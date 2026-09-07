'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { LogOut, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'
import { signOutAndRedirect, verifyAdminAccess } from '@/lib/admin/auth'

type AdminAuthGuardProps = { children: ReactNode }

type GuardState = 'loading' | 'authorized' | 'denied' | 'error'

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [state, setState] = useState<GuardState>('loading')
  const [loggingOut, setLoggingOut] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

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
      setState((current) => current === 'authorized' ? current : 'loading')

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        let user = userData.user

        if (userError) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError || !refreshData.user) {
            console.error('Admin session recovery failed:', refreshError ?? userError)
            if (active) setState('error')
            return
          }
          user = refreshData.user
        }

        if (!user) {
          if (active) redirectToLogin()
          return
        }

        const { data, error } = await verifyAdminAccess()
        if (error) {
          console.error('Admin access check failed:', error)
          if (active) setState('error')
          return
        }

        if (active) setState(data === true ? 'authorized' : 'denied')
      } catch (error) {
        console.error('Admin access check unexpectedly failed:', error)
        if (active) setState('error')
      } finally {
        checking = false
      }
    }

    void checkAccess()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (active) redirectToLogin()
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [retryCount])

  if (state === 'loading') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Miftahul Mubin</span><strong>Memeriksa akses…</strong><p>Menyiapkan sesi pengelola.</p></div></div>
  }

  if (state === 'error') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Sesi bermasalah</span><h1>Sesi pengelola tidak dapat diverifikasi.</h1><p>Koneksi atau sesi browser mungkin sedang bermasalah. Data Anda belum diubah.</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="admin-button secondary" onClick={() => setRetryCount((count) => count + 1)}><RefreshCw size={16}/> Coba lagi</button><button className="admin-button primary" onClick={() => void logout()} disabled={loggingOut}>{loggingOut ? <><Loader2 className="spin" size={16}/> Keluar…</> : <><LogOut size={16}/> Keluar dan masuk kembali</>}</button></div></div></div>
  }

  if (state === 'denied') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Akses ditolak</span><h1>Akun belum memiliki peran pengelola.</h1><p>Sesi berhasil dikenali, tetapi akun ini tidak memiliki role pengelola yang diizinkan.</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="admin-button secondary" onClick={() => window.location.assign(sitePath('/'))}>Kembali ke website</button><button className="admin-button primary" onClick={() => void logout()} disabled={loggingOut}>{loggingOut ? <><Loader2 className="spin" size={16}/> Keluar…</> : <><LogOut size={16}/> Keluar</>}</button></div></div></div>
  }

  return <>{children}</>
}
