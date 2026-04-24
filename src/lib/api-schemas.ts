import { z } from 'zod'

// ── Shared field schemas ──────────────────────────────────────────────────────

export const PlaceEditorDraftSchema = z.object({
  placeId: z.string().nullable(),
  slug: z.string().nullable().max(300),
  name: z.string().max(300),
  shortDescription: z.string().max(1000),
  longDescription: z.string().max(50000),
  kasguideBadges: z.array(z.string().max(100)),
  categoryIds: z.array(z.string().max(100)),
  address: z.string().max(1000),
  phone: z.string().max(50),
  website: z.string().max(500),
  imageUrls: z.array(z.string().max(2000)).max(5),
  status: z.enum(['pending', 'review', 'admin', 'published', 'archived', 'rejected', 'merged', 'error']),
  verificationStatus: z.enum(['pending', 'reviewed', 'verified', 'rejected']),
})

// ── Request body schemas ──────────────────────────────────────────────────────

export const ReviewActionBodySchema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(['start_review', 'approve', 'merge', 'reject']),
  candidatePlaceId: z.string().nullish(),
  notes: z.string().max(2000).nullish(),
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
  title: z.string().trim().min(1).max(500),
  slug: z.string().trim().max(300).nullish(),
  summary: z.string().trim().min(1).max(2000),
  content: z.string().trim().min(1).max(100000),
  imageUrl: z.string().trim().url().max(2000).nullish().or(z.literal('')),
  publishedAt: z.string().trim().nullish().or(z.literal('')),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  status: ContentStatusSchema,
})

export const AnnouncementInputSchema = z.object({
  title: z.string().trim().min(1).max(500),
  slug: z.string().trim().max(300).nullish(),
  summary: z.string().trim().min(1).max(2000),
  content: z.string().trim().min(1).max(100000),
  imageUrl: z.string().trim().url().max(2000).nullish().or(z.literal('')),
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

export const UserPlaceSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Mekan adı en az 2 karakter olmalı').max(200),
  categoryIds: z.array(z.string().min(1)).min(1, 'En az bir kategori seçin').max(3),
  address: z.string().trim().min(5, 'Adres en az 5 karakter olmalı').max(500),
  phone: z.string().trim().max(50).optional(),
  website: z.string().trim().max(500).optional(),
  shortDescription: z.string().trim().max(500).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
})

export const OverpassSweepRunBodySchema = z.object({
  gridX: z.coerce.number().int(),
  gridY: z.coerce.number().int(),
  cellSizeMeters: z.coerce.number().int().min(100).max(5000).default(500),
  regionName: z.string().trim().min(1).max(120).optional(),
  dryRun: z.boolean().optional().default(false),
})
