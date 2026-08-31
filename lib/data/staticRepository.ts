import { events, news } from '@/lib/content'
import { islamicItems } from '@/lib/islamic'
import type {
  AnnouncementRecord,
  EventRecord,
  FinancePeriod,
  FinanceTransaction,
  IslamicItemRecord,
  ManagementMember,
  ManagementPeriod,
  MediaAlbum,
  MediaItem,
  NewsRecord,
} from '@/types/content'
import type { PublicContentRepository } from './repository'

const announcements: AnnouncementRecord[] = [
  { title: 'Pendaftaran Relawan Kegiatan Sosial Masjid Dibuka', content: 'Pendaftaran relawan dibuka bagi jamaah dan masyarakat yang ingin terlibat dalam kegiatan sosial masjid.', status: 'published', publishedAt: '2026-08-24T08:00:00+07:00' },
  { title: 'Jadwal Kajian Rutin Bulan September', content: 'Jadwal kajian rutin bulan September tersedia untuk jamaah.', status: 'published', publishedAt: '2026-08-28T08:00:00+07:00' },
]

const managementPeriods: ManagementPeriod[] = [
  { id: 'static-period-2026', name: 'Periode 2026', startDate: '2026-01-01', endDate: '2026-12-31', isActive: true },
]

const managementMembers: ManagementMember[] = [
  { id: 'static-member-01', periodId: 'static-period-2026', name: 'H. Ahmad Fauzi', position: 'Ketua Takmir', sortOrder: 1 },
  { id: 'static-member-02', periodId: 'static-period-2026', name: 'Muhammad Fikri', position: 'Sekretaris', sortOrder: 2 },
  { id: 'static-member-03', periodId: 'static-period-2026', name: 'Abdul Rahman', position: 'Bendahara', sortOrder: 3 },
  { id: 'static-member-04', periodId: 'static-period-2026', name: 'Ust. Ahmad Hidayat', position: 'Divisi Dakwah', sortOrder: 4 },
  { id: 'static-member-05', periodId: 'static-period-2026', name: 'Nurul Huda', position: 'Divisi Pendidikan', sortOrder: 5 },
  { id: 'static-member-06', periodId: 'static-period-2026', name: 'M. Rizki Pratama', position: 'Divisi Sosial', sortOrder: 6 },
  { id: 'static-member-07', periodId: 'static-period-2026', name: 'Fajar Maulana', position: 'Divisi Sarana', sortOrder: 7 },
  { id: 'static-member-08', periodId: 'static-period-2026', name: 'Rafi Kurniawan', position: 'Divisi Pemuda', sortOrder: 8 },
]

const staticMediaAlbums: MediaAlbum[] = [
  { id: 'static-album-2026', title: 'Dokumentasi Kegiatan 2026', slug: 'dokumentasi-kegiatan-2026', description: 'Arsip visual kegiatan Miftahul Mubin selama 2026.' },
]

const staticMediaItems: MediaItem[] = [
  ['Kajian Akbar Miftahul Mubin', 'Kajian', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'],
  ['Kegiatan Pemuda Masjid', 'Pemuda', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'],
  ['Penyaluran Bantuan Sosial', 'Sosial', 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80'],
  ['Kelas Al-Qur’an Anak', 'Pendidikan', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80'],
  ['Kerja Bakti Lingkungan', 'Sosial', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80'],
  ['Rapat Pengurus', 'Pengurus', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80'],
].map(([title, category, url], index) => ({ id: `static-media-${index + 1}`, albumId: 'static-album-2026', type: 'image' as const, title: `${title} · ${category}`, url, sortOrder: index + 1 }))

const staticFinancePeriod: FinancePeriod = { id: 'static-finance-september-2026', year: 2026, month: 9, openingBalance: 9_750_000 }
const staticFinanceTransactions: FinanceTransaction[] = [
  { id: 'static-fin-01', periodId: staticFinancePeriod.id, transactionDate: '2026-09-01', type: 'income', categoryId: 'income-donation', description: 'Kotak amal Jumat', amount: 2_500_000, status: 'published' },
  { id: 'static-fin-02', periodId: staticFinancePeriod.id, transactionDate: '2026-09-02', type: 'income', categoryId: 'income-donation', description: 'Donasi jamaah', amount: 4_000_000, status: 'published' },
  { id: 'static-fin-03', periodId: staticFinancePeriod.id, transactionDate: '2026-09-03', type: 'expense', categoryId: 'expense-operational', description: 'Pembayaran listrik', amount: 1_200_000, status: 'published' },
  { id: 'static-fin-04', periodId: staticFinancePeriod.id, transactionDate: '2026-09-05', type: 'expense', categoryId: 'expense-operational', description: 'Operasional kajian', amount: 750_000, status: 'published' },
  { id: 'static-fin-05', periodId: staticFinancePeriod.id, transactionDate: '2026-09-08', type: 'income', categoryId: 'income-donation', description: 'Infak kegiatan sosial', amount: 1_500_000, status: 'published' },
  { id: 'static-fin-06', periodId: staticFinancePeriod.id, transactionDate: '2026-09-10', type: 'expense', categoryId: 'expense-maintenance', description: 'Perawatan fasilitas', amount: 500_000, status: 'published' },
]

const newsRecords: NewsRecord[] = news.map((item, index) => ({ id: `static-news-${index + 1}`, slug: item.slug, title: item.title, excerpt: item.excerpt, content: item.content, thumbnailUrl: item.image, category: item.category, status: 'published', publishedAt: parseLegacyDate(item.date), viewCount: Math.max(0, 180 - index * 17) }))
const monthLookup: Record<string, string> = { januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06', juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12' }
function parseLegacyDate(value: string): string | null { const m = value.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/); if (!m) return null; return `${m[3]}-${monthLookup[m[2]] ?? '01'}-${m[1].padStart(2, '0')}T08:00:00+07:00` }
function parseIndonesianDate(value: string): string { const parsed = parseLegacyDate(value); return parsed ? parsed.slice(0, 10) : '1970-01-01' }
function parseTime(value: string): string { const match = value.match(/(\d{1,2})\.(\d{2})/); return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '00:00' }
const eventRecords: EventRecord[] = events.map((item, index) => ({ id: `static-event-${index + 1}`, slug: item.slug, title: item.title, description: item.description, eventDate: parseIndonesianDate(item.date), startTime: parseTime(item.time), location: item.place, status: 'published', category: item.category }))
const islamicRecords: IslamicItemRecord[] = islamicItems.map((item, index) => ({ id: `static-islamic-${index + 1}`, slug: item.slug, category: item.category, title: item.title, date: item.date, excerpt: item.excerpt, content: item.content, status: 'published', publishedAt: parseLegacyDate(item.date) }))

export const staticRepository: PublicContentRepository = {
  async listNews() { return newsRecords },
  async getNewsBySlug(slug) { return newsRecords.find((item) => item.slug === slug) ?? null },
  async listIslamic() { return islamicRecords },
  async getIslamicBySlug(slug) { return islamicRecords.find((item) => item.slug === slug) ?? null },
  async listEvents() { return eventRecords },
  async getEventBySlug(slug) { return eventRecords.find((item) => item.slug === slug) ?? null },
  async listAnnouncements() { return announcements },
  async listManagementPeriods() { return managementPeriods },
  async listManagementMembers(periodId) { return managementMembers.filter((item) => !periodId || item.periodId === periodId).sort((a, b) => a.sortOrder - b.sortOrder) },
  async listMediaAlbums() { return staticMediaAlbums },
  async listMediaItems(albumId) { return staticMediaItems.filter((item) => !albumId || item.albumId === albumId).sort((a, b) => a.sortOrder - b.sortOrder) },
  async getLatestPublishedFinancePeriod() { return staticFinancePeriod },
  async getPublishedFinancePeriod(year, month) { return staticFinancePeriod.year === year && staticFinancePeriod.month === month ? staticFinancePeriod : null },
  async listPublishedFinanceTransactions(periodId) { return staticFinanceTransactions.filter((item) => item.periodId === periodId) },
}
