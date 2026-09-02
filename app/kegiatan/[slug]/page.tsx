import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import LiveEventDetail from '@/components/live/LiveEventDetail'
import { contentRepository } from '@/lib/data'
import { eventRecordToLegacy } from '@/lib/data/presentation'

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
  const event = await contentRepository.getEventBySlug(slug)
  return { title: event ? `${event.title} — Miftahul Mubin` : 'Kegiatan — Miftahul Mubin', description: event?.description }
}

export default async function KegiatanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await contentRepository.getEventBySlug(slug)
  return <SiteShell><LiveEventDetail slug={slug} initialEvent={event ? eventRecordToLegacy(event) : null} /></SiteShell>
}
