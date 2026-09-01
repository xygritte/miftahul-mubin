'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { CalendarDays, Edit3, Eye, FilePlus2, ImagePlus, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'
import { uploadPublicStorageFile } from '@/lib/supabase/storage'

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
type EventRow = {
  id: string
  title: string
  slug: string
  description: string
  event_date: string
  start_time: string | null
  end_time: string | null
  location: string
  speaker: string | null
  status: EventStatus
  cover_url: string | null
  category_id: string | null
  created_at: string
  updated_at: string
}
type Category = { id: string; name: string; slug: string }
type EventForm = {
  id?: string
  title: string
  slug: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  location: string
  speaker: string
  status: EventStatus
  coverUrl: string
  categoryId: string
}

const emptyForm: EventForm = { title: '', slug: '', description: '', eventDate: '', startTime: '', endTime: '', location: '', speaker: '', status: 'draft', coverUrl: '', categoryId: '' }

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') }
function formatDate(value: string) { const date = new Date(`${value.slice(0, 10)}T12:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date) }
function extractStoragePath(url: string | null) { if (!url) return null; const marker = '/storage/v1/object/public/event-media/'; const index = url.indexOf(marker); return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null }
function errorMessage(error: { code?: string; message?: string } | null, action: 'load' | 'save' | 'delete' | 'access') {
  if (!error) return ''
  if (error.code === '23505') return 'Slug kegiatan sudah digunakan. Gunakan slug yang berbeda.'
  if (error.code === '23503') return 'Kategori kegiatan tidak valid.'
  if (error.code === '23514') return 'Data kegiatan tidak memenuhi aturan database.'
  if (error.code === '42501') return action === 'load' ? 'Data kegiatan tidak dapat dibaca dengan sesi ini.' : 'Sesi admin tidak memiliki izin untuk operasi ini. Keluar dan masuk kembali.'
  if (action === 'access') return 'Sesi admin tidak dapat memverifikasi hak akses Kegiatan. Keluar dan masuk kembali.'
  if (action === 'load') return 'Data kegiatan gagal dimuat.'
  if (action === 'delete') return 'Kegiatan gagal dihapus.'
  return 'Kegiatan gagal disimpan.'
}
function storageErrorMessage(error: unknown) { const message = error instanceof Error ? error.message.toLowerCase() : ''; if (message.includes('tipe file') || message.includes('ukuran file')) return error instanceof Error ? error.message : 'File tidak valid.'; if (message.includes('row-level security') || message.includes('permission')) return 'Sesi admin tidak memiliki izin untuk mengunggah cover kegiatan.'; return 'Cover kegiatan gagal diunggah. Coba file gambar lain.' }

export default function AdminEventManagerV2() {
  const [rows, setRows] = useState<EventRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<EventForm>(emptyForm)
  const [editorOpen, setEditorOpen] = useState(false)
  const [stagedUploadPath, setStagedUploadPath] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  async function refreshAndVerifyAccess() {
    const refreshed = await supabase.auth.refreshSession()
    const user = refreshed.data.session?.user ?? (await supabase.auth.getUser()).data.user
    if (!user) { setAuthorized(false); return false }
    const { data, error: accessError } = await supabase.rpc('can_manage_events')
    if (accessError) { console.error('Kegiatan access check failed:', accessError); setAuthorized(false); return false }
    const allowed = data === true
    setAuthorized(allowed)
    return allowed
  }

  async function load() {
    setLoading(true)
    setError('')
    const [{ data, error: eventError }, { data: cats, error: categoryError }] = await Promise.all([
      supabase.from('events').select('id,title,slug,description,event_date,start_time,end_time,location,speaker,status,cover_url,category_id,created_at,updated_at').order('event_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug').eq('type', 'event').order('name'),
    ])
    if (eventError || categoryError) setError(errorMessage(eventError ?? categoryError, 'load'))
    else { setRows((data ?? []) as EventRow[]); setCategories((cats ?? []) as Category[]) }
    setLoading(false)
  }

  useEffect(() => { void (async () => { const allowed = await refreshAndVerifyAccess(); if (allowed) await load(); else { setLoading(false); setError('Sesi admin belum memiliki hak kelola Kegiatan. Silakan keluar dan masuk kembali sebagai admin.'); } })() }, [])

  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? rows.filter((item) => `${item.title} ${item.slug} ${item.description} ${item.location} ${item.speaker ?? ''}`.toLowerCase().includes(needle)) : rows }, [query, rows])

  function openCreate() { setForm({ ...emptyForm }); setStagedUploadPath(null); setEditorOpen(true); setError(''); setSuccess('') }
  function openEdit(row: EventRow) { setForm({ id: row.id, title: row.title, slug: row.slug, description: row.description, eventDate: row.event_date, startTime: row.start_time?.slice(0, 5) ?? '', endTime: row.end_time?.slice(0, 5) ?? '', location: row.location, speaker: row.speaker ?? '', status: row.status, coverUrl: row.cover_url ?? '', categoryId: row.category_id ?? '' }); setStagedUploadPath(null); setEditorOpen(true); setError(''); setSuccess('') }
  function closeEditor() { if (saving || uploading) return; if (stagedUploadPath) void supabase.storage.from('event-media').remove([stagedUploadPath]); setStagedUploadPath(null); setEditorOpen(false) }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading || saving) return
    setUploading(true); setError(''); setSuccess('')
    try {
      if (!(await refreshAndVerifyAccess())) throw new Error('permission')
      const uploaded = await uploadPublicStorageFile('event-media', file)
      if (stagedUploadPath) await supabase.storage.from('event-media').remove([stagedUploadPath])
      setStagedUploadPath(uploaded.path); setForm((current) => ({ ...current, coverUrl: uploaded.url })); setSuccess('Cover berhasil diunggah. Klik Simpan untuk menyimpan kegiatan.')
    } catch (uploadError) { setError(storageErrorMessage(uploadError)) } finally { setUploading(false) }
  }

  function validate() {
    if (!form.title.trim()) return 'Judul kegiatan wajib diisi.'
    if (!slugify(form.slug || form.title)) return 'Slug kegiatan wajib diisi.'
    if (!form.eventDate) return 'Tanggal kegiatan wajib diisi.'
    if (form.startTime && form.endTime && form.endTime < form.startTime) return 'Waktu selesai tidak boleh lebih awal dari waktu mulai.'
    if (!form.location.trim()) return 'Lokasi kegiatan wajib diisi.'
    if (!form.description.trim()) return 'Deskripsi kegiatan wajib diisi.'
    return null
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (saving || uploading) return
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      if (!(await refreshAndVerifyAccess())) { setError('Sesi admin tidak memiliki izin untuk mengelola Kegiatan. Silakan keluar dan masuk kembali.'); return }
      const payload = { title: form.title.trim(), slug: slugify(form.slug || form.title), description: form.description.trim(), event_date: form.eventDate, start_time: form.startTime || null, end_time: form.endTime || null, location: form.location.trim(), speaker: form.speaker.trim() || null, status: form.status, cover_url: form.coverUrl.trim() || null, category_id: form.categoryId || null }
      const result = form.id ? await supabase.from('events').update(payload).eq('id', form.id) : await supabase.from('events').insert(payload)
      if (result.error) { if (stagedUploadPath) await supabase.storage.from('event-media').remove([stagedUploadPath]); setError(errorMessage(result.error, 'save')); return }
      const oldPath = form.id ? extractStoragePath(rows.find((row) => row.id === form.id)?.cover_url ?? null) : null
      const newPath = extractStoragePath(form.coverUrl)
      if (oldPath && newPath && oldPath !== newPath) await supabase.storage.from('event-media').remove([oldPath])
      setStagedUploadPath(null); await load(); setEditorOpen(false); setSuccess(form.id ? 'Kegiatan berhasil diperbarui.' : 'Kegiatan berhasil dibuat.')
    } finally { setSaving(false) }
  }

  async function remove(row: EventRow) {
    if (deletingId) return
    if (!window.confirm(`Hapus kegiatan “${row.title}”? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(row.id); setError(''); setSuccess('')
    try {
      if (!(await refreshAndVerifyAccess())) { setError('Sesi admin tidak memiliki izin untuk menghapus kegiatan. Silakan keluar dan masuk kembali.'); return }
      const { error: deleteError } = await supabase.from('events').delete().eq('id', row.id)
      if (deleteError) { setError(errorMessage(deleteError, 'delete')); return }
      const storagePath = extractStoragePath(row.cover_url)
      if (storagePath) await supabase.storage.from('event-media').remove([storagePath])
      await load(); setSuccess('Kegiatan berhasil dihapus.')
    } finally { setDeletingId(null) }
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan kegiatan">
    <div className="admin-module-toolbar"><div className="admin-search-wrap"><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, slug, lokasi…" aria-label="Cari kegiatan" /></div><button className="admin-button primary" onClick={openCreate} disabled={authorized !== true}><FilePlus2 size={17} /> Tambah kegiatan</button></div>
    {error && <p className="admin-form-error" role="alert">{error}</p>}{success && <p className="admin-form-success" role="status">{success}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat kegiatan…</div> : filtered.length === 0 ? <div className="admin-table-state"><CalendarDays size={20} /><strong>Tidak ada kegiatan</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat kegiatan pertama.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Kegiatan</th><th>Status</th><th>Tanggal</th><th aria-label="Aksi" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="admin-table-title"><strong>{row.title}</strong><small>/{row.slug} · {row.location}</small></div></td><td><span className={`admin-status-pill ${row.status}`}>{row.status}</span></td><td>{formatDate(row.event_date)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(row)} disabled={authorized !== true} aria-label={`Edit ${row.title}`}><Edit3 size={16} /></button><button className="admin-icon-button" onClick={() => window.open(sitePath(`/kegiatan/${row.slug}/`), '_blank', 'noopener,noreferrer')} aria-label={`Lihat ${row.title}`}><Eye size={16} /></button><button className="admin-icon-button danger" onClick={() => void remove(row)} disabled={authorized !== true || deletingId === row.id} aria-label={`Hapus ${row.title}`}>{deletingId === row.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}</button></div></td></tr>)}</tbody></table></div>}
    {editorOpen && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="event-editor-title"><div className="admin-modal-header"><div><span className="eyebrow">CMS Kegiatan</span><h2 id="event-editor-title">{form.id ? 'Edit kegiatan' : 'Tambah kegiatan'}</h2></div><button type="button" className="admin-icon-button" onClick={closeEditor} disabled={saving || uploading} aria-label="Tutup"><X size={18} /></button></div><form className="admin-editor-form" onSubmit={save}>
      <label><span>Judul</span><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.id ? current.slug : slugify(event.target.value) }))} /></label>
      <label><span>Slug</span><input required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} /></label>
      <div className="admin-form-grid"><label><span>Tanggal</span><input type="date" required value={form.eventDate} onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))} /></label><label><span>Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as EventStatus }))}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label></div>
      <div className="admin-form-grid"><label><span>Mulai</span><input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} /></label><label><span>Selesai</span><input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} /></label></div>
      <label><span>Lokasi</span><input required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></label>
      <label><span>Narasumber</span><input value={form.speaker} onChange={(event) => setForm((current) => ({ ...current, speaker: event.target.value }))} /></label>
      <label><span>Deskripsi</span><textarea rows={7} required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Jelaskan agenda, tujuan, dan informasi penting kegiatan." /></label>
      <label><span>Kategori</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <div className="admin-upload-field"><div className="admin-upload-label"><span>Cover kegiatan</span><small>JPG, PNG, WebP, GIF, SVG · maks. 16 MB</small></div>{form.coverUrl && <div className="admin-upload-preview"><img src={form.coverUrl} alt="Pratinjau cover kegiatan" /><button type="button" className="admin-icon-button" onClick={() => { if (stagedUploadPath) void supabase.storage.from('event-media').remove([stagedUploadPath]); setStagedUploadPath(null); setForm((current) => ({ ...current, coverUrl: '' })) }} aria-label="Hapus cover" disabled={saving || uploading}><X size={16} /></button></div>}<label className="admin-file-picker"><ImagePlus size={17} /><span>{uploading ? 'Mengunggah cover…' : form.coverUrl ? 'Ganti cover' : 'Pilih gambar dari perangkat'}</span><input type="file" accept="image/*" onChange={(event) => void handleCoverChange(event)} disabled={saving || uploading || authorized !== true} /></label>{!form.coverUrl && <input type="url" value={form.coverUrl} onChange={(event) => setForm((current) => ({ ...current, coverUrl: event.target.value }))} placeholder="Atau gunakan URL gambar eksternal untuk data lama" aria-label="URL cover alternatif" />}</div>
      <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={closeEditor} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading || authorized !== true}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : uploading ? <><Loader2 className="spin" size={16} /> Mengunggah…</> : 'Simpan kegiatan'}</button></div>
    </form></div></div>}
  </section>
}
