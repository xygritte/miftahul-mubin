'use client'

import { useCallback, useEffect, useState } from 'react'
import { eventRecordToLegacy, type EventItem } from '@/lib/data/presentation'
import { supabasePublicRepository } from '@/lib/data/supabasePublicRepository'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import EventDetail from '@/components/content/EventDetail'

export default function LiveEventDetail({ slug, initialEvent }: { slug: string; initialEvent: EventItem | null }) {
  const [event, setEvent] = useState<EventItem | null>(initialEvent)
  const [relatedEvents, setRelatedEvents] = useState<EventItem[]>([])
  const [relatedLoading, setRelatedLoading] = useState(true)
  const refresh = useCallback(async () => {
    const record = await supabasePublicRepository.getEventBySlug(slug)
    if (record) setEvent(eventRecordToLegacy(record))
    else setEvent(null)
  }, [slug])

  const refreshRelated = useCallback(async () => {
    try {
      const records = await supabasePublicRepository.listEvents()
      setRelatedEvents(records.map(eventRecordToLegacy).filter((item) => item.slug !== slug).slice(0, 3))
    } finally {
      setRelatedLoading(false)
    }
  }, [slug])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    setRelatedLoading(true)
    void refreshRelated()
  }, [refreshRelated])

  const refreshEventsSurface = useCallback(async () => {
    await Promise.all([refresh(), refreshRelated()])
  }, [refresh, refreshRelated])

  useRealtimeRefresh('events', refreshEventsSurface)

  if (!event) return <main id="main-content" className="inner-page"><div className="container"><div className="empty-state"><strong>Kegiatan tidak tersedia</strong><p>Kegiatan ini belum dipublikasikan atau sudah tidak tersedia.</p></div></div></main>
  return <EventDetail event={event} relatedEvents={relatedEvents} relatedLoading={relatedLoading} />
}
