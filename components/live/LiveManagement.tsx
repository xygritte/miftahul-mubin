'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { ManagementMember, ManagementPeriod } from '@/types/content'

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join('') || 'MM'
}

export default function LiveManagement({ initialPeriod, initialMembers }: { initialPeriod: ManagementPeriod | null; initialMembers: ManagementMember[] }) {
  const [period, setPeriod] = useState(initialPeriod)
  const [members, setMembers] = useState(initialMembers)
  useEffect(() => {
    let active = true
    async function refresh() {
      if (!supabase) return
      const { data: periods, error: periodError } = await supabase.from('management_periods').select('id,name,start_date,end_date,is_active,created_at,updated_at').order('start_date',{ascending:false})
      if (periodError) return
      const nextPeriod = ((periods ?? []) as ManagementPeriod[]).find((item) => item.isActive) ?? ((periods ?? []) as ManagementPeriod[])[0] ?? null
      if (!nextPeriod) { if (active) { setPeriod(null); setMembers([]) }; return }
      const { data: memberData, error: memberError } = await supabase.from('management_members').select('id,period_id,name,position,department,sort_order,photo_url,created_at,updated_at').eq('period_id',nextPeriod.id).order('sort_order',{ascending:true})
      if (!memberError && active) { setPeriod(nextPeriod); setMembers((memberData ?? []) as ManagementMember[]) }
    }
    void refresh()
    return () => { active = false }
  }, [])
  const lead = members[0]
  if (!period || !members.length) return <div className="empty-state"><strong>Data kepengurusan belum tersedia</strong><p>Struktur pengurus aktif belum dipublikasikan.</p></div>
  return <>
    <section className="org-tree-page"><article className="management-lead page-lead"><span className="management-avatar">{initials(lead.name)}</span><div><span>{lead.position}</span><strong>{lead.name}</strong></div></article><div className="org-connector"/><div className="org-grid">{members.slice(1).map((member) => <article className="management-card" key={member.id ?? member.name}><span className="management-avatar small">{initials(member.name)}</span><div><span>{member.position}</span><strong>{member.name}</strong></div></article>)}</div></section>
    <section className="role-note"><span className="eyebrow">Periode Aktif</span><h2>{period.name}</h2><p>Periode kepengurusan aktif digunakan sebagai acuan struktur pelayanan jamaah pada portal Miftahul Mubin.</p></section>
  </>
}
