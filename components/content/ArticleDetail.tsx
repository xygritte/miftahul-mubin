import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye } from 'lucide-react'
import type { ArticleBlock, ArticleDocument, ArticleInline } from '@/types/article-document'
import type { NewsItem } from '@/lib/data/presentation'
import ArticleContentRenderer from '@/components/content/ArticleContentRenderer'
import ContentContextRail, { type ContentContextRailData } from '@/components/content/ContentContextRail'
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
  contextRail: ContentContextRailData
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
    contextRail: {
      eyebrow: 'Jelajah portal',
      title: 'Informasi Miftahul Mubin',
      links: [
        { label: 'Berita', href: '/berita/', active: true },
        { label: 'Kegiatan', href: '/kegiatan/' },
        { label: 'Keislaman', href: '/keislaman/' },
        { label: 'Keuangan', href: '/keuangan/' },
      ],
      note: 'Artikel publik ditampilkan dari konten yang telah dipublikasikan pengurus.',
    },
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
    <main id="main-content" className="inner-page content-detail-page article-page">
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
          <ContentContextRail
            data={data.contextRail}
            relatedLoading={data.latestLoading}
            relatedGroups={[
              {
                label: 'Berita',
                href: '/berita/',
                items: (data.latestNews ?? []).map((item) => ({
                  title: item.title,
                  href: `/berita/${item.slug}/`,
                  meta: `${item.category} · ${formatArticleSidebarDate(item.publishedAt)}`,
                  image: item.image,
                })),
              },
              {
                label: 'Keislaman',
                href: '/keislaman/',
                items: (data.latestIslamic ?? []).map((item) => ({
                  title: item.title,
                  href: `/keislaman/${item.slug}/`,
                  meta: `${item.category} · ${formatArticleSidebarDate(item.publishedAt)}`,
                })),
              },
            ]}
          />
        </aside>
      </div>
    </main>
  )
}
