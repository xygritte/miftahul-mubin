'use client'

import { useCallback, useEffect, useState } from 'react'
import { newsRecordToLegacy, type NewsItem } from '@/lib/data/presentation'
import { supabasePublicRepository } from '@/lib/data/supabasePublicRepository'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import ArticleDetail from '@/components/content/ArticleDetail'
import { fetchLiveArticleSidebarContent, type ArticleSidebarContent } from '@/lib/data/liveArticleSidebar'

export default function LiveArticleDetail({ slug, initialArticle }: { slug: string; initialArticle: NewsItem | null }) {
  const [article, setArticle] = useState<NewsItem | null>(initialArticle)
  const [sidebar, setSidebar] = useState<ArticleSidebarContent>({ news: [], islamic: [] })
  const refresh = useCallback(async () => {
    const record = await supabasePublicRepository.getNewsBySlug(slug)
    if (record) setArticle(newsRecordToLegacy(record))
    else setArticle(null)
  }, [slug])

  const refreshSidebar = useCallback(async () => {
    const content = await fetchLiveArticleSidebarContent({ excludeNewsSlug: slug })
    if (content) setSidebar(content)
  }, [slug])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => { void refreshSidebar() }, [refreshSidebar])
  useRealtimeRefresh('news', refresh)
  useRealtimeRefresh('islamic_articles', refreshSidebar)

  if (!article) return <main id="main-content" className="inner-page"><div className="container"><div className="empty-state"><strong>Berita tidak tersedia</strong><p>Berita ini belum dipublikasikan atau sudah tidak tersedia.</p></div></div></main>
  return <ArticleDetail article={{
    ...article,
    latestNews: sidebar.news,
    latestIslamic: sidebar.islamic,
  }} />
}
