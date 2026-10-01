'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabasePublicRepository } from '@/lib/data/supabasePublicRepository'
import { formatIndonesianDate, islamicRecordToLegacy, type IslamicItem } from '@/lib/data/presentation'
import { legacyNewsContentToDocument } from '@/lib/data/articleDocumentLegacy'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import ArticleDetail, { type ArticleDetailModel } from '@/components/content/ArticleDetail'
import { fetchLiveArticleSidebarContent, type ArticleSidebarContent } from '@/lib/data/liveArticleSidebar'

export default function LiveIslamicDetail({ slug, initialItem }: { slug: string; initialItem: IslamicItem | null }) {
  const [item, setItem] = useState<IslamicItem | null>(initialItem)
  const [sidebar, setSidebar] = useState<ArticleSidebarContent>({ news: [], islamic: [] })

  const refresh = useCallback(async () => {
    const record = await supabasePublicRepository.getIslamicBySlug(slug)
    if (record) setItem(islamicRecordToLegacy(record))
    else setItem(null)
  }, [slug])

  const refreshSidebar = useCallback(async () => {
    const content = await fetchLiveArticleSidebarContent({ excludeIslamicSlug: slug })
    if (content) setSidebar(content)
  }, [slug])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => { void refreshSidebar() }, [refreshSidebar])
  const refreshIslamicSurface = useCallback(async () => {
    await Promise.all([refresh(), refreshSidebar()])
  }, [refresh, refreshSidebar])

  useRealtimeRefresh('islamic_articles', refreshIslamicSurface)
  useRealtimeRefresh('news', refreshSidebar)

  if (!item) {
    return (
      <main id="main-content" className="inner-page article-page">
        <div className="container article-layout article-layout-empty">
          <div className="empty-state">
            <strong>Materi tidak tersedia</strong>
            <p>Materi ini belum dipublikasikan atau sudah tidak tersedia.</p>
          </div>
        </div>
      </main>
    )
  }

  const publishedLabel = formatIndonesianDate(item.date, false)
  const article: ArticleDetailModel = {
    eyebrow: 'Ruang Keislaman',
    category: item.category,
    title: item.title,
    date: publishedLabel,
    excerpt: item.excerpt,
    image: null,
    content: legacyNewsContentToDocument(item.content),
    backHref: '/keislaman/',
    backLabel: 'Kembali ke keislaman',
    sidebarEyebrow: 'Ruang keislaman',
    sidebarTitle: 'Jelajahi materi',
    sidebarLinks: [
      { label: 'Semua artikel', href: '/keislaman/' },
      { label: 'Jadwal kajian', href: '/kegiatan/' },
      { label: 'Dokumentasi', href: '/dokumentasi/' },
      { label: 'Hubungi pengurus', href: '/kontak/' },
    ],
    sidebarNote: 'Materi keislaman disajikan untuk pembelajaran, kajian, dan penguatan wawasan jamaah.',
    footerText: 'Materi pembelajaran Miftahul Mubin.',
    footerLinkLabel: 'Lihat artikel lainnya',
    footerLinkHref: '/keislaman/',
    latestNews: sidebar.news,
    latestIslamic: sidebar.islamic,
  }

  return <ArticleDetail article={article} />
}
