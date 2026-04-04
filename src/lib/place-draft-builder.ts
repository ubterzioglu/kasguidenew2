import 'server-only'

import { getPlaceCategoryLabel, suggestCategoryFromRaw } from '@/lib/place-taxonomy'

import type { PlaceEditorDraft, RecentRawPlaceItem } from '@/types/review'

import { normalizeText, slugifyText } from './place-review-utils'

// ── Internal DB row shapes ────────────────────────────────────────────────────

export type RecentRawPlaceRow = {
  id: string
  source_name: string
  source_id: string
  name_raw: string | null
  lat: number | null
  lng: number | null
  address_raw: string | null
  phone_raw: string | null
  website_raw: string | null
  category_raw: string | null
  processing_status: string
  imported_at: string
  raw_payload: {
    google?: {
      gridKey?: string
      cellId?: string
      place?: {
        googleMapsUri?: string
      }
    }
  } | null
}

export type PlaceSourceRow = {
  raw_place_id: string | null
  place_id: string
}

export type PlaceRow = {
  id: string
  slug: string
  name: string
  kasguide_badge?: string | null
  category_primary: string
  address: string | null
  phone: string | null
  website: string | null
  lat?: number | null
  lng?: number | null
  opening_hours?: string | null
  status: 'draft' | 'review' | 'admin' | 'published' | 'archived'
  verification_status: 'pending' | 'reviewed' | 'verified' | 'rejected'
  updated_at?: string
}

export type PlaceContentRow = {
  place_id: string
  headline: string | null
  short_text: string | null
  long_text: string | null
}

export type PlaceImageRow = {
  place_id: string
  public_url: string | null
  storage_path: string
  sort_order: number
}

// ── Draft builders ────────────────────────────────────────────────────────────

export function buildDraftFromRaw(
  rawRow: RecentRawPlaceRow,
  place: PlaceRow | null,
  content: PlaceContentRow | null,
  imageUrls: string[],
): PlaceEditorDraft {
  const fallbackName = normalizeText(rawRow.name_raw) || 'Yeni mekan'
  const categoryPrimary = place?.category_primary ?? suggestCategoryFromRaw(rawRow.category_raw)
  const categoryLabel = getPlaceCategoryLabel(categoryPrimary)

  return {
    placeId: place?.id ?? null,
    slug: place?.slug ?? slugifyText(fallbackName),
    name: place?.name ?? fallbackName,
    headline: normalizeText(content?.headline) ?? fallbackName,
    shortDescription:
      normalizeText(content?.short_text) ??
      `${fallbackName}, Kaş'ta ${categoryLabel.toLowerCase()} olarak listelenen bir mekan.`,
    longDescription: normalizeText(content?.long_text) ?? '',
    kasguideBadge: normalizeText(place?.kasguide_badge) ?? '',
    categoryPrimary,
    address: (normalizeText(place?.address) ?? normalizeText(rawRow.address_raw) ?? '') as string,
    phone: (normalizeText(place?.phone) ?? normalizeText(rawRow.phone_raw) ?? '') as string,
    website: (normalizeText(place?.website) ?? normalizeText(rawRow.website_raw) ?? '') as string,
    imageUrls: imageUrls.length > 0 ? imageUrls.slice(0, 5) : [''],
    status: place?.status ?? 'admin',
    verificationStatus: place?.verification_status ?? 'pending',
  }
}

export function buildDraftFromPlace(
  place: PlaceRow,
  content: PlaceContentRow | null,
  imageUrls: string[],
): PlaceEditorDraft {
  const categoryPrimary = place.category_primary || 'gezi'
  const fallbackName = normalizeText(place.name) || 'Mevcut mekan'
  const categoryLabel = getPlaceCategoryLabel(categoryPrimary)

  return {
    placeId: place.id,
    slug: place.slug ?? slugifyText(fallbackName),
    name: fallbackName,
    headline: normalizeText(content?.headline) ?? fallbackName,
    shortDescription:
      normalizeText(content?.short_text) ??
      `${fallbackName}, Kaş'ta ${categoryLabel.toLowerCase()} olarak listelenen bir mekan.`,
    longDescription: normalizeText(content?.long_text) ?? '',
    kasguideBadge: normalizeText(place.kasguide_badge) ?? '',
    categoryPrimary,
    address: normalizeText(place.address) ?? '',
    phone: normalizeText(place.phone) ?? '',
    website: normalizeText(place.website) ?? '',
    imageUrls: imageUrls.length > 0 ? imageUrls.slice(0, 5) : [''],
    status: place.status ?? 'admin',
    verificationStatus: place.verification_status ?? 'pending',
  }
}

export function mapRecentRawPlaceRow(
  row: RecentRawPlaceRow,
  draft: PlaceEditorDraft | null,
): RecentRawPlaceItem {
  const googleMeta = row.raw_payload?.google

  return {
    id: row.id,
    sourceName: row.source_name,
    sourceId: row.source_id,
    nameRaw: row.name_raw,
    lat: row.lat,
    lng: row.lng,
    addressRaw: row.address_raw,
    phoneRaw: row.phone_raw,
    websiteRaw: row.website_raw,
    categoryRaw: row.category_raw,
    processingStatus: row.processing_status,
    importedAt: row.imported_at,
    gridKey: typeof googleMeta?.gridKey === 'string' ? googleMeta.gridKey : null,
    cellId: typeof googleMeta?.cellId === 'string' ? googleMeta.cellId : null,
    googleMapsUri:
      typeof googleMeta?.place?.googleMapsUri === 'string' ? googleMeta.place.googleMapsUri : null,
    draft: draft ?? buildDraftFromRaw(row, null, null, []),
  }
}
