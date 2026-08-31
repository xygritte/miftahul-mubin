'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatIndonesianDate, islamicRecordToLegacy } from '@/lib/data/presentation'
import { supabasePublicRepository } from '@/lib/data/supabasePublicRepository'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { IslamicItem } from '@/lib/islamic'

export default function LiveIslamicDetail({ slug, initialItem }: { slug: string; initialItem: IslamicItem | null }) {
  const [item, setItem] = useState<IslamicItem | null>(initialItem)
  const refresh = useCallback(async () => {
    const record = await supabasePublicRepository.getIslamicBySlug(slug)
    if (record) setItem(islamicRecordToLegacy(record))
    else setItem(null)
  }, [slug])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('islamic_articles', refresh)

  if (!item) return <main id="main-content" className="inner-page"><div className="container"><div className="empty-state"><strong>Materi tidak tersedia</strong><p>Materi ini belum dipublikasikan atau sudah tidak tersedia.</p></div></div></main>
  const publishedLabel = formatIndonesianDate(item.date, false)
  return <main id="main-content" className="inner-page"><div className="container article-layout"><article className="article-detail"><Link className="back-link" href="/keislaman/"><ArrowLeft size={15}/> Kembali ke keislaman</Link><div className="article-kicker"><span>{item.category}</span><span>•</span><span>{publishedLabel}</span></div><h1>{item.title}</h1><p className="article-lead">{item.excerpt}</p><div className="article-copy article-copy-first">{item.content.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}</div><div className="article-share"><span>Materi pembelajaran Miftahul Mubin.</span><Link href="/keislaman/">Artikel lainnya <ArrowRight size={15}/></Link></div></article><aside className="article-sidebar"><div className="sidebar-card"><span className="eyebrow">Kategori</span><h2>Ruang Keislaman</h2><Link href="/keislaman/">Semua artikel <ArrowRight size={15}/></Link><Link href="/kegiatan/">Jadwal kajian <ArrowRight size={15}/></Link><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></div></aside></div></main>
}
