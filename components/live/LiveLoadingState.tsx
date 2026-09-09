'use client'

import { Loader2 } from 'lucide-react'

type Props = { label: string }

export default function LiveLoadingState({ label }: Props) {
  return <div className="live-content-loading" role="status" aria-live="polite" aria-busy="true">
    <Loader2 className="spin" size={20} aria-hidden="true" />
    <span>{label}</span>
  </div>
}
