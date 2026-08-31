'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { formatIndonesianDate } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import type { AnnouncementRecord } from '@/types/content'

type Notice = AnnouncementRecord

export default function LiveAnnouncements({ initialItems }: { initialItems: Notice[] }) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data, error } = await supabase.from('announcements').select('id,title,content,published_at,created_at,updated_at,status').eq('status','published').not('published_at','is',null).lte('published_at',new Date().toISOString()).order('published_at',{ascending:false})
      if (!error && active) setItems((data ?? []) as Notice[])
    }
    void refresh()
    return () => { active = false }
  }, [])
  if (!items.length) return <div className="empty-state"><strong>Belum ada pengumuman</strong><p>Belum tersedia pengumuman yang dipublikasikan.</p></div>
  return <div className="notice-list">{items.map((notice,index) => <article key={notice.id ?? notice.title}><div className="notice-index">{String(index+1).padStart(2,'0')}</div><div><span>Informasi Resmi</span><h2>{notice.title}</h2><small>{formatIndonesianDate(notice.publishedAt)}</small><p>{notice.content}</p></div><ArrowRight className="notice-arrow" size={16} aria-hidden="true" /></article>)}</div>
}
