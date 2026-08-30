import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import ArticleDetail from '@/components/content/ArticleDetail'
import { news } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return news.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = news.find((item) => item.slug === slug)
  return { title: article ? `${article.title} — Miftahul Mubin` : 'Berita — Miftahul Mubin', description: article?.excerpt }
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = news.find((item) => item.slug === slug)
  if (!article) notFound()
  return <SiteShell><ArticleDetail article={article}/></SiteShell>
}
