'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit3, FilePlus2, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

 type AnnouncementStatus = 'draft' | 'published' | 'archived'
 type AnnouncementRow = {
  id: string
  title: string
  content: string
  status: AnnouncementStatus
  published_at: string | null
  author_id: string | null
  created_at: string
  updated_at: string
 }
 type AnnouncementForm = {
  id?: string
  title: string
  content: string
  status: AnnouncementStatus
  publishedAt: string | null
 }

 const emptyForm: AnnouncementForm = { title: '', content: '', status: 'draft', publishedAt: null }

 function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
 }

 function errorMessage(error: { code?: string; message?: string } | null, action: 'load' | 'save' | 'delete') {
  if (!error) return ''
  if (error.code === '42501') return 'Akun tidak memiliki izin untuk mengelola pengumuman.'
  if (error.code === '23514') return 'Data pengumuman tidak memenuhi aturan database.'
  if (action === 'load') return 'Data pengumuman gagal dimuat.'
  if (action === 'delete') return 'Pengumuman gagal dihapus.'
  return 'Pengumuman gagal disimpan.'
 }

 export default function AdminAnnouncementManager() {
  const [rows, setRows] = useState<AnnouncementRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<AnnouncementForm>(emptyForm)
  const [editorOpen, setEditorOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase
      .from('announcements')
      .select('id,title,content,status,published_at,author_id,created_at,updated_at')
      .order('created_at', { ascending: false })

    if (queryError) setError(errorMessage(queryError, 'load'))
    else setRows((data ?? []) as AnnouncementRow[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => `${row.title} ${row.content}`.toLowerCase().includes(needle))
  }, [rows, query])

  function openCreate() {
    setForm({ ...emptyForm })
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  function openEdit(row: AnnouncementRow) {
    setForm({ id: row.id, title: row.title, content: row.content, status: row.status, publishedAt: row.published_at })
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  function closeEditor() {
    if (saving) return
    setEditorOpen(false)
  }

  function validate() {
    if (!form.title.trim()) return 'Judul pengumuman wajib diisi.'
    if (!form.content.trim()) return 'Isi pengumuman wajib diisi.'
    return null
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setSaving(true)
    setError('')
    setSuccess('')

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      setError('Sesi admin tidak tersedia. Silakan masuk kembali.')
      setSaving(false)
      return
    }

    const publishedAt = form.status === 'published'
      ? (form.publishedAt ?? new Date().toISOString())
      : null

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      status: form.status,
      published_at: publishedAt,
      author_id: userData.user.id,
    }

    const result = form.id
      ? await supabase.from('announcements').update(payload).eq('id', form.id)
      : await supabase.from('announcements').insert(payload)

    if (result.error) {
      setError(errorMessage(result.error, 'save'))
      setSaving(false)
      return
    }

    await load()
    setEditorOpen(false)
    setSuccess(form.id ? 'Pengumuman berhasil diperbarui.' : 'Pengumuman berhasil dibuat.')
    setSaving(false)
  }

  async function remove(row: AnnouncementRow) {
    if (deletingId) return
    if (!window.confirm(`Hapus pengumuman “${row.title}”? Tindakan ini tidak dapat dibatalkan.`)) return

    setDeletingId(row.id)
    setError('')
    setSuccess('')

    const { error: deleteError } = await supabase.from('announcements').delete().eq('id', row.id)
    if (deleteError) setError(errorMessage(deleteError, 'delete'))
    else { await load(); setSuccess('Pengumuman berhasil dihapus.') }
    setDeletingId(null)
  }

  return (
    <section className="admin-news-manager" aria-label="Pengelolaan pengumuman">
      <div className="admin-module-toolbar">
        <div className="admin-search-wrap"><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau isi…" aria-label="Cari pengumuman" /></div>
        <button className="admin-button primary" onClick={openCreate}><FilePlus2 size={17} /> Tulis pengumuman</button>
      </div>

      {error && <p className="admin-form-error" role="alert">{error}</p>}
      {success && <p className="admin-form-success" role="status">{success}</p>}

      {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat pengumuman…</div> : filtered.length === 0 ? <div className="admin-table-state"><strong>Tidak ada pengumuman</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat pengumuman pertama.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Pengumuman</th><th>Status</th><th>Dipublikasikan</th><th>Diperbarui</th><th aria-label="Aksi" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="admin-table-title"><strong>{row.title}</strong><small>{row.content.length > 100 ? `${row.content.slice(0, 100)}…` : row.content}</small></div></td><td><span className={`admin-status-pill ${row.status}`}>{row.status}</span></td><td>{formatDate(row.published_at)}</td><td>{formatDate(row.updated_at)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><Edit3 size={16} /></button><button className="admin-icon-button danger" disabled={deletingId === row.id} onClick={() => void remove(row)} aria-label={`Hapus ${row.title}`}>{deletingId === row.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}</button></div></td></tr>)}</tbody></table></div>}

      {editorOpen && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-editor-title"><div className="admin-modal-header"><div><span className="eyebrow">CMS Pengumuman</span><h2 id="announcement-editor-title">{form.id ? 'Edit pengumuman' : 'Tulis pengumuman'}</h2></div><button type="button" className="admin-icon-button" onClick={closeEditor} disabled={saving} aria-label="Tutup"><X size={18} /></button></div><form className="admin-editor-form" onSubmit={save}>
        <label><span>Judul</span><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
        <label><span>Isi pengumuman</span><textarea required rows={10} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Tulis informasi resmi yang perlu diketahui jamaah." /></label>
        <label><span>Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AnnouncementStatus }))}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={closeEditor} disabled={saving}>Batal</button><button type="submit" className="admin-button primary" disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : 'Simpan pengumuman'}</button></div>
      </form></div></div>}
    </section>
  )
 }
