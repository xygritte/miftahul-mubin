'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

type TableName = 'news' | 'events' | 'islamic_articles' | 'announcements' | 'management_periods' | 'management_members' | 'media_albums' | 'media_items' | 'finance_periods' | 'finance_transactions'

export function useRealtimeRefresh(table: TableName, refresh: () => void | Promise<void>) {
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel(`public:${table}:live`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        void refresh()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [table, refresh])
}
