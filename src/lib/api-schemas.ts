import { z } from 'zod'

// ── Shared field schemas ──────────────────────────────────────────────────────

export const PlaceEditorDraftSchema = z.object({
  placeId: z.string().nullable(),
  slug: z.string().nullable(),
  name: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  kasguideBadges: z.array(z.string()),
  categoryIds: z.array(z.string()),
  address: z.string(),
  phone: z.string(),
  website: z.string(),
  imageUrls: z.array(z.string()).max(5),
  status: z.enum(['pending', 'review', 'admin', 'published', 'archived', 'rejected', 'merged', 'error']),
  verificationStatus: z.enum(['pending', 'reviewed', 'verified', 'rejected']),
})

// ── Request body schemas ──────────────────────────────────────────────────────

export const ReviewActionBodySchema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(['start_review', 'approve', 'merge', 'reject']),
  candidatePlaceId: z.string().nullish(),
  notes: z.string().nullish(),
})

export const RawPlaceSaveBodySchema = z.object({
  rawPlaceId: z.string().min(1),
  action: z.enum(['save_draft', 'publish', 'reject']),
  draft: PlaceEditorDraftSchema.optional(),
})

export const SweepPlaceSaveBodySchema = z.object({
  placeId: z.string().min(1),
  action: z.enum(['save_draft', 'publish', 'reject']),
  draft: PlaceEditorDraftSchema.optional(),
})

export const ExistingPlaceSaveBodySchema = z.object({
  placeId: z.string().min(1),
  draft: PlaceEditorDraftSchema,
})

export const ContentStatusSchema = z.enum(['draft', 'published', 'archived'])
export const AnnouncementPrioritySchema = z.enum(['urgent', 'normal', 'info'])

export const NewsInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().nullish(),
  summary: z.string().trim().min(1),
  content: z.string().trim().min(1),
  imageUrl: z.string().trim().url().nullish().or(z.literal('')),
  publishedAt: z.string().trim().nullish().or(z.literal('')),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  status: ContentStatusSchema,
})

export const AnnouncementInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().nullish(),
  summary: z.string().trim().min(1),
  content: z.string().trim().min(1),
  imageUrl: z.string().trim().url().nullish().or(z.literal('')),
  priority: AnnouncementPrioritySchema,
  isPinned: z.boolean(),
  isActive: z.boolean(),
  startDate: z.string().trim().nullish().or(z.literal('')),
  endDate: z.string().trim().nullish().or(z.literal('')),
  publishedAt: z.string().trim().nullish().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  status: ContentStatusSchema,
})

export const AdminNewsCreateBodySchema = z.object({
  news: NewsInputSchema,
})

export const AdminNewsUpdateBodySchema = z.object({
  news: NewsInputSchema,
})

export const AdminAnnouncementCreateBodySchema = z.object({
  announcement: AnnouncementInputSchema,
})

export const AdminAnnouncementUpdateBodySchema = z.object({
  announcement: AnnouncementInputSchema,
})

export const OverpassSweepRunBodySchema = z.object({
  gridX: z.coerce.number().int(),
  gridY: z.coerce.number().int(),
  cellSizeMeters: z.coerce.number().int().min(100).max(5000).default(500),
  regionName: z.string().trim().min(1).max(120).optional(),
  dryRun: z.boolean().optional().default(false),
})
