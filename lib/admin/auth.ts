import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'

export async function signOutAndRedirect(router: { replace: (href: string) => void }) {
  await supabase.auth.signOut()
  router.replace(sitePath('/admin/login/'))
}
