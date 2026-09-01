'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Edit3, Eye, FilePlus2, ImagePlus, Loader2, Search, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'
import { uploadPublicStorageFile } from '@/lib/supabase/storage'

type Album = { id: string; title: string; slug: string; description: string | null; cover_url: string | null; created_at: string; updated_at: string }
type Media = { id: string; album_id: string; type: 'image' | 'video'; title: string | null; url: string; thumbnail_url: string | null; caption: string | null; sort_order: number; created_at: string }
type AlbumForm = { id?: string; title: string; slug: string; description: string; coverUrl: string }
type MediaForm = { id?: string; albumId: string; type: 'image' | 'video'; title: string; url: string; thumbnailUrl: string; caption: string; sortOrder: number }

const emptyAlbum: AlbumForm = { title: '', slug: '', description: '', coverUrl: '' }
const emptyMedia: MediaForm = { albumId: '', type: 'image', title: '', url: '', thumbnailUrl: '', caption: '', sortOrder: 0 }

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') }
function dateLabel(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date) }
function errorMessage(error: { code?: string; message?: string } | null, label: string) {
  if (!error) return ''
  if (error.code === '42501') return `Akun tidak memiliki izin untuk mengelola ${label}.`
  if (error.code === '23505') return 'Slug atau data unik tersebut sudah digunakan.'
  if (error.code === '23503') return 'Relasi data tidak valid. Pilih album yang masih tersedia.'
  return `${label} gagal diproses.`
}
function storageError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  if (message.includes('tipe file') || message.includes('ukuran file')) return error instanceof Error ? error.message : 'File tidak valid.'
  if (message.includes('permission') || message.includes('row-level security')) return 'Akun tidak memiliki izin untuk mengunggah media dokumentasi.'
  return 'Media gagal diunggah.'
}

export default function AdminDocumentationManager() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [albumQuery, setAlbumQuery] = useState('')
  const [mediaQuery, setMediaQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [albumEditor, setAlbumEditor] = useState<AlbumForm | false>(false)
  const [mediaEditor, setMediaEditor] = useState<MediaForm | false>(false)

  async function loadAlbums() {
    const { data, error: queryError } = await supabase.from('media_albums').select('id,title,slug,description,cover_url,created_at,updated_at').order('created_at', { ascending: false })
    if (queryError) { setError(errorMessage(queryError, 'album')); return }
    const next = (data ?? []) as Album[]
    setAlbums(next)
    setSelectedAlbumId((current) => current && next.some((album) => album.id === current) ? current : next[0]?.id ?? '')
  }

  async function loadMedia(albumId = selectedAlbumId) {
    if (!albumId) { setMedia([]); return }
    const { data, error: queryError } = await supabase.from('media_items').select('id,album_id,type,title,url,thumbnail_url,caption,sort_order,created_at').eq('album_id', albumId).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
    if (queryError) { setError(errorMessage(queryError, 'media')); return }
    setMedia((data ?? []) as Media[])
  }

  async function load() {
    setLoading(true); setError('')
    await loadAlbums()
    setLoading(false)
  }

  useEffect(() => { void load() }, [])
  useEffect(() => { void loadMedia(selectedAlbumId) }, [selectedAlbumId])

  const filteredAlbums = useMemo(() => {
    const q = albumQuery.trim().toLowerCase()
    return !q ? albums : albums.filter((album) => `${album.title} ${album.slug} ${album.description ?? ''}`.toLowerCase().includes(q))
  }, [albums, albumQuery])
  const filteredMedia = useMemo(() => {
    const q = mediaQuery.trim().toLowerCase()
    return !q ? media : media.filter((item) => `${item.title ?? ''} ${item.caption ?? ''} ${item.type}`.toLowerCase().includes(q))
  }, [media, mediaQuery])

  function openCreateAlbum() { setAlbumEditor({ ...emptyAlbum }); setError(''); setSuccess('') }
  function openEditAlbum(album: Album) { setAlbumEditor({ id: album.id, title: album.title, slug: album.slug, description: album.description ?? '', coverUrl: album.cover_url ?? '' }); setError(''); setSuccess('') }
  function openCreateMedia() { if (!selectedAlbumId) { setError('Pilih album terlebih dahulu.'); return }; setMediaEditor({ ...emptyMedia, albumId: selectedAlbumId, sortOrder: media.length }); setError(''); setSuccess('') }
  function openEditMedia(item: Media) { setMediaEditor({ id: item.id, albumId: item.album_id, type: item.type, title: item.title ?? '', url: item.url, thumbnailUrl: item.thumbnail_url ?? '', caption: item.caption ?? '', sortOrder: item.sort_order }); setError(''); setSuccess('') }

  async function handleAlbumCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file || !albumEditor || uploading || saving) return
    setUploading(true); setError(''); setSuccess('')
    try { const uploaded = await uploadPublicStorageFile('gallery-media', file); setAlbumEditor((current) => current && ({ ...current, coverUrl: uploaded.url })); setSuccess('Cover album berhasil diunggah.') }
    catch (uploadError) { setError(storageError(uploadError)) }
    finally { setUploading(false) }
  }

  async function handleMediaFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file || !mediaEditor || uploading || saving) return
    setUploading(true); setError(''); setSuccess('')
    try { const uploaded = await uploadPublicStorageFile('gallery-media', file); setMediaEditor((current) => current && ({ ...current, url: uploaded.url, thumbnailUrl: current.type === 'image' ? uploaded.url : current.thumbnailUrl })) ; setSuccess('Media berhasil diunggah.') }
    catch (uploadError) { setError(storageError(uploadError)) }
    finally { setUploading(false) }
  }

  async function saveAlbum(event: FormEvent) {
    event.preventDefault(); if (!albumEditor || saving || uploading) return
    const title = albumEditor.title.trim(); const slug = slugify(albumEditor.slug || albumEditor.title)
    if (!title || !slug) { setError('Nama album dan slug wajib diisi.'); return }
    setSaving(true); setError(''); setSuccess('')
    const payload = { title, slug, description: albumEditor.description.trim() || null, cover_url: albumEditor.coverUrl.trim() || null }
    const result = albumEditor.id ? await supabase.from('media_albums').update(payload).eq('id', albumEditor.id) : await supabase.from('media_albums').insert(payload)
    if (result.error) setError(errorMessage(result.error, 'album'))
    else { await loadAlbums(); setAlbumEditor(false); setSuccess(albumEditor.id ? 'Album berhasil diperbarui.' : 'Album berhasil dibuat.') }
    setSaving(false)
  }

  async function saveMedia(event: FormEvent) {
    event.preventDefault(); if (!mediaEditor || saving || uploading) return
    if (!mediaEditor.albumId) { setError('Album wajib dipilih.'); return }
    if (!mediaEditor.url.trim()) { setError('File atau URL media wajib diisi.'); return }
    setSaving(true); setError(''); setSuccess('')
    const payload = { album_id: mediaEditor.albumId, type: mediaEditor.type, title: mediaEditor.title.trim() || null, url: mediaEditor.url.trim(), thumbnail_url: mediaEditor.thumbnailUrl.trim() || null, caption: mediaEditor.caption.trim() || null, sort_order: Number.isFinite(mediaEditor.sortOrder) ? Math.max(0, mediaEditor.sortOrder) : 0 }
    const result = mediaEditor.id ? await supabase.from('media_items').update(payload).eq('id', mediaEditor.id) : await supabase.from('media_items').insert(payload)
    if (result.error) setError(errorMessage(result.error, 'media'))
    else { setSelectedAlbumId(mediaEditor.albumId); await loadMedia(mediaEditor.albumId); setMediaEditor(false); setSuccess(mediaEditor.id ? 'Media berhasil diperbarui.' : 'Media berhasil ditambahkan.') }
    setSaving(false)
  }

  async function removeAlbum(album: Album) {
    if (deletingId) return; if (!window.confirm(`Hapus album “${album.title}” beserta media di dalamnya?`)) return
    setDeletingId(album.id); setError(''); setSuccess('')
    const { error: deleteError } = await supabase.from('media_albums').delete().eq('id', album.id)
    if (deleteError) setError(errorMessage(deleteError, 'album'))
    else { await loadAlbums(); setMedia([]); setSuccess('Album berhasil dihapus.') }
    setDeletingId(null)
  }

  async function removeMedia(item: Media) {
    if (deletingId) return; if (!window.confirm(`Hapus media “${item.title || item.url}”?`)) return
    setDeletingId(item.id); setError(''); setSuccess('')
    const { error: deleteError } = await supabase.from('media_items').delete().eq('id', item.id)
    if (deleteError) setError(errorMessage(deleteError, 'media'))
    else { await loadMedia(item.album_id); setSuccess('Media berhasil dihapus.') }
    setDeletingId(null)
  }

  return <section className="admin-news-manager" aria-label="Pengelolaan dokumentasi">
    <div className="admin-module-toolbar"><div className="admin-search-wrap"><Search size={17}/><input value={albumQuery} onChange={(e) => setAlbumQuery(e.target.value)} placeholder="Cari album…" aria-label="Cari album"/></div><button className="admin-button primary" onClick={openCreateAlbum}><FilePlus2 size={17}/> Tambah album</button></div>
    {error && <p className="admin-form-error" role="alert">{error}</p>}{success && <p className="admin-form-success" role="status">{success}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20}/> Memuat dokumentasi…</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Album</th><th>Slug</th><th>Cover</th><th>Diperbarui</th><th/></tr></thead><tbody>{filteredAlbums.map((album) => <tr key={album.id}><td><button className="admin-button secondary" onClick={() => setSelectedAlbumId(album.id)}>{album.title}</button></td><td>/{album.slug}</td><td>{album.cover_url ? 'Ada' : '—'}</td><td>{dateLabel(album.updated_at)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEditAlbum(album)} aria-label={`Edit ${album.title}`}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={() => void removeAlbum(album)} disabled={deletingId === album.id} aria-label={`Hapus ${album.title}`}>{deletingId === album.id ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>}

    <div className="admin-module-toolbar"><div><strong>Media</strong><span> · {albums.find((album) => album.id === selectedAlbumId)?.title || 'Pilih album'}</span></div><div className="admin-row-actions"><div className="admin-search-wrap"><Search size={17}/><input value={mediaQuery} onChange={(e) => setMediaQuery(e.target.value)} placeholder="Cari media…" aria-label="Cari media"/></div><button className="admin-button primary" onClick={openCreateMedia} disabled={!selectedAlbumId}><FilePlus2 size={17}/> Tambah media</button></div></div>
    {!selectedAlbumId ? <div className="admin-table-state">Pilih album untuk mengelola media.</div> : filteredMedia.length === 0 ? <div className="admin-table-state"><strong>Belum ada media</strong><span>Tambahkan foto atau video ke album ini.</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Media</th><th>Tipe</th><th>Urutan</th><th>Dibuat</th><th/></tr></thead><tbody>{filteredMedia.map((item) => <tr key={item.id}><td><div className="admin-table-title"><strong>{item.title || 'Tanpa judul'}</strong><small>{item.caption || item.url}</small></div></td><td>{item.type}</td><td>{item.sort_order}</td><td>{dateLabel(item.created_at)}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEditMedia(item)} aria-label="Edit media"><Edit3 size={16}/></button><button className="admin-icon-button" onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')} aria-label="Buka media"><Eye size={16}/></button><button className="admin-icon-button danger" onClick={() => void removeMedia(item)} disabled={deletingId === item.id} aria-label="Hapus media">{deletingId === item.id ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>}

    {albumEditor && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="documentation-album-title"><div className="admin-modal-header"><div><span className="eyebrow">Dokumentasi</span><h2 id="documentation-album-title">{albumEditor.id ? 'Edit album' : 'Tambah album'}</h2></div><button className="admin-icon-button" onClick={() => setAlbumEditor(false)} disabled={saving || uploading} aria-label="Tutup"><X size={18}/></button></div><form className="admin-editor-form" onSubmit={saveAlbum}><label><span>Nama album</span><input required value={albumEditor.title} onChange={(e) => setAlbumEditor((v) => v && ({ ...v, title: e.target.value, slug: v.id ? v.slug : slugify(e.target.value) }))}/></label><label><span>Slug</span><input required value={albumEditor.slug} onChange={(e) => setAlbumEditor((v) => v && ({ ...v, slug: slugify(e.target.value) }))}/></label><label><span>Deskripsi</span><textarea rows={4} value={albumEditor.description} onChange={(e) => setAlbumEditor((v) => v && ({ ...v, description: e.target.value }))}/></label><div className="admin-upload-field"><div className="admin-upload-label"><span>Cover album</span><small>Gambar, maksimal 16 MB</small></div>{albumEditor.coverUrl && <div className="admin-upload-preview"><img src={albumEditor.coverUrl} alt="Pratinjau cover album"/><button type="button" className="admin-icon-button" onClick={() => setAlbumEditor((v) => v && ({ ...v, coverUrl: '' }))} disabled={saving || uploading} aria-label="Hapus cover"><X size={16}/></button></div>}<label className="admin-file-picker"><ImagePlus size={17}/><span>{uploading ? 'Mengunggah…' : albumEditor.coverUrl ? 'Ganti cover' : 'Pilih cover dari perangkat'}</span><input type="file" accept="image/*" onChange={(e) => void handleAlbumCover(e)} disabled={saving || uploading}/></label>{!albumEditor.coverUrl && <input type="url" value={albumEditor.coverUrl} onChange={(e) => setAlbumEditor((v) => v && ({ ...v, coverUrl: e.target.value }))} placeholder="Atau URL cover eksternal"/>}</div><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => setAlbumEditor(false)} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16}/> Menyimpan…</> : 'Simpan album'}</button></div></form></div></div>}

    {mediaEditor && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="documentation-media-title"><div className="admin-modal-header"><div><span className="eyebrow">Media Dokumentasi</span><h2 id="documentation-media-title">{mediaEditor.id ? 'Edit media' : 'Tambah media'}</h2></div><button className="admin-icon-button" onClick={() => setMediaEditor(false)} disabled={saving || uploading} aria-label="Tutup"><X size={18}/></button></div><form className="admin-editor-form" onSubmit={saveMedia}><label><span>Album</span><select value={mediaEditor.albumId} onChange={(e) => setMediaEditor((v) => v && ({ ...v, albumId: e.target.value }))}>{albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select></label><label><span>Tipe</span><select value={mediaEditor.type} onChange={(e) => setMediaEditor((v) => v && ({ ...v, type: e.target.value as MediaForm['type'] }))}><option value="image">Gambar</option><option value="video">Video</option></select></label><div className="admin-upload-field"><div className="admin-upload-label"><span>File media</span><small>Gambar/video, maksimal 16 MB</small></div>{mediaEditor.url && mediaEditor.type === 'image' && <div className="admin-upload-preview"><img src={mediaEditor.url} alt="Pratinjau media"/><button type="button" className="admin-icon-button" onClick={() => setMediaEditor((v) => v && ({ ...v, url: '', thumbnailUrl: '' }))} disabled={saving || uploading} aria-label="Hapus file"><X size={16}/></button></div>}<label className="admin-file-picker"><Upload size={17}/><span>{uploading ? 'Mengunggah…' : mediaEditor.url ? 'Ganti file' : 'Pilih file dari perangkat'}</span><input type="file" accept="image/*,video/*" onChange={(e) => void handleMediaFile(e)} disabled={saving || uploading}/></label><input type="url" value={mediaEditor.url} onChange={(e) => setMediaEditor((v) => v && ({ ...v, url: e.target.value }))} placeholder="Atau masukkan URL media" required /></div><label><span>Thumbnail video (opsional)</span><input type="url" value={mediaEditor.thumbnailUrl} onChange={(e) => setMediaEditor((v) => v && ({ ...v, thumbnailUrl: e.target.value }))} placeholder="URL thumbnail video"/></label><label><span>Judul</span><input value={mediaEditor.title} onChange={(e) => setMediaEditor((v) => v && ({ ...v, title: e.target.value }))}/></label><label><span>Caption</span><textarea rows={3} value={mediaEditor.caption} onChange={(e) => setMediaEditor((v) => v && ({ ...v, caption: e.target.value }))}/></label><label><span>Urutan tampil</span><input type="number" min={0} value={mediaEditor.sortOrder} onChange={(e) => setMediaEditor((v) => v && ({ ...v, sortOrder: Number(e.target.value) }))}/></label><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={() => setMediaEditor(false)} disabled={saving || uploading}>Batal</button><button type="submit" className="admin-button primary" disabled={saving || uploading}>{saving ? <><Loader2 className="spin" size={16}/> Menyimpan…</> : 'Simpan media'}</button></div></form></div></div>}
  </section>
}
