'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

type TableName = 'news' | 'events' | 'islamic_articles' | 'announcements' | 'management_periods' | 'management_members' | 'media_albums' | 'media_items' | 'finance_periods' | 'finance_transactions'

let subscriptionSequence = 0

export function useRealtimeRefresh(table: TableName, refresh: () => void | Promise<void>) {
  useEffect(() => {
    const run = () => { void refresh() }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        startPolling()
        run()
      } else {
        stopPolling()
      }
    }

    let interval: number | undefined
    const startPolling = () => {
      if (interval !== undefined || document.visibilityState !== 'visible') return
      interval = window.setInterval(run, 15000)
    }
    const stopPolling = () => {
      if (interval === undefined) return
      window.clearInterval(interval)
      interval = undefined
    }

    window.addEventListener('focus', run)
    window.addEventListener('pageshow', run)
    document.addEventListener('visibilitychange', onVisibility)
    startPolling()

    if (!supabase) {
      return () => {
        window.removeEventListener('focus', run)
        window.removeEventListener('pageshow', run)
        document.removeEventListener('visibilitychange', onVisibility)
        stopPolling()
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
      stopPolling()
      void supabase.removeChannel(channel)
    }
  }, [table, refresh])
}
