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
  url: string | null
  thumbnail_url: string | null
  type: 'image' | 'video'
  sort_order: number
  created_at: string | null
}

function mapMediaItem(row: MediaItemRow): MediaItem | null {
  const url = row.url?.trim() || row.thumbnail_url?.trim() || ''
  if (!url) return null
  return {
    id: row.id,
    albumId: row.album_id,
    type: row.type,
    title: row.title,
    url,
    thumbnailUrl: row.thumbnail_url ?? url,
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
      const { data, error } = await supabase
        .from('media_items')
        .select('id,album_id,title,caption,url,thumbnail_url,type,sort_order,created_at')
        .order('sort_order', { ascending: true })
      if (!error && active) {
        setItems((data ?? []).map((row) => mapMediaItem(row as MediaItemRow)).filter((item): item is MediaItem => Boolean(item)))
      }
    }
    void refresh()
    return () => { active = false }
  }, [])

  return <FilterableDocumentation items={items} />
}
