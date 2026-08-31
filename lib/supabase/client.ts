import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from './publicConfig'

const noStoreFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const request = new Request(input, init)
  const isRestRequest = request.url.includes('/rest/v1/')

  if (!isRestRequest) return fetch(request)

  return fetch(request, {
    ...init,
    headers: {
      ...new Headers(init?.headers ?? {}),
      'Cache-Control': 'no-store, no-cache, max-age=0',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  })
}

// Keep client creation safe during static builds where public Supabase
// environment variables may be absent. The app still exposes the real
// configuration state through `isSupabaseConfigured`; runtime operations
// should guard against a missing configuration before making requests.
const clientUrl = SUPABASE_URL || 'https://placeholder.supabase.co'
const clientKey = SUPABASE_PUBLISHABLE_KEY || 'placeholder-publishable-key'

/** Browser-safe Supabase client for Auth, admin interactions, public live data and Realtime. */
export const supabase = createClient(clientUrl, clientKey, {
  global: { fetch: noStoreFetch },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export { isSupabaseConfigured }
