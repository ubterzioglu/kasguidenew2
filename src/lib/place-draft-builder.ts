import 'server-only'

import { getPlaceCategoryLabel, suggestCategoryFromRaw } from '@/lib/place-taxonomy'
import type {
  PlaceEditorDraft,
  PlaceIntakeChannel,
  PlaceStatus,
  PlaceVerificationStatus,
  RecentRawPlaceItem,
  ReviewQueueItem,
  ReviewQueueStatus,
} from '@/types/review'

import { normalizeText, slugifyText } from './place-review-utils'

export type PlaceImageRecord = {
  url?: string | null
  alt_text?: string | null
  source_name?: string | null
  is_cover?: boolean | null
  sort_order?: number | null
}

export type PlaceSourceRecord = {
  source_name?: string | null
  source_id?: string | null
  source_url?: string | null
  is_primary?: boolean | null
  first_seen_at?: string | null
  last_seen_at?: string | null
  raw_place_id?: string | null
}

export type UnifiedPlaceRow = {
  id: string
  slug: string | null
  name: string
  kasguide_badge?: string | null
  category_primary: string | null
  address: string | null
  phone: string | null
  website: string | null
  lat: number | null
  lng: number | null
  opening_hours?: string | null
  status: PlaceStatus
  verification_status: PlaceVerificationStatus
  updated_at?: string | null
  imported_at?: string | null
  primary_source_name?: string | null
  primary_source_id?: string | null
  source_url?: string | null
  grid_key?: string | null
  cell_id?: string | null
  google_maps_uri?: string | null
  review_reason?: string | null
  review_notes?: string | null
  review_score?: number | null
  merge_target_place_id?: string | null
  headline?: string | null
  short_description?: string | null
  long_description?: string | null
  images?: PlaceImageRecord[] | null
  source_records?: PlaceSourceRecord[] | null
  raw_snapshot?: Record<string, unknown> | null
  intake_channel?: PlaceIntakeChannel | null
  is_sweeped?: boolean | null
  source_sweep_id?: string | null
}

function getFallbackName(place: UnifiedPlaceRow) {
  return normalizeText(place.name) || 'Yeni mekan'
}

export function mapImageUrls(images: PlaceImageRecord[] | null | undefined): string[] {
  const sorted = [...(images ?? [])].sort((left, right) => {
    const leftCover = left.is_cover ? 0 : 1
    const rightCover = right.is_cover ? 0 : 1

    if (leftCover !== rightCover) {
      return leftCover - rightCover
    }

    return (left.sort_order ?? 999) - (right.sort_order ?? 999)
  })

  return sorted
    .map((image) => normalizeText(image.url) ?? '')
    .filter(Boolean)
    .slice(0, 5)
}

export function buildDraftFromPlace(place: UnifiedPlaceRow): PlaceEditorDraft {
  const fallbackName = getFallbackName(place)
  const categoryPrimary = place.category_primary ?? 'gezi'
  const categoryLabel = getPlaceCategoryLabel(categoryPrimary)
  const imageUrls = mapImageUrls(place.images)

  return {
    placeId: place.id,
    slug: place.slug ?? slugifyText(fallbackName),
    name: fallbackName,
    headline: normalizeText(place.headline) ?? fallbackName,
    shortDescription:
      normalizeText(place.short_description) ??
      `${fallbackName}, Kas'ta ${categoryLabel.toLowerCase()} olarak listelenen bir mekan.`,
    longDescription: normalizeText(place.long_description) ?? '',
    kasguideBadge: normalizeText(place.kasguide_badge) ?? '',
    categoryPrimary,
    address: normalizeText(place.address) ?? '',
    phone: normalizeText(place.phone) ?? '',
    website: normalizeText(place.website) ?? '',
    imageUrls: imageUrls.length > 0 ? imageUrls : [''],
    status: place.status,
    verificationStatus: place.verification_status,
  }
}

export function buildDraftFromUnifiedRow(place: UnifiedPlaceRow): PlaceEditorDraft {
  return buildDraftFromPlace(place)
}

export function mapRecentRawPlaceRow(row: UnifiedPlaceRow): RecentRawPlaceItem {
  const draft = buildDraftFromUnifiedRow(row)

  return {
    id: row.id,
    intakeChannel: row.intake_channel ?? 'manual',
    isSweeped: row.is_sweeped ?? false,
    sweepId: row.source_sweep_id ?? null,
    sourceName: row.primary_source_name ?? 'unknown',
    sourceId: row.primary_source_id ?? row.id,
    nameRaw: normalizeText((row.raw_snapshot?.name_raw as string | undefined) ?? row.name) ?? row.name,
    lat: row.lat,
    lng: row.lng,
    addressRaw:
      normalizeText((row.raw_snapshot?.address_raw as string | undefined) ?? row.address) ?? row.address ?? null,
    phoneRaw:
      normalizeText((row.raw_snapshot?.phone_raw as string | undefined) ?? row.phone) ?? row.phone ?? null,
    websiteRaw:
      normalizeText((row.raw_snapshot?.website_raw as string | undefined) ?? row.website) ?? row.website ?? null,
    categoryRaw:
      normalizeText((row.raw_snapshot?.category_raw as string | undefined) ?? row.category_primary) ??
      row.category_primary ??
      null,
    processingStatus: row.status,
    importedAt: row.imported_at ?? row.updated_at ?? new Date().toISOString(),
    gridKey: row.grid_key ?? null,
    cellId: row.cell_id ?? null,
    googleMapsUri: row.google_maps_uri ?? null,
    draft,
  }
}

export function buildReviewQueueStatus(place: UnifiedPlaceRow): ReviewQueueStatus {
  switch (place.status) {
    case 'review':
      return 'in_review'
    case 'merged':
      return 'merged'
    case 'rejected':
      return 'rejected'
    case 'admin':
    case 'published':
    case 'archived':
      return 'approved'
    default:
      return 'pending'
  }
}

export function buildReviewQueueItem(
  place: UnifiedPlaceRow,
  candidatePlace: UnifiedPlaceRow | null,
): ReviewQueueItem {
  return {
    id: place.id,
    reason: normalizeText(place.review_reason) ?? 'Tek tablo review kaydi',
    status: buildReviewQueueStatus(place),
    notes: normalizeText(place.review_notes),
    score: place.review_score ?? null,
    createdAt: place.imported_at ?? place.updated_at ?? new Date().toISOString(),
    updatedAt: place.updated_at ?? place.imported_at ?? new Date().toISOString(),
    rawPlace: {
      id: place.id,
      sourceName: place.primary_source_name ?? 'unknown',
      sourceId: place.primary_source_id ?? place.id,
      nameRaw: normalizeText((place.raw_snapshot?.name_raw as string | undefined) ?? place.name) ?? place.name,
      lat: place.lat,
      lng: place.lng,
      addressRaw:
        normalizeText((place.raw_snapshot?.address_raw as string | undefined) ?? place.address) ??
        place.address ??
        null,
      phoneRaw:
        normalizeText((place.raw_snapshot?.phone_raw as string | undefined) ?? place.phone) ??
        place.phone ??
        null,
      websiteRaw:
        normalizeText((place.raw_snapshot?.website_raw as string | undefined) ?? place.website) ??
        place.website ??
        null,
      categoryRaw:
        normalizeText((place.raw_snapshot?.category_raw as string | undefined) ?? place.category_primary) ??
        place.category_primary ??
        null,
      processingStatus: place.status,
      importedAt: place.imported_at ?? place.updated_at ?? new Date().toISOString(),
    },
    candidatePlace: candidatePlace
      ? {
          id: candidatePlace.id,
          name: candidatePlace.name,
          slug: candidatePlace.slug ?? '',
          categoryPrimary: candidatePlace.category_primary ?? 'gezi',
          status: candidatePlace.status,
          verificationStatus: candidatePlace.verification_status,
        }
      : null,
  }
}

export function getSuggestedCategory(place: UnifiedPlaceRow) {
  return place.category_primary ?? suggestCategoryFromRaw(place.raw_snapshot?.category_raw as string | null | undefined)
}
