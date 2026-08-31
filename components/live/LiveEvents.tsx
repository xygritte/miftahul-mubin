'use client'

import { useEffect, useState } from 'react'
import FilterableEvents from '@/components/content/FilterableEvents'
import { eventRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { EventRecord } from '@/types/content'
import type { EventItem } from '@/lib/content'

type Props = { initialItems: EventItem[]; limit?: number }

export default function LiveEvents({ initialItems, limit }: Props) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      let query = supabase.from('events').select('id,slug,title,description,event_date,start_time,end_time,location,status').eq('status','published').order('event_date',{ascending:true})
      if (limit) query = query.limit(limit)
      const { data, error } = await query
      if (!error && active) setItems(((data ?? []) as unknown as EventRecord[]).map(eventRecordToLegacy))
    }
    void refresh()
    return () => { active = false }
  }, [limit])
  return <FilterableEvents items={items} />
}
