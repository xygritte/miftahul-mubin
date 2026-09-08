'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  rootMargin?: string
  minHeight?: number
  className?: string
}

export default function DeferredSection({ children, rootMargin = '700px 0px', minHeight = 180, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (!('IntersectionObserver' in window)) {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setReady(true)
        observer.disconnect()
      },
      { rootMargin, threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className={className} style={ready ? undefined : { minHeight }} aria-busy={!ready}>
      {ready ? children : null}
    </div>
  )
}
