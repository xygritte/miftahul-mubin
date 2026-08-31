'use client'

import { useMemo, useState } from 'react'

type DocumentationItem = { id?: string; url: string; type?: 'image' | 'video'; title?: string | null; sortOrder: number }

const filters = ['Semua', 'Kajian', 'Sosial', 'Pendidikan', 'Pemuda', 'Pengurus']

function getVideoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
    if (parsed.hostname === 'youtube.com' || parsed.hostname === 'www.youtube.com' || parsed.hostname === 'm.youtube.com') {
      const id = parsed.searchParams.get('v') || parsed.pathname.match(/\/embed\/([^/]+)/)?.[1] || parsed.pathname.match(/\/shorts\/([^/]+)/)?.[1]
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
    if (parsed.hostname === 'vimeo.com' || parsed.hostname === 'www.vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

export default function FilterableDocumentation({ items }: { items: DocumentationItem[] }) {
  const [filter, setFilter] = useState('Semua')
  const mapped = useMemo(() => items.map((item) => {
    const parts = (item.title ?? '').split(' · ')
    return { ...item, displayTitle: parts[0] || 'Dokumentasi Miftahul Mubin', category: parts[1] || 'Umum' }
  }), [items])
  const filtered = useMemo(() => filter === 'Semua' ? mapped : mapped.filter((item) => item.category === filter), [filter, mapped])

  return <>
    <div className="filter-row filter-row-interactive" role="group" aria-label="Filter dokumentasi">
      {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    <div className="gallery-page" aria-live="polite">
      {filtered.map((item) => {
        const embedUrl = item.type === 'video' ? getVideoEmbedUrl(item.url) : null
        return <article key={item.id ?? item.url} className="gallery-card">
          <div className="gallery-image-wrap">
            {embedUrl ? <iframe className="gallery-video" src={embedUrl} title={item.displayTitle} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <img src={item.url} alt={item.displayTitle} loading="lazy" onError={(event) => { event.currentTarget.style.opacity = '0.25' }} />}
          </div>
          <div><span>{item.category}</span><h2>{item.displayTitle}</h2><small>{item.type === 'video' ? 'Video dokumentasi · Miftahul Mubin' : 'Dokumentasi Miftahul Mubin'}</small></div>
        </article>
      })}
    </div>
    {filtered.length === 0 && <div className="empty-state"><strong>Belum ada dokumentasi</strong><p>Belum tersedia dokumentasi pada kategori ini.</p></div>}
  </>
}
