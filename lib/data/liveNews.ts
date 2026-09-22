import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'

export type LiveNewsItem = {
  slug: string
  category: string
  title: string
  image: string
  excerpt: string
  publishedAt: string | null
  viewCount: number
}

type NewsRow = {
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  published_at: string | null
  view_count: number | null
  categories?: { name: string } | { name: string }[] | null
}

function mapRow(row: NewsRow): LiveNewsItem {
  const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name

  return {
    slug: row.slug,
    category: category ?? 'Berita',
    title: row.title,
    image: row.thumbnail_url ?? sitePath('/hero-bg.png'),
    excerpt: row.excerpt,
    publishedAt: row.published_at,
    viewCount: row.view_count ?? 0,
  }
}

export async function fetchLivePublishedNews(limit: number): Promise<LiveNewsItem[] | null> {
  const { data, error } = await supabase
    .from('news')
    .select('title,slug,excerpt,thumbnail_url,published_at,view_count,categories(name)')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return null

  return ((data ?? []) as unknown as NewsRow[]).map(mapRow)
}

export function formatLiveNewsDate(value: string | null | undefined) {
  if (!value) return ''
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function formatLiveNewsViews(value: number | undefined) {
  return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0)
}
