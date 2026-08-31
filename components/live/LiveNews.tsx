'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { newsRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { NewsRecord } from '@/types/content'
import type { NewsItem } from '@/lib/content'

type Props = { initialItems: NewsItem[] }
type NewsRow = {
  id: string; title: string; slug: string; excerpt: string; content: string | string[]
  thumbnail_url: string | null; category_id: string | null; status: NewsRecord['status']
  published_at: string | null; view_count: number | null; created_at: string | null; updated_at: string | null
  categories?: { name: string } | { name: string }[] | null
}

function mapRow(row: NewsRow): NewsRecord {
  const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name
  const content = Array.isArray(row.content) ? row.content : row.content.split(/\n\s*\n/).filter(Boolean)
  return {
    id: row.id, slug: row.slug, title: row.title, excerpt: row.excerpt, content,
    thumbnailUrl: row.thumbnail_url, category: category ?? 'Berita', status: row.status,
    publishedAt: row.published_at, viewCount: row.view_count ?? 0,
    createdAt: row.created_at ?? undefined, updatedAt: row.updated_at ?? undefined,
  }
}

async function fetchNews(): Promise<NewsItem[] | null> {
  const { data, error } = await supabase.from('news')
    .select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,view_count,created_at,updated_at,categories(name)')
    .eq('status','published').not('published_at','is',null).lte('published_at',new Date().toISOString())
    .order('published_at',{ascending:false})
  if (error) return null
  return ((data ?? []) as unknown as NewsRow[]).map(mapRow).map(newsRecordToLegacy)
}

export default function LiveNews({ initialItems }: Props) {
  const [items,setItems] = useState(initialItems)
  const refresh = useCallback(async () => { const next = await fetchNews(); if (next !== null) setItems(next) }, [])
  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)
  if (!items.length) return <div className="empty-state"><strong>Belum ada berita</strong><p>Belum tersedia berita yang dipublikasikan.</p></div>
  const [featured,...latest] = items
  return <div className="home-news-layout"><a className="home-featured-news" href={`/berita/${featured.slug}/`}><div className="home-news-image"><img src={featured.image} alt={featured.title}/><span className="tag">{featured.category}</span></div><div className="home-news-copy"><span className="meta">{featured.date}</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><span className="read-link">Baca selengkapnya <ArrowRight size={15}/></span></div></a><div className="home-latest-list">{latest.slice(0,3).map((item,index)=><a className="home-latest-item" key={item.slug} href={`/berita/${item.slug}/`}><span className="latest-number">0{index+2}</span><div><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><span className="meta">{item.date}</span></div><ArrowRight size={16} aria-hidden="true"/></a>)}</div></div>
}
