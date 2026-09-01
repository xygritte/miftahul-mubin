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

const emptyForm: EventForm = {
  title: '', slug: '', description: '', eventDate: '', startTime: '', endTime: '',
  location: '', speaker: '', status: 'draft', coverUrl: '', categoryId: '',
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${value.slice(0, 10)}T12:00:00`))
}

function formatError(error: { code?: string; message?: string } | null, action: 'load' | 'save' | 'delete') {
  if (!error) return ''
  if (error.code === '23505') return 'Slug kegiatan sudah digunakan. Gunakan slug yang berbeda.'
  if (error.code === '23503') return 'Kategori kegiatan tidak valid.'
  if (error.code === '23514') return 'Data kegiatan tidak memenuhi aturan database.'
  if (error.code === '42501') return 'Akun tidak memiliki izin untuk mengubah kegiatan.'
  if (error.message?.toLowerCase().includes('has_role')) return 'Pemeriksaan role gagal. Silakan masuk kembali.'
  if (action === 'load') return 'Data kegiatan gagal dimuat.'
  if (action === 'delete') return 'Kegiatan gagal dihapus.'
  return 'Kegiatan gagal disimpan.'
}

function storageErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Tipe file')) return message
  if (message.includes('Ukuran file')) return message
  if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('permission')) return 'Akun tidak memiliki izin untuk mengunggah cover kegiatan.'
  return 'Cover kegiatan gagal diunggah. Coba file gambar lain.'
}

function getEventStoragePath(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/event-media/'
  const index = url.indexOf(marker)
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null
}

export default function AdminEventManager() {
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

  async function load() {
    if (!supabase) {
      setError('Supabase belum dikonfigurasi.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const [{ data, error: eventError }, { data: cats, error: categoryError }] = await Promise.all([
      supabase.from('events').select('id,title,slug,description,event_date,start_time,end_time,location,speaker,status,cover_url,category_id,created_at,updated_at').order('event_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug').eq('type', 'event').order('name'),
    ])
    if (eventError || categoryError) setError(formatError(eventError ?? categoryError, 'load'))
    else {
      setRows((data ?? []) as EventRow[])
      setCategories((cats ?? []) as Category[])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.title} ${item.slug} ${item.description} ${item.location} ${item.speaker ?? ''}`.toLowerCase().includes(needle))
  }, [query, rows])

  function closeEditor() {
    if (saving || uploading) return
    if (stagedUploadPath) void supabase.storage.from('event-media').remove([stagedUploadPath])
    setStagedUploadPath(null)
    setEditorOpen(false)
  }

  function openCreate() {
    setForm({ ...emptyForm })
    setStagedUploadPath(null)
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  function openEdit(row: EventRow) {
    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      eventDate: row.event_date,
      startTime: row.start_time?.slice(0, 5) ?? '',
      endTime: row.end_time?.slice(0, 5) ?? '',
      location: row.location,
      speaker: row.speaker ?? '',
      status: row.status,
      coverUrl: row.cover_url ?? '',
      categoryId: row.category_id ?? '',
    })
    setStagedUploadPath(null)
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading || saving) return
    if (!file.type.startsWith('image/')) {
      setError('Cover kegiatan hanya menerima file gambar.')
      return
    }
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const uploaded = await uploadPublicStorageFile('event-media', file)
      if (stagedUploadPath) await supabase.storage.from('event-media').remove([stagedUploadPath])
      setStagedUploadPath(uploaded.path)
      setForm((current) => ({ ...current, coverUrl: uploaded.url }))
      setSuccess('Cover berhasil diunggah. Klik Simpan untuk menyimpan kegiatan.')
    } catch (uploadError) {
      setError(storageErrorMessage(uploadError))
    } finally {
      setUploading(false)
    }
  }

  function validate() {
    const title = form.title.trim()
    const slug = slugify(form.slug || form.title)
    const description = form.description.trim()
    if (!title || !slug) return 'Judul dan slug wajib diisi.'
    if (!form.eventDate) return 'Tanggal kegiatan wajib diisi.'
    if (form.startTime && form.endTime && form.endTime < form.startTime) return 'Waktu selesai tidak boleh lebih awal dari waktu mulai.'
    if (!description) return 'Deskripsi kegiatan wajib diisi.'
    if (!form.location.trim()) return 'Lokasi kegiatan wajib diisi.'
    return null
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!supabase || saving || uploading) return
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      description: form.description.trim(),
      event_date: form.eventDate,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      location: form.location.trim(),
      speaker: form.speaker.trim() || null,
      status: form.status,
      cover_url: form.coverUrl.trim() || null,
      category_id: form.categoryId || null,
    }

    const oldCoverUrl = form.id ? rows.find((row) => row.id === form.id)?.cover_url ?? null : null
    const result = form.id
      ? await supabase.from('events').update(payload).eq('id', form.id)
      : await supabase.from('events').insert(payload)

    if (result.error) {
      if (stagedUploadPath) await supabase.storage.from('event-media').remove([stagedUploadPath])
      setError(formatError(result.error, 'save'))
      setSaving(false)
      return
    }

    const oldPath = getEventStoragePath(oldCoverUrl)
    const newPath = getEventStoragePath(form.coverUrl)
    if (oldPath && newPath && oldPath !== newPath) await supabase.storage.from('event-media').remove([oldPath])

    setStagedUploadPath(null)
    await load()
    setEditorOpen(false)
    setSuccess(form.id ? 'Kegiatan berhasil diperbarui.' : 'Kegiatan berhasil dibuat.')
    setSaving(false)
  }

  async function remove(row: EventRow) {
    if (!supabase || deletingId) return
    if (!window.confirm(`Hapus kegiatan “${row.title}”? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(row.id)
    setError('')
    setSuccess('')
    const { error: deleteError } = await supabase.from('events').delete().eq('id', row.id)
    if (deleteError) {
      setError(formatError(deleteError, 'delete'))
    } else {
      const storagePath = getEventStoragePath(row.cover_url)
      if (storagePath) await supabase.storage.from('event-media').remove([storagePath])
      await load()
      setSuccess('Kegiatan berhasil dihapus.')
    }
    setDeletingId(null)
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan kegiatan">
    <div className="admin-module-toolbar">
      <div className="admin-search-wrap"><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, slug, lokasi…" aria-label="Cari kegiatan" /></div>
      <button className="admin-button primary" onClick={openCreate}><FilePlus2 size={17} /> Tambah kegiatan</button>
    </div>

    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {success && <p className="admin-form-success" role="status">{success}</p>}

    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat kegiatan…</div> : filtered.length === 0 ? <div className="admin-table-state"><CalendarDays size={20} /><strong>Tidak ada kegiatan</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat kegiatan pertama.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Kegiatan</th><th>Status</th><th>Tanggal</th><th aria-label="Aksi" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="admin-table-title"><strong>{row.title}</strong><small>/{row.slug} · {row.location}</small></div></td><td><span className={`admin-status-pill ${row.status}`}>{row.status}</span></td><td>{formatDate(row.event_date)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><Edit3 size={16} /></button><button className="admin-icon-button" onClick={() => window.open(sitePath(`/kegiatan/${row.slug}/`), '_blank', 'noopener,noreferrer')} aria-label={`Lihat ${row.title}`}><Eye size={16} /></button><button className="admin-icon-button danger" onClick={() => void remove(row)} disabled={deletingId === row.id} aria-label={`Hapus ${row.title}`}>{deletingId === row.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}</button></div></td></tr>)}</tbody></table></div>}

    {editorOpen && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="event-editor-title"><div className="admin-modal-header"><div><span className="eyebrow">CMS Kegiatan</span><h2 id="event-editor-title">{form.id ? 'Edit kegiatan' : 'Tambah kegiatan'}</h2></div><button type="button" className="admin-icon-button" onClick={closeEditor} aria-label="Tutup" disabled={saving || uploading}><X size={18} /></button></div><form className="admin-editor-form" onSubmit={save}>
      <label><span>Judul</span><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.id ? current.slug : slugify(event.target.value) }))} /></label>
      <label><span>Slug</span><input required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} /></label>
      <div className="admin-form-grid"><label><span>Tanggal</span><input type="date" required value={form.eventDate} onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))} /></label><label><span>Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as EventStatus }))}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label></div>
      <div className="admin-form-grid"><label><span>Mulai</span><input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} /></label><label><span>Selesai</span><input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} /></label></div>
      <label><span>Lokasi</span><input required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></label>
      <label><span>Narasumber</span><input value={form.speaker} onChange={(event) => setForm((current) => ({ ...current, speaker: event.target.value }))} /></label>
      <label><span>Deskripsi</span><textarea rows={7} required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Jelaskan agenda, tujuan, dan informasi penting kegiatan." /></label>
      <label><span>Kategori</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <div className="admin-upload-field"><div className="admin-upload-label"><span>Cover kegiatan</span><small>JPG, PNG, WebP, GIF, SVG · maks. 16 MB</small></div>{form.coverUrl && <div className="admin-upload-preview"><img src={form.coverUrl} alt="Pratinjau cover kegiatan" /><button type="button" className="admin-icon-button" onClick={() => { if (stagedUploadPath) void supabase.storage.from('event-media').remove([stagedUploadPath]); setStagedUploadPath(null); setForm((current) => ({ ...current, coverUrl: '' })) }} aria-label="Hapus cover" disabled={saving || uploading}><X size={16} /></button></div>}<label className="admin-file-picker"><ImagePlus size={17} /><span>{uploading ? 'Mengunggah cover…' : form.coverUrl ? 'Ganti cover' : 'Pilih gambar dari perangkat'}</span><input type="file" accept="image/*" onChange={(event) => void handleCoverChange(event)} disabled={saving || uploading} /></label>{!form.coverUrl && <input type="url" value={form.coverUrl} onChange={(event) => setForm((current) => ({ ...current, coverUrl: event.target.value }))} placeholder="Atau gunakan URL gambar eksternal untuk data lama" aria-label="URL cover alternatif" />}</div>
      <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={closeEditor} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : uploading ? <><Loader2 className="spin" size={16} /> Mengunggah…</> : 'Simpan kegiatan'}</button></div>
    </form></div></div>}
  </section>
}
