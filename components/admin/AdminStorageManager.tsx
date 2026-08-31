'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, ExternalLink, FileUp, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { acceptsMime, createStoragePath, privateStorageUrl, publicStorageUrl, STORAGE_BUCKETS, type StorageBucket } from '@/lib/supabase/storage'

type FileRow = {
  name: string
  id: string | null
  created_at: string | null
  updated_at: string | null
  metadata: Record<string, unknown> | null
}

type RoleName = 'super_admin' | 'admin' | 'editor' | 'secretary' | 'treasurer'

const bucketRoles: Record<StorageBucket, RoleName[]> = {
  'site-assets': ['super_admin', 'admin', 'editor'],
  avatars: ['super_admin', 'admin', 'editor', 'secretary'],
  'news-media': ['super_admin', 'admin', 'editor'],
  'event-media': ['super_admin', 'admin', 'editor'],
  'management-media': ['super_admin', 'admin', 'secretary'],
  'gallery-media': ['super_admin', 'admin', 'editor'],
  'finance-proofs': ['super_admin', 'admin', 'treasurer'],
}

function roleCanUse(bucket: StorageBucket, roles: Set<string>) {
  return bucketRoles[bucket].some((role) => roles.has(role))
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminStorageManager() {
  const [roles, setRoles] = useState<Set<string>>(new Set())
  const [bucket, setBucket] = useState<StorageBucket>('news-media')
  const [files, setFiles] = useState<FileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState('')

  const availableBuckets = useMemo(
    () => (Object.keys(STORAGE_BUCKETS) as StorageBucket[]).filter((item) => roleCanUse(item, roles)),
    [roles],
  )

  useEffect(() => {
    async function loadRoles() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setError('Sesi pengelola tidak ditemukan.')
        setLoading(false)
        return
      }
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userData.user.id)
      if (roleError) {
        setError('Role pengelola gagal dimuat.')
        setLoading(false)
        return
      }
      const nextRoles = new Set<string>()
      for (const row of data ?? []) {
        const role = Array.isArray((row as { roles?: unknown }).roles)
          ? (row as { roles: Array<{ name?: string }> }).roles[0]
          : (row as { roles?: { name?: string } }).roles
        if (role?.name) nextRoles.add(role.name)
      }
      setRoles(nextRoles)
      const first = (Object.keys(STORAGE_BUCKETS) as StorageBucket[]).find((item) => roleCanUse(item, nextRoles))
      if (first) setBucket(first)
      else setError('Akun tidak memiliki akses Storage.')
      setLoading(false)
    }
    void loadRoles()
  }, [])

  async function loadFiles() {
    setLoading(true)
    setError('')
    const { data, error: listError } = await supabase.storage.from(bucket).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (listError) setError(`Daftar file gagal dimuat: ${listError.message}`)
    else setFiles((data ?? []) as FileRow[])
    setLoading(false)
  }

  useEffect(() => {
    if (roles.size && roleCanUse(bucket, roles)) void loadFiles()
  }, [bucket, roles])

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading) return
    setError('')
    setSuccess('')
    const config = STORAGE_BUCKETS[bucket]
    if (file.size > config.maxBytes) {
      setError(`File terlalu besar. Maksimal ${formatBytes(config.maxBytes)}.`)
      return
    }
    if (!acceptsMime(bucket, file.type)) {
      setError(`Format ${file.type || 'file'} tidak diizinkan untuk ${config.label}.`)
      return
    }

    setUploading(true)
    const path = createStoragePath(file)
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (uploadError) {
      setError(`Upload gagal: ${uploadError.message}`)
    } else {
      setSuccess(`File berhasil diunggah: ${path}`)
      await loadFiles()
    }
    setUploading(false)
  }

  async function copyValue(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(value)
    window.setTimeout(() => setCopied(''), 1600)
  }

  async function getOpenUrl(path: string) {
    if (STORAGE_BUCKETS[bucket].public) return publicStorageUrl(bucket, path)
    return privateStorageUrl(bucket, path)
  }

  async function remove(path: string) {
    if (removing) return
    if (!window.confirm(`Hapus file “${path}”? File yang dihapus tidak dapat dipulihkan.`)) return
    setRemoving(path)
    setError('')
    const { error: removeError } = await supabase.storage.from(bucket).remove([path])
    if (removeError) setError(`File gagal dihapus: ${removeError.message}`)
    else {
      setSuccess('File berhasil dihapus.')
      await loadFiles()
    }
    setRemoving(null)
  }

  if (loading && !roles.size) {
    return <div className="admin-table-state"><Loader2 className="spin" size={20} /> Menyiapkan Storage…</div>
  }

  return <section className="admin-storage-manager">
    <div className="admin-storage-toolbar">
      <label className="admin-storage-bucket"><span>Bucket</span><select value={bucket} onChange={(event) => setBucket(event.target.value as StorageBucket)}>{availableBuckets.map((item) => <option key={item} value={item}>{STORAGE_BUCKETS[item].label}{STORAGE_BUCKETS[item].public ? ' · Public' : ' · Private'}</option>)}</select></label>
      <label className="admin-button primary admin-upload-button"><FileUp size={17} /> {uploading ? 'Mengunggah…' : 'Upload file'}<input type="file" accept={STORAGE_BUCKETS[bucket].accepted.join(',')} onChange={upload} disabled={uploading} /></label>
    </div>

    <div className="admin-storage-note"><strong>{STORAGE_BUCKETS[bucket].label}</strong><p>Maksimal {formatBytes(STORAGE_BUCKETS[bucket].maxBytes)} · {STORAGE_BUCKETS[bucket].accepted.join(', ')} · {STORAGE_BUCKETS[bucket].public ? 'URL publik dapat digunakan langsung pada CMS.' : 'Bucket private menggunakan signed URL; simpan path pada data transaksi.'}</p></div>

    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {success && <p className="admin-form-success" role="status">{success}</p>}

    {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat file…</div> : files.length === 0 ? <div className="admin-table-state"><strong>Belum ada file di bucket ini.</strong><span>Upload file untuk mulai memakai Supabase Storage.</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>File</th><th>Ukuran</th><th>Dibuat</th><th aria-label="Aksi" /></tr></thead><tbody>{files.map((file) => { const size = Number((file.metadata as { size?: string | number } | null)?.size ?? 0); return <tr key={file.id ?? file.name}><td><div className="admin-table-title"><strong>{file.name}</strong><small>{STORAGE_BUCKETS[bucket].public ? publicStorageUrl(bucket, file.name) : 'Private object'}</small></div></td><td>{size ? formatBytes(size) : '—'}</td><td>{file.created_at ? new Intl.DateTimeFormat('id-ID',{dateStyle:'medium'}).format(new Date(file.created_at)) : '—'}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => void copyValue(file.name)} aria-label="Salin path">{copied === file.name ? <Check size={16}/> : <Clipboard size={16}/>}</button><button className="admin-icon-button" onClick={async () => { try { const url = await getOpenUrl(file.name); window.open(url, '_blank', 'noopener,noreferrer') } catch (e) { setError(e instanceof Error ? e.message : 'URL file gagal dibuat.') } }} aria-label="Buka file"><ExternalLink size={16}/></button><button className="admin-icon-button danger" disabled={removing === file.name} onClick={() => void remove(file.name)} aria-label="Hapus file">{removing === file.name ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr> })}</tbody></table></div>}
  </section>
}
