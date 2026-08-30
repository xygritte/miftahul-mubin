import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import SiteShell from '@/components/layout/SiteShell'
import { islamicItems } from '@/lib/islamic'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export const dynamicParams = false
export function generateStaticParams() { return islamicItems.map((item) => ({ slug: item.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = islamicItems.find((entry) => entry.slug === slug)
  return { title: item ? `${item.title} — Miftahul Mubin` : 'Keislaman — Miftahul Mubin', description: item?.excerpt }
}
export default async function KeislamanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = islamicItems.find((entry) => entry.slug === slug)
  if (!item) notFound()
  return <SiteShell><main id="main-content" className="inner-page"><div className="container article-layout"><article className="article-detail"><Link className="back-link" href="/keislaman/"><ArrowLeft size={15}/> Kembali ke keislaman</Link><div className="article-kicker"><span>{item.category}</span><span>•</span><span>{item.date}</span></div><h1>{item.title}</h1><p className="article-lead">{item.excerpt}</p><div className="article-copy article-copy-first">{item.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="article-share"><span>Materi pembelajaran Miftahul Mubin.</span><Link href="/keislaman/">Artikel lainnya <ArrowRight size={15}/></Link></div></article><aside className="article-sidebar"><div className="sidebar-card"><span className="eyebrow">Kategori</span><h2>Ruang Keislaman</h2><Link href="/keislaman/">Semua artikel <ArrowRight size={15}/></Link><Link href="/kegiatan/">Jadwal kajian <ArrowRight size={15}/></Link><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></div></aside></div></main></SiteShell>
}
