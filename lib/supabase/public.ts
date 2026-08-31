import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './publicConfig'

/**
 * Server/build-safe public Supabase client for public, RLS-protected reads.
 * The client is created lazily so static Next.js generation can evaluate
 * public modules even when local build environments do not provide Supabase
 * environment variables.
 */
let client: SupabaseClient | null = null

function getPublicSupabase(): SupabaseClient {
  if (client) return client

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return client
}

export const publicSupabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPublicSupabase() as object, property, receiver)
  },
})
