import { supabase } from './client'

export type StorageBucket =
  | 'site-assets'
  | 'avatars'
  | 'news-media'
  | 'event-media'
  | 'management-media'
  | 'gallery-media'
  | 'finance-proofs'

type StorageBucketConfig = {
  label: string
  public: boolean
  maxBytes: number
  accepted: string[]
}

export const STORAGE_BUCKETS: Record<StorageBucket, StorageBucketConfig> = {
  'site-assets': { label: 'Site Assets', public: true, maxBytes: 8 * 1024 * 1024, accepted: ['image/*', 'image/svg+xml', 'application/pdf'] },
  avatars: { label: 'Avatar', public: true, maxBytes: 4 * 1024 * 1024, accepted: ['image/*'] },
  'news-media': { label: 'Media Berita', public: true, maxBytes: 8 * 1024 * 1024, accepted: ['image/*', 'image/svg+xml'] },
  'event-media': { label: 'Media Kegiatan', public: true, maxBytes: 16 * 1024 * 1024, accepted: ['image/*', 'video/*'] },
  'management-media': { label: 'Media Kepengurusan', public: true, maxBytes: 8 * 1024 * 1024, accepted: ['image/*'] },
  'gallery-media': { label: 'Galeri', public: true, maxBytes: 16 * 1024 * 1024, accepted: ['image/*', 'video/*'] },
  'finance-proofs': { label: 'Bukti Keuangan', public: false, maxBytes: 8 * 1024 * 1024, accepted: ['image/*', 'application/pdf'] },
}

export function acceptsMime(bucket: StorageBucket, mime: string) {
  return STORAGE_BUCKETS[bucket].accepted.some((pattern) => {
    if (pattern.endsWith('/*')) return mime.startsWith(pattern.slice(0, -1))
    return mime === pattern
  })
}

export function sanitizeFileName(name: string) {
  const normalized = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  const safe = normalized.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return safe || 'file'
}

export function createStoragePath(file: File) {
  return `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
}

export function publicStorageUrl(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function uploadPublicStorageFile(bucket: StorageBucket, file: File) {
  const config = STORAGE_BUCKETS[bucket]
  if (!acceptsMime(bucket, file.type)) {
    throw new Error(`Tipe file tidak didukung untuk ${config.label}.`)
  }
  if (file.size > config.maxBytes) {
    throw new Error(`Ukuran file terlalu besar. Maksimal ${Math.floor(config.maxBytes / (1024 * 1024))} MB.`)
  }

  const path = createStoragePath(file)
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error

  return { path, url: publicStorageUrl(bucket, path) }
}

export async function privateStorageUrl(bucket: StorageBucket, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
