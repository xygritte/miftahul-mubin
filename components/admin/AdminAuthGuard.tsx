'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type AdminAuthGuardProps = { children: ReactNode }

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'authorized' | 'denied'>('loading')

  useEffect(() => {
    let active = true

    const checkAccess = async () => {
      setState('loading')

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        if (active) router.replace('/admin/login/')
        return
      }

      // Use the SECURITY DEFINER RPC instead of relying on a client-side join
      // between user_roles and roles. This makes the guard authoritative and
      // avoids RLS/relation-shape differences between environments.
      const { data, error } = await supabase.rpc('has_admin_access')

      if (error) {
        console.error('Admin access check failed:', error)
        if (active) setState('denied')
        return
      }

      if (data === true) {
        if (active) setState('authorized')
      } else {
        if (active) setState('denied')
      }
    }

    void checkAccess()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        if (active) router.replace('/admin/login/')
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void checkAccess()
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [router])

  if (state === 'loading') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Miftahul Mubin</span><strong>Memeriksa akses…</strong><p>Menyiapkan sesi pengelola.</p></div></div>
  }

  if (state === 'denied') {
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Akses ditolak</span><h1>Akun belum memiliki peran pengelola.</h1><p>Sesi berhasil dikenali, tetapi akun ini tidak memiliki role pengelola yang diizinkan.</p><button className="admin-button secondary" onClick={() => router.replace('/')}>Kembali ke website</button></div></div>
  }

  return <>{children}</>
}
