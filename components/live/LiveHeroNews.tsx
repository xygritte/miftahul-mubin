import Link from 'next/link'
import { useCallback, useEffect } from 'react'
import { useLiveContent } from './useLiveContent'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import { fetchLivePublishedNews, formatLiveNewsDate, type LiveNewsItem } from '@/lib/data/liveNews'

export default function LiveHeroNews() {
  const fetcher = useCallback(() => fetchLivePublishedNews(1), [])
  const { items, loading, error, refresh } = useLiveContent<LiveNewsItem>([], fetcher)

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)

  if (loading) {
    return (
      <div className="home-hero-news-empty" aria-live="polite">
        <span className="eyebrow">Berita Terbaru</span>
        <strong>Memuat berita terbaru…</strong>
      </div>
    )
  }

  if (error || !items.length) {
    return (
      <div className="home-hero-news-empty" aria-live="polite">
        <span className="eyebrow">Berita Terbaru</span>
        <strong>{error ? 'Berita terbaru belum dapat dimuat.' : 'Belum ada berita terbaru.'}</strong>
      </div>
    )
  }

  const latest = items[0]

  return (
    <Link className="home-hero-news" href={'/berita/' + latest.slug + '/'}>
      <div className="home-hero-news-image" style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
        <img src={latest.image} alt={latest.title} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="home-hero-news-meta">
        <span className="eyebrow">Berita Terbaru</span>
        <span className="home-hero-news-details">
          <span>{latest.category}</span>
          <span>{formatLiveNewsDate(latest.publishedAt)}</span>
        </span>
      </div>
      <strong>{latest.title}</strong>
    </Link>
  )
}
