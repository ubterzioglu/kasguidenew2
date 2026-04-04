/**
 * Shared type definitions for the review pipeline.
 * Import from here in both server (lib/) and client (app/admin/) code.
 * No runtime code — type exports only.
 */

export type ReviewQueueStatus = 'pending' | 'in_review' | 'approved' | 'merged' | 'rejected'
export type ReviewAction = 'start_review' | 'approve' | 'merge' | 'reject'
export type GridSweepStatus = 'running' | 'completed' | 'partial' | 'failed'
export type StatusTone = 'neutral' | 'success' | 'error'
export type RawPlaceAction = 'save_draft' | 'publish' | 'reject'
export type ExistingPlaceAction = 'save' | 'publish'
export type PlaceIntakeChannel = 'sweep' | 'manual' | 'import' | 'migrated'
export type PlaceStatus =
  | 'pending'
  | 'review'
  | 'admin'
  | 'published'
  | 'archived'
  | 'rejected'
  | 'merged'
  | 'error'
export type PlaceVerificationStatus = 'pending' | 'reviewed' | 'verified' | 'rejected'

export type GridSweepCellItem = {
  id: string
  cellIndex: number
  status: 'pending' | 'success' | 'failed'
  bbox: {
    south: number
    west: number
    north: number
    east: number
  }
  fetchedCount: number
  preparedCount: number
  errorMessage: string | null
  completedAt: string | null
}

export type GridSweepItem = {
  id: string
  regionName: string
  presetName: string | null
  status: GridSweepStatus
  originLat: number
  originLng: number
  cellSizeMeters: number
  totalCells: number
  processedCells: number
  successfulCells: number
  failedCells: number
  bbox: {
    south: number
    west: number
    north: number
    east: number
  }
  startedAt: string
  completedAt: string | null
  cells: GridSweepCellItem[]
}

export type PlaceEditorDraft = {
  placeId: string | null
  slug: string | null
  name: string
  headline: string
  shortDescription: string
  longDescription: string
  kasguideBadge: string
  categoryPrimary: string
  address: string
  phone: string
  website: string
  imageUrls: string[]
  status: PlaceStatus
  verificationStatus: PlaceVerificationStatus
}

export type RecentRawPlaceItem = {
  id: string
  intakeChannel: PlaceIntakeChannel
  isSweeped: boolean
  sweepId: string | null
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
  gridKey: string | null
  cellId: string | null
  googleMapsUri: string | null
  draft: PlaceEditorDraft
}

export type ExistingPlaceItem = {
  id: string
  intakeChannel: PlaceIntakeChannel
  isSweeped: boolean
  sweepId: string | null
  sourceName: string | null
  sourceId: string | null
  updatedAt: string
  draft: PlaceEditorDraft
}

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

export type SweepDashboardSnapshot = {
  sweeps: GridSweepItem[]
  sweepPlaces: RecentRawPlaceItem[]
  stats: {
    trackedSweeps: number
    runningSweeps: number
    sweepPlaces: number
    pendingSweepPlaces: number
    publishedSweepPlaces: number
  }
  categoryOptions: Array<{ id: string; label: string }>
}

export type AdminPlacesSnapshot = {
  places: ExistingPlaceItem[]
  stats: {
    totalPlaces: number
    publishedPlaces: number
    draftPlaces: number
    sweepedPlaces: number
  }
  categoryOptions: Array<{ id: string; label: string }>
}

export type PanelStatus = {
  tone: StatusTone
  message: string
}
