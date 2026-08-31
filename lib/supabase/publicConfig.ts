/**
 * Public Supabase configuration.
 *
 * Values come from environment variables. The publishable key is safe for
 * browser use when Supabase Row Level Security is configured.
 *
 * Keep module evaluation side-effect free so static Next.js routes such as
 * `_not-found` can be generated even when Supabase is not configured in the
 * local build environment. Consumers that actually need Supabase should use
 * `requireSupabaseConfig()` and receive a clear configuration error.
 */
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

export const SUPABASE_URL = envUrl
export const SUPABASE_PUBLISHABLE_KEY = envKey

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
}

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  return {
    url: SUPABASE_URL,
    key: SUPABASE_PUBLISHABLE_KEY,
  }
}
