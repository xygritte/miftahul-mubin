'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit3, Eye, FilePlus2, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

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
}

const emptyForm: FormState = { title: '', slug: '', excerpt: '', content: '', thumbnailUrl: '', categoryId: '', status: 'draft' }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

export default function AdminNewsManager() {
  const [rows, setRows] = useState<NewsRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editorOpen, setEditorOpen] = useState(false)

  async function load() {
    if (!supabase) { setError('Supabase belum dikonfigurasi.'); setLoading(false); return }
    setLoading(true); setError('')
    const [{ data: news, error: newsError }, { data: cats, error: catError }] = await Promise.all([
      supabase.from('news').select('id,title,slug,excerpt,content,thumbnail_url,category_id,status,published_at,created_at,updated_at').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug').order('name'),
    ])
    if (newsError || catError) setError('Data berita gagal dimuat. Pastikan akun memiliki hak akses pengelola.')
    setRows((news ?? []) as NewsRow[]); setCategories((cats ?? []) as Category[]); setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((item) => `${item.title} ${item.excerpt} ${item.slug}`.toLowerCase().includes(needle))
  }, [query, rows])

  function openCreate() { setForm(emptyForm); setEditorOpen(true); setError('') }
  function openEdit(row: NewsRow) {
    setForm({ id: row.id, title: row.title, slug: row.slug, excerpt: row.excerpt, content: row.content.join('\n\n'), thumbnailUrl: row.thumbnail_url ?? '', categoryId: row.category_id ?? '', status: row.status === 'published' ? 'published' : 'draft' })
    setEditorOpen(true); setError('')
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!supabase || saving) return
    setSaving(true); setError('')
    const slug = slugify(form.slug || form.title)
    if (!form.title.trim() || !slug) { setError('Judul dan slug wajib diisi.'); setSaving(false); return }
    const payload = {
      title: form.title.trim(), slug, excerpt: form.excerpt.trim(),
      content: form.content.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean),
      thumbnail_url: form.thumbnailUrl.trim() || null,
      category_id: form.categoryId || null,
      status: form.status,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    }
    const result = form.id
      ? await supabase.from('news').update(payload).eq('id', form.id)
      : await supabase.from('news').insert(payload)
    if (result.error) setError(result.error.code === '23505' ? 'Slug sudah digunakan. Gunakan slug yang berbeda.' : 'Berita gagal disimpan.')
    else { setEditorOpen(false); await load() }
    setSaving(false)
  }

  async function remove(row: NewsRow) {
    if (!supabase || !window.confirm(`Hapus berita “${row.title}”?`)) return
    const { error: deleteError } = await supabase.from('news').delete().eq('id', row.id)
    if (deleteError) setError('Berita gagal dihapus.')
    else await load()
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan berita">
    <div className="admin-module-toolbar">
      <div className="admin-search-wrap"><Search size={17} aria-hidden="true" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul atau slug…" aria-label="Cari berita" /></div>
      <button className="admin-button primary" onClick={openCreate}><FilePlus2 size={17} /> Tulis berita</button>
    </div>

    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat berita…</div> : filtered.length === 0 ? <div className="admin-table-state"><strong>Tidak ada berita</strong><span>{query ? 'Coba kata kunci lain.' : 'Mulai dengan membuat berita pertama.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Berita</th><th>Status</th><th>Diperbarui</th><th aria-label="Aksi" /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="admin-table-title"><strong>{row.title}</strong><small>/{row.slug}</small></div></td><td><span className={`admin-status-pill ${row.status}`}>{row.status === 'published' ? 'Published' : 'Draft'}</span></td><td>{formatDate(row.updated_at)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><Edit3 size={16} /></button><button className="admin-icon-button" onClick={() => window.open(`/berita/${row.slug}/`, '_blank', 'noopener,noreferrer')} aria-label={`Lihat ${row.title}`}><Eye size={16} /></button><button className="admin-icon-button danger" onClick={() => remove(row)} aria-label={`Hapus ${row.title}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}

    {editorOpen && <div className="admin-modal-backdrop" role="presentation"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="news-editor-title"><div className="admin-modal-header"><div><span className="eyebrow">CMS Berita</span><h2 id="news-editor-title">{form.id ? 'Edit berita' : 'Tulis berita'}</h2></div><button className="admin-icon-button" onClick={() => setEditorOpen(false)} aria-label="Tutup"><X size={18} /></button></div><form className="admin-editor-form" onSubmit={save}><label><span>Judul</span><input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value, slug: v.id ? v.slug : slugify(e.target.value) }))} required /></label><label><span>Slug</span><input value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: slugify(e.target.value) }))} required /></label><div className="admin-form-grid"><label><span>Kategori</span><select value={form.categoryId} onChange={(e) => setForm((v) => ({ ...v, categoryId: e.target.value }))}><option value="">Tanpa kategori</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label><label><span>Status</span><select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as FormState['status'] }))}><option value="draft">Draft</option><option value="published">Published</option></select></label></div><label><span>Ringkasan</span><textarea rows={3} value={form.excerpt} onChange={(e) => setForm((v) => ({ ...v, excerpt: e.target.value }))} /></label><label><span>Isi berita</span><textarea rows={12} value={form.content} onChange={(e) => setForm((v) => ({ ...v, content: e.target.value }))} placeholder="Pisahkan paragraf dengan satu baris kosong." required /></label><label><span>URL thumbnail</span><input type="url" value={form.thumbnailUrl} onChange={(e) => setForm((v) => ({ ...v, thumbnailUrl: e.target.value }))} placeholder="https://…" /></label><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => setEditorOpen(false)}>Batal</button><button type="submit" className="admin-button primary" disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : 'Simpan berita'}</button></div></form></div></div>}
  </section>
}
