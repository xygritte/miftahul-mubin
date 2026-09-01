'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookOpenText, Edit3, Eye, FilePlus2, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'

type Status = 'draft' | 'published' | 'archived'

type IslamicRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string[]
  category_id: string | null
  author_id: string | null
  status: Status
  published_at: string | null
  created_at: string
  updated_at: string
}

type Category = { id: string; name: string; slug: string }

type FormState = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  categoryId: string
  status: Status
  publishedAt: string | null
}

const emptyForm: FormState = {
  title: '', slug: '', excerpt: '', content: '', categoryId: '', status: 'draft', publishedAt: null,
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

function getErrorMessage(error: { code?: string; message?: string } | null, action: 'load' | 'save' | 'delete') {
  if (!error) return ''
  if (error.code === '23505') return 'Slug sudah digunakan. Gunakan slug yang berbeda.'
  if (error.code === '23503') return 'Kategori yang dipilih tidak valid.'
  if (error.code === '42501') return 'Akun tidak memiliki izin untuk mengelola artikel keislaman.'
  if (error.code === '22P02') return 'Nilai data tidak valid.'
  if (action === 'load') return 'Data artikel keislaman gagal dimuat.'
  if (action === 'delete') return 'Artikel keislaman gagal dihapus.'
  return 'Artikel keislaman gagal disimpan.'
}

export default function AdminIslamicManager() {
  const [rows, setRows] = useState<IslamicRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editorOpen, setEditorOpen] = useState(false)

  async function load() {
    if (!supabase) {
      setError('Supabase belum dikonfigurasi.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const [{ data, error: articleError }, { data: cats, error: categoryError }] = await Promise.all([
      supabase
        .from('islamic_articles')
        .select('id,title,slug,excerpt,content,category_id,author_id,status,published_at,created_at,updated_at')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug').eq('type', 'islamic').order('name'),
    ])

    if (articleError || categoryError) {
      setError(getErrorMessage(articleError ?? categoryError, 'load'))
    } else {
      setRows((data ?? []) as IslamicRow[])
      setCategories((cats ?? []) as Category[])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.title} ${item.slug} ${item.excerpt}`.toLowerCase().includes(needle))
  }, [query, rows])

  function openCreate() {
    setForm({ ...emptyForm })
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  function openEdit(row: IslamicRow) {
    const paragraphs = Array.isArray(row.content) ? row.content : []
    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: paragraphs.join('\n\n'),
      categoryId: row.category_id ?? '',
      status: row.status,
      publishedAt: row.published_at,
    })
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  function closeEditor() {
    if (saving) return
    setEditorOpen(false)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!supabase || saving) return

    const title = form.title.trim()
    const slug = slugify(form.slug || form.title)
    const excerpt = form.excerpt.trim()
    const paragraphs = form.content.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean)

    if (!title || !slug) {
      setError('Judul dan slug wajib diisi.')
      return
    }
    if (!excerpt) {
      setError('Ringkasan artikel wajib diisi.')
      return
    }
    if (!paragraphs.length) {
      setError('Isi artikel wajib diisi.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const publishedAt = form.status === 'published'
      ? (form.publishedAt ?? new Date().toISOString())
      : null

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      title,
      slug,
      excerpt,
      content: paragraphs,
      category_id: form.categoryId || null,
      author_id: form.id ? undefined : (user?.id ?? null),
      status: form.status,
      published_at: publishedAt,
    }

    const result = form.id
      ? await supabase.from('islamic_articles').update(payload).eq('id', form.id)
      : await supabase.from('islamic_articles').insert(payload)

    if (result.error) {
      setError(getErrorMessage(result.error, 'save'))
      setSaving(false)
      return
    }

    await load()
    setEditorOpen(false)
    setSuccess(form.id ? 'Artikel keislaman berhasil diperbarui.' : 'Artikel keislaman berhasil dibuat.')
    setSaving(false)
  }

  async function remove(row: IslamicRow) {
    if (!supabase || deletingId) return
    if (!window.confirm(`Hapus artikel “${row.title}”? Tindakan ini tidak dapat dibatalkan.`)) return

    setDeletingId(row.id)
    setError('')
    setSuccess('')

    const { error: deleteError } = await supabase.from('islamic_articles').delete().eq('id', row.id)
    if (deleteError) {
      setError(getErrorMessage(deleteError, 'delete'))
    } else {
      await load()
      setSuccess('Artikel keislaman berhasil dihapus.')
    }
    setDeletingId(null)
  }

  return (
    <section className="admin-news-manager" aria-label="Pengelolaan artikel keislaman">
      <div className="admin-module-toolbar">
        <div className="admin-search-wrap">
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau slug…" aria-label="Cari artikel keislaman" />
        </div>
        <button className="admin-button primary" onClick={openCreate}>
          <FilePlus2 size={17} /> Tulis artikel
        </button>
      </div>

      {error && <p className="admin-form-error" role="alert">{error}</p>}
      {success && <p className="admin-form-success" role="status">{success}</p>}

      {loading ? (
        <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat artikel…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-table-state"><BookOpenText size={20} /><strong>Tidak ada artikel</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat artikel pertama.'}</span></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Artikel</th><th>Status</th><th>Diperbarui</th><th aria-label="Aksi" /></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td><div className="admin-table-title"><strong>{row.title}</strong><small>/{row.slug}</small></div></td>
                  <td><span className={`admin-status-pill ${row.status}`}>{row.status}</span></td>
                  <td>{formatDate(row.updated_at)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-icon-button" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><Edit3 size={16} /></button>
                      <button className="admin-icon-button" onClick={() => window.open(sitePath(`/keislaman/${row.slug}/`), '_blank', 'noopener,noreferrer')} aria-label={`Lihat ${row.title}`}><Eye size={16} /></button>
                      <button className="admin-icon-button danger" disabled={deletingId === row.id} onClick={() => void remove(row)} aria-label={`Hapus ${row.title}`}>{deletingId === row.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editorOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="islamic-editor-title">
            <div className="admin-modal-header">
              <div><span className="eyebrow">CMS Keislaman</span><h2 id="islamic-editor-title">{form.id ? 'Edit artikel' : 'Tulis artikel'}</h2></div>
              <button type="button" className="admin-icon-button" onClick={closeEditor} disabled={saving} aria-label="Tutup"><X size={18} /></button>
            </div>
            <form className="admin-editor-form" onSubmit={save}>
              <label><span>Judul</span><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.id ? current.slug : slugify(event.target.value) }))} /></label>
              <label><span>Slug</span><input required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} /></label>
              <div className="admin-form-grid">
                <label><span>Kategori</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                <label><span>Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Status }))}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
              </div>
              <label><span>Ringkasan</span><textarea rows={3} required value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} /></label>
              <label><span>Isi artikel</span><textarea rows={14} required value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Pisahkan paragraf dengan satu baris kosong." /></label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-button secondary" onClick={closeEditor} disabled={saving}>Batal</button>
                <button type="submit" className="admin-button primary" disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : 'Simpan artikel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
