'use client'

import { useEffect, useState } from 'react'
import FilterableEvents from '@/components/content/FilterableEvents'
import { eventRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { EventRecord } from '@/types/content'
import type { EventItem } from '@/lib/content'

export default function LiveEvents({ initialItems }: { initialItems: EventItem[] }) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase.from('events').select('id,slug,title,description,event_date,start_time,end_time,location,status').eq('status','published').order('event_date',{ascending:true})
      if (!error && active) setItems(((data ?? []) as unknown as EventRecord[]).map(eventRecordToLegacy))
    }
    void refresh()
    return () => { active = false }
  }, [])
  return <FilterableEvents items={items} />
}
