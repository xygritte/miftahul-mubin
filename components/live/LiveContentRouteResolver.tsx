'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LiveArticleDetail from './LiveArticleDetail'
import LiveEventDetail from './LiveEventDetail'
import LiveIslamicDetail from './LiveIslamicDetail'

type RouteTarget =
  | { type: 'news'; slug: string }
  | { type: 'event'; slug: string }
  | { type: 'islamic'; slug: string }
  | null

function parseTarget(pathname: string): RouteTarget {
  const base = '/miftahul-mubin'
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  const clean = path.replace(/^\/+|\/+$/g, '')
  const parts = clean.split('/').filter(Boolean)
  if (parts.length !== 2) return null
  const [section, slug] = parts
  if (!slug) return null
  if (section === 'berita') return { type: 'news', slug: decodeURIComponent(slug) }
  if (section === 'kegiatan') return { type: 'event', slug: decodeURIComponent(slug) }
  if (section === 'keislaman') return { type: 'islamic', slug: decodeURIComponent(slug) }
  return null
}

export default function LiveContentRouteResolver() {
  const [target, setTarget] = useState<RouteTarget>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    setTarget(parseTarget(window.location.pathname))
    setResolved(true)
  }, [])

  if (!resolved || !target) return null

  return (
    <>
      <Header searchItems={[]} />
      {target.type === 'news' && <LiveArticleDetail slug={target.slug} initialArticle={null} />}
      {target.type === 'event' && <LiveEventDetail slug={target.slug} initialEvent={null} />}
      {target.type === 'islamic' && <LiveIslamicDetail slug={target.slug} initialItem={null} />}
      <Footer />
    </>
  )
}
