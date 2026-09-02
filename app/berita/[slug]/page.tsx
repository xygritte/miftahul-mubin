import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import LiveArticleDetail from '@/components/live/LiveArticleDetail'
import { contentRepository } from '@/lib/data'
import { newsRecordToLegacy } from '@/lib/data/presentation'

export const dynamicParams = false

/**
 * GitHub Pages uses `output: 'export'` and requires at least one generated
 * path for a dynamic segment, even when the live database is empty.
 * Real slugs are resolved client-side by the 404 route resolver.
 */
export async function generateStaticParams() {
  return [{ slug: '__placeholder__' }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await contentRepository.getNewsBySlug(slug)
  return { title: article ? `${article.title} — Miftahul Mubin` : 'Berita — Miftahul Mubin', description: article?.excerpt }
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await contentRepository.getNewsBySlug(slug)
  return <SiteShell><LiveArticleDetail slug={slug} initialArticle={article ? newsRecordToLegacy(article) : null} /></SiteShell>
}
