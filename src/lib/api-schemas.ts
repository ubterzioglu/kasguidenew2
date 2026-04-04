import { z } from 'zod'

// ── Shared field schemas ──────────────────────────────────────────────────────

export const PlaceEditorDraftSchema = z.object({
  placeId: z.string().nullable(),
  slug: z.string().nullable(),
  name: z.string(),
  headline: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  kasguideBadge: z.string(),
  categoryPrimary: z.string(),
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
