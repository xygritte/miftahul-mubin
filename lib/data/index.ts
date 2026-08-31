import type { PublicContentRepository } from './repository'
import { staticRepository } from './staticRepository'
import { supabaseRepository } from './supabaseRepository'

/**
 * Single entry point for public content access.
 * Supabase becomes the source of truth when its public client variables exist;
 * static data remains available as a safe local/preview fallback.
 */
export const contentRepository: PublicContentRepository =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? supabaseRepository
    : staticRepository

export type { PublicContentRepository } from './repository'
