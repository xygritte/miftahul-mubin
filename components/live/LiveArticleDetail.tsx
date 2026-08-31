'use client'

import { useCallback, useEffect, useState } from 'react'
import { newsRecordToLegacy } from '@/lib/data/presentation'
import { supabasePublicRepository } from '@/lib/data/supabasePublicRepository'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import ArticleDetail from '@/components/content/ArticleDetail'
import type { NewsItem } from '@/lib/content'

export default function LiveArticleDetail({ slug, initialArticle }: { slug: string; initialArticle: NewsItem | null }) {
  const [article, setArticle] = useState<NewsItem | null>(initialArticle)
  const refresh = useCallback(async () => {
    const record = await supabasePublicRepository.getNewsBySlug(slug)
    if (record) setArticle(newsRecordToLegacy(record))
    else setArticle(null)
  }, [slug])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)

  if (!article) return <main id="main-content" className="inner-page"><div className="container"><div className="empty-state"><strong>Berita tidak tersedia</strong><p>Berita ini belum dipublikasikan atau sudah tidak tersedia.</p></div></div></main>
  return <ArticleDetail article={article} />
}
