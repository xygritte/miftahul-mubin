'use client'

import type { ReactNode } from 'react'

const URL_PATTERN = /(https?:\/\/[^\s<]+)/gi

function normalizeUrl(raw: string) {
  return raw.replace(/[),.;!?]+$/g, '')
}

function getVideoEmbedUrl(raw: string) {
  try {
    const url = new URL(normalizeUrl(raw))
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      const id = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
  } catch {
    return null
  }
  return null
}

function renderText(text: string): ReactNode[] {
  const parts = text.split(URL_PATTERN)
  return parts.map((part, index) => {
    if (!/^https?:\/\//i.test(part)) return <span key={index}>{part}</span>
    const href = normalizeUrl(part)
    const embed = getVideoEmbedUrl(href)
    if (embed) return <span className="content-embed" key={index}><iframe src={embed} title="Video konten Miftahul Mubin" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></span>
    return <a key={index} className="content-external-link" href={href} target="_blank" rel="noopener noreferrer">{href}</a>
  })
}

export default function SafeRichContent({ paragraphs }: { paragraphs: string[] }) {
  return <div className="safe-rich-content">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{renderText(paragraph)}</p>)}</div>
}
