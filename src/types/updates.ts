export type ContentStatus = 'draft' | 'published' | 'archived'
export type AnnouncementPriority = 'urgent' | 'normal' | 'info'
export type UpdateFeedType = 'news' | 'announcement'

export type NewsItem = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  imageUrl: string | null
  publishedAt: string | null
  isActive: boolean
  sortOrder: number
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type AnnouncementItem = {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  imageUrl: string | null
  priority: AnnouncementPriority
  isPinned: boolean
  isActive: boolean
  startDate: string | null
  endDate: string | null
  publishedAt: string | null
  sortOrder: number
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type UpdateCarouselItem = {
  id: string
  type: UpdateFeedType
  title: string
  summary: string
  dateLabel: string
  href: string
  imageUrl: string | null
  badgeLabel: string
  priority: AnnouncementPriority | null
  isPinned: boolean
}

export type UpdatesAdminSnapshot = {
  news: NewsItem[]
  announcements: AnnouncementItem[]
}

export type NewsInput = {
  title: string
  slug?: string | null
  summary: string
  content: string
  imageUrl?: string | null
  publishedAt?: string | null
  isActive: boolean
  sortOrder: number
  status: ContentStatus
}

export type AnnouncementInput = {
  title: string
  slug?: string | null
  summary: string
  content: string
  imageUrl?: string | null
  priority: AnnouncementPriority
  isPinned: boolean
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  publishedAt?: string | null
  sortOrder: number
  status: ContentStatus
}