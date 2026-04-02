import 'server-only'

import { PLACE_CATEGORY_OPTIONS } from '@/lib/place-taxonomy'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import { fetchGridSweeps, type GridSweepItem } from './grid-sweep-store'
import {
  fetchRecentRawPlaces,
  persistPlaceFromRaw,
  rejectRawPlace,
  updateRawPlaceStatus,
  type PlaceEditorDraft,
  type RawPlaceSaveAction,
  type RecentRawPlaceItem,
} from './raw-place-store'

export type { GridSweepItem, PlaceEditorDraft, RawPlaceSaveAction, RecentRawPlaceItem }
export type { GridSweepStatus, GridSweepCellStatus, GridSweepCellItem } from './grid-sweep-store'

export type ReviewQueueStatus = 'pending' | 'in_review' | 'approved' | 'merged' | 'rejected'
export type ReviewAction = 'start_review' | 'approve' | 'merge' | 'reject'

export type ReviewQueueItem = {
  id: string
  reason: string
  status: ReviewQueueStatus
  notes: string | null
  score: number | null
  createdAt: string
  updatedAt: string
  rawPlace: {
    id: string
    sourceName: string
    sourceId: string
    nameRaw: string | null
    lat: number | null
    lng: number | null
    addressRaw: string | null
    phoneRaw: string | null
    websiteRaw: string | null
    categoryRaw: string | null
    processingStatus: string
    importedAt: string
  }
  candidatePlace: {
    id: string
    name: string
    slug: string
    categoryPrimary: string
    status: string
    verificationStatus: string
  } | null
}

export type ReviewDashboardSnapshot = {
  queue: ReviewQueueItem[]
  sweeps: GridSweepItem[]
  rawResults: RecentRawPlaceItem[]
  stats: {
    pendingReviews: number
    pendingRawPlaces: number
    draftPlaces: number
    publishedPlaces: number
    trackedSweeps: number
    runningSweeps: number
  }
  categoryOptions: Array<{ id: string; label: string }>
}

type ReviewQueueRow = {
  id: string
  reason: string
  status: ReviewQueueStatus
  notes: string | null
  score: number | null
  created_at: string
  updated_at: string
  raw_place:
    | {
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
      }
    | Array<{
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
      }>
    | null
  candidate_place:
    | {
        id: string
        name: string
        slug: string
        category_primary: string
        status: string
        verification_status: string
      }
    | Array<{
        id: string
        name: string
        slug: string
        category_primary: string
        status: string
        verification_status: string
      }>
    | null
}

export function isPlaceReviewStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function getReviewDashboardSnapshot(limit = 276): Promise<ReviewDashboardSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin baglantisi hazir degil.')
  }

  const [queueResult, sweeps, rawResults, pendingReviews, pendingRawPlaces, draftPlaces, publishedPlaces, trackedSweeps, runningSweeps] =
    await Promise.all([
      client
        .from('review_queue')
        .select(
          `
            id,
            reason,
            status,
            notes,
            score,
            created_at,
            updated_at,
            raw_place:raw_places (
              id, source_name, source_id, name_raw, lat, lng,
              address_raw, phone_raw, website_raw, category_raw,
              processing_status, imported_at
            ),
            candidate_place:places (
              id, name, slug, category_primary, status, verification_status
            )
          `,
        )
        .order('created_at', { ascending: true })
        .limit(limit),
      fetchGridSweeps(client, 6),
      fetchRecentRawPlaces(client, Math.max(limit, 48)),
      countRows(client, 'review_queue', (q) => q.in('status', ['pending', 'in_review'])),
      countRows(client, 'raw_places', (q) => q.eq('processing_status', 'pending')),
      countRows(client, 'places', (q) => q.in('status', ['draft', 'review'])),
      countRows(client, 'places', (q) => q.eq('status', 'published')),
      countRows(client, 'grid_sweeps', (q) => q),
      countRows(client, 'grid_sweeps', (q) => q.eq('status', 'running')),
    ])

  if (queueResult.error) {
    throw new Error('Review kuyrugu okunamadi.')
  }

  return {
    queue: ((queueResult.data ?? []) as unknown as ReviewQueueRow[])
      .map(mapReviewQueueRow)
      .filter((item): item is ReviewQueueItem => item !== null),
    sweeps,
    rawResults,
    stats: {
      pendingReviews,
      pendingRawPlaces,
      draftPlaces,
      publishedPlaces,
      trackedSweeps,
      runningSweeps,
    },
    categoryOptions: PLACE_CATEGORY_OPTIONS.map((option) => ({ id: option.id, label: option.label })),
  }
}

export async function applyReviewAction(input: {
  reviewId: string
  action: ReviewAction
  notes?: string | null
  candidatePlaceId?: string | null
}): Promise<ReviewDashboardSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin baglantisi hazir degil.')
  }

  const { data: reviewRow, error: reviewError } = await client
    .from('review_queue')
    .select('id, raw_place_id, candidate_place_id')
    .eq('id', input.reviewId)
    .single()

  if (reviewError || !reviewRow) {
    throw new Error('Review kaydi bulunamadi.')
  }

  const notes = input.notes?.trim() || null

  switch (input.action) {
    case 'start_review':
      await updateReviewQueue(client, input.reviewId, { status: 'in_review', notes })
      break
    case 'approve':
      await updateReviewQueue(client, input.reviewId, { status: 'approved', notes })
      await updateRawPlaceStatus(client, reviewRow.raw_place_id, 'review')
      break
    case 'reject':
      await updateReviewQueue(client, input.reviewId, { status: 'rejected', notes })
      await updateRawPlaceStatus(client, reviewRow.raw_place_id, 'rejected')
      break
    case 'merge': {
      const candidatePlaceId = input.candidatePlaceId ?? reviewRow.candidate_place_id

      if (!candidatePlaceId) {
        throw new Error('Merge için candidate_place_id gerekli.')
      }

      await updateReviewQueue(client, input.reviewId, {
        status: 'merged',
        notes,
        candidate_place_id: candidatePlaceId,
      })
      await updateRawPlaceStatus(client, reviewRow.raw_place_id, 'normalized')
      break
    }
    default:
      throw new Error('Desteklenmeyen review aksiyonu.')
  }

  return getReviewDashboardSnapshot()
}

export async function applyRawPlaceAction(input: {
  rawPlaceId: string
  action: RawPlaceSaveAction
  draft?: PlaceEditorDraft
}): Promise<ReviewDashboardSnapshot> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin baglantisi hazir degil.')
  }

  if (input.action === 'reject') {
    await rejectRawPlace(client, input.rawPlaceId)
    return getReviewDashboardSnapshot()
  }

  if (!input.draft) {
    throw new Error('Mekan taslagi gonderilmedi.')
  }

  await persistPlaceFromRaw(client, {
    rawPlaceId: input.rawPlaceId,
    draft: input.draft,
    publish: input.action === 'publish',
  })

  return getReviewDashboardSnapshot()
}

async function countRows(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  table: 'review_queue' | 'raw_places' | 'places' | 'grid_sweeps',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate: (query: any) => any,
): Promise<number> {
  const response = await mutate(client.from(table).select('*', { count: 'exact', head: true }))

  if (response.error) {
    throw new Error(`Sayac okunamadi: ${table}`)
  }

  return response.count ?? 0
}

async function updateReviewQueue(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  reviewId: string,
  values: Record<string, string | null>,
): Promise<void> {
  const { error } = await client.from('review_queue').update(values).eq('id', reviewId)

  if (error) {
    throw new Error('Review kaydi guncellenemedi.')
  }
}

function mapReviewQueueRow(row: ReviewQueueRow): ReviewQueueItem | null {
  const rawPlace = Array.isArray(row.raw_place) ? (row.raw_place[0] ?? null) : row.raw_place
  const candidatePlace = Array.isArray(row.candidate_place)
    ? (row.candidate_place[0] ?? null)
    : row.candidate_place

  if (!rawPlace) {
    return null
  }

  return {
    id: row.id,
    reason: row.reason,
    status: row.status,
    notes: row.notes,
    score: row.score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rawPlace: {
      id: rawPlace.id,
      sourceName: rawPlace.source_name,
      sourceId: rawPlace.source_id,
      nameRaw: rawPlace.name_raw,
      lat: rawPlace.lat,
      lng: rawPlace.lng,
      addressRaw: rawPlace.address_raw,
      phoneRaw: rawPlace.phone_raw,
      websiteRaw: rawPlace.website_raw,
      categoryRaw: rawPlace.category_raw,
      processingStatus: rawPlace.processing_status,
      importedAt: rawPlace.imported_at,
    },
    candidatePlace: candidatePlace
      ? {
          id: candidatePlace.id,
          name: candidatePlace.name,
          slug: candidatePlace.slug,
          categoryPrimary: candidatePlace.category_primary,
          status: candidatePlace.status,
          verificationStatus: candidatePlace.verification_status,
        }
      : null,
  }
}
