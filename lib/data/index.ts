import { staticRepository } from './staticRepository'
import type { PublicContentRepository } from './repository'

/**
 * Single entry point for public content access.
 * Replace staticRepository with a Supabase implementation when the backend is connected.
 */
export const contentRepository: PublicContentRepository = staticRepository

export type { PublicContentRepository } from './repository'
