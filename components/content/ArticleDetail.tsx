import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import type { ArticleBlock, ArticleDocument, ArticleInline } from '@/types/article-document'
import type { NewsItem } from '@/lib/data/presentation'
import ArticleContentRenderer from '@/components/content/ArticleContentRenderer'

function inlineText(content: ArticleInline[]) {
  return content
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

export default function ArticleDetail({ article }: { article: NewsItem }) {
  const readingMinutes = articleReadingMinutes(article.content)

  return (
    <main id="main-content" className="inner-page">
      <div className="container article-layout">
        <article className="article-detail">
          <header className="article-header">
            <Link className="back-link" href="/berita/">
              <ArrowLeft size={15} aria-hidden="true" />
              Semua berita
            </Link>

            <div className="article-kicker">
              <span>{article.category}</span>
            </div>

            <h1>{article.title}</h1>
            <p className="article-lead">{article.excerpt}</p>

            <div className="article-reading-meta" aria-label="Informasi artikel">
              <span>
                <CalendarDays size={15} aria-hidden="true" />
                {article.date}
              </span>
              <span>
                <Clock3 size={15} aria-hidden="true" />
                {readingMinutes} menit baca
              </span>
            </div>
          </header>

          <figure className="article-hero">
            <img src={article.image} alt={article.title} />
            <figcaption className="article-caption">Dokumentasi Miftahul Mubin · 2026</figcaption>
          </figure>

          <div className="article-copy">
            <ArticleContentRenderer document={article.content} />
          </div>

          <div className="article-share">
            <span>Dipublikasikan untuk jamaah dan masyarakat.</span>
            <Link href="/kontak/">
              Hubungi pengurus
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </article>

        <aside className="article-sidebar">
          <nav className="sidebar-card" aria-label="Navigasi portal">
            <span className="eyebrow">Navigasi</span>
            <h2>Jelajahi Miftahul Mubin</h2>
            <Link href="/berita/">
              Berita
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/kegiatan/">
              Kegiatan
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/keislaman/">
              Keislaman
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/keuangan/">
              Keuangan
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </nav>

          <div className="sidebar-note">
            <CalendarDays size={18} aria-hidden="true" />
            <p>Artikel publik ditampilkan dari konten yang telah dipublikasikan pengurus.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}
