import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import EventDetail from '@/components/content/EventDetail'
import { contentRepository } from '@/lib/data'
import { eventRecordToLegacy } from '@/lib/data/presentation'

export const dynamicParams = false

export async function generateStaticParams() {
  const records = await contentRepository.listEvents()
  return records.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await contentRepository.getEventBySlug(slug)
  return { title: event ? `${event.title} — Miftahul Mubin` : 'Kegiatan — Miftahul Mubin', description: event?.description }
}

export default async function KegiatanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await contentRepository.getEventBySlug(slug)
  if (!event) notFound()
  return <SiteShell><EventDetail event={eventRecordToLegacy(event)} /></SiteShell>
}
