import type { EventItem, NewsItem } from '@/lib/content'
import type { IslamicItem } from '@/lib/islamic'
import type { EventRecord, IslamicItemRecord, NewsRecord } from '@/types/content'

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

// This module is imported by client components, so GITHUB_ACTIONS is not
// available in the browser. Use NEXT_PUBLIC_BASE_PATH for browser-safe URLs.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Build a site-internal URL that respects the GitHub Pages project basePath. */
export const sitePath = (path: string) => `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`

export function formatIndonesianDate(value: string | null | undefined, withWeekday = true): string {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  const parts = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  return withWeekday ? `${WEEKDAYS[date.getDay()]} ${parts}` : parts
}

export function formatIndonesianDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

export function formatEventTime(value: string | null | undefined): string {
  if (!value) return '—'
  const [hour = '00', minute = '00'] = value.slice(0, 5).split(':')
  return `${hour.padStart(2, '0')}.${minute.padStart(2, '0')} WIB`
}

export function newsRecordToLegacy(item: NewsRecord): NewsItem {
  return {
    slug: item.slug,
    category: item.category,
    title: item.title,
    date: formatIndonesianDate(item.publishedAt ?? item.createdAt ?? null, false),
    image: item.thumbnailUrl ?? sitePath('/hero-bg.png'),
    excerpt: item.excerpt,
    content: item.content,
  }
}

export function eventRecordToLegacy(item: EventRecord): EventItem {
  const date = new Date(`${item.eventDate}T12:00:00`)
  return {
    slug: item.slug,
    day: Number.isNaN(date.getTime()) ? item.eventDate.slice(-2) : String(date.getDate()).padStart(2, '0'),
    month: Number.isNaN(date.getTime()) ? '' : MONTHS[date.getMonth()].slice(0, 3).toUpperCase(),
    date: formatIndonesianDate(item.eventDate),
    title: item.title,
    time: formatEventTime(item.startTime),
    place: item.location,
    category: item.category,
    description: item.description,
  }
}

export function islamicRecordToLegacy(item: IslamicItemRecord): IslamicItem {
  return {
    slug: item.slug,
    category: item.category,
    title: item.title,
    date: formatIndonesianDate(item.publishedAt ?? item.date, false),
    excerpt: item.excerpt,
    content: item.content,
  }
}

type SearchEntry = { title: string; href: string; category: string }

export function buildSearchEntries(news: NewsRecord[], islamic: IslamicItemRecord[], events: EventRecord[]): SearchEntry[] {
  return [
    ...news.map((item) => ({ title: item.title, href: sitePath(`/berita/${item.slug}/`), category: item.category })),
    ...islamic.map((item) => ({ title: item.title, href: sitePath(`/keislaman/${item.slug}/`), category: item.category })),
    ...events.map((item) => ({ title: item.title, href: sitePath(`/kegiatan/${item.slug}/`), category: item.category })),
    { title: 'Pengumuman Miftahul Mubin', href: sitePath('/pengumuman/'), category: 'Pengumuman' },
    { title: 'Struktur Kepengurusan Masjid Miftahul Mubin', href: sitePath('/kepengurusan/'), category: 'Kepengurusan' },
    { title: 'Profil dan Sejarah Masjid Miftahul Mubin', href: sitePath('/profil/'), category: 'Profil' },
    { title: 'Dokumentasi Kegiatan Miftahul Mubin', href: sitePath('/dokumentasi/'), category: 'Dokumentasi' },
    { title: 'Transparansi Keuangan Masjid Miftahul Mubin', href: sitePath('/keuangan/'), category: 'Keuangan' },
    { title: 'Hubungi Pengurus Miftahul Mubin', href: sitePath('/kontak/'), category: 'Kontak' },
  ]
}
