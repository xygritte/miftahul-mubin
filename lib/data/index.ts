import type { PublicContentRepository } from './repository'
import { staticRepository } from './staticRepository'
import { supabasePublicRepository } from './supabasePublicRepository'

/**
 * Public content access with failure isolation.
 * Supabase is attempted first; static content is used only when the public
 * database read is unavailable during static generation or preview builds.
 */
const withFallback = <T>(
  live: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> => live().catch(() => fallback())

export const contentRepository: PublicContentRepository = {
  listNews: () => withFallback(() => supabasePublicRepository.listNews(), () => staticRepository.listNews()),
  getNewsBySlug: (slug) => withFallback(() => supabasePublicRepository.getNewsBySlug(slug), () => staticRepository.getNewsBySlug(slug)),
  listIslamic: () => withFallback(() => supabasePublicRepository.listIslamic(), () => staticRepository.listIslamic()),
  getIslamicBySlug: (slug) => withFallback(() => supabasePublicRepository.getIslamicBySlug(slug), () => staticRepository.getIslamicBySlug(slug)),
  listEvents: () => withFallback(() => supabasePublicRepository.listEvents(), () => staticRepository.listEvents()),
  getEventBySlug: (slug) => withFallback(() => supabasePublicRepository.getEventBySlug(slug), () => staticRepository.getEventBySlug(slug)),
  listAnnouncements: () => withFallback(() => supabasePublicRepository.listAnnouncements(), () => staticRepository.listAnnouncements()),
  listManagementPeriods: () => withFallback(() => supabasePublicRepository.listManagementPeriods(), () => staticRepository.listManagementPeriods()),
  listManagementMembers: (periodId) => withFallback(() => supabasePublicRepository.listManagementMembers(periodId), () => staticRepository.listManagementMembers(periodId)),
  listMediaAlbums: () => withFallback(() => supabasePublicRepository.listMediaAlbums(), () => staticRepository.listMediaAlbums()),
  listMediaItems: (albumId) => withFallback(() => supabasePublicRepository.listMediaItems(albumId), () => staticRepository.listMediaItems(albumId)),
  getLatestPublishedFinancePeriod: () => withFallback(() => supabasePublicRepository.getLatestPublishedFinancePeriod(), () => staticRepository.getLatestPublishedFinancePeriod()),
  getPublishedFinancePeriod: (year, month) => withFallback(() => supabasePublicRepository.getPublishedFinancePeriod(year, month), () => staticRepository.getPublishedFinancePeriod(year, month)),
  listPublishedFinanceTransactions: (periodId) => withFallback(() => supabasePublicRepository.listPublishedFinanceTransactions(periodId), () => staticRepository.listPublishedFinanceTransactions(periodId)),
}

export const fallbackContentRepository: PublicContentRepository = staticRepository

export type { PublicContentRepository } from './repository'
