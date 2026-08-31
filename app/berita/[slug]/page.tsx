import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import ArticleDetail from '@/components/content/ArticleDetail'
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
  if (!article) notFound()
  return <SiteShell><ArticleDetail article={newsRecordToLegacy(article)} /></SiteShell>
}
