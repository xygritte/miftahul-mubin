'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import LiveLoadingState from './LiveLoadingState'
import { useRealtimeRefresh } from './useRealtimeRefresh'

type PopularNewsItem = {
  slug: string
  category: string
  title: string
}

type NewsRow = {
  slug: string
  title: string
  categories?: { name: string | null } | { name: string | null }[] | null
}

function mapNewsRow(row: NewsRow): PopularNewsItem {
  const category = Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name
  return { slug: row.slug, category: category ?? 'Berita', title: row.title }
}

export default function LivePopularNews({ initialItems }: { initialItems: PopularNewsItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(initialItems.length === 0)
  const [error, setError] = useState(false)
  const refresh = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('news')
      .select('slug,title,categories(name)')
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('view_count', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(4)
    if (fetchError) {
      setError(true)
      setLoading(false)
      return
    }
    setItems(((data ?? []) as unknown as NewsRow[]).map(mapNewsRow))
    setError(false)
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)

  if (loading) return <LiveLoadingState label="Memuat berita terpopuler…" />
  if (error && !items.length) return <div className="empty-state"><strong>Konten belum dapat dimuat</strong><p>Coba lagi beberapa saat lagi.</p></div>
  if (!items.length) return <div className="empty-state"><strong>Belum ada berita populer</strong><p>Belum tersedia berita yang dapat ditampilkan.</p></div>
  return <div className="popular-list">{items.map((item, index) => <Link key={item.slug} href={`/berita/${item.slug}/`}><span className="popular-rank">0{index + 1}</span><span><small>{item.category}</small><strong>{item.title}</strong></span><ChevronRight size={16} /></Link>)}</div>
}
