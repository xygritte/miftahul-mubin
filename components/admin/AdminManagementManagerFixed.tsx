'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Edit3, FilePlus2, ImagePlus, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { uploadPublicStorageFile, removeStorageFile } from '@/lib/supabase/storage'

type Period = { id: string; name: string; start_date: string; end_date: string | null; is_active: boolean }
type Member = { id: string; period_id: string; name: string; position: string; photo_url: string | null; bio: string | null; sort_order: number }
type PeriodForm = { id?: string; name: string; startDate: string; endDate: string; isActive: boolean }
type MemberForm = { id?: string; name: string; position: string; photoUrl: string; bio: string; sortOrder: string }

const EMPTY_PERIOD: PeriodForm = { name: '', startDate: '', endDate: '', isActive: false }
const EMPTY_MEMBER: MemberForm = { name: '', position: '', photoUrl: '', bio: '', sortOrder: '0' }

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

function storagePath(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/management-media/'
  const index = url.indexOf(marker)
  return index < 0 ? null : decodeURIComponent(url.slice(index + marker.length))
}

function messageFor(error: { code?: string; message?: string } | null, label: string) {
  if (!error) return ''
  if (error.code === '42501') return `Akun tidak memiliki izin untuk mengelola ${label}.`
  if (error.code === '23505') return 'Data dengan nilai unik tersebut sudah digunakan.'
  if (error.code === '23503') return 'Relasi data tidak valid.'
  return `${label} gagal diproses.`
}

export default function AdminManagementManagerFixed() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [periodForm, setPeriodForm] = useState<PeriodForm>({ ...EMPTY_PERIOD })
  const [memberForm, setMemberForm] = useState<MemberForm>({ ...EMPTY_MEMBER })
  const [periodEditor, setPeriodEditor] = useState(false)
  const [memberEditor, setMemberEditor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stagedPath, setStagedPath] = useState<string | null>(null)

  async function loadMembers(periodId: string) {
    if (!periodId) { setMembers([]); return }
    const { data, error: memberError } = await supabase
      .from('management_members')
      .select('id,period_id,name,position,photo_url,bio,sort_order')
      .eq('period_id', periodId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (memberError) { setError(messageFor(memberError, 'anggota')); setMembers([]); return }
    setMembers((data ?? []) as Member[])
  }

  async function loadPeriods(preferredId = '') {
    setLoading(true)
    setError('')
    const { data, error: periodError } = await supabase
      .from('management_periods')
      .select('id,name,start_date,end_date,is_active')
      .order('start_date', { ascending: false })
    if (periodError) { setError(messageFor(periodError, 'periode')); setLoading(false); return }
    const next = (data ?? []) as Period[]
    setPeriods(next)
    const nextId = preferredId && next.some((p) => p.id === preferredId)
      ? preferredId
      : next.find((p) => p.is_active)?.id ?? next[0]?.id ?? ''
    setSelectedPeriodId(nextId)
    await loadMembers(nextId)
    setLoading(false)
  }

  useEffect(() => {
    void loadPeriods()
  }, [])

  useEffect(() => {
    if (selectedPeriodId) void loadMembers(selectedPeriodId)
    else setMembers([])
  }, [selectedPeriodId])

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) ?? null
  const filteredMembers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return members
    return members.filter((m) => `${m.name} ${m.position} ${m.bio ?? ''}`.toLowerCase().includes(needle))
  }, [members, query])

  async function savePeriod(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    const name = periodForm.name.trim()
    if (!name || !periodForm.startDate) { setError('Nama dan tanggal mulai periode wajib diisi.'); return }
    if (periodForm.endDate && periodForm.endDate < periodForm.startDate) { setError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'); return }
    setSaving(true); setError(''); setSuccess('')
    const payload = { name, start_date: periodForm.startDate, end_date: periodForm.endDate || null, is_active: periodForm.isActive }
    const result = periodForm.id
      ? await supabase.from('management_periods').update(payload).eq('id', periodForm.id)
      : await supabase.from('management_periods').insert(payload)
    if (result.error) setError(messageFor(result.error, 'periode'))
    else {
      setPeriodEditor(false)
      setSuccess(periodForm.id ? 'Periode berhasil diperbarui.' : 'Periode berhasil dibuat.')
      await loadPeriods(periodForm.id ?? '')
    }
    setSaving(false)
  }

  async function saveMember(event: FormEvent) {
    event.preventDefault()
    if (saving || uploading || !selectedPeriodId) return
    const name = memberForm.name.trim()
    const position = memberForm.position.trim()
    const sortOrder = Number(memberForm.sortOrder)
    if (!name || !position) { setError('Nama dan jabatan anggota wajib diisi.'); return }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setError('Urutan harus berupa bilangan bulat 0 atau lebih.'); return }
    setSaving(true); setError(''); setSuccess('')
    const payload = { period_id: selectedPeriodId, name, position, photo_url: memberForm.photoUrl.trim() || null, bio: memberForm.bio.trim() || null, sort_order: sortOrder }
    const result = memberForm.id
      ? await supabase.from('management_members').update(payload).eq('id', memberForm.id)
      : await supabase.from('management_members').insert(payload)
    if (result.error) {
      if (stagedPath) await removeStorageFile('management-media', stagedPath).catch(() => undefined)
      setError(messageFor(result.error, 'anggota'))
    } else {
      setStagedPath(null)
      setMemberEditor(false)
      setSuccess(memberForm.id ? 'Anggota berhasil diperbarui.' : 'Anggota berhasil ditambahkan.')
      await loadMembers(selectedPeriodId)
    }
    setSaving(false)
  }

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || saving || uploading) return
    setUploading(true); setError(''); setSuccess('')
    try {
      const uploaded = await uploadPublicStorageFile('management-media', file)
      if (stagedPath) await removeStorageFile('management-media', stagedPath).catch(() => undefined)
      setStagedPath(uploaded.path)
      setMemberForm((current) => ({ ...current, photoUrl: uploaded.url }))
      setSuccess('Foto berhasil diunggah. Klik Simpan anggota untuk menyimpannya.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Foto anggota gagal diunggah.')
    } finally { setUploading(false) }
  }

  function closeMemberEditor() {
    if (saving || uploading) return
    if (stagedPath) void removeStorageFile('management-media', stagedPath).catch(() => undefined)
    setStagedPath(null); setMemberEditor(false)
  }

  async function removePeriod(period: Period) {
    if (deletingId) return
    if (!window.confirm(`Hapus periode “${period.name}” beserta seluruh anggotanya?`)) return
    setDeletingId(period.id); setError(''); setSuccess('')
    const { error: deleteError } = await supabase.from('management_periods').delete().eq('id', period.id)
    if (deleteError) setError(messageFor(deleteError, 'periode'))
    else { setSuccess('Periode berhasil dihapus.'); await loadPeriods(selectedPeriodId === period.id ? '' : selectedPeriodId) }
    setDeletingId(null)
  }

  async function removeMember(member: Member) {
    if (deletingId) return
    if (!window.confirm(`Hapus anggota “${member.name}”?`)) return
    setDeletingId(member.id); setError(''); setSuccess('')
    const { error: deleteError } = await supabase.from('management_members').delete().eq('id', member.id)
    if (deleteError) setError(messageFor(deleteError, 'anggota'))
    else {
      const path = storagePath(member.photo_url)
      if (path) await removeStorageFile('management-media', path).catch(() => undefined)
      await loadMembers(member.period_id)
      setSuccess('Anggota berhasil dihapus.')
    }
    setDeletingId(null)
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan kepengurusan">
    <div className="admin-module-toolbar">
      <strong>Periode Kepengurusan</strong>
      <button className="admin-button primary" onClick={() => { setPeriodForm({ ...EMPTY_PERIOD }); setPeriodEditor(true); setError(''); setSuccess('') }}><FilePlus2 size={17}/> Tambah periode</button>
    </div>

    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {success && <p className="admin-form-success" role="status">{success}</p>}

    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20}/> Memuat kepengurusan…</div> : periods.length === 0 ? <div className="admin-table-state"><strong>Belum ada periode kepengurusan.</strong><span>Buat periode pertama untuk mulai mengelola anggota.</span></div> : <>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Periode</th><th>Mulai</th><th>Selesai</th><th>Status</th><th/></tr></thead><tbody>{periods.map((period) => <tr key={period.id} className={period.id === selectedPeriodId ? 'is-selected' : ''}><td><button className="admin-button secondary" onClick={() => { setSelectedPeriodId(period.id); setQuery('') }}>{period.name}</button></td><td>{formatDate(period.start_date)}</td><td>{formatDate(period.end_date)}</td><td><span className={`admin-status-pill ${period.is_active ? 'published' : 'draft'}`}>{period.is_active ? 'Aktif' : 'Nonaktif'}</span></td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => { setPeriodForm({ id: period.id, name: period.name, startDate: period.start_date, endDate: period.end_date ?? '', isActive: period.is_active }); setPeriodEditor(true) }} aria-label={`Edit ${period.name}`}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={() => void removePeriod(period)} disabled={deletingId === period.id} aria-label={`Hapus ${period.name}`}>{deletingId === period.id ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>

      <div className="admin-module-toolbar"><div><strong>Anggota</strong><small>{selectedPeriod ? ` · ${selectedPeriod.name}` : ' · pilih periode'}</small></div><div className="admin-row-actions"><div className="admin-search-wrap"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau jabatan…" aria-label="Cari anggota"/></div><button className="admin-button primary" disabled={!selectedPeriodId} onClick={() => { setMemberForm({ ...EMPTY_MEMBER }); setStagedPath(null); setMemberEditor(true); setError(''); setSuccess('') }}><FilePlus2 size={17}/> Tambah anggota</button></div></div>

      {!selectedPeriodId ? <div className="admin-table-state">Pilih periode untuk melihat anggotanya.</div> : filteredMembers.length === 0 ? <div className="admin-table-state"><strong>Belum ada anggota</strong><span>Tambahkan anggota pada periode ini.</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Anggota</th><th>Jabatan</th><th>Urutan</th><th/></tr></thead><tbody>{filteredMembers.map((member) => <tr key={member.id}><td><div className="admin-table-title">{member.photo_url ? <img src={member.photo_url} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: '999px' }}/> : null}<strong>{member.name}</strong></div></td><td>{member.position}</td><td>{member.sort_order}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => { setMemberForm({ id: member.id, name: member.name, position: member.position, photoUrl: member.photo_url ?? '', bio: member.bio ?? '', sortOrder: String(member.sort_order) }); setStagedPath(null); setMemberEditor(true) }} aria-label={`Edit ${member.name}`}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={() => void removeMember(member)} disabled={deletingId === member.id} aria-label={`Hapus ${member.name}`}>{deletingId === member.id ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>}
    </>}

    {periodEditor && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">CMS Kepengurusan</span><h2>{periodForm.id ? 'Edit periode' : 'Tambah periode'}</h2></div><button className="admin-icon-button" onClick={() => setPeriodEditor(false)} disabled={saving}><X size={18}/></button></div><form className="admin-editor-form" onSubmit={savePeriod}><label><span>Nama periode</span><input required value={periodForm.name} onChange={(e) => setPeriodForm((v) => ({ ...v, name: e.target.value }))}/></label><div className="admin-form-grid"><label><span>Tanggal mulai</span><input type="date" required value={periodForm.startDate} onChange={(e) => setPeriodForm((v) => ({ ...v, startDate: e.target.value }))}/></label><label><span>Tanggal selesai</span><input type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm((v) => ({ ...v, endDate: e.target.value }))}/></label></div><label className="admin-checkbox"><input type="checkbox" checked={periodForm.isActive} onChange={(e) => setPeriodForm((v) => ({ ...v, isActive: e.target.checked }))}/><span>Jadikan periode aktif</span></label><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => setPeriodEditor(false)} disabled={saving}>Batal</button><button type="submit" className="admin-button primary" disabled={saving}>{saving ? <><Loader2 className="spin" size={16}/> Menyimpan…</> : 'Simpan periode'}</button></div></form></div></div>}

    {memberEditor && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">CMS Kepengurusan</span><h2>{memberForm.id ? 'Edit anggota' : 'Tambah anggota'}</h2></div><button className="admin-icon-button" onClick={closeMemberEditor} disabled={saving || uploading}><X size={18}/></button></div><form className="admin-editor-form" onSubmit={saveMember}><label><span>Nama</span><input required value={memberForm.name} onChange={(e) => setMemberForm((v) => ({ ...v, name: e.target.value }))}/></label><label><span>Jabatan</span><input required value={memberForm.position} onChange={(e) => setMemberForm((v) => ({ ...v, position: e.target.value }))}/></label><label><span>Urutan</span><input type="number" min="0" step="1" required value={memberForm.sortOrder} onChange={(e) => setMemberForm((v) => ({ ...v, sortOrder: e.target.value }))}/></label><label><span>Bio</span><textarea rows={4} value={memberForm.bio} onChange={(e) => setMemberForm((v) => ({ ...v, bio: e.target.value }))}/></label><div className="admin-upload-field"><div className="admin-upload-label"><span>Foto anggota</span><small>JPG, PNG, WebP, GIF, SVG · maks. 8 MB</small></div>{memberForm.photoUrl && <div className="admin-upload-preview"><img src={memberForm.photoUrl} alt="Pratinjau foto anggota"/><button type="button" className="admin-icon-button" onClick={() => setMemberForm((v) => ({ ...v, photoUrl: '' }))} disabled={saving || uploading} aria-label="Hapus foto"><X size={16}/></button></div>}<label className="admin-file-picker"><ImagePlus size={17}/><span>{uploading ? 'Mengunggah foto…' : memberForm.photoUrl ? 'Ganti foto' : 'Pilih foto dari perangkat'}</span><input type="file" accept="image/*" onChange={(e) => void handlePhoto(e)} disabled={saving || uploading}/></label></div><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={closeMemberEditor} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16}/> Menyimpan…</> : uploading ? <><Loader2 className="spin" size={16}/> Mengunggah…</> : 'Simpan anggota'}</button></div></form></div></div>}
  </section>
}
