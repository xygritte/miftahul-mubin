import { publicSupabase } from '@/lib/supabase/public'
import type { PublicContentRepository } from './repository'
import type { AnnouncementRecord, EventRecord, FinancePeriod, FinanceTransaction, IslamicItemRecord, ManagementMember, ManagementPeriod, MediaAlbum, MediaItem, NewsRecord } from '@/types/content'

type Row = Record<string, any>

const paragraphs = (value: unknown): string[] => Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : typeof value === 'string' ? [value] : []
const category = (row: Row): string => Array.isArray(row.categories) && row.categories[0]?.name ? row.categories[0].name : row.categories?.name ?? 'Umum'

export const supabasePublicRepository: PublicContentRepository = {
  async listNews() {
    const { data, error } = await publicSupabase.from('news').select('*, categories(name)').order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, content: paragraphs(r.content), thumbnailUrl: r.thumbnail_url, category: category(r), authorId: r.author_id, status: r.status, publishedAt: r.published_at, viewCount: Number(r.view_count ?? 0), createdAt: r.created_at, updatedAt: r.updated_at })) as NewsRecord[]
  },
  async getNewsBySlug(slug) {
    const { data, error } = await publicSupabase.from('news').select('*, categories(name)').eq('slug', slug).maybeSingle()
    if (error) throw error
    if (!data) return null
    const r: Row = data
    return { id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, content: paragraphs(r.content), thumbnailUrl: r.thumbnail_url, category: category(r), authorId: r.author_id, status: r.status, publishedAt: r.published_at, viewCount: Number(r.view_count ?? 0), createdAt: r.created_at, updatedAt: r.updated_at } as NewsRecord
  },
  async listIslamic() {
    const { data, error } = await publicSupabase.from('islamic_articles').select('*, categories(name)').order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, slug: r.slug, category: category(r), title: r.title, date: r.published_at ?? r.created_at, excerpt: r.excerpt, content: paragraphs(r.content), status: r.status, publishedAt: r.published_at })) as IslamicItemRecord[]
  },
  async getIslamicBySlug(slug) {
    const { data, error } = await publicSupabase.from('islamic_articles').select('*, categories(name)').eq('slug', slug).maybeSingle()
    if (error) throw error
    if (!data) return null
    const r: Row = data
    return { id: r.id, slug: r.slug, category: category(r), title: r.title, date: r.published_at ?? r.created_at, excerpt: r.excerpt, content: paragraphs(r.content), status: r.status, publishedAt: r.published_at } as IslamicItemRecord
  },
  async listEvents() {
    const { data, error } = await publicSupabase.from('events').select('*, categories(name)').order('event_date', { ascending: true }).order('start_time', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, slug: r.slug, title: r.title, description: r.description, eventDate: r.event_date, startTime: r.start_time, endTime: r.end_time, location: r.location, speaker: r.speaker, status: r.status, coverUrl: r.cover_url, category: category(r), createdAt: r.created_at, updatedAt: r.updated_at })) as EventRecord[]
  },
  async getEventBySlug(slug) {
    const { data, error } = await publicSupabase.from('events').select('*, categories(name)').eq('slug', slug).maybeSingle()
    if (error) throw error
    if (!data) return null
    const r: Row = data
    return { id: r.id, slug: r.slug, title: r.title, description: r.description, eventDate: r.event_date, startTime: r.start_time, endTime: r.end_time, location: r.location, speaker: r.speaker, status: r.status, coverUrl: r.cover_url, category: category(r), createdAt: r.created_at, updatedAt: r.updated_at } as EventRecord
  },
  async listAnnouncements() {
    const { data, error } = await publicSupabase.from('announcements').select('*').order('published_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, title: r.title, content: r.content, status: r.status, publishedAt: r.published_at, authorId: r.author_id, createdAt: r.created_at, updatedAt: r.updated_at })) as AnnouncementRecord[]
  },
  async listManagementPeriods() {
    const { data, error } = await publicSupabase.from('management_periods').select('*').order('start_date', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, name: r.name, startDate: r.start_date, endDate: r.end_date, isActive: r.is_active })) as ManagementPeriod[]
  },
  async listManagementMembers(periodId) {
    let q = publicSupabase.from('management_members').select('*').order('sort_order', { ascending: true })
    if (periodId) q = q.eq('period_id', periodId)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, periodId: r.period_id, name: r.name, position: r.position, photoUrl: r.photo_url, bio: r.bio, sortOrder: r.sort_order })) as ManagementMember[]
  },
  async listMediaAlbums() {
    const { data, error } = await publicSupabase.from('media_albums').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, title: r.title, slug: r.slug, description: r.description, coverUrl: r.cover_url, createdAt: r.created_at })) as MediaAlbum[]
  },
  async listMediaItems(albumId) {
    let q = publicSupabase.from('media_items').select('*').order('sort_order', { ascending: true })
    if (albumId) q = q.eq('album_id', albumId)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, albumId: r.album_id, type: r.type, title: r.title, url: r.url, thumbnailUrl: r.thumbnail_url, caption: r.caption, sortOrder: r.sort_order, createdAt: r.created_at })) as MediaItem[]
  },
  async getLatestPublishedFinancePeriod() {
    const { data, error } = await publicSupabase.from('finance_periods').select('*').not('published_at', 'is', null).lte('published_at', new Date().toISOString()).order('year', { ascending: false }).order('month', { ascending: false }).limit(1).maybeSingle()
    if (error) throw error
    if (!data) return null
    const r: Row = data
    return { id: r.id, year: r.year, month: r.month, openingBalance: Number(r.opening_balance), publishedAt: r.published_at, createdAt: r.created_at, updatedAt: r.updated_at } as FinancePeriod
  },
  async getPublishedFinancePeriod(year, month) {
    const { data, error } = await publicSupabase.from('finance_periods').select('*').eq('year', year).eq('month', month).not('published_at', 'is', null).lte('published_at', new Date().toISOString()).maybeSingle()
    if (error) throw error
    if (!data) return null
    const r: Row = data
    return { id: r.id, year: r.year, month: r.month, openingBalance: Number(r.opening_balance), publishedAt: r.published_at, createdAt: r.created_at, updatedAt: r.updated_at } as FinancePeriod
  },
  async listPublishedFinanceTransactions(periodId) {
    const { data, error } = await publicSupabase.from('finance_transactions').select('*').eq('period_id', periodId).eq('status', 'published').order('transaction_date', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r: Row) => ({ id: r.id, periodId: r.period_id, transactionDate: r.transaction_date, type: r.type, categoryId: r.category_id, description: r.description, amount: Number(r.amount), proofUrl: r.proof_url, createdBy: r.created_by, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at })) as FinanceTransaction[]
  },
}
