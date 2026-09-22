'use client'

import Link from 'next/link'
import { useCallback, useEffect } from 'react'
import { ArrowRight, Clock3, Eye, Share2 } from 'lucide-react'
import { fetchLivePublishedNews, formatLiveNewsDate, formatLiveNewsViews, type LiveNewsItem } from '@/lib/data/liveNews'
import LiveLoadingState from './LiveLoadingState'
import { useLiveContent } from './useLiveContent'
import { useRealtimeRefresh } from './useRealtimeRefresh'

type Props = { initialItems: LiveNewsItem[] }

function shareNews(title: string, slug: string) {
  const path = `/berita/${slug}/`
  const url = new URL(path, window.location.origin).toString()

  if (navigator.share) {
    void navigator.share({ title, text: title, url }).catch(() => undefined)
    return
  }

  void navigator.clipboard?.writeText(url)
}

function ShareButton({ title, slug }: { title: string; slug: string }) {
  return (
    <button
      className="home-news-share"
      type="button"
      aria-label={`Bagikan ${title}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        shareNews(title, slug)
      }}
    >
      <Share2 size={14} aria-hidden="true" />
      <span>Bagikan</span>
    </button>
  )
}

export default function LiveNews({ initialItems }: Props) {
  const fetcher = useCallback(() => fetchLivePublishedNews(4), [])
  const { items, loading, error, refresh } = useLiveContent<LiveNewsItem>(initialItems, fetcher)

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('news', refresh)

  if (loading) return <LiveLoadingState label="Memuat berita terbaru…" />
  if (error && !items.length) return <div className="empty-state"><strong>Konten belum dapat dimuat</strong><p>Coba lagi beberapa saat lagi.</p></div>
  if (!items.length) return <div className="empty-state"><strong>Belum ada berita</strong><p>Belum tersedia berita yang dipublikasikan.</p></div>

  const [featured, ...latest] = items

  return (
    <div className="home-news-layout">
      <div className="home-featured-news-wrap">
        <Link className="home-featured-news" href={`/berita/${featured.slug}/`}>
          <div className="home-news-image">
            <img src={featured.image} alt={featured.title} fetchPriority="high" decoding="async" />
            <span className="tag">{featured.category}</span>
            <div className="home-news-image-shade" />
          </div>
          <div className="home-news-copy">
            <div className="home-news-meta">
              <span>{formatLiveNewsDate(featured.publishedAt)}</span>
              <span><Eye size={14} /> {formatLiveNewsViews(featured.viewCount)}</span>
            </div>
            <span className="home-news-kicker">Berita utama</span>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <span className="read-link">Baca selengkapnya <ArrowRight size={15} /></span>
          </div>
        </Link>
        <div className="home-news-share-row"><ShareButton title={featured.title} slug={featured.slug} /></div>
      </div>

      <div className="home-latest-panel">
        <div className="home-latest-head">
          <span className="eyebrow">Berita terbaru</span>
          <span>{Math.min(latest.length, 3)} artikel</span>
        </div>
        <div className="home-latest-list">
          {latest.slice(0, 3).map((item, index) => (
            <div className="home-latest-item-wrap" key={item.slug}>
              <Link className="home-latest-item" href={`/berita/${item.slug}/`}>
                <span className="latest-number">0{index + 2}</span>
                <div className="home-latest-copy">
                  <span className="eyebrow">{item.category}</span>
                  <h3>{item.title}</h3>
                  <div className="home-latest-meta">
                    <span><Clock3 size={13} /> {formatLiveNewsDate(item.publishedAt)}</span>
                    <span><Eye size={13} /> {formatLiveNewsViews(item.viewCount)}</span>
                  </div>
                </div>
                <ArrowRight className="home-latest-arrow" size={17} aria-hidden="true" />
              </Link>
              <div className="home-latest-share-row"><ShareButton title={item.title} slug={item.slug} /></div>
            </div>
          ))}
        </div>
        <Link className="home-news-more" href="/berita/">Lihat semua berita <ArrowRight size={15} /></Link>
      </div>
    </div>
  )
}
