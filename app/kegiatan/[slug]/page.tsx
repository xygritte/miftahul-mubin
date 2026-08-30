import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteShell from '@/components/layout/SiteShell'
import EventDetail from '@/components/content/EventDetail'
import { events } from '@/lib/content'

export const dynamicParams = false

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = events.find((item) => item.slug === slug)
  return { title: event ? `${event.title} — Miftahul Mubin` : 'Kegiatan — Miftahul Mubin', description: event?.description }
}

export default async function KegiatanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = events.find((item) => item.slug === slug)
  if (!event) notFound()
  return <SiteShell><EventDetail event={event}/></SiteShell>
}
