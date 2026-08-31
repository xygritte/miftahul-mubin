import type { PublicContentRepository } from './repository'
import { staticRepository } from './staticRepository'
import { supabasePublicRepository } from './supabasePublicRepository'

/**
 * Single entry point for public content access.
 * The published portal uses Supabase as the source of truth; static data remains
 * available only when the build explicitly opts into fallback mode.
 */
export const contentRepository: PublicContentRepository = supabasePublicRepository

export const fallbackContentRepository: PublicContentRepository = staticRepository

export type { PublicContentRepository } from './repository'
