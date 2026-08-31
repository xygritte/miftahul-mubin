'use client'

import { useCallback, useEffect, useState } from 'react'
import FilterableEvents from '@/components/content/FilterableEvents'
import { eventRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { EventItem } from '@/lib/content'
import type { EventStatus } from '@/types/content'

type Props = { initialItems: EventItem[]; limit?: number }

type EventRow = {
  id: string
  slug: string
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string | null
  location: string
  speaker: string | null
  status: EventStatus
  cover_url: string | null
  category_id: string | null
  created_at: string
  updated_at: string
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
        eventDate: item.event_date,
        startTime: item.start_time,
        endTime: item.end_time,
        location: item.location,
        speaker: item.speaker,
        status: item.status,
        coverUrl: item.cover_url,
        category: category ?? 'Kegiatan',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })
    })
    setItems(mapped)
  }, [limit])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('events', refresh)

  return <FilterableEvents items={items} />
}
