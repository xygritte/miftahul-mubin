'use client'

import { useEffect, useState } from 'react'
import FilterableNews from '@/components/content/FilterableNews'
import { newsRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { NewsRecord } from '@/types/content'
import type { NewsItem } from '@/lib/content'

type Row = NewsRecord & { categories?: { name: string } | null }

function mapRow(row: Row): NewsRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    thumbnailUrl: row.thumbnailUrl ?? null,
    category: row.categories?.name ?? row.category ?? 'Berita',
    authorId: row.authorId ?? null,
    status: row.status,
    publishedAt: row.publishedAt ?? null,
    viewCount: row.viewCount ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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
  return ((data ?? []) as unknown as Row[]).map(mapRow).map(newsRecordToLegacy)
}

export default function LiveNewsList({ initialItems }: { initialItems: NewsItem[] }) {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    let active = true
    const refresh = async () => {
      const next = await fetchNews()
      if (active && next) setItems(next)
    }

    void refresh()

    const channel = supabase
      .channel('public-news-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => { void refresh() })
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [])

  return <FilterableNews items={items} />
}
