import { supabase } from '@/lib/supabase/client'
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
import type { PublicContentRepository } from './repository'

type Row = Record<string, unknown>

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

function contentToParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string') return [value]
  return []
}

function categoryName(row: Row): string {
  const category = row.categories
  if (Array.isArray(category) && category[0] && typeof category[0].name === 'string') return category[0].name
  if (category && typeof category === 'object' && 'name' in category && typeof category.name === 'string') return category.name as string
  return 'Umum'
}

function mapNews(row: Row): NewsRecord {
  return { id: row.id as string, slug: row.slug as string, title: row.title as string, excerpt: row.excerpt as string, content: contentToParagraphs(row.content), thumbnailUrl: row.thumbnail_url as string | null, category: categoryName(row), authorId: row.author_id as string | null, status: row.status as NewsRecord['status'], publishedAt: row.published_at as string | null, viewCount: Number(row.view_count ?? 0), createdAt: row.created_at as string, updatedAt: row.updated_at as string }
}

function mapIslamic(row: Row): IslamicItemRecord {
  return { id: row.id as string, slug: row.slug as string, category: categoryName(row), title: row.title as string, date: (row.published_at ?? row.created_at) as string, excerpt: row.excerpt as string, content: contentToParagraphs(row.content), status: row.status as IslamicItemRecord['status'], publishedAt: row.published_at as string | null }
}

function mapEvent(row: Row): EventRecord {
  return { id: row.id as string, slug: row.slug as string, title: row.title as string, description: row.description as string, eventDate: row.event_date as string, startTime: row.start_time as string, endTime: row.end_time as string | null, location: row.location as string, speaker: row.speaker as string | null, status: row.status as EventRecord['status'], coverUrl: row.cover_url as string | null, category: categoryName(row), createdAt: row.created_at as string, updatedAt: row.updated_at as string }
}

export const supabaseRepository: PublicContentRepository = {
  async listNews() {
    const { data, error } = await requireClient().from('news').select('*, categories(name)').order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => mapNews(row as Row))
  },

  async getNewsBySlug(slug) {
    const { data, error } = await requireClient().from('news').select('*, categories(name)').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ? mapNews(data as Row) : null
  },

  async listIslamic() {
    const { data, error } = await requireClient().from('islamic_articles').select('*, categories(name)').order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => mapIslamic(row as Row))
  },

  async getIslamicBySlug(slug) {
    const { data, error } = await requireClient().from('islamic_articles').select('*, categories(name)').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ? mapIslamic(data as Row) : null
  },

  async listEvents() {
    const { data, error } = await requireClient().from('events').select('*, categories(name)').order('event_date', { ascending: true }).order('start_time', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => mapEvent(row as Row))
  },

  async getEventBySlug(slug) {
    const { data, error } = await requireClient().from('events').select('*, categories(name)').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data ? mapEvent(data as Row) : null
  },

  async listAnnouncements() {
    const { data, error } = await requireClient().from('announcements').select('*').order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({ id: row.id, title: row.title, content: row.content, status: row.status, publishedAt: row.published_at, authorId: row.author_id, createdAt: row.created_at, updatedAt: row.updated_at })) as AnnouncementRecord[]
  },

  async listManagementPeriods() {
    const { data, error } = await requireClient().from('management_periods').select('*').order('start_date', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({ id: row.id, name: row.name, startDate: row.start_date, endDate: row.end_date, isActive: row.is_active })) as ManagementPeriod[]
  },

  async listManagementMembers(periodId) {
    let query = requireClient().from('management_members').select('*').order('sort_order', { ascending: true })
    if (periodId) query = query.eq('period_id', periodId)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((row) => ({ id: row.id, periodId: row.period_id, name: row.name, position: row.position, photoUrl: row.photo_url, bio: row.bio, sortOrder: row.sort_order })) as ManagementMember[]
  },

  async listMediaAlbums() {
    const { data, error } = await requireClient().from('media_albums').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => ({ id: row.id, title: row.title, slug: row.slug, description: row.description, coverUrl: row.cover_url, createdAt: row.created_at })) as MediaAlbum[]
  },

  async listMediaItems(albumId) {
    let query = requireClient().from('media_items').select('*').order('sort_order', { ascending: true })
    if (albumId) query = query.eq('album_id', albumId)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map((row) => ({ id: row.id, albumId: row.album_id, type: row.type, title: row.title, url: row.url, thumbnailUrl: row.thumbnail_url, caption: row.caption, sortOrder: row.sort_order, createdAt: row.created_at })) as MediaItem[]
  },

  async getLatestPublishedFinancePeriod() {
    const { data, error } = await requireClient().from('finance_periods').select('*').not('published_at', 'is', null).lte('published_at', new Date().toISOString()).order('year', { ascending: false }).order('month', { ascending: false }).limit(1).maybeSingle()
    if (error) throw error
    if (!data) return null
    return { id: data.id, year: data.year, month: data.month, openingBalance: Number(data.opening_balance), publishedAt: data.published_at, createdAt: data.created_at, updatedAt: data.updated_at } as FinancePeriod
  },

  async getPublishedFinancePeriod(year, month) {
    const { data, error } = await requireClient().from('finance_periods').select('*').eq('year', year).eq('month', month).maybeSingle()
    if (error) throw error
    if (!data) return null
    return { id: data.id, year: data.year, month: data.month, openingBalance: Number(data.opening_balance), publishedAt: data.published_at, createdAt: data.created_at, updatedAt: data.updated_at } as FinancePeriod
  },

  async listPublishedFinanceTransactions(periodId) {
    const { data, error } = await requireClient().from('finance_transactions').select('*').eq('period_id', periodId).order('transaction_date', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => ({ id: row.id, periodId: row.period_id, transactionDate: row.transaction_date, type: row.type, categoryId: row.category_id, description: row.description, amount: Number(row.amount), proofUrl: row.proof_url, createdBy: row.created_by, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at })) as FinanceTransaction[]
  },
}
