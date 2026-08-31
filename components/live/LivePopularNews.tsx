'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { NewsRecord } from '@/types/content'

export default function LivePopularNews({ initialItems }: { initialItems: NewsRecord[] }) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase.from('news').select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,view_count,created_at,updated_at,categories(name)').eq('status','published').not('published_at','is',null).lte('published_at',new Date().toISOString()).order('view_count',{ascending:false}).order('published_at',{ascending:false}).limit(4)
      if (!error && active) setItems((data ?? []) as unknown as NewsRecord[])
    }
    void refresh()
    return () => { active = false }
  }, [])
  return <div className="popular-list">{items.map((item,index) => <a key={item.slug} href={`/berita/${item.slug}/`}><span className="popular-rank">0{index+1}</span><span><small>{item.category?.name ?? 'Berita'}</small><strong>{item.title}</strong></span><ChevronRight size={16}/></a>)}</div>
}
