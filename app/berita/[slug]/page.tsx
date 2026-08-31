import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import LiveArticleDetail from '@/components/live/LiveArticleDetail'
import { contentRepository } from '@/lib/data'
import { newsRecordToLegacy } from '@/lib/data/presentation'

export const dynamicParams = false

export async function generateStaticParams() {
  const records = await contentRepository.listNews()
  return records.map((item) => ({ slug: item.slug }))
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
