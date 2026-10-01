import { fetchLivePublishedNews, formatLiveNewsDate, type LiveNewsItem } from '@/lib/data/liveNews'
import { supabase } from '@/lib/supabase/client'

export type ArticleSidebarNewsItem = LiveNewsItem

export type ArticleSidebarIslamicItem = {
  slug: string
  category: string
  title: string
  publishedAt: string | null
}

type IslamicRow = {
  slug: string
  title: string
  published_at: string | null
  created_at: string | null
  categories?: { name: string } | { name: string }[] | null
}

function mapIslamicRow(row: IslamicRow): ArticleSidebarIslamicItem {
  const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name

  return {
    slug: row.slug,
    title: row.title,
    category: category ?? 'Keislaman',
    publishedAt: row.published_at ?? row.created_at,
  }
}

async function fetchLivePublishedIslamic(limit: number): Promise<ArticleSidebarIslamicItem[] | null> {
  const { data, error } = await supabase
    .from('islamic_articles')
    .select('slug,title,published_at,created_at,categories(name)')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return null

  return ((data ?? []) as unknown as IslamicRow[]).map(mapIslamicRow)
}

export type ArticleSidebarContent = {
  news: ArticleSidebarNewsItem[]
  islamic: ArticleSidebarIslamicItem[]
}

export async function fetchLiveArticleSidebarContent(options?: {
  excludeNewsSlug?: string
  excludeIslamicSlug?: string
}): Promise<ArticleSidebarContent | null> {
  const [news, islamic] = await Promise.all([
    fetchLivePublishedNews(4),
    fetchLivePublishedIslamic(4),
  ])

  if (!news || !islamic) return null

  return {
    news: news.filter((item) => item.slug !== options?.excludeNewsSlug).slice(0, 3),
    islamic: islamic.filter((item) => item.slug !== options?.excludeIslamicSlug).slice(0, 3),
  }
}

export function formatArticleSidebarDate(value: string | null | undefined) {
  return formatLiveNewsDate(value) || 'Terbaru'
}
