import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import LiveIslamicDetail from '@/components/live/LiveIslamicDetail'
import { contentRepository } from '@/lib/data'
import { islamicRecordToLegacy } from '@/lib/data/presentation'

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
  return <SiteShell><LiveIslamicDetail slug={slug} initialItem={item ? islamicRecordToLegacy(item) : null} /></SiteShell>
}
