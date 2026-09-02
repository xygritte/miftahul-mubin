'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * GitHub Pages serves the app as a static export. Explicitly reset scroll
 * position after a route transition so navigation starts at the top rather
 * than preserving the previous page's scroll position.
 */
export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
