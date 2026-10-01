import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye } from 'lucide-react'
import type { ArticleBlock, ArticleDocument, ArticleInline } from '@/types/article-document'
import type { NewsItem } from '@/lib/data/presentation'
import ArticleContentRenderer from '@/components/content/ArticleContentRenderer'
import { formatArticleSidebarDate, type ArticleSidebarIslamicItem, type ArticleSidebarNewsItem } from '@/lib/data/liveArticleSidebar'

export type ArticleDetailModel = {
  eyebrow: string
  category: string
  title: string
  date: string
  excerpt: string
  image?: string | null
  imageAlt?: string
  imageCaption?: string | null
  content: ArticleDocument
  viewCount?: number
  backHref: string
  backLabel: string
  sidebarEyebrow: string
  sidebarTitle: string
  sidebarLinks: Array<{ label: string; href: string }>
  sidebarNote: string
  latestNews?: ArticleSidebarNewsItem[]
  latestIslamic?: ArticleSidebarIslamicItem[]
  latestLoading?: boolean
  footerText: string
  footerLinkLabel: string
  footerLinkHref: string
}

function inlineText(content: ArticleInline[] | undefined) {
  return (content ?? [])
    .filter((node): node is Extract<ArticleInline, { type: 'text' }> => node.type === 'text')
    .map((node) => node.text)
    .join(' ')
}

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return inlineText(block.content)
    case 'blockquote':
      return block.content.map(blockText).join(' ')
    case 'bulletList':
    case 'orderedList':
      return block.content.flatMap((item) => item.content.map(blockText)).join(' ')
    case 'image':
      return block.attrs.caption ?? ''
    case 'horizontalRule':
      return ''
  }
}

function articleReadingMinutes(document: ArticleDocument) {
  const text = document.content.map(blockText).join(' ').trim()
  const words = text ? text.split(/\s+/u).length : 0
  return Math.max(1, Math.ceil(words / 220))
}

function formatViews(value: number | undefined) {
  if (!Number.isFinite(value)) return ''
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value ?? 0)
}

function fromNews(article: NewsItem): ArticleDetailModel {
  return {
    eyebrow: 'Berita Miftahul Mubin',
    category: article.category,
    title: article.title,
    date: article.date,
    excerpt: article.excerpt,
    image: article.image,
    imageAlt: article.title,
    imageCaption: 'Dokumentasi Miftahul Mubin.',
    content: article.content,
    viewCount: article.viewCount,
    backHref: '/berita/',
    backLabel: 'Semua berita',
    sidebarEyebrow: 'Jelajah portal',
    sidebarTitle: 'Informasi Miftahul Mubin',
    sidebarLinks: [
      { label: 'Berita', href: '/berita/' },
      { label: 'Kegiatan', href: '/kegiatan/' },
      { label: 'Keislaman', href: '/keislaman/' },
      { label: 'Keuangan', href: '/keuangan/' },
    ],
    sidebarNote: 'Artikel publik ditampilkan dari konten yang telah dipublikasikan pengurus.',
    footerText: 'Dipublikasikan untuk jamaah dan masyarakat.',
    footerLinkLabel: 'Hubungi pengurus',
    footerLinkHref: '/kontak/',
  }
}

function normalizeArticle(article: NewsItem | ArticleDetailModel): ArticleDetailModel {
  return 'backHref' in article ? article : fromNews(article)
}

export default function ArticleDetail({ article }: { article: NewsItem | ArticleDetailModel }) {
  const data = normalizeArticle(article)
  const readingMinutes = articleReadingMinutes(data.content)
  const views = formatViews(data.viewCount)

  return (
    <main id="main-content" className="inner-page article-page">
      <div className="container article-layout">
        <article className="article-detail">
          <header className="article-header">
            <Link className="back-link article-back-link" href={data.backHref}>
              <ArrowLeft size={15} aria-hidden="true" />
              <span>{data.backLabel}</span>
            </Link>

            <div className="article-kicker" aria-label="Klasifikasi artikel">
              <span className="article-section-label">{data.eyebrow}</span>
              <span className="article-kicker-separator" aria-hidden="true">/</span>
              <span className="article-category">{data.category}</span>
            </div>

            <h1 className="article-title">{data.title}</h1>
            {data.excerpt && <p className="article-lead article-dek">{data.excerpt}</p>}

            <div className="article-reading-meta" aria-label="Informasi artikel">
              <span>
                <CalendarDays size={15} aria-hidden="true" />
                <time>{data.date}</time>
              </span>
              <span>
                <Clock3 size={15} aria-hidden="true" />
                {readingMinutes} menit baca
              </span>
              {views && (
                <span>
                  <Eye size={15} aria-hidden="true" />
                  {views} dilihat
                </span>
              )}
            </div>
          </header>

          {data.image && (
            <figure className="article-hero">
              <img
                src={data.image}
                alt={data.imageAlt || data.title}
                fetchPriority="high"
                decoding="async"
              />
              {data.imageCaption && <figcaption className="article-caption">{data.imageCaption}</figcaption>}
            </figure>
          )}

          <div className="article-copy">
            <ArticleContentRenderer document={data.content} />
          </div>

          <footer className="article-share">
            <div>
              <span className="eyebrow">Penutup</span>
              <p>{data.footerText}</p>
            </div>
            <Link href={data.footerLinkHref}>
              {data.footerLinkLabel}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </footer>
        </article>

        <aside className="article-sidebar">
          <section
            className="article-sidebar-section article-sidebar-latest"
            aria-labelledby="article-sidebar-latest-title"
            aria-busy={data.latestLoading || undefined}
          >
            <div className="article-sidebar-section-head">
              <span className="eyebrow">Terbaru</span>
              <h2 id="article-sidebar-latest-title">Dari Miftahul Mubin</h2>
            </div>

            {data.latestLoading ? (
              <div className="article-sidebar-loading" role="status" aria-label="Memuat konten terbaru">
                <div className="article-sidebar-latest-group" aria-hidden="true">
                  <div className="article-sidebar-subhead">
                    <span>Berita</span>
                  </div>
                  <div className="article-sidebar-news-list">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="article-sidebar-news-skeleton">
                        <span className="article-sidebar-skeleton-index" />
                        <span className="article-sidebar-skeleton-thumb" />
                        <span className="article-sidebar-item-copy">
                          <span className="article-sidebar-skeleton-line article-sidebar-skeleton-line-title" />
                          <span className="article-sidebar-skeleton-line article-sidebar-skeleton-line-meta" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="article-sidebar-latest-group article-sidebar-islamic" aria-hidden="true">
                  <div className="article-sidebar-subhead">
                    <span>Keislaman</span>
                  </div>
                  <div className="article-sidebar-islamic-list">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="article-sidebar-islamic-skeleton">
                        <span className="article-sidebar-skeleton-index" />
                        <span className="article-sidebar-item-copy">
                          <span className="article-sidebar-skeleton-line article-sidebar-skeleton-line-title" />
                          <span className="article-sidebar-skeleton-line article-sidebar-skeleton-line-meta" />
                        </span>
                        <span className="article-sidebar-skeleton-arrow" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {!!data.latestNews?.length && (
                  <div className="article-sidebar-latest-group">
                    <div className="article-sidebar-subhead">
                      <span>Berita</span>
                      <Link href="/berita/">Semua</Link>
                    </div>
                    <div className="article-sidebar-news-list">
                      {data.latestNews.map((item, index) => (
                        <Link key={item.slug} className="article-sidebar-news-item" href={`/berita/${item.slug}/`}>
                          <span className="article-sidebar-item-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                          <img src={item.image} alt="" loading="lazy" decoding="async" />
                          <span className="article-sidebar-item-copy">
                            <strong>{item.title}</strong>
                            <small>{item.category} · {formatArticleSidebarDate(item.publishedAt)}</small>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {!!data.latestIslamic?.length && (
                  <div className="article-sidebar-latest-group article-sidebar-islamic">
                    <div className="article-sidebar-subhead">
                      <span>Keislaman</span>
                      <Link href="/keislaman/">Semua</Link>
                    </div>
                    <div className="article-sidebar-islamic-list">
                      {data.latestIslamic.map((item, index) => (
                        <Link key={item.slug} className="article-sidebar-islamic-item" href={`/keislaman/${item.slug}/`}>
                          <span className="article-sidebar-item-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                          <span className="article-sidebar-item-copy">
                            <strong>{item.title}</strong>
                            <small>{item.category} · {formatArticleSidebarDate(item.publishedAt)}</small>
                          </span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {!data.latestNews?.length && !data.latestIslamic?.length && (
                  <p className="article-sidebar-empty">Belum ada konten terbaru untuk ditampilkan.</p>
                )}
              </>
            )}
          </section>

          <nav className="sidebar-card article-context-card" aria-label={data.sidebarTitle}>
            <div className="article-sidebar-section-head">
              <span className="eyebrow">{data.sidebarEyebrow}</span>
              <h3>{data.sidebarTitle}</h3>
            </div>
            <div className="article-sidebar-links">
              {data.sidebarLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span>{item.label}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </nav>

          <div className="sidebar-note article-sidebar-note">
            <CalendarDays size={18} aria-hidden="true" />
            <p>{data.sidebarNote}</p>
          </div>        </aside>
      </div>
    </main>
  )
}
