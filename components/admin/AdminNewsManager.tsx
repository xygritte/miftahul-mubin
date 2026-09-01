'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit3, Eye, FilePlus2, ImagePlus, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'
import { uploadPublicStorageFile } from '@/lib/supabase/storage'

type NewsRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string[]
  thumbnail_url: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
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
  thumbnailUrl: string
  categoryId: string
  status: 'draft' | 'published'
  publishedAt: string | null
}

const emptyForm: FormState = { title: '', slug: '', excerpt: '', content: '', thumbnailUrl: '', categoryId: '', status: 'draft', publishedAt: null }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

function getErrorMessage(error: { code?: string; message?: string } | null, action: 'load' | 'save' | 'delete') {
  if (!error) return ''
  if (error.code === '23505') return 'Slug sudah digunakan. Gunakan slug yang berbeda.'
  if (error.code === '42501') return 'Akun tidak memiliki izin untuk mengubah berita. Pastikan role super_admin atau editor sudah terpasang.'
  if (error.code === '23503') return 'Kategori yang dipilih tidak valid.'
  if (error.message?.toLowerCase().includes('has_role')) return 'Pemeriksaan role gagal. Pastikan izin fungsi role sudah aktif.'
  if (action === 'load') return 'Data berita gagal dimuat.'
  if (action === 'delete') return 'Berita gagal dihapus.'
  return 'Berita gagal disimpan.'
}

function storageErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Tipe file')) return message
  if (message.includes('Ukuran file')) return message
  if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('permission')) return 'Akun tidak memiliki izin untuk mengunggah gambar berita.'
  return 'Gambar gagal diunggah. Coba file gambar lain.'
}

export default function AdminNewsManager() {
  const [rows, setRows] = useState<NewsRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editorOpen, setEditorOpen] = useState(false)

  async function load() {
    if (!supabase) { setError('Supabase belum dikonfigurasi.'); setLoading(false); return }
    setLoading(true); setError('')
    const [{ data: news, error: newsError }, { data: cats, error: catError }] = await Promise.all([
      supabase.from('news').select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug').order('name'),
    ])
    if (newsError || catError) {
      setError(getErrorMessage(newsError ?? catError, 'load'))
    } else {
      setRows((news ?? []) as NewsRow[])
      setCategories((cats ?? []) as Category[])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.title} ${item.excerpt} ${item.slug}`.toLowerCase().includes(needle))
  }, [query, rows])

  function openCreate() { setForm({ ...emptyForm }); setEditorOpen(true); setError(''); setSuccess('') }
  function openEdit(row: NewsRow) {
    setForm({ id: row.id, title: row.title, slug: row.slug, excerpt: row.excerpt, content: row.content.join('\n\n'), thumbnailUrl: row.thumbnail_url ?? '', categoryId: row.category_id ?? '', status: row.status === 'published' ? 'published' : 'draft', publishedAt: row.published_at })
    setEditorOpen(true); setError(''); setSuccess('')
  }

  async function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading || saving) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const uploaded = await uploadPublicStorageFile('news-media', file)
      setForm((current) => ({ ...current, thumbnailUrl: uploaded.url }))
      setSuccess('Gambar berhasil diunggah. Klik Simpan berita untuk menyimpan perubahan.')
    } catch (uploadError) {
      setError(storageErrorMessage(uploadError))
    } finally {
      setUploading(false)
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!supabase || saving || uploading) return
    setSaving(true); setError(''); setSuccess('')
    const slug = slugify(form.slug || form.title)
    const paragraphs = form.content.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean)
    if (!form.title.trim() || !slug) { setError('Judul dan slug wajib diisi.'); setSaving(false); return }
    if (!form.excerpt.trim()) { setError('Ringkasan berita wajib diisi.'); setSaving(false); return }
    if (!paragraphs.length) { setError('Isi berita wajib diisi.'); setSaving(false); return }

    const publishedAt = form.status === 'published'
      ? (form.publishedAt ?? new Date().toISOString())
      : null

    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim(),
      content: paragraphs,
      thumbnail_url: form.thumbnailUrl.trim() || null,
      category_id: form.categoryId || null,
      status: form.status,
      published_at: publishedAt,
    }

    const result = form.id
      ? await supabase.from('news').update(payload).eq('id', form.id).select('id')
      : await supabase.from('news').insert(payload).select('id')

    if (result.error) {
      setError(getErrorMessage(result.error, 'save'))
      setSaving(false)
      return
    }

    await load()
    setEditorOpen(false)
    setSuccess(form.id ? 'Berita berhasil diperbarui.' : 'Berita berhasil dibuat.')
    setSaving(false)
  }

  async function remove(row: NewsRow) {
    if (!supabase || deletingId) return
    if (!window.confirm(`Hapus berita “${row.title}”? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(row.id); setError(''); setSuccess('')
    const { error: deleteError } = await supabase.from('news').delete().eq('id', row.id)
    if (deleteError) setError(getErrorMessage(deleteError, 'delete'))
    else { await load(); setSuccess('Berita berhasil dihapus.') }
    setDeletingId(null)
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan berita">
    <div className="admin-module-toolbar">
      <div className="admin-search-wrap"><Search size={17} aria-hidden="true" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul atau slug…" aria-label="Cari berita" /></div>
      <button className="admin-button primary" onClick={openCreate}><FilePlus2 size={17} /> Tulis berita</button>
    </div>

    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {success && <p className="admin-form-success" role="status">{success}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat berita…</div> : filtered.length === 0 ? <div className="admin-table-state"><strong>Tidak ada berita</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat berita pertama.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Berita</th><th>Status</th><th>Diperbarui</th><th aria-label="Aksi" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="admin-table-title"><strong>{row.title}</strong><small>/{row.slug}</small></div></td><td><span className={`admin-status-pill ${row.status}`}>{row.status === 'published' ? 'Published' : row.status === 'draft' ? 'Draft' : 'Archived'}</span></td><td>{formatDate(row.updated_at)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><Edit3 size={16} /></button><button className="admin-icon-button" onClick={() => window.open(sitePath(`/berita/${row.slug}/`), '_blank', 'noopener,noreferrer')} aria-label={`Lihat ${row.title}`}><Eye size={16} /></button><button className="admin-icon-button danger" onClick={() => void remove(row)} disabled={deletingId === row.id} aria-label={`Hapus ${row.title}`}>{deletingId === row.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}</button></div></td></tr>)}</tbody></table></div>}

    {editorOpen && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="news-editor-title"><div className="admin-modal-header"><div><span className="eyebrow">CMS Berita</span><h2 id="news-editor-title">{form.id ? 'Edit berita' : 'Tulis berita'}</h2></div><button className="admin-icon-button" onClick={() => setEditorOpen(false)} aria-label="Tutup" disabled={saving || uploading}><X size={18} /></button></div><form className="admin-editor-form" onSubmit={save}>
      <label><span>Judul</span><input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value, slug: v.id ? v.slug : slugify(e.target.value) }))} required /></label>
      <label><span>Slug</span><input value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: slugify(e.target.value) }))} required /></label>
      <div className="admin-form-grid"><label><span>Kategori</span><select value={form.categoryId} onChange={(e) => setForm((v) => ({ ...v, categoryId: e.target.value }))}><option value="">Tanpa kategori</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label><label><span>Status</span><select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as FormState['status'] }))}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <label><span>Ringkasan</span><textarea rows={3} value={form.excerpt} onChange={(e) => setForm((v) => ({ ...v, excerpt: e.target.value }))} required /></label>
      <label><span>Isi berita</span><textarea rows={12} value={form.content} onChange={(e) => setForm((v) => ({ ...v, content: e.target.value }))} placeholder="Pisahkan paragraf dengan satu baris kosong." required /></label>
      <div className="admin-upload-field"><div className="admin-upload-label"><span>Thumbnail berita</span><small>JPG, PNG, WebP, GIF, SVG · maks. 8 MB</small></div>{form.thumbnailUrl && <div className="admin-upload-preview"><img src={form.thumbnailUrl} alt="Pratinjau thumbnail berita" /><button type="button" className="admin-icon-button" onClick={() => setForm((v) => ({ ...v, thumbnailUrl: '' }))} aria-label="Hapus thumbnail" disabled={saving || uploading}><X size={16} /></button></div>}<label className="admin-file-picker"><ImagePlus size={17} /><span>{uploading ? 'Mengunggah gambar…' : form.thumbnailUrl ? 'Ganti gambar' : 'Pilih gambar dari perangkat'}</span><input type="file" accept="image/*" onChange={(e) => void handleThumbnailChange(e)} disabled={saving || uploading} /></label>{!form.thumbnailUrl && <input type="url" value={form.thumbnailUrl} onChange={(e) => setForm((v) => ({ ...v, thumbnailUrl: e.target.value }))} placeholder="Atau gunakan URL gambar eksternal" aria-label="URL thumbnail alternatif" />}</div>
      <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => setEditorOpen(false)} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : uploading ? <><Loader2 className="spin" size={16} /> Mengunggah…</> : 'Simpan berita'}</button></div></form></div></div>}
  </section>
}
