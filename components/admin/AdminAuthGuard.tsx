'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const ALLOWED_ROLES = new Set(['super_admin', 'editor', 'treasurer', 'secretary'])

type AdminAuthGuardProps = {
  children: ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'authorized' | 'denied'>('loading')

  useEffect(() => {
    let active = true

    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        if (active) router.replace('/admin/login/')
        return
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id)

      if (error) {
        if (active) setState('denied')
        return
      }

      const roles = (data ?? []).flatMap((row) => {
        const relation = row.roles
        if (Array.isArray(relation)) return relation.map((item) => item?.name).filter(Boolean)
        return relation?.name ? [relation.name] : []
      })

      if (!roles.some((role) => ALLOWED_ROLES.has(role))) {
        if (active) setState('denied')
        return
      }

      if (active) setState('authorized')
    }

    checkAccess()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/admin/login/')
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
    return <div className="admin-status-page"><div className="admin-status-card"><span className="eyebrow">Akses ditolak</span><h1>Akun belum memiliki peran pengelola.</h1><p>Hubungi administrator untuk memberikan role yang sesuai.</p><button className="admin-button secondary" onClick={() => router.replace('/')}>Kembali ke website</button></div></div>
  }

  return <>{children}</>
}
