'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Edit3, FilePlus2, ImagePlus, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { uploadPublicStorageFile } from '@/lib/supabase/storage'

type Period = { id: string; name: string; start_date: string; end_date: string | null; is_active: boolean }
type Member = { id: string; period_id: string; name: string; position: string; photo_url: string | null; bio: string | null; sort_order: number }
type MemberForm = { id?: string; name: string; position: string; photoUrl: string; bio: string; sortOrder: string }
type PeriodForm = { id?: string; name: string; startDate: string; endDate: string; isActive: boolean }

const emptyPeriod: PeriodForm = { name: '', startDate: '', endDate: '', isActive: false }
const emptyMember: MemberForm = { name: '', position: '', photoUrl: '', bio: '', sortOrder: '0' }

function dateLabel(value: string | null) {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

function storagePath(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/management-media/'
  const index = url.indexOf(marker)
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null
}

function errorMessage(error: { code?: string; message?: string } | null, label: string) {
  if (!error) return ''
  if (error.code === '42501') return `Akun tidak memiliki izin untuk mengelola ${label}.`
  if (error.code === '23505') return 'Data dengan nilai unik tersebut sudah digunakan.'
  if (error.code === '23503') return 'Relasi periode tidak valid.'
  return `${label} gagal diproses.`
}

function storageError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Tipe file') || message.includes('Ukuran file')) return message
  if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('row-level security')) return 'Anda tidak memiliki izin untuk mengunggah foto anggota.'
  return 'Foto anggota gagal diunggah.'
}

export default function AdminManagementManager() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [periodForm, setPeriodForm] = useState<PeriodForm>(emptyPeriod)
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMember)
  const [periodEditorOpen, setPeriodEditorOpen] = useState(false)
  const [memberEditorOpen, setMemberEditorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stagedUploadPath, setStagedUploadPath] = useState<string | null>(null)

  async function loadPeriods(preferredId?: string) {
    setLoading(true)
    setError('')
    const { data, error: periodError } = await supabase.from('management_periods').select('id,name,start_date,end_date,is_active').order('start_date', { ascending: false })
    if (periodError) { setError(errorMessage(periodError, 'periode')); setLoading(false); return }
    const nextPeriods = (data ?? []) as Period[]
    setPeriods(nextPeriods)
    const nextId = preferredId && nextPeriods.some((item) => item.id === preferredId) ? preferredId : nextPeriods.find((item) => item.is_active)?.id ?? nextPeriods[0]?.id ?? ''
    setSelectedPeriod(nextId)
    if (!nextId) { setMembers([]); setLoading(false); return }
    const { data: memberData, error: memberError } = await supabase.from('management_members').select('id,period_id,name,position,photo_url,bio,sort_order').eq('period_id', nextId).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
    if (memberError) setError(errorMessage(memberError, 'anggota'))
    setMembers((memberData ?? []) as Member[])
    setLoading(false)
  }

  function refresh() { return loadPeriods(selectedPeriod || undefined) }

  async function savePeriod(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setError(''); setSuccess('')
    if (!periodForm.name.trim() || !periodForm.startDate) { setError('Nama dan tanggal mulai periode wajib diisi.'); return }
    if (periodForm.endDate && periodForm.endDate < periodForm.startDate) { setError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'); return }
    setSaving(true)
    const payload = { name: periodForm.name.trim(), start_date: periodForm.startDate, end_date: periodForm.endDate || null, is_active: periodForm.isActive }
    const result = periodForm.id ? await supabase.from('management_periods').update(payload).eq('id', periodForm.id) : await supabase.from('management_periods').insert(payload)
    if (result.error) { setError(errorMessage(result.error, 'periode')); setSaving(false); return }
    setPeriodEditorOpen(false)
    setSuccess(periodForm.id ? 'Periode berhasil diperbarui.' : 'Periode berhasil dibuat.')
    setSaving(false)
    await loadPeriods(periodForm.id)
  }

  async function saveMember(event: FormEvent) {
    event.preventDefault()
    if (saving || uploading || !selectedPeriod) return
    setError(''); setSuccess('')
    if (!memberForm.name.trim() || !memberForm.position.trim()) { setError('Nama dan jabatan anggota wajib diisi.'); return }
    const sortOrder = Number(memberForm.sortOrder)
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setError('Urutan harus berupa bilangan bulat 0 atau lebih.'); return }
    setSaving(true)
    const payload = { period_id: selectedPeriod, name: memberForm.name.trim(), position: memberForm.position.trim(), photo_url: memberForm.photoUrl.trim() || null, bio: memberForm.bio.trim() || null, sort_order: sortOrder }
    const result = memberForm.id ? await supabase.from('management_members').update(payload).eq('id', memberForm.id) : await supabase.from('management_members').insert(payload)
    if (result.error) { if (stagedUploadPath) await supabase.storage.from('management-media').remove([stagedUploadPath]); setError(errorMessage(result.error, 'anggota')); setSaving(false); return }
    setStagedUploadPath(null)
    setMemberEditorOpen(false)
    setSuccess(memberForm.id ? 'Anggota berhasil diperbarui.' : 'Anggota berhasil dibuat.')
    setSaving(false)
    await refresh()
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading || saving) return
    setUploading(true); setError(''); setSuccess('')
    try {
      const uploaded = await uploadPublicStorageFile('management-media', file)
      if (stagedUploadPath) await supabase.storage.from('management-media').remove([stagedUploadPath])
      setStagedUploadPath(uploaded.path)
      setMemberForm((current) => ({ ...current, photoUrl: uploaded.url }))
      setSuccess('Foto berhasil diunggah. Klik Simpan untuk menyimpan anggota.')
    } catch (uploadError) { setError(storageError(uploadError)) }
    finally { setUploading(false) }
  }

  async function removeRow(type: 'period' | 'member', row: Period | Member) {
    const label = type === 'period' ? 'periode' : 'anggota'
    if (deleting) return
    if (!window.confirm(`Hapus ${label} “${'name' in row ? row.name : ''}”? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeleting(row.id); setError(''); setSuccess('')
    const table = type === 'period' ? 'management_periods' : 'management_members'
    const { error: deleteError } = await supabase.from(table).delete().eq('id', row.id)
    if (deleteError) { setError(errorMessage(deleteError, label)); setDeleting(null); return }
    const photo = type === 'member' ? storagePath((row as Member).photo_url) : null
    if (photo) await supabase.storage.from('management-media').remove([photo])
    setSuccess(`${label[0].toUpperCase()}${label.slice(1)} berhasil dihapus.`)
    await loadPeriods(type === 'period' && selectedPeriod === row.id ? undefined : selectedPeriod)
    setDeleting(null)
  }

  const selected = periods.find((period) => period.id === selectedPeriod) ?? null
  const filteredMembers = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? members.filter((member) => `${member.name} ${member.position} ${member.bio ?? ''}`.toLowerCase().includes(needle)) : members }, [members, query])

  return <section className="admin-news-manager" aria-label="Pengelolaan kepengurusan">
    <div className="admin-module-toolbar">
      <strong>Periode Kepengurusan</strong>
      <button className="admin-button primary" onClick={() => { setPeriodForm({ ...emptyPeriod }); setPeriodEditorOpen(true); setError(''); setSuccess('') }}><FilePlus2 size={17} /> Tambah periode</button>
    </div>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {success && <p className="admin-form-success" role="status">{success}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat kepengurusan…</div> : <>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Periode</th><th>Mulai</th><th>Selesai</th><th>Status</th><th aria-label="Aksi" /></tr></thead><tbody>{periods.map((period) => <tr key={period.id} className={period.id === selectedPeriod ? 'is-selected' : ''}><td><button className="admin-button secondary" onClick={() => { setSelectedPeriod(period.id); setQuery('') }}>{period.name}</button></td><td>{dateLabel(period.start_date)}</td><td>{dateLabel(period.end_date)}</td><td><span className={`admin-status-pill ${period.is_active ? 'published' : 'draft'}`}>{period.is_active ? 'Aktif' : 'Nonaktif'}</span></td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => { setPeriodForm({ id: period.id, name: period.name, startDate: period.start_date, endDate: period.end_date ?? '', isActive: period.is_active }); setPeriodEditorOpen(true) }} aria-label={`Edit ${period.name}`}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={() => void removeRow('period', period)} disabled={deleting === period.id} aria-label={`Hapus ${period.name}`}>{deleting === period.id ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>
      <div className="admin-module-toolbar"><div><strong>Anggota</strong><small>{selected ? ` · ${selected.name}` : ' · belum ada periode'}</small></div><div className="admin-module-toolbar"><div className="admin-search-wrap"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau jabatan…" aria-label="Cari anggota"/></div><button className="admin-button primary" disabled={!selectedPeriod} onClick={() => { setMemberForm({ ...emptyMember }); setStagedUploadPath(null); setMemberEditorOpen(true); setError(''); setSuccess('') }}><FilePlus2 size={17}/> Tambah anggota</button></div></div>
      {selectedPeriod && (filteredMembers.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Anggota</th><th>Jabatan</th><th>Urutan</th><th aria-label="Aksi"/></tr></thead><tbody>{filteredMembers.map((member) => <tr key={member.id}><td><div className="admin-table-title">{member.photo_url ? <img src={member.photo_url} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: '999px' }}/> : null}<strong>{member.name}</strong></div></td><td>{member.position}</td><td>{member.sort_order}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => { setMemberForm({ id: member.id, name: member.name, position: member.position, photoUrl: member.photo_url ?? '', bio: member.bio ?? '', sortOrder: String(member.sort_order) }); setStagedUploadPath(null); setMemberEditorOpen(true) }} aria-label={`Edit ${member.name}`}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={() => void removeRow('member', member)} disabled={deleting === member.id} aria-label={`Hapus ${member.name}`}>{deleting === member.id ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div> : <div className="admin-table-state"><strong>Tidak ada anggota</strong><span>Tambahkan anggota pada periode ini.</span></div>)}
    </>}
    {periodEditorOpen && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">CMS Kepengurusan</span><h2>{periodForm.id ? 'Edit periode' : 'Tambah periode'}</h2></div><button className="admin-icon-button" onClick={() => setPeriodEditorOpen(false)} disabled={saving}><X size={18}/></button></div><form className="admin-editor-form" onSubmit={savePeriod}><label><span>Nama periode</span><input required value={periodForm.name} onChange={(event) => setPeriodForm((current) => ({ ...current, name: event.target.value }))}/></label><div className="admin-form-grid"><label><span>Tanggal mulai</span><input type="date" required value={periodForm.startDate} onChange={(event) => setPeriodForm((current) => ({ ...current, startDate: event.target.value }))}/></label><label><span>Tanggal selesai</span><input type="date" value={periodForm.endDate} onChange={(event) => setPeriodForm((current) => ({ ...current, endDate: event.target.value }))}/></label></div><label className="admin-checkbox"><input type="checkbox" checked={periodForm.isActive} onChange={(event) => setPeriodForm((current) => ({ ...current, isActive: event.target.checked }))}/><span>Jadikan periode aktif</span></label><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => setPeriodEditorOpen(false)} disabled={saving}>Batal</button><button type="submit" className="admin-button primary" disabled={saving}>{saving ? <><Loader2 className="spin" size={16}/> Menyimpan…</> : 'Simpan periode'}</button></div></form></div></div>}
    {memberEditorOpen && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">CMS Kepengurusan</span><h2>{memberForm.id ? 'Edit anggota' : 'Tambah anggota'}</h2></div><button className="admin-icon-button" onClick={() => { if (!saving && !uploading) { if (stagedUploadPath) void supabase.storage.from('management-media').remove([stagedUploadPath]); setStagedUploadPath(null); setMemberEditorOpen(false) } }} disabled={saving || uploading}><X size={18}/></button></div><form className="admin-editor-form" onSubmit={saveMember}><label><span>Nama</span><input required value={memberForm.name} onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))}/></label><label><span>Jabatan</span><input required value={memberForm.position} onChange={(event) => setMemberForm((current) => ({ ...current, position: event.target.value }))}/></label><div className="admin-form-grid"><label><span>Urutan</span><input type="number" min="0" step="1" value={memberForm.sortOrder} onChange={(event) => setMemberForm((current) => ({ ...current, sortOrder: event.target.value }))}/></label><label><span>Bio</span><input value={memberForm.bio} onChange={(event) => setMemberForm((current) => ({ ...current, bio: event.target.value }))}/></label></div><div className="admin-upload-field"><div className="admin-upload-label"><span>Foto anggota</span><small>Gambar · maks. 8 MB</small></div>{memberForm.photoUrl && <div className="admin-upload-preview"><img src={memberForm.photoUrl} alt="Pratinjau foto anggota"/><button type="button" className="admin-icon-button" onClick={() => setMemberForm((current) => ({ ...current, photoUrl: '' }))} disabled={saving || uploading} aria-label="Hapus foto"><X size={16}/></button></div>}<label className="admin-file-picker"><ImagePlus size={17}/><span>{uploading ? 'Mengunggah foto…' : memberForm.photoUrl ? 'Ganti foto' : 'Pilih foto dari perangkat'}</span><input type="file" accept="image/*" onChange={(event) => void handlePhotoChange(event)} disabled={saving || uploading}/></label></div><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => { if (stagedUploadPath) void supabase.storage.from('management-media').remove([stagedUploadPath]); setStagedUploadPath(null); setMemberEditorOpen(false) }} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16}/> Menyimpan…</> : uploading ? <><Loader2 className="spin" size={16}/> Mengunggah…</> : 'Simpan anggota'}</button></div></form></div></div>}
  </section>
}
