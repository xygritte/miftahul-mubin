'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, ExternalLink, FileUp, Loader2, Search, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  privateStorageUrl,
  removeStorageFile,
  STORAGE_BUCKETS,
  uploadStorageFile,
  type StorageBucket,
} from '@/lib/supabase/storage'

type RoleName = 'super_admin' | 'admin' | 'editor' | 'secretary' | 'treasurer'
type FileRow = {
  name: string
  id: string | null
  created_at: string | null
  updated_at: string | null
  metadata: Record<string, unknown> | null
}

const bucketRoles: Record<StorageBucket, RoleName[]> = {
  'site-assets': ['super_admin', 'admin', 'editor'],
  avatars: ['super_admin', 'admin', 'editor', 'secretary'],
  'news-media': ['super_admin', 'admin', 'editor'],
  'event-media': ['super_admin', 'admin', 'editor'],
  'management-media': ['super_admin', 'admin', 'secretary'],
  'gallery-media': ['super_admin', 'admin', 'editor'],
  'finance-proofs': ['super_admin', 'admin', 'treasurer'],
}

function canUseBucket(bucket: StorageBucket, roles: Set<string>) {
  return bucketRoles[bucket].some((role) => roles.has(role))
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function storageErrorMessage(error: unknown, action: 'list' | 'upload' | 'delete' | 'open') {
  const message = error instanceof Error ? error.message : ''
  if (/permission|not authorized|forbidden|row-level security|42501/i.test(message)) {
    return 'Akun tidak memiliki izin untuk operasi Storage pada bucket ini.'
  }
  if (action === 'list') return 'Daftar file gagal dimuat.'
  if (action === 'upload') return message || 'Upload file gagal.'
  if (action === 'delete') return message || 'File gagal dihapus.'
  return message || 'File gagal dibuka.'
}

export default function AdminStorageManager() {
  const [roles, setRoles] = useState<Set<string>>(new Set())
  const [bucket, setBucket] = useState<StorageBucket>('news-media')
  const [files, setFiles] = useState<FileRow[]>([])
  const [query, setQuery] = useState('')
  const [rolesLoading, setRolesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState('')

  const availableBuckets = useMemo(
    () => (Object.keys(STORAGE_BUCKETS) as StorageBucket[]).filter((item) => canUseBucket(item, roles)),
    [roles],
  )

  const filteredFiles = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return files
    return files.filter((file) => file.name.toLowerCase().includes(needle))
  }, [files, query])

  useEffect(() => {
    let active = true
    async function loadRoles() {
      setRolesLoading(true)
      setError('')
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        if (active) {
          setError('Sesi pengelola tidak ditemukan. Silakan masuk kembali.')
          setRolesLoading(false)
        }
        return
      }

      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userData.user.id)

      if (roleError) {
        if (active) {
          setError('Role pengelola gagal dimuat.')
          setRolesLoading(false)
        }
        return
      }

      const nextRoles = new Set<string>()
      for (const row of data ?? []) {
        const related = (row as { roles?: { name?: string } | Array<{ name?: string }> }).roles
        const role = Array.isArray(related) ? related[0] : related
        if (role?.name) nextRoles.add(role.name)
      }

      if (!active) return
      setRoles(nextRoles)
      const nextBucket = (Object.keys(STORAGE_BUCKETS) as StorageBucket[]).find((item) => canUseBucket(item, nextRoles))
      if (nextBucket) setBucket(nextBucket)
      else setError('Akun tidak memiliki akses Storage.')
      setRolesLoading(false)
    }

    void loadRoles()
    return () => {
      active = false
    }
  }, [])

  async function loadFiles(nextBucket: StorageBucket = bucket) {
    if (!canUseBucket(nextBucket, roles)) {
      setFiles([])
      setError('Akun tidak memiliki akses ke bucket ini.')
      return
    }

    setLoading(true)
    setError('')
    const { data, error: listError } = await supabase.storage.from(nextBucket).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (listError) {
      setFiles([])
      setError(storageErrorMessage(listError, 'list'))
    } else {
      setFiles((data ?? []) as FileRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!rolesLoading && roles.size && canUseBucket(bucket, roles)) {
      void loadFiles(bucket)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, rolesLoading, roles])

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading) return

    setError('')
    setSuccess('')
    setUploading(true)
    try {
      const result = await uploadStorageFile(bucket, file)
      setSuccess(result.path ? `File berhasil diunggah: ${result.path}` : 'File berhasil diunggah.')
      await loadFiles(bucket)
    } catch (uploadError) {
      setError(storageErrorMessage(uploadError, 'upload'))
    } finally {
      setUploading(false)
    }
  }

  async function copyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path)
      setCopied(path)
      window.setTimeout(() => setCopied(''), 1600)
    } catch {
      setError('Path file tidak dapat disalin dari browser ini.')
    }
  }

  async function openFile(path: string) {
    if (opening) return
    setOpening(path)
    setError('')
    try {
      const url = STORAGE_BUCKETS[bucket].public
        ? STORAGE_BUCKETS[bucket].public ? `${supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl}` : ''
        : await privateStorageUrl(bucket, path)
      if (!url) throw new Error('URL file tidak tersedia.')
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (openError) {
      setError(storageErrorMessage(openError, 'open'))
    } finally {
      setOpening(null)
    }
  }

  async function remove(path: string) {
    if (removing) return
    if (!window.confirm(`Hapus file “${path}”? File yang dihapus tidak dapat dipulihkan.`)) return

    setRemoving(path)
    setError('')
    setSuccess('')
    try {
      await removeStorageFile(bucket, path)
      setFiles((current) => current.filter((file) => file.name !== path))
      setSuccess('File berhasil dihapus.')
    } catch (removeError) {
      setError(storageErrorMessage(removeError, 'delete'))
    } finally {
      setRemoving(null)
    }
  }

  if (rolesLoading) {
    return <div className="admin-table-state"><Loader2 className="spin" size={20} /> Menyiapkan Storage…</div>
  }

  if (!availableBuckets.length) {
    return <div className="admin-table-state"><strong>Storage tidak tersedia</strong><span>{error || 'Akun ini tidak memiliki bucket Storage yang dapat dikelola.'}</span></div>
  }

  return (
    <section className="admin-storage-manager" aria-label="Pengelolaan Supabase Storage">
      <div className="admin-storage-toolbar">
        <label className="admin-storage-bucket">
          <span>Bucket</span>
          <select value={bucket} onChange={(event) => { setBucket(event.target.value as StorageBucket); setQuery(''); setSuccess(''); setError('') }}>
            {availableBuckets.map((item) => <option key={item} value={item}>{STORAGE_BUCKETS[item].label}{STORAGE_BUCKETS[item].public ? ' · Public' : ' · Private'}</option>)}
          </select>
        </label>
        <div className="admin-search-wrap">
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama file…" aria-label="Cari file" />
        </div>
        <label className="admin-button primary admin-upload-button">
          <FileUp size={17} /> {uploading ? 'Mengunggah…' : 'Upload file'}
          <input type="file" accept={STORAGE_BUCKETS[bucket].accepted.join(',')} onChange={upload} disabled={uploading} />
        </label>
      </div>

      <div className="admin-storage-note">
        <strong>{STORAGE_BUCKETS[bucket].label}</strong>
        <p>Maksimal {formatBytes(STORAGE_BUCKETS[bucket].maxBytes)} · {STORAGE_BUCKETS[bucket].accepted.join(', ')} · {STORAGE_BUCKETS[bucket].public ? 'URL publik tersedia.' : 'Bucket private menggunakan signed URL dan tidak dibuka sebagai URL publik.'}</p>
      </div>

      {error && <p className="admin-form-error" role="alert">{error}</p>}
      {success && <p className="admin-form-success" role="status">{success}</p>}

      {loading ? <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat file…</div> : filteredFiles.length === 0 ? <div className="admin-table-state"><strong>{query ? 'File tidak ditemukan.' : 'Belum ada file di bucket ini.'}</strong><span>{query ? 'Coba kata kunci lain.' : 'Upload file untuk mulai menggunakan bucket ini.'}</span></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>File</th><th>Ukuran</th><th>Dibuat</th><th aria-label="Aksi" /></tr></thead><tbody>{filteredFiles.map((file) => { const sizeValue = (file.metadata as { size?: string | number } | null)?.size; const size = typeof sizeValue === 'string' ? Number(sizeValue) : Number(sizeValue ?? 0); return <tr key={file.id ?? file.name}><td><div className="admin-table-title"><strong>{file.name}</strong><small>{STORAGE_BUCKETS[bucket].public ? supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl : 'Private object'}</small></div></td><td>{formatBytes(size)}</td><td>{file.created_at ? new Intl.DateTimeFormat('id-ID',{dateStyle:'medium'}).format(new Date(file.created_at)) : '—'}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => void copyPath(file.name)} aria-label="Salin path">{copied === file.name ? <Check size={16}/> : <Clipboard size={16}/>}</button><button className="admin-icon-button" disabled={opening === file.name} onClick={() => void openFile(file.name)} aria-label="Buka file">{opening === file.name ? <Loader2 className="spin" size={16}/> : <ExternalLink size={16}/>}</button><button className="admin-icon-button danger" disabled={removing === file.name} onClick={() => void remove(file.name)} aria-label="Hapus file">{removing === file.name ? <Loader2 className="spin" size={16}/> : <Trash2 size={16}/>}</button></div></td></tr> })}</tbody></table></div>}
    </section>
  )
}
