import type { MetadataRoute } from 'next'
import { news, events } from '@/lib/content'
import { islamicItems } from '@/lib/islamic'

const base = 'https://xygritte.github.io/miftahul-mubin'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['/', '/berita/', '/keislaman/', '/kegiatan/', '/kepengurusan/', '/keuangan/', '/profil/', '/dokumentasi/', '/pengumuman/', '/kontak/']
  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const, priority: path === '/' ? 1 : 0.7 })),
    ...news.map((item) => ({ url: `${base}/berita/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...events.map((item) => ({ url: `${base}/kegiatan/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...islamicItems.map((item) => ({ url: `${base}/keislaman/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
}
