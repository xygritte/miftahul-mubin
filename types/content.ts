export type PublishStatus = 'draft' | 'published' | 'archived'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type FinanceType = 'income' | 'expense'

export type ContentCategory = {
  id?: string
  name: string
  slug: string
  type: 'news' | 'islamic' | 'event' | 'announcement' | 'gallery'
}

export type NewsRecord = {
  id?: string
  slug: string
  title: string
  excerpt: string
  content: string[]
  thumbnailUrl?: string | null
  category: string
  authorId?: string | null
  status: PublishStatus
  publishedAt?: string | null
  viewCount: number
  createdAt?: string
  updatedAt?: string
}

export type IslamicItemRecord = {
  id?: string
  slug: string
  category: string
  title: string
  date: string
  excerpt: string
  content: string[]
  status: PublishStatus
  publishedAt?: string | null
}

export type EventRecord = {
  id?: string
  slug: string
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime?: string | null
  location: string
  speaker?: string | null
  status: EventStatus
  coverUrl?: string | null
  category: string
  createdAt?: string
  updatedAt?: string
}

export type AnnouncementRecord = {
  id?: string
  title: string
  content: string
  status: PublishStatus
  publishedAt?: string | null
  authorId?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ManagementPeriod = {
  id?: string
  name: string
  startDate: string
  endDate?: string | null
  isActive: boolean
}

export type ManagementMember = {
  id?: string
  periodId?: string
  name: string
  position: string
  photoUrl?: string | null
  bio?: string | null
  sortOrder: number
}

export type MediaAlbum = {
  id?: string
  title: string
  slug: string
  description?: string | null
  coverUrl?: string | null
  createdAt?: string
}

export type MediaItem = {
  id?: string
  albumId: string
  type: 'image' | 'video'
  title?: string | null
  url: string
  thumbnailUrl?: string | null
  caption?: string | null
  sortOrder: number
  createdAt?: string
}

export type FinanceCategory = {
  id?: string
  name: string
  type: FinanceType
  description?: string | null
}

export type FinanceTransaction = {
  id?: string
  periodId?: string | null
  transactionDate: string
  type: FinanceType
  categoryId: string
  description: string
  amount: number
  proofUrl?: string | null
  createdBy?: string | null
  status: PublishStatus
  createdAt?: string
  updatedAt?: string
}

export type FinancePeriod = {
  id?: string
  year: number
  month: number
  openingBalance: number
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type AuditLog = {
  id?: string
  actorId?: string | null
  entityType: string
  entityId?: string | null
  action: string
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  createdAt?: string
}
