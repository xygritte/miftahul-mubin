'use client'

import { useEffect, useState } from 'react'
import FilterableDocumentation from '@/components/content/FilterableDocumentation'
import { supabase } from '@/lib/supabase/client'
import type { MediaItem } from '@/types/content'

type MediaItemRow = {
  id: string
  album_id: string
  title: string | null
  caption: string | null
  image_url: string | null
  taken_at: string | null
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

function mapMediaItem(row: MediaItemRow): MediaItem {
  return {
    id: row.id,
    albumId: row.album_id,
    type: 'image',
    title: row.title,
    url: row.image_url ?? '',
    thumbnailUrl: row.image_url,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at ?? undefined,
  }
}

export default function LiveDocumentation({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase.from('media_items').select('id,album_id,title,caption,image_url,taken_at,sort_order,created_at,updated_at').order('sort_order', { ascending: true })
      if (!error && active) setItems(((data ?? []) as MediaItemRow[]).map(mapMediaItem).filter((item) => Boolean(item.url)))
    }
    void refresh()
    return () => { active = false }
  }, [])

  return <FilterableDocumentation items={items} />
}
