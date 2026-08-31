import { supabase } from '@/lib/supabase/client'

export async function signOutAndRedirect(router: { replace: (href: string) => void }) {
  await supabase.auth.signOut()
  router.replace('/admin/login/')
}
