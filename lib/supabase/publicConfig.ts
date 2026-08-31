/**
 * Public Supabase configuration.
 *
 * The publishable/anon key is intentionally browser-safe and is restricted by
 * Supabase RLS. Environment variables override these defaults when non-empty.
 */
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

export const SUPABASE_URL = envUrl || 'https://xzcwmplikcavrbiuuxcc.supabase.co'

export const SUPABASE_PUBLISHABLE_KEY =
  envKey || 'sb_publishable_TRd_cCShGfXnmZmPW1YC_w_arK4lS1V'

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Public Supabase configuration is missing.')
}
