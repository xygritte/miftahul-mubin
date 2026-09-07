import { supabase } from '@/lib/supabase/client'

export async function verifyAdminAccess() {
  return supabase.rpc('has_admin_access')
}

export async function signOutAndRedirect(router: { replace: (href: string) => void }) {
  await supabase.auth.signOut()
  router.replace('/admin/login/')
}
