'use client'

import { useCallback, useEffect, useState } from 'react'
import FilterableIslamic from '@/components/content/FilterableIslamic'
import { islamicRecordToLegacy, type IslamicItem } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import LiveLoadingState from './LiveLoadingState'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { IslamicItemRecord } from '@/types/content'

type Props = { initialItems: IslamicItem[]; limit?: number }

export default function LiveIslamic({ initialItems, limit }: Props) {
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(initialItems.length === 0)
  const [error, setError] = useState(false)
  const refresh = useCallback(async () => {
    let query = supabase
      .from('islamic_articles')
      .select('id,slug,title,excerpt,content,category_id,status,published_at,created_at,updated_at,categories(name)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(true)
      setLoading(false)
      return
    }
    setItems(((data ?? []) as unknown as IslamicItemRecord[]).map(islamicRecordToLegacy))
    setError(false)
    setLoading(false)
  }, [limit])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('islamic_articles', refresh)

  if (loading) return <LiveLoadingState label="Memuat materi keislaman…" />
  if (error && !items.length) return <div className="empty-state"><strong>Konten belum dapat dimuat</strong><p>Coba lagi beberapa saat lagi.</p></div>
  return <FilterableIslamic items={items} />
}
