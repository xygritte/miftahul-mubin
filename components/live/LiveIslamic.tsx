'use client'

import { useCallback, useEffect, useState } from 'react'
import FilterableIslamic from '@/components/content/FilterableIslamic'
import { islamicRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { IslamicItemRecord } from '@/types/content'
import type { IslamicItem } from '@/lib/islamic'

type Props = { initialItems: IslamicItem[]; limit?: number }

export default function LiveIslamic({ initialItems, limit }: Props) {
  const [items, setItems] = useState(initialItems)
  const refresh = useCallback(async () => {
    let query = supabase
      .from('islamic_articles')
      .select('id,slug,title,excerpt,content,category_id,status,published_at,created_at,updated_at,categories(name)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (!error) setItems(((data ?? []) as unknown as IslamicItemRecord[]).map(islamicRecordToLegacy))
  }, [limit])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('islamic_articles', refresh)

  return <FilterableIslamic items={items} />
}
