import 'server-only'

import type {
  ExistingPlaceItem,
  PlaceEditorDraft,
  RawPlaceAction,
  RecentRawPlaceItem,
  ReviewAction,
  ReviewDashboardSnapshot,
} from '@/types/review'

import {
  applyAdminPlaceAction,
  getAdminPlacesSnapshot,
  isPlaceAdminStoreConfigured,
} from './place-admin-store'
import {
  applySweepPlaceAction,
  getSweepDashboardSnapshot,
  isPlaceSweepStoreConfigured,
} from './place-sweep-store'

export type { GridSweepItem, GridSweepCellItem, GridSweepCellStatus, GridSweepStatus } from './grid-sweep-store'
export type { ExistingPlaceItem, PlaceEditorDraft, RecentRawPlaceItem }
export type RawPlaceSaveAction = RawPlaceAction

export function isPlaceReviewStoreConfigured() {
  return isPlaceSweepStoreConfigured() && isPlaceAdminStoreConfigured()
}

export async function getReviewDashboardSnapshot(limit = 276): Promise<ReviewDashboardSnapshot> {
  const sweepSnapshot = await getSweepDashboardSnapshot(limit)
  const placesSnapshot = await getAdminPlacesSnapshot()

  return {
    queue: [],
    sweeps: sweepSnapshot.sweeps,
    rawResults: sweepSnapshot.sweepPlaces,
    stats: {
      pendingReviews: 0,
      pendingRawPlaces: sweepSnapshot.stats.pendingSweepPlaces,
      draftPlaces: placesSnapshot.stats.draftPlaces,
      publishedPlaces: placesSnapshot.stats.publishedPlaces,
      trackedSweeps: sweepSnapshot.stats.trackedSweeps,
      runningSweeps: sweepSnapshot.stats.runningSweeps,
    },
    categoryOptions: sweepSnapshot.categoryOptions,
  }
}

export async function applyReviewAction(_input: {
  reviewId: string
  action: ReviewAction
  notes?: string | null
  candidatePlaceId?: string | null
}): Promise<ReviewDashboardSnapshot> {
  throw new Error('Review paneli artik sweep ve mekan yonetiminden ayrildi.')
}

export async function applyRawPlaceAction(input: {
  rawPlaceId: string
  action: RawPlaceSaveAction
  draft?: PlaceEditorDraft
}): Promise<ReviewDashboardSnapshot> {
  const snapshot = await applySweepPlaceAction({
    placeId: input.rawPlaceId,
    action: input.action,
    draft: input.draft,
  })

  return {
    queue: [],
    sweeps: snapshot.sweeps,
    rawResults: snapshot.sweepPlaces,
    stats: {
      pendingReviews: 0,
      pendingRawPlaces: snapshot.stats.pendingSweepPlaces,
      draftPlaces: 0,
      publishedPlaces: snapshot.stats.publishedSweepPlaces,
      trackedSweeps: snapshot.stats.trackedSweeps,
      runningSweeps: snapshot.stats.runningSweeps,
    },
    categoryOptions: snapshot.categoryOptions,
  }
}

export async function getExistingPlacesSnapshot(limit = 400): Promise<{
  places: ExistingPlaceItem[]
  categoryOptions: Array<{ id: string; label: string }>
}> {
  const snapshot = await getAdminPlacesSnapshot(limit)

  return {
    places: snapshot.places,
    categoryOptions: snapshot.categoryOptions,
  }
}

export async function applyExistingPlaceAction(input: {
  placeId: string
  draft: PlaceEditorDraft
}): Promise<{
  places: ExistingPlaceItem[]
  categoryOptions: Array<{ id: string; label: string }>
}> {
  const snapshot = await applyAdminPlaceAction(input)

  return {
    places: snapshot.places,
    categoryOptions: snapshot.categoryOptions,
  }
}
