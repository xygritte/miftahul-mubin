export type NewsItem = {
  slug: string
  category: string
  title: string
  date: string
  image: string
  excerpt: string
  content: string[]
  publishedAt?: string | null
  viewCount?: number
}

export type EventItem = {
  slug: string
  day: string
  month: string
  date: string
  title: string
  time: string
  place: string
  category: string
  description: string
}
