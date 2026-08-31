'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { newsRecordToLegacy } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { NewsRecord } from '@/types/content'
import type { NewsItem } from '@/lib/content'

type Props = { initialItems: NewsItem[] }

export default function LiveNews({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase
        .from('news')
        .select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,view_count,created_at,updated_at,categories(name)')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
      if (!error && active) setItems(((data ?? []) as unknown as NewsRecord[]).map(newsRecordToLegacy))
    }
    void refresh()
    return () => { active = false }
  }, [])

  if (!items.length) return <div className="empty-state"><strong>Belum ada berita</strong><p>Belum tersedia berita yang dipublikasikan.</p></div>
  const [featured, ...latest] = items

  return <div className="home-news-layout">
    <a className="home-featured-news" href={`/berita/${featured.slug}/`}>
      <div className="home-news-image"><img src={featured.image} alt={featured.title} /><span className="tag">{featured.category}</span></div>
      <div className="home-news-copy"><span className="meta">{featured.date}</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><span className="read-link">Baca selengkapnya <ArrowRight size={15} /></span></div>
    </a>
    <div className="home-latest-list">
      {latest.slice(0, 3).map((item, index) => <a className="home-latest-item" key={item.slug} href={`/berita/${item.slug}/`}><span className="latest-number">0{index + 2}</span><div><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><span className="meta">{item.date}</span></div><ArrowRight size={16} aria-hidden="true" /></a>)}
    </div>
  </div>
}
