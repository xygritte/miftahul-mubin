'use client'

import { useEffect, useState } from 'react'
import FilterableDocumentation from '@/components/content/FilterableDocumentation'
import { supabase } from '@/lib/supabase/client'
import type { MediaItem } from '@/types/content'

export default function LiveDocumentation({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase.from('media_items').select('id,album_id,title,caption,image_url,taken_at,sort_order,created_at,updated_at').order('sort_order',{ascending:true})
      if (!error && active) setItems((data ?? []) as MediaItem[])
    }
    void refresh()
    return () => { active = false }
  }, [])
  return <FilterableDocumentation items={items} />
}
