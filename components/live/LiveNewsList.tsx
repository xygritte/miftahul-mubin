'use client'

import { useCallback, useEffect, useState } from 'react'
import FilterableNews from '@/components/content/FilterableNews'
import { newsRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { NewsRecord } from '@/types/content'
import type { NewsItem } from '@/lib/content'

type NewsRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string | string[]
  thumbnail_url: string | null
  category_id: string | null
  status: NewsRecord['status']
  published_at: string | null
  view_count: number | null
  created_at: string | null
  updated_at: string | null
  categories?: { name: string } | null
}

function mapNewsRow(row: NewsRow): NewsRecord {
  const content = Array.isArray(row.content) ? row.content : row.content.split(/\n\s*\n/).filter(Boolean)
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content,
    thumbnailUrl: row.thumbnail_url,
    category: row.categories?.name ?? 'Berita',
    status: row.status,
    publishedAt: row.published_at,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

async function fetchNews(): Promise<NewsItem[] | null> {
  const { data, error } = await supabase
    .from('news')
    .select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,view_count,created_at,updated_at,categories(name)')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (error) return null
  return ((data ?? []) as unknown as NewsRow[]).map(mapNewsRow).map(newsRecordToLegacy)
}

export default function LiveNewsList({ initialItems }: { initialItems: NewsItem[] }) {
  const [items, setItems] = useState(initialItems)

  const refresh = useCallback(async () => {
    const next = await fetchNews()
    if (next) setItems(next)
  }, [])

  useEffect(() => {
    let active = true
    const runRefresh = async () => {
      const next = await fetchNews()
      if (active && next) setItems(next)
    }

    void runRefresh()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    window.addEventListener('focus', handleVisibility)
    document.addEventListener('visibilitychange', handleVisibility)
    const interval = window.setInterval(() => void runRefresh(), 30000)

    const channel = supabase
      .channel('public-news-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => { void refresh() })
      .subscribe()

    return () => {
      active = false
      window.removeEventListener('focus', handleVisibility)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return <FilterableNews items={items} />
}
