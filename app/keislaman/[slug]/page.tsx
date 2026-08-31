import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import SiteShell from '@/components/layout/SiteShell'
import { contentRepository } from '@/lib/data'
import { formatIndonesianDate, islamicRecordToLegacy } from '@/lib/data/presentation'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const dynamicParams = false

export async function generateStaticParams() {
  const records = await contentRepository.listIslamic()
  return records.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await contentRepository.getIslamicBySlug(slug)
  return { title: item ? `${item.title} — Miftahul Mubin` : 'Keislaman — Miftahul Mubin', description: item?.excerpt }
}

export default async function KeislamanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await contentRepository.getIslamicBySlug(slug)
  if (!item) notFound()
  const view = islamicRecordToLegacy(item)
  const publishedLabel = formatIndonesianDate(item.publishedAt ?? item.date, false)

  return <SiteShell><main id="main-content" className="inner-page"><div className="container article-layout"><article className="article-detail"><Link className="back-link" href="/keislaman/"><ArrowLeft size={15}/> Kembali ke keislaman</Link><div className="article-kicker"><span>{view.category}</span><span>•</span><span>{publishedLabel}</span></div><h1>{view.title}</h1><p className="article-lead">{view.excerpt}</p><div className="article-copy article-copy-first">{view.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="article-share"><span>Materi pembelajaran Miftahul Mubin.</span><Link href="/keislaman/">Artikel lainnya <ArrowRight size={15}/></Link></div></article><aside className="article-sidebar"><div className="sidebar-card"><span className="eyebrow">Kategori</span><h2>Ruang Keislaman</h2><Link href="/keislaman/">Semua artikel <ArrowRight size={15}/></Link><Link href="/kegiatan/">Jadwal kajian <ArrowRight size={15}/></Link><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></div></aside></div></main></SiteShell>
}
