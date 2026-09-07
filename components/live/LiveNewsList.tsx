'use client'

import { useCallback, useEffect, useState } from 'react'
import FilterableNews from '@/components/content/FilterableNews'
import { newsRecordToLegacy, type NewsItem } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { NewsRecord } from '@/types/content'

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
  categories?: { name: string } | { name: string }[] | null
}

function mapNewsRow(row: NewsRow): NewsRecord {
  const content = Array.isArray(row.content) ? row.content : row.content.split(/\n\s*\n/).filter(Boolean)
  const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content,
    thumbnailUrl: row.thumbnail_url,
    categoryId: row.category_id,
    category: category ?? 'Berita',
    status: row.status,
    publishedAt: row.published_at,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export default function LiveNewsList({ initialItems }: { initialItems: NewsItem[] }) {
  const [items, setItems] = useState(initialItems)
  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,view_count,created_at,updated_at,categories(name)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (!error) setItems(((data ?? []) as unknown as NewsRow[]).map(mapNewsRow).map(newsRecordToLegacy))
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)

  return <FilterableNews items={items} />
}
