'use client'

import { useCallback, useEffect } from 'react'
import FilterableIslamic from '@/components/content/FilterableIslamic'
import { islamicRecordToLegacy, type IslamicItem } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import LiveLoadingState from './LiveLoadingState'
import { useLiveContent } from './useLiveContent'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { IslamicItemRecord } from '@/types/content'

type Props = { initialItems: IslamicItem[]; limit?: number }

export default function LiveIslamic({ initialItems, limit }: Props) {
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('islamic_articles')
      .select('id,slug,title,excerpt,content,category_id,status,published_at,created_at,updated_at,categories(name)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) return null
    return ((data ?? []) as unknown as IslamicItemRecord[]).map(islamicRecordToLegacy)
  }, [limit])

  const { items, loading, error, refresh } = useLiveContent(initialItems, fetcher)
  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('islamic_articles', refresh)

  if (loading) return <LiveLoadingState label="Memuat materi keislaman…" />
  if (error && !items.length) return <div className="empty-state"><strong>Konten belum dapat dimuat</strong><p>Coba lagi beberapa saat lagi.</p></div>
  return <FilterableIslamic items={items} />
}
