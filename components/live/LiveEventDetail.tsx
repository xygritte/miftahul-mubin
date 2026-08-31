'use client'

import { useCallback, useEffect, useState } from 'react'
import { eventRecordToLegacy } from '@/lib/data/presentation'
import { supabasePublicRepository } from '@/lib/data/supabasePublicRepository'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import EventDetail from '@/components/content/EventDetail'
import type { EventItem } from '@/lib/content'

export default function LiveEventDetail({ slug, initialEvent }: { slug: string; initialEvent: EventItem | null }) {
  const [event, setEvent] = useState<EventItem | null>(initialEvent)
  const refresh = useCallback(async () => {
    const record = await supabasePublicRepository.getEventBySlug(slug)
    if (record) setEvent(eventRecordToLegacy(record))
    else setEvent(null)
  }, [slug])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('events', refresh)

  if (!event) return <main id="main-content" className="inner-page"><div className="container"><div className="empty-state"><strong>Kegiatan tidak tersedia</strong><p>Kegiatan ini belum dipublikasikan atau sudah tidak tersedia.</p></div></div></main>
  return <EventDetail event={event} />
}
