import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './publicConfig'

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

/** Browser-safe Supabase client for Auth, admin interactions, public live data and Realtime. */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: { fetch: noStoreFetch },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
