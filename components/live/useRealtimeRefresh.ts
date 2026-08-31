'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

type TableName = 'news' | 'events' | 'islamic_articles' | 'announcements' | 'management_periods' | 'management_members' | 'media_albums' | 'media_items' | 'finance_periods' | 'finance_transactions'

let subscriptionSequence = 0

export function useRealtimeRefresh(table: TableName, refresh: () => void | Promise<void>) {
  useEffect(() => {
    const run = () => { void refresh() }
    const onVisibility = () => { if (document.visibilityState === 'visible') run() }

    window.addEventListener('focus', run)
    window.addEventListener('pageshow', run)
    document.addEventListener('visibilitychange', onVisibility)
    const interval = window.setInterval(run, 15000)

    if (!supabase) {
      return () => {
        window.removeEventListener('focus', run)
        window.removeEventListener('pageshow', run)
        document.removeEventListener('visibilitychange', onVisibility)
        window.clearInterval(interval)
      }
    }

    subscriptionSequence += 1
    const channel = supabase
      .channel(`public:${table}:live:${subscriptionSequence}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, run)
      .subscribe()

    return () => {
      window.removeEventListener('focus', run)
      window.removeEventListener('pageshow', run)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [table, refresh])
}
