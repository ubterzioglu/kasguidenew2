import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
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

export function useReviewDashboard() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [snapshot, setSnapshot] = useState<ReviewDashboardSnapshot>(EMPTY_SNAPSHOT)
  const [drafts, setDrafts] = useState<Record<string, PlaceEditorDraft>>({})
  const [existingPlaces, setExistingPlaces] = useState<ExistingPlaceItem[]>([])
  const [existingDrafts, setExistingDrafts] = useState<Record<string, PlaceEditorDraft>>({})
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [activeRawPlaceId, setActiveRawPlaceId] = useState<string | null>(null)
  const [activeExistingPlaceId, setActiveExistingPlaceId] = useState<string | null>(null)

  const hydrateDrafts = useCallback((rawResults: RecentRawPlaceItem[]) => {
    setDrafts(() => {
      const nextDrafts: Record<string, PlaceEditorDraft> = {}
      for (const item of rawResults) {
        nextDrafts[item.id] = {
          ...item.draft,
          imageUrls: item.draft.imageUrls.length > 0 ? [...item.draft.imageUrls] : [''],
        }
      }
      return nextDrafts
    })

    setActiveRawPlaceId((current) => {
      if (!current && rawResults[0]) return rawResults[0].id
      return current
    })
  }, [])

  const hydrateExistingDrafts = useCallback((places: ExistingPlaceItem[]) => {
    setExistingPlaces(places)
    setExistingDrafts(() => {
      const nextDrafts: Record<string, PlaceEditorDraft> = {}
      for (const item of places) {
        nextDrafts[item.id] = {
          ...item.draft,
          imageUrls: item.draft.imageUrls.length > 0 ? [...item.draft.imageUrls] : [''],
        }
      }
      return nextDrafts
    })

    setActiveExistingPlaceId((current) => {
      if (!current && places[0]) return places[0].id
      return current
    })
  }, [])

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
          headers: {
            'X-Admin-Password': password,
          },
          cache: 'no-store',
        }),
        fetch('/api/admin/places?limit=1000', {
          headers: {
            'X-Admin-Password': password,
          },
          cache: 'no-store',
        }),
      ])

      const payload = (await reviewResponse.json()) as ReviewDashboardSnapshot & { error?: string }
      const placesPayload = (await placesResponse.json()) as
        | { places?: ExistingPlaceItem[]; error?: string }
        | undefined

      if (!reviewResponse.ok) {
        throw new Error(payload.error || 'Admin verisi yüklenemedi.')
      }

      if (!placesResponse.ok) {
        throw new Error(placesPayload?.error || 'Mevcut mekanlar yüklenemedi.')
      }

      if (!placesPayload?.places) {
        throw new Error('Mevcut mekan verisi eksik.')
      }

      storeAdminPassword(password)
      setAdminPassword(password)
      setSnapshot(payload)
      hydrateDrafts(payload.rawResults)
      hydrateExistingDrafts(placesPayload.places)
      setStatus({
        tone: 'success',
        message: `${payload.rawResults.length} sweep mekanı, ${payload.sweeps.length} sweep oturumu ve ${placesPayload.places.length} mevcut mekan yüklendi.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin verisi yüklenemedi.'

      if (redirectOnAuthError && message.toLowerCase().includes('yetkisiz')) {
        clearStoredAdminPassword()
        router.replace('/admin')
        return
      }

      setStatus({ tone: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }, [adminPassword, hydrateDrafts, hydrateExistingDrafts, router])

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
    const password = adminPassword.trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setActiveActionId(reviewId)
    setStatus({ tone: 'neutral', message: 'Review aksiyonu uygulanıyor...' })

    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ reviewId, action, candidatePlaceId }),
      })

      const payload = (await response.json()) as ReviewDashboardSnapshot & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Review aksiyonu başarısız oldu.')
      }

      storeAdminPassword(password)
      setSnapshot(payload)
      hydrateDrafts(payload.rawResults)
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
    const password = adminPassword.trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    const draft = drafts[rawPlaceId]

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
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ rawPlaceId, action, draft }),
      })

      const payload = (await response.json()) as ReviewDashboardSnapshot & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Mekan kaydı güncellenemedi.')
      }

      storeAdminPassword(password)
      setSnapshot(payload)
      hydrateDrafts(payload.rawResults)
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
    const password = adminPassword.trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    const draft = existingDrafts[placeId]
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
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ placeId, draft: nextDraft }),
      })

      const payload = (await response.json()) as { places?: ExistingPlaceItem[]; error?: string }
      if (!response.ok || !payload.places) {
        throw new Error(payload.error || 'Mevcut mekan güncellenemedi.')
      }

      storeAdminPassword(password)
      hydrateExistingDrafts(payload.places)
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

  const updateDraftField = (rawPlaceId: string, field: keyof PlaceEditorDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [rawPlaceId]: {
        ...current[rawPlaceId],
        [field]: field === 'imageUrls' ? current[rawPlaceId].imageUrls : value,
      },
    }))
  }

  const updateImageField = (rawPlaceId: string, index: number, value: string) => {
    setDrafts((current) => {
      const nextImages = [...(current[rawPlaceId]?.imageUrls ?? [''])]
      nextImages[index] = value

      return {
        ...current,
        [rawPlaceId]: {
          ...current[rawPlaceId],
          imageUrls: nextImages,
        },
      }
    })
  }

  const addImageField = (rawPlaceId: string) => {
    setDrafts((current) => {
      const images = [...(current[rawPlaceId]?.imageUrls ?? [''])]

      if (images.length >= 5) {
        return current
      }

      images.push('')

      return {
        ...current,
        [rawPlaceId]: {
          ...current[rawPlaceId],
          imageUrls: images,
        },
      }
    })
  }

  const removeImageField = (rawPlaceId: string, index: number) => {
    setDrafts((current) => {
      const images = [...(current[rawPlaceId]?.imageUrls ?? [''])]

      if (images.length <= 1) {
        images[0] = ''
      } else {
        images.splice(index, 1)
      }

      return {
        ...current,
        [rawPlaceId]: {
          ...current[rawPlaceId],
          imageUrls: images,
        },
      }
    })
  }

  const updateExistingDraftField = (placeId: string, field: keyof PlaceEditorDraft, value: string) => {
    setExistingDrafts((current) => ({
      ...current,
      [placeId]: {
        ...current[placeId],
        [field]: field === 'imageUrls' ? current[placeId].imageUrls : value,
      },
    }))
  }

  const updateExistingImageField = (placeId: string, index: number, value: string) => {
    setExistingDrafts((current) => {
      const nextImages = [...(current[placeId]?.imageUrls ?? [''])]
      nextImages[index] = value
      return {
        ...current,
        [placeId]: {
          ...current[placeId],
          imageUrls: nextImages,
        },
      }
    })
  }

  const addExistingImageField = (placeId: string) => {
    setExistingDrafts((current) => {
      const images = [...(current[placeId]?.imageUrls ?? [''])]
      if (images.length >= 5) {
        return current
      }
      images.push('')
      return {
        ...current,
        [placeId]: {
          ...current[placeId],
          imageUrls: images,
        },
      }
    })
  }

  const removeExistingImageField = (placeId: string, index: number) => {
    setExistingDrafts((current) => {
      const images = [...(current[placeId]?.imageUrls ?? [''])]
      if (images.length <= 1) {
        images[0] = ''
      } else {
        images.splice(index, 1)
      }
      return {
        ...current,
        [placeId]: {
          ...current[placeId],
          imageUrls: images,
        },
      }
    })
  }

  const logout = () => {
    clearStoredAdminPassword()
    setAdminPassword('')
    router.replace('/admin')
  }

  return {
    snapshot,
    drafts,
    existingPlaces,
    existingDrafts,
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
    updateDraftField,
    updateImageField,
    addImageField,
    removeImageField,
    updateExistingDraftField,
    updateExistingImageField,
    addExistingImageField,
    removeExistingImageField,
    logout,
  }
}
