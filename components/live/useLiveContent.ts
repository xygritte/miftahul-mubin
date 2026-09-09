'use client'

import { useCallback, useState } from 'react'

type Fetcher<T> = () => Promise<T[] | null>

export function useLiveContent<T>(initialItems: T[], fetcher: Fetcher<T>) {
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(initialItems.length === 0)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    const next = await fetcher()
    if (next === null) {
      setError(true)
      setLoading(false)
      return
    }

    setItems(next)
    setError(false)
    setLoading(false)
  }, [fetcher])

  return { items, loading, error, refresh }
}
