'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

// Keep this list aligned with the database role vocabulary. `admin` is retained
// for compatibility with the original schema; `super_admin` is the current top role.
const ALLOWED_ROLES = new Set(['admin', 'super_admin', 'editor', 'treasurer', 'secretary'])

type AdminAuthGuardProps = { children: ReactNode }
type RoleRow = { role_id: string; roles: { name: string } | Array<{ name: string }> | null }

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'authorized' | 'denied'>('loading')

  useEffect(() => {
    let active = true

    async function checkAccess() {
      if (!supabase) {
        if (active) setState('denied')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (active) router.replace('/admin/login/')
        return
      }

      // user_roles now explicitly allows self-read, avoiding the previous
      // circular situation where the guard needed a role in order to read its role.
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id)

      if (error) {
        console.error('Admin role check failed:', error)
        if (active) setState('denied')
        return
      }

      const roles = ((data ?? []) as unknown as RoleRow[]).flatMap((row) => {
        const relation = row.roles
        return Array.isArray(relation) ? relation.map((item) => item.name) : relation?.name ? [relation.name] : []
      })

      if (!roles.some((role) => ALLOWED_ROLES.has(role))) {
        if (active) setState('denied')
        return
      }

      if (active) setState('authorized')
    }

    void checkAccess()

    if (!supabase) {
      return () => { active = false }
    }

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
