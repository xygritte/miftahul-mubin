'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Edit3, Eye, FilePlus2, FileUp, ImagePlus, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'
import { articleDocumentHasContent, emptyArticleDocument, newsContentToArticleDocument } from '@/lib/data/articleDocumentLegacy'
import { uploadPublicStorageFile } from '@/lib/supabase/storage'
import type { ArticleDocument } from '@/types/article-document'
import ArticleContentRenderer from '@/components/content/ArticleContentRenderer'
import RichArticleEditor from '@/components/admin/RichArticleEditor'
import { importDocxArticle, replaceImportedImageSources } from '@/lib/data/articleDocx'

type NewsListRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
}

type NewsDetailRow = NewsListRow & { content: unknown }
type Category = { id: string; name: string; slug: string }
type EditorMode = 'edit' | 'preview'

type FormState = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: ArticleDocument
  thumbnailUrl: string
  categoryId: string
  status: 'draft' | 'published'
  publishedAt: string | null
}

const newForm = (): FormState => ({ title: '', slug: '', excerpt: '', content: emptyArticleDocument(), thumbnailUrl: '', categoryId: '', status: 'draft', publishedAt: null })

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
  if (message.includes('Tipe file') || message.includes('Ukuran file')) return message
  if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('permission')) return 'Akun tidak memiliki izin untuk mengunggah gambar berita.'
  return 'Gambar gagal diunggah. Coba file gambar lain.'
}

function formSignature(form: FormState) {
  return JSON.stringify(form)
}

export default function AdminNewsManager() {
  const [rows, setRows] = useState<NewsListRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<FormState>(newForm)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('edit')
  const [initialForm, setInitialForm] = useState('')
  const docxRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    setError('')
    const [{ data: news, error: newsError }, { data: cats, error: catError }] = await Promise.all([
      supabase.from('news').select('id,title,slug,excerpt,thumbnail_url,category_id,status,published_at,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug').order('name'),
    ])
    if (newsError || catError) setError(getErrorMessage(newsError ?? catError, 'load'))
    else {
      setRows((news ?? []) as NewsListRow[])
      setCategories((cats ?? []) as Category[])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? rows.filter((item) => `${item.title} ${item.excerpt} ${item.slug}`.toLowerCase().includes(needle)) : rows
  }, [query, rows])
  const hasUnsavedChanges = editorOpen && initialForm !== formSignature(form)

  function openCreate() {
    const next = newForm()
    setForm(next)
    setInitialForm(formSignature(next))
    setEditorMode('edit')
    setEditorOpen(true)
    setError('')
    setSuccess('')
  }

  function closeEditor() {
    if (!saving && !uploading && hasUnsavedChanges && !window.confirm('Ada perubahan yang belum disimpan. Tutup editor?')) return
    setEditorOpen(false)
    setEditorMode('edit')
  }

  async function openEdit(row: NewsListRow) {
    if (loadingEditId) return
    setLoadingEditId(row.id)
    setError('')
    setSuccess('')
    const { data, error: detailError } = await supabase
      .from('news')
      .select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,created_at,updated_at')
      .eq('id', row.id)
      .single()
    if (detailError) {
      setError(getErrorMessage(detailError, 'load'))
      setLoadingEditId(null)
      return
    }
    const detail = data as NewsDetailRow
    const next: FormState = {
      id: detail.id,
      title: detail.title,
      slug: detail.slug,
      excerpt: detail.excerpt,
      content: newsContentToArticleDocument(detail.content),
      thumbnailUrl: detail.thumbnail_url ?? '',
      categoryId: detail.category_id ?? '',
      status: detail.status === 'published' ? 'published' : 'draft',
      publishedAt: detail.published_at,
    }
    setForm(next)
    setInitialForm(formSignature(next))
    setEditorMode('edit')
    setEditorOpen(true)
    setLoadingEditId(null)
  }

  async function uploadImage(file: File) {
    try {
      const uploaded = await uploadPublicStorageFile('news-media', file)
      return uploaded.url
    } catch (uploadError) {
      throw new Error(storageErrorMessage(uploadError))
    }
  }

  async function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading || saving) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(file)
      setForm((current) => ({ ...current, thumbnailUrl: url }))
      setSuccess('Thumbnail berhasil diunggah. Simpan berita untuk menerapkan perubahan.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Gambar gagal diunggah.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDocxImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || saving || uploading) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const result = await importDocxArticle(file)
      const sources: Record<string, string> = {}
      for (const image of result.images) sources[`docx:${image.id}`] = await uploadImage(image.file)
      const content = replaceImportedImageSources(result.document, sources)
      setForm((current) => ({ ...current, content }))
      setEditorMode('edit')
      const warning = result.warnings.length ? ` ${result.warnings.join(' ')}` : ''
      setSuccess(`DOCX diimpor: ${content.content.length} blok konten dan ${result.images.length} gambar.${warning}`)
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'DOCX gagal diimpor.')
    } finally {
      setUploading(false)
    }
  }

  async function persist(status: FormState['status']) {
    if (saving || uploading) return
    const slug = slugify(form.slug || form.title)
    if (!form.title.trim() || !slug) { setError('Judul dan slug wajib diisi.'); return }
    if (!form.excerpt.trim()) { setError('Ringkasan berita wajib diisi.'); return }
    if (!articleDocumentHasContent(form.content)) { setError('Isi berita wajib diisi.'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    const publishedAt = status === 'published' ? (form.publishedAt ?? new Date().toISOString()) : null
    const payload = {
      title: form.title.trim(), slug, excerpt: form.excerpt.trim(), content: form.content,
      thumbnail_url: form.thumbnailUrl.trim() || null, category_id: form.categoryId || null,
      status, published_at: publishedAt,
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
    setEditorMode('edit')
    setSuccess(status === 'published' ? 'Berita berhasil diterbitkan.' : form.id ? 'Draft berita berhasil diperbarui.' : 'Draft berita berhasil disimpan.')
    setSaving(false)
  }

  async function remove(row: NewsListRow) {
    if (deletingId) return
    if (!window.confirm(`Hapus berita “${row.title}”? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(row.id)
    setError('')
    setSuccess('')
    const { error: deleteError } = await supabase.from('news').delete().eq('id', row.id)
    if (deleteError) setError(getErrorMessage(deleteError, 'delete'))
    else { await load(); setSuccess('Berita berhasil dihapus.') }
    setDeletingId(null)
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan berita">
    <div className="admin-module-toolbar">
      <div className="admin-search-wrap"><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau slug…" aria-label="Cari berita" /></div>
      <button className="admin-button primary" onClick={openCreate}><FilePlus2 size={17} /> Tulis berita</button>
    </div>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {success && <p className="admin-form-success" role="status">{success}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat berita…</div> : filtered.length === 0 ? <div className="admin-table-state"><strong>Tidak ada berita</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat berita pertama.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Berita</th><th>Status</th><th>Diperbarui</th><th aria-label="Aksi" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="admin-table-title"><strong>{row.title}</strong><small>/{row.slug}</small></div></td><td><span className={`admin-status-pill ${row.status}`}>{row.status === 'published' ? 'Published' : row.status === 'draft' ? 'Draft' : 'Archived'}</span></td><td>{formatDate(row.updated_at)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => void openEdit(row)} disabled={loadingEditId === row.id} aria-label={`Edit ${row.title}`}>{loadingEditId === row.id ? <Loader2 className="spin" size={16} /> : <Edit3 size={16} />}</button><button className="admin-icon-button" onClick={() => window.open(sitePath(`/berita/${row.slug}/`), '_blank', 'noopener,noreferrer')} aria-label={`Lihat ${row.title}`}><Eye size={16} /></button><button className="admin-icon-button danger" onClick={() => void remove(row)} disabled={deletingId === row.id} aria-label={`Hapus ${row.title}`}>{deletingId === row.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}</button></div></td></tr>)}</tbody></table></div>}
    {editorOpen && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal admin-news-editor-modal" role="dialog" aria-modal="true" aria-labelledby="news-editor-title"><div className="admin-modal-header"><div><span className="eyebrow">CMS Berita</span><h2 id="news-editor-title">{form.id ? 'Edit berita' : 'Tulis berita'}</h2></div><button className="admin-icon-button" onClick={closeEditor} aria-label="Tutup" disabled={saving || uploading}><X size={18} /></button></div><form className="admin-editor-form" onSubmit={(event) => { event.preventDefault(); void persist(form.status) }}>
      <label><span>Judul</span><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value, slug: current.id ? current.slug : slugify(event.target.value) }))} required /></label>
      <label><span>Slug</span><input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} required /></label>
      <div className="admin-form-grid"><label><span>Kategori</span><select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span>Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FormState['status'] }))}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <label><span>Ringkasan</span><textarea rows={3} value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} required /></label>
      <section className="admin-article-field"><div className="admin-article-field-heading"><div><span>Isi berita</span><small>Konten tersimpan sebagai dokumen terstruktur dan tampil sama di halaman publik.</small></div><div className="admin-article-heading-actions"><button type="button" className="admin-import-docx" onClick={() => docxRef.current?.click()} disabled={saving || uploading}><FileUp size={15} /> {uploading ? 'Memproses…' : 'Impor DOCX'}</button><input ref={docxRef} className="sr-only" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" onChange={(event) => void handleDocxImport(event)} /><div className="admin-editor-mode" role="tablist" aria-label="Mode editor"><button type="button" role="tab" aria-selected={editorMode === 'edit'} className={editorMode === 'edit' ? 'active' : ''} onClick={() => setEditorMode('edit')}>Edit</button><button type="button" role="tab" aria-selected={editorMode === 'preview'} className={editorMode === 'preview' ? 'active' : ''} onClick={() => setEditorMode('preview')}>Pratinjau</button></div></div></div>{editorMode === 'edit' ? <RichArticleEditor value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} onUploadImage={uploadImage} onUploadStateChange={setUploading} disabled={saving} /> : <div className="admin-article-preview"><span className="eyebrow">Pratinjau publik</span><h3>{form.title || 'Judul berita'}</h3><p>{form.excerpt || 'Ringkasan berita akan tampil di sini.'}</p><ArticleContentRenderer document={form.content} /></div>}</section>
      <div className="admin-upload-field"><div className="admin-upload-label"><span>Thumbnail berita</span><small>JPG, PNG, WebP, GIF, SVG · maks. 8 MB</small></div>{form.thumbnailUrl && <div className="admin-upload-preview"><img src={form.thumbnailUrl} alt="Pratinjau thumbnail berita" /><button type="button" className="admin-icon-button" onClick={() => setForm((current) => ({ ...current, thumbnailUrl: '' }))} aria-label="Hapus thumbnail" disabled={saving || uploading}><X size={16} /></button></div>}<label className="admin-file-picker"><ImagePlus size={17} /><span>{uploading ? 'Mengunggah gambar…' : form.thumbnailUrl ? 'Ganti gambar' : 'Pilih gambar dari perangkat'}</span><input type="file" accept="image/*" onChange={(event) => void handleThumbnailChange(event)} disabled={saving || uploading} /></label>{!form.thumbnailUrl && <input type="url" value={form.thumbnailUrl} onChange={(event) => setForm((current) => ({ ...current, thumbnailUrl: event.target.value }))} placeholder="Atau gunakan URL gambar eksternal" aria-label="URL thumbnail alternatif" />}</div>
      <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={closeEditor} disabled={saving || uploading}>Batal</button><button type="button" className="admin-button secondary" onClick={() => void persist('draft')} disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : 'Simpan draft'}</button><button type="button" className="admin-button primary" onClick={() => void persist('published')} disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : 'Terbitkan berita'}</button></div>
    </form></div></div>}
  </section>
}
