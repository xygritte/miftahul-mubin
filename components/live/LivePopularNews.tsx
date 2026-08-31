'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { NewsRecord } from '@/types/content'

type NewsRow = NewsRecord & { category?: string | { name?: string | null } | null }
function mapNewsRow(row: NewsRow): NewsRecord { return { ...row, category: typeof row.category === 'string' ? row.category : row.category?.name ?? 'Berita' } }

export default function LivePopularNews({ initialItems }: { initialItems: NewsRecord[] }) {
  const [items, setItems] = useState(initialItems)
  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,view_count,created_at,updated_at,categories(name)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('view_count', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(4)
    if (!error) setItems(((data ?? []) as unknown as NewsRow[]).map(mapNewsRow))
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)

  return <div className="popular-list">{items.map((item, index) => <a key={item.slug} href={`/berita/${item.slug}/`}><span className="popular-rank">0{index + 1}</span><span><small>{item.category}</small><strong>{item.title}</strong></span><ChevronRight size={16} /></a>)}</div>
}
