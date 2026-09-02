'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, CalendarDays, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { ManagementMember, ManagementPeriod } from '@/types/content'

type ManagementPeriodRow = { id: string; name: string; start_date: string; end_date: string | null; is_active: boolean }
type ManagementMemberRow = { id: string; period_id: string | null; name: string; position: string; sort_order: number; photo_url: string | null; bio: string | null }

function mapPeriod(row: ManagementPeriodRow): ManagementPeriod {
  return { id: row.id, name: row.name, startDate: row.start_date, endDate: row.end_date, isActive: row.is_active }
}

function mapMember(row: ManagementMemberRow): ManagementMember {
  return { id: row.id, periodId: row.period_id ?? undefined, name: row.name, position: row.position, photoUrl: row.photo_url, bio: row.bio, sortOrder: row.sort_order }
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'MM'
}

function formatPeriodDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function PersonPhoto({ member, lead = false }: { member: ManagementMember; lead?: boolean }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(member.photoUrl) && !failed
  return <span className={`management-photo${lead ? ' lead' : ''}`} aria-hidden="true">
    {showImage ? <img src={member.photoUrl ?? ''} alt="" onError={() => setFailed(true)} /> : <span>{initials(member.name)}</span>}
  </span>
}

export default function LiveManagement({ initialPeriod, initialMembers }: { initialPeriod: ManagementPeriod | null; initialMembers: ManagementMember[] }) {
  const [period, setPeriod] = useState(initialPeriod)
  const [members, setMembers] = useState(initialMembers)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data: periods, error: periodError } = await supabase
      .from('management_periods')
      .select('id,name,start_date,end_date,is_active')
      .order('start_date', { ascending: false })

    if (periodError) {
      setLoading(false)
      return
    }

    const mappedPeriods = (periods ?? []).map((row) => mapPeriod(row as ManagementPeriodRow))
    const nextPeriod = mappedPeriods.find((item) => item.isActive) ?? mappedPeriods[0] ?? null

    if (!nextPeriod?.id) {
      setPeriod(null)
      setMembers([])
      setLoading(false)
      return
    }

    const { data: memberData, error: memberError } = await supabase
      .from('management_members')
      .select('id,period_id,name,position,sort_order,photo_url,bio')
      .eq('period_id', nextPeriod.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!memberError) {
      setPeriod(nextPeriod)
      setMembers((memberData ?? []).map((row) => mapMember(row as ManagementMemberRow)))
    }
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('management_periods', refresh)
  useRealtimeRefresh('management_members', refresh)

  const orderedMembers = useMemo(() => [...members].sort((a, b) => a.sortOrder - b.sortOrder), [members])
  const lead = orderedMembers[0]
  const team = orderedMembers.slice(1)
  const startDate = period ? formatPeriodDate(period.startDate) : null
  const endDate = period ? formatPeriodDate(period.endDate) : null

  if (!period || !lead) {
    return <section className="management-empty" aria-live="polite">
      <div className="management-empty-icon"><Users size={22} /></div>
      <div><strong>Struktur kepengurusan belum tersedia</strong><p>Data pengurus aktif belum dipublikasikan pada portal.</p></div>
    </section>
  }

  return <>
    <section className={`management-public${loading ? ' is-refreshing' : ''}`} aria-label="Struktur kepengurusan">
      <header className="management-public-head">
        <div>
          <span className="eyebrow">Struktur organisasi</span>
          <h2>{period.name}</h2>
          <p>Susunan pengurus yang menjalankan pelayanan dan kegiatan Masjid Miftahul Mubin.</p>
        </div>
        <div className="management-period-badge">
          <CalendarDays size={17} aria-hidden="true" />
          <span>{startDate ?? 'Periode aktif'}{endDate ? ` — ${endDate}` : ''}</span>
        </div>
      </header>

      <div className="management-lead-card">
        <div className="management-lead-photo"><PersonPhoto member={lead} lead /></div>
        <div className="management-lead-content">
          <span className="management-role">{lead.position}</span>
          <h3>{lead.name}</h3>
          {lead.bio && <p>{lead.bio}</p>}
          <span className="management-lead-label"><Building2 size={14} aria-hidden="true" /> Pimpinan struktur</span>
        </div>
      </div>

      {team.length > 0 && <>
        <div className="management-team-heading">
          <div><span className="eyebrow">Tim pelayanan</span><h3>Pengurus & bidang</h3></div>
          <span><Users size={15} aria-hidden="true" /> {team.length} anggota</span>
        </div>
        <div className="management-team-grid">
          {team.map((member) => <article className="management-person-card" key={member.id ?? `${member.name}-${member.sortOrder}`}>
            <PersonPhoto member={member} />
            <div className="management-person-content">
              <span>{member.position}</span>
              <h4>{member.name}</h4>
              {member.bio && <p>{member.bio}</p>}
            </div>
          </article>)}
        </div>
      </>}
    </section>

    <section className="management-public-note">
      <div><span className="eyebrow">Periode aktif</span><strong>{period.name}</strong></div>
      <p>Informasi ini diperbarui dari data kepengurusan yang dikelola pengurus dan tersinkron secara berkala.</p>
    </section>

    <style jsx>{`
      .management-public{background:#fff;border:1px solid var(--line);border-radius:2px;overflow:hidden;transition:opacity .2s ease}.management-public.is-refreshing{opacity:.92}.management-public-head{display:flex;justify-content:space-between;gap:28px;padding:32px 34px;border-bottom:1px solid var(--line);align-items:flex-end}.management-public-head h2{font-family:'Playfair Display',serif;font-size:32px;line-height:1.1;margin:6px 0 8px}.management-public-head p{max-width:680px;margin:0;color:var(--muted);font-size:13px;line-height:1.65}.management-period-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--line);background:var(--canvas);color:var(--green);font-size:11px;font-weight:700;white-space:nowrap}.management-lead-card{display:grid;grid-template-columns:190px 1fr;gap:28px;padding:32px 34px;background:linear-gradient(135deg,#f8faf8 0%,#fff 65%);border-bottom:1px solid var(--line)}.management-lead-photo{display:flex;align-items:center;justify-content:center}.management-photo{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:#e7eee9;color:var(--green-dark);font-weight:700;font-size:18px;letter-spacing:.04em;flex:0 0 auto;border:4px solid #fff;box-shadow:0 7px 24px rgba(8,61,49,.12)}.management-photo.lead{width:148px;height:148px;font-size:34px;border-width:6px}.management-photo img{width:100%;height:100%;object-fit:cover}.management-lead-content{align-self:center}.management-role{display:block;color:var(--green);font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.management-lead-content h3{font-family:'Playfair Display',serif;font-size:34px;line-height:1.12;margin:7px 0 10px}.management-lead-content p{max-width:700px;color:var(--muted);font-size:13px;line-height:1.7;margin:0 0 14px}.management-lead-label{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.management-team-heading{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;padding:28px 34px 18px}.management-team-heading h3{font-family:'Playfair Display',serif;font-size:24px;margin:5px 0 0}.management-team-heading>span{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}.management-team-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:0 34px 34px}.management-person-card{display:flex;gap:15px;align-items:flex-start;background:var(--canvas);border:1px solid var(--line);padding:18px;min-height:118px;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.management-person-card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(8,61,49,.08);border-color:#cfdad4}.management-person-content{min-width:0;padding-top:2px}.management-person-content>span{display:block;color:var(--green);font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.management-person-content h4{margin:5px 0 5px;font-size:16px;line-height:1.25}.management-person-content p{margin:0;color:var(--muted);font-size:11px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.management-public-note{display:grid;grid-template-columns:minmax(180px,.45fr) 1fr;gap:30px;align-items:center;margin-top:18px;padding:20px 22px;border-left:3px solid var(--green);background:#eef4f1}.management-public-note strong{display:block;font-family:'Playfair Display',serif;font-size:20px;margin-top:4px}.management-public-note p{margin:0;color:var(--muted);font-size:11px;line-height:1.65}.management-empty{display:flex;align-items:flex-start;gap:14px;padding:28px;background:#fff;border:1px solid var(--line)}.management-empty-icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#eef4f1;color:var(--green);flex:0 0 auto}.management-empty strong{display:block;font-family:'Playfair Display',serif;font-size:20px;margin-bottom:5px}.management-empty p{margin:0;color:var(--muted);font-size:12px;line-height:1.6}@media(max-width:900px){.management-public-head{padding:26px 24px;align-items:flex-start;flex-direction:column}.management-period-badge{white-space:normal}.management-lead-card{grid-template-columns:140px 1fr;padding:28px 24px}.management-team-heading{padding-inline:24px}.management-team-grid{grid-template-columns:repeat(2,minmax(0,1fr));padding-inline:24px}.management-public-note{grid-template-columns:1fr;gap:9px}.management-lead-content h3{font-size:29px}}@media(max-width:640px){.management-public-head h2{font-size:28px}.management-lead-card{grid-template-columns:1fr;text-align:center}.management-lead-photo{margin-bottom:4px}.management-lead-content p{margin-inline:auto}.management-team-heading{align-items:flex-start;flex-direction:column;gap:10px}.management-team-grid{grid-template-columns:1fr;padding:0 16px 20px}.management-team-grid .management-person-card{min-height:0}.management-public-note{margin-top:14px;padding:18px}.management-empty{padding:22px}}
    `}</style>
  </>
}
