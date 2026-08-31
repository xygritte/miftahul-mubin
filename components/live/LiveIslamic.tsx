'use client'

import { useEffect, useState } from 'react'
import FilterableIslamic from '@/components/content/FilterableIslamic'
import { islamicRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { IslamicItemRecord } from '@/types/content'
import type { IslamicItem } from '@/lib/islamic'

export default function LiveIslamic({ initialItems }: { initialItems: IslamicItem[] }) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase.from('islamic_articles').select('id,slug,title,excerpt,content,thumbnail_url,category_id,status,published_at,categories(name)').eq('status','published').not('published_at','is',null).lte('published_at',new Date().toISOString()).order('published_at',{ascending:false})
      if (!error && active) setItems(((data ?? []) as unknown as IslamicItemRecord[]).map(islamicRecordToLegacy))
    }
    void refresh()
    return () => { active = false }
  }, [])
  return <FilterableIslamic items={items} />
}
