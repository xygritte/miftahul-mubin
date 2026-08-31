/**
 * Public Supabase configuration.
 *
 * These values must come from environment variables. The publishable key is
 * safe for browser use when Supabase Row Level Security is configured.
 */
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

if (!envUrl || !envKey) {
  throw new Error(
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  )
}

export const SUPABASE_URL = envUrl
export const SUPABASE_PUBLISHABLE_KEY = envKey
