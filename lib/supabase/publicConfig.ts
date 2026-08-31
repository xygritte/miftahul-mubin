/**
 * Public Supabase configuration.
 *
 * The publishable/anon key is intentionally browser-safe and is restricted by
 * Supabase RLS. Environment variables override these defaults when present.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://xzcwmplikcavrbiuuxcc.supabase.co'

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_TRd_cCShGfXnmZmPW1YC_w_arK4lS1V'
