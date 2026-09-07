import type { MetadataRoute } from 'next'
import { contentRepository } from '@/lib/data'

export const dynamic = 'force-static'

const base = 'https://xygritte.github.io/miftahul-mubin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, islamic, events] = await Promise.all([
    contentRepository.listNews(),
    contentRepository.listIslamic(),
    contentRepository.listEvents(),
  ])

  const staticPages = ['/', '/berita/', '/keislaman/', '/kegiatan/', '/kepengurusan/', '/keuangan/', '/profil/', '/dokumentasi/', '/pengumuman/', '/kontak/']
  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const, priority: path === '/' ? 1 : 0.7 })),
    ...news.map((item) => ({ url: `${base}/berita/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...events.map((item) => ({ url: `${base}/kegiatan/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...islamic.map((item) => ({ url: `${base}/keislaman/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
}
