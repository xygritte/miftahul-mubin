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
  {
    title: 'Pendaftaran Relawan Kegiatan Sosial Masjid Dibuka',
    content: 'Pendaftaran relawan dibuka bagi jamaah dan masyarakat yang ingin terlibat dalam kegiatan sosial masjid.',
    status: 'published',
    publishedAt: '2026-08-24T08:00:00+07:00',
  },
  {
    title: 'Jadwal Kajian Rutin Bulan September',
    content: 'Jadwal kajian rutin bulan September tersedia untuk jamaah.',
    status: 'published',
    publishedAt: '2026-08-28T08:00:00+07:00',
  },
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

const staticMediaAlbums: MediaAlbum[] = []
const staticMediaItems: MediaItem[] = []

const staticFinancePeriod: FinancePeriod = {
  id: 'static-finance-september-2026',
  year: 2026,
  month: 9,
  openingBalance: 9_750_000,
}

const staticFinanceTransactions: FinanceTransaction[] = [
  { id: 'static-fin-01', periodId: staticFinancePeriod.id, transactionDate: '2026-09-01', type: 'income', categoryId: 'income-donation', description: 'Kotak amal Jumat', amount: 2_500_000, status: 'published' },
  { id: 'static-fin-02', periodId: staticFinancePeriod.id, transactionDate: '2026-09-02', type: 'income', categoryId: 'income-donation', description: 'Donasi jamaah', amount: 4_000_000, status: 'published' },
  { id: 'static-fin-03', periodId: staticFinancePeriod.id, transactionDate: '2026-09-03', type: 'expense', categoryId: 'expense-operational', description: 'Pembayaran listrik', amount: 1_200_000, status: 'published' },
  { id: 'static-fin-04', periodId: staticFinancePeriod.id, transactionDate: '2026-09-05', type: 'expense', categoryId: 'expense-operational', description: 'Operasional kajian', amount: 750_000, status: 'published' },
  { id: 'static-fin-05', periodId: staticFinancePeriod.id, transactionDate: '2026-09-08', type: 'income', categoryId: 'income-donation', description: 'Infak kegiatan sosial', amount: 1_500_000, status: 'published' },
  { id: 'static-fin-06', periodId: staticFinancePeriod.id, transactionDate: '2026-09-10', type: 'expense', categoryId: 'expense-maintenance', description: 'Perawatan fasilitas', amount: 500_000, status: 'published' },
]

const newsRecords: NewsRecord[] = news.map((item, index) => ({
  id: `static-news-${index + 1}`,
  slug: item.slug,
  title: item.title,
  excerpt: item.excerpt,
  content: item.content,
  thumbnailUrl: item.image,
  category: item.category,
  status: 'published',
  publishedAt: `${item.date}T08:00:00+07:00`,
  viewCount: Math.max(0, 180 - index * 17),
}))

const eventRecords: EventRecord[] = events.map((item, index) => ({
  id: `static-event-${index + 1}`,
  slug: item.slug,
  title: item.title,
  description: item.description,
  eventDate: item.slug.includes('06-september') ? '2026-09-06' : item.slug.match(/(\d{2})-september-2026/)?.[1] ? `2026-09-${item.slug.match(/(\d{2})-september-2026/)?.[1]}` : '2026-09-01',
  startTime: item.time.replace(' WIB', ''),
  location: item.place,
  status: 'published',
  category: item.category,
}))

const islamicRecords: IslamicItemRecord[] = islamicItems.map((item, index) => ({
  id: `static-islamic-${index + 1}`,
  slug: item.slug,
  category: item.category,
  title: item.title,
  date: item.date,
  excerpt: item.excerpt,
  content: item.content,
  status: 'published',
  publishedAt: `${item.date}T08:00:00+07:00`,
}))

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
  async getPublishedFinancePeriod(year, month) { return staticFinancePeriod.year === year && staticFinancePeriod.month === month ? staticFinancePeriod : null },
  async listPublishedFinanceTransactions(periodId) { return staticFinanceTransactions.filter((item) => item.periodId === periodId) },
}
