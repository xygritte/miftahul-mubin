'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

type TableName = 'news' | 'events' | 'islamic_articles' | 'announcements' | 'management_periods' | 'management_members' | 'media_albums' | 'media_items' | 'finance_periods' | 'finance_transactions'

type SubscriptionEntry = {
  listeners: Set<() => void | Promise<void>>
  channel: ReturnType<NonNullable<typeof supabase>['channel']>
}

let subscriptionSequence = 0
const subscriptions = new Map<TableName, SubscriptionEntry>()

function addRealtimeListener(table: TableName, listener: () => void | Promise<void>) {
  if (!supabase) return () => undefined

  let entry = subscriptions.get(table)
  if (!entry) {
    subscriptionSequence += 1
    const listeners = new Set<() => void | Promise<void>>()
    const channel = supabase
      .channel(`public:${table}:live:${subscriptionSequence}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        const currentListeners = subscriptions.get(table)?.listeners
        currentListeners?.forEach((refresh) => { void refresh() })
      })
      .subscribe()

    entry = { listeners, channel }
    subscriptions.set(table, entry)
  }

  entry.listeners.add(listener)

  return () => {
    const current = subscriptions.get(table)
    if (!current) return

    current.listeners.delete(listener)
    if (current.listeners.size === 0) {
      subscriptions.delete(table)
      void supabase.removeChannel(current.channel)
    }
  }
}

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

    const removeRealtimeListener = addRealtimeListener(table, run)

    return () => {
      window.removeEventListener('focus', run)
      window.removeEventListener('pageshow', run)
      document.removeEventListener('visibilitychange', onVisibility)
      stopPolling()
      removeRealtimeListener()
    }
  }, [table, refresh])
}
