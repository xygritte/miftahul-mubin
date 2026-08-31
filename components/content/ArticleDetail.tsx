import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react'
import type { NewsItem } from '@/lib/content'
import SafeRichContent from '@/components/content/SafeRichContent'

export default function ArticleDetail({ article }: { article: NewsItem }) {
  return (
    <main id="main-content" className="inner-page">
      <div className="container article-layout">
        <article className="article-detail">
          <Link className="back-link" href="/berita/"><ArrowLeft size={15}/> Kembali ke berita</Link>
          <div className="article-kicker"><span>{article.category}</span><span>•</span><span>{article.date}</span></div>
          <h1>{article.title}</h1>
          <p className="article-lead">{article.excerpt}</p>
          <div className="article-hero"><img src={article.image} alt={article.title}/></div>
          <div className="article-caption">Dokumentasi ilustrasi Miftahul Mubin · 2026</div>
          <div className="article-copy"><SafeRichContent paragraphs={article.content} /></div>
          <div className="article-share"><span>Dipublikasikan untuk jamaah dan masyarakat.</span><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></div>
        </article>
        <aside className="article-sidebar">
          <div className="sidebar-card"><span className="eyebrow">Navigasi</span><h2>Jelajahi Miftahul Mubin</h2><Link href="/berita/">Berita <ArrowRight size={15}/></Link><Link href="/kegiatan/">Kegiatan <ArrowRight size={15}/></Link><Link href="/keislaman/">Keislaman <ArrowRight size={15}/></Link><Link href="/keuangan/">Keuangan <ArrowRight size={15}/></Link></div>
          <div className="sidebar-note"><CalendarDays size={18}/><p>Artikel publik ditampilkan dari konten yang telah dipublikasikan pengurus.</p></div>
        </aside>
      </div>
    </main>
  )
}
