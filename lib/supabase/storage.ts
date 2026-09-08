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

const IMAGE_OPTIMIZE_THRESHOLD = 600 * 1024
const IMAGE_MAX_DIMENSION = 1920
const IMAGE_QUALITY = 0.82

async function optimizeRasterImage(file: File): Promise<File> {
  if (!file.type || (!file.type.includes('jpeg') && file.type !== 'image/webp')) return file
  if (file.size <= IMAGE_OPTIMIZE_THRESHOLD) return file
  if (typeof document === 'undefined') return file

  try {
    const bitmap = typeof createImageBitmap === 'function' ? await createImageBitmap(file) : null
    const image = bitmap ?? await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const element = new Image()
      element.onload = () => {
        URL.revokeObjectURL(url)
        resolve(element)
      }
      element.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Gagal membaca gambar.'))
      }
      element.src = url
    })

    const sourceWidth = image.width
    const sourceHeight = image.height
    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(1, Math.round(sourceWidth * scale))
    const height = Math.max(1, Math.round(sourceHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) {
      bitmap?.close()
      return file
    }

    context.drawImage(image, 0, 0, width, height)
    bitmap?.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY))
    if (!blob || blob.size >= file.size) return file

    const baseName = sanitizeFileName(file.name).replace(/\.[^.]+$/, '')
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: file.lastModified })
  } catch {
    return file
  }
}

export async function prepareStorageFile(file: File) {
  return optimizeRasterImage(file)
}

export async function uploadStorageFile(bucket: StorageBucket, file: File) {
  const config = STORAGE_BUCKETS[bucket]
  if (!acceptsMime(bucket, file.type)) {
    throw new Error(`Tipe file tidak didukung untuk ${config.label}.`)
  }
  if (file.size > config.maxBytes) {
    throw new Error(`Ukuran file terlalu besar. Maksimal ${Math.floor(config.maxBytes / (1024 * 1024))} MB.`)
  }

  const preparedFile = await prepareStorageFile(file)
  if (preparedFile.size > config.maxBytes) {
    throw new Error(`Ukuran file terlalu besar setelah optimasi. Maksimal ${Math.floor(config.maxBytes / (1024 * 1024))} MB.`)
  }

  const path = createStoragePath(preparedFile)
  const { error } = await supabase.storage.from(bucket).upload(path, preparedFile, {
    cacheControl: '31536000',
    contentType: preparedFile.type || undefined,
    upsert: false,
  })
  if (error) throw error

  return { path, url: config.public ? publicStorageUrl(bucket, path) : null, size: preparedFile.size, optimized: preparedFile !== file }
}

export async function uploadPublicStorageFile(bucket: Exclude<StorageBucket, 'finance-proofs'>, file: File) {
  const result = await uploadStorageFile(bucket, file)
  if (!result.url) {
    await removeStorageFile(bucket, result.path).catch(() => undefined)
    throw new Error(`Bucket ${STORAGE_BUCKETS[bucket].label} tidak menyediakan URL publik.`)
  }
  return { path: result.path, url: result.url, size: result.size, optimized: result.optimized }
}

export async function removeStorageFile(bucket: StorageBucket, path: string) {
  if (!path) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export async function privateStorageUrl(bucket: StorageBucket, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
