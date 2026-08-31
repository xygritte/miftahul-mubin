import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from './publicConfig'

const noStoreFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const request = new Request(input, init)
  if (!request.url.includes('/rest/v1/')) return fetch(request)

  const headers = new Headers(request.headers)
  headers.set('Cache-Control', 'no-store, no-cache, max-age=0')
  headers.set('Pragma', 'no-cache')

  return fetch(new Request(request, {
    headers,
    cache: 'no-store',
  }))
}

// Keep client creation safe during static builds where public Supabase
// environment variables may be absent. Runtime requests use the real
// configuration injected by the deployment environment.
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
