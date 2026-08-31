'use client'

import { useCallback, useEffect, useState } from 'react'
import FilterableEvents from '@/components/content/FilterableEvents'
import { eventRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { EventRecord } from '@/types/content'
import type { EventItem } from '@/lib/content'

type Props = { initialItems: EventItem[]; limit?: number }

type EventRow = EventRecord & {
  categories?: { name: string } | { name: string }[] | null
}

export default function LiveEvents({ initialItems, limit }: Props) {
  const [items, setItems] = useState(initialItems)
  const refresh = useCallback(async () => {
    let query = supabase
      .from('events')
      .select('id,slug,title,description,event_date,start_time,end_time,location,speaker,status,cover_url,category_id,created_at,updated_at,categories(name)')
      .eq('status', 'published')
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) return
    const mapped = (data ?? []).map((row) => {
      const item = row as unknown as EventRow
      const category = Array.isArray(item.categories) ? item.categories[0]?.name : item.categories?.name
      return eventRecordToLegacy({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        eventDate: item.event_date as unknown as string,
        startTime: item.start_time as unknown as string,
        endTime: item.end_time as unknown as string | null,
        location: item.location,
        speaker: item.speaker,
        status: item.status,
        coverUrl: item.cover_url,
        category: category ?? 'Kegiatan',
        createdAt: item.created_at as unknown as string,
        updatedAt: item.updated_at as unknown as string,
      })
    })
    setItems(mapped)
  }, [limit])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('events', refresh)

  return <FilterableEvents items={items} />
}
