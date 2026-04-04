import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type {
  ReviewDashboardSnapshot,
  PlaceEditorDraft,
  PanelStatus,
  RecentRawPlaceItem,
  ReviewAction,
  RawPlaceAction,
  ExistingPlaceItem,
  ExistingPlaceAction,
} from './types'
import { useAdminAuth } from './useAdminAuth'
import { useDraftEditor } from './useDraftEditor'

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Sweep ve mekan editörü yükleniyor...',
}

const EMPTY_SNAPSHOT: ReviewDashboardSnapshot = {
  queue: [],
  sweeps: [],
  rawResults: [],
  stats: {
    pendingReviews: 0,
    pendingRawPlaces: 0,
    draftPlaces: 0,
    publishedPlaces: 0,
    trackedSweeps: 0,
    runningSweeps: 0,
  },
  categoryOptions: [],
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export function useReviewDashboard() {
  const router = useRouter()
  const {
    adminPassword,
    setAdminPassword,
    getStoredAdminPassword,
    logout,
    requireAuth,
    persistPassword,
  } = useAdminAuth()

  const rawEditor = useDraftEditor()
  const existingEditor = useDraftEditor()

  const [snapshot, setSnapshot] = useState<ReviewDashboardSnapshot>(EMPTY_SNAPSHOT)
  const [existingPlaces, setExistingPlaces] = useState<ExistingPlaceItem[]>([])
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [activeRawPlaceId, setActiveRawPlaceId] = useState<string | null>(null)
  const [activeExistingPlaceId, setActiveExistingPlaceId] = useState<string | null>(null)

  const hydrateDrafts = useCallback((rawResults: RecentRawPlaceItem[]) => {
    rawEditor.hydrate(rawResults)
    setActiveRawPlaceId((current) => {
      if (!current && rawResults[0]) return rawResults[0].id
      return current
    })
  }, [rawEditor.hydrate]) // eslint-disable-line react-hooks/exhaustive-deps

  const hydrateExistingDrafts = useCallback((places: ExistingPlaceItem[]) => {
    setExistingPlaces(places)
    existingEditor.hydrate(places)
    setActiveExistingPlaceId((current) => {
      if (!current && places[0]) return places[0].id
      return current
    })
  }, [existingEditor.hydrate]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboard = useCallback(async (passwordOverride?: string, redirectOnAuthError = false) => {
    const password = (passwordOverride ?? adminPassword).trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Grid sweep kayıtları ve mekan editörü yükleniyor...' })

    try {
      const [reviewResponse, placesResponse] = await Promise.all([
        fetch('/api/admin/review?limit=276', {
          headers: { 'X-Admin-Password': password },
          cache: 'no-store',
        }),
        fetch('/api/admin/places?limit=1000', {
          headers: { 'X-Admin-Password': password },
          cache: 'no-store',
        }),
      ])

      const reviewEnvelope = (await reviewResponse.json()) as ApiEnvelope<ReviewDashboardSnapshot>
      const placesEnvelope = (await placesResponse.json()) as ApiEnvelope<{
        places: ExistingPlaceItem[]
        categoryOptions: Array<{ id: string; label: string }>
      }>

      if (!reviewResponse.ok || !reviewEnvelope.success) {
        throw new Error(
          !reviewEnvelope.success ? reviewEnvelope.error : 'Admin verisi yüklenemedi.',
        )
      }

      if (!placesResponse.ok || !placesEnvelope.success) {
        throw new Error(
          !placesEnvelope.success ? placesEnvelope.error : 'Mevcut mekanlar yüklenemedi.',
        )
      }

      const reviewData = reviewEnvelope.data
      const placesData = placesEnvelope.data

      persistPassword(password)
      setSnapshot(reviewData)
      hydrateDrafts(reviewData.rawResults)
      hydrateExistingDrafts(placesData.places)
      setStatus({
        tone: 'success',
        message: `${reviewData.rawResults.length} sweep mekanı, ${reviewData.sweeps.length} sweep oturumu ve ${placesData.places.length} mevcut mekan yüklendi.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin verisi yüklenemedi.'

      if (redirectOnAuthError && message.toLowerCase().includes('yetkisiz')) {
        logout()
        return
      }

      setStatus({ tone: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }, [adminPassword, hydrateDrafts, hydrateExistingDrafts, logout, persistPassword, router])

  useEffect(() => {
    const storedPassword = getStoredAdminPassword()

    if (!storedPassword) {
      router.replace('/admin')
      return
    }

    setAdminPassword(storedPassword)
    void loadDashboard(storedPassword, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const runReviewAction = async (reviewId: string, action: ReviewAction, candidatePlaceId?: string | null) => {
    const password = requireAuth()
    if (!password) return

    setActiveActionId(reviewId)
    setStatus({ tone: 'neutral', message: 'Review aksiyonu uygulanıyor...' })

    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ reviewId, action, candidatePlaceId }),
      })

      const envelope = (await response.json()) as ApiEnvelope<ReviewDashboardSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Review aksiyonu başarısız oldu.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.rawResults)
      setStatus({ tone: 'success', message: 'Review kaydı güncellendi.' })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Review aksiyonu başarısız oldu.',
      })
    } finally {
      setActiveActionId(null)
    }
  }

  const runRawPlaceAction = async (rawPlaceId: string, action: RawPlaceAction) => {
    const password = requireAuth()
    if (!password) return

    const draft = rawEditor.drafts[rawPlaceId]

    if (!draft && action !== 'reject') {
      setStatus({ tone: 'error', message: 'Mekan editörü hazır değil.' })
      return
    }

    setActiveActionId(rawPlaceId)
    setStatus({
      tone: 'neutral',
      message: action === 'publish' ? 'Mekan yayına alınıyor...' : 'Mekan kaydı güncelleniyor...',
    })

    try {
      const response = await fetch('/api/admin/raw-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ rawPlaceId, action, draft }),
      })

      const envelope = (await response.json()) as ApiEnvelope<ReviewDashboardSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Mekan kaydı güncellenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.rawResults)
      setStatus({
        tone: 'success',
        message:
          action === 'publish'
            ? 'Mekan onaylandı ve yayına alındı.'
            : action === 'reject'
              ? 'Ham mekan kaydı reddedildi.'
              : 'Mekan taslağı kaydedildi.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Mekan kaydı güncellenemedi.',
      })
    } finally {
      setActiveActionId(null)
    }
  }

  const runExistingPlaceAction = async (placeId: string, action: ExistingPlaceAction) => {
    const password = requireAuth()
    if (!password) return

    const draft = existingEditor.drafts[placeId]
    if (!draft) {
      setStatus({ tone: 'error', message: 'Mevcut mekan editörü hazır değil.' })
      return
    }

    const nextDraft: PlaceEditorDraft =
      action === 'publish'
        ? { ...draft, status: 'published', verificationStatus: 'verified' }
        : { ...draft, status: 'admin' }

    setActiveActionId(placeId)
    setStatus({
      tone: 'neutral',
      message: action === 'publish' ? 'Mevcut mekan yayına alınıyor...' : 'Mevcut mekan kaydediliyor...',
    })

    try {
      const response = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ placeId, draft: nextDraft }),
      })

      const envelope = (await response.json()) as ApiEnvelope<{
        places: ExistingPlaceItem[]
        categoryOptions: Array<{ id: string; label: string }>
      }>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Mevcut mekan güncellenemedi.')
      }

      persistPassword(password)
      hydrateExistingDrafts(envelope.data.places)
      setStatus({
        tone: 'success',
        message: action === 'publish' ? 'Mevcut mekan yayına alındı.' : 'Mevcut mekan kaydedildi.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Mevcut mekan güncellenemedi.',
      })
    } finally {
      setActiveActionId(null)
    }
  }

  return {
    snapshot,
    drafts: rawEditor.drafts,
    existingPlaces,
    existingDrafts: existingEditor.drafts,
    status,
    isLoading,
    activeActionId,
    activeRawPlaceId,
    setActiveRawPlaceId,
    activeExistingPlaceId,
    setActiveExistingPlaceId,
    loadDashboard,
    runReviewAction,
    runRawPlaceAction,
    runExistingPlaceAction,
    updateDraftField: rawEditor.updateField,
    updateImageField: rawEditor.updateImage,
    addImageField: rawEditor.addImage,
    removeImageField: rawEditor.removeImage,
    updateExistingDraftField: existingEditor.updateField,
    updateExistingImageField: existingEditor.updateImage,
    addExistingImageField: existingEditor.addImage,
    removeExistingImageField: existingEditor.removeImage,
    logout,
  }
}
