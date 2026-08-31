import type {
  AnnouncementRecord,
  EventRecord,
  FinancePeriod,
  FinanceTransaction,
  IslamicItemRecord,
  ManagementMember,
  ManagementPeriod,
  MediaAlbum,
  MediaItem,
  NewsRecord,
} from '@/types/content'

/** UI-facing contract shared by static and Supabase implementations. */
export type PublicContentRepository = {
  listNews(): Promise<NewsRecord[]>
  getNewsBySlug(slug: string): Promise<NewsRecord | null>
  listIslamic(): Promise<IslamicItemRecord[]>
  getIslamicBySlug(slug: string): Promise<IslamicItemRecord | null>
  listEvents(): Promise<EventRecord[]>
  getEventBySlug(slug: string): Promise<EventRecord | null>
  listAnnouncements(): Promise<AnnouncementRecord[]>
  listManagementPeriods(): Promise<ManagementPeriod[]>
  listManagementMembers(periodId?: string): Promise<ManagementMember[]>
  listMediaAlbums(): Promise<MediaAlbum[]>
  listMediaItems(albumId?: string): Promise<MediaItem[]>
  getLatestPublishedFinancePeriod(): Promise<FinancePeriod | null>
  getPublishedFinancePeriod(year: number, month: number): Promise<FinancePeriod | null>
  listPublishedFinanceTransactions(periodId: string): Promise<FinanceTransaction[]>
}
