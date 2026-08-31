import type { PublicContentRepository } from './repository'
import { supabasePublicRepository } from './supabasePublicRepository'

/**
 * Public content is database-backed by design.
 * Static source data is no longer used as a runtime fallback, so public pages
 * cannot silently display stale content when Supabase is unavailable.
 */
export const contentRepository: PublicContentRepository = supabasePublicRepository

export type { PublicContentRepository } from './repository'
