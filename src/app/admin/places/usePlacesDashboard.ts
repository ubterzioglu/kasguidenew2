import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { AdminPlacesSnapshot, ExistingPlaceAction, PanelStatus, PlaceEditorDraft } from '@/types/review'

import { useAdminAuth } from '../review/useAdminAuth'
import { useDraftEditor } from '../review/useDraftEditor'

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Mekanlar paneli yukleniyor...',
}

const EMPTY_SNAPSHOT: AdminPlacesSnapshot = {
  places: [],
  stats: {
    totalPlaces: 0,
    publishedPlaces: 0,
    draftPlaces: 0,
    sweepedPlaces: 0,
  },
  categoryOptions: [],
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export function usePlacesDashboard() {
  const router = useRouter()
  const {
    adminPassword,
    setAdminPassword,
    getStoredAdminPassword,
    logout,
    requireAuth,
    persistPassword,
  } = useAdminAuth()
  const editor = useDraftEditor()

  const [snapshot, setSnapshot] = useState<AdminPlacesSnapshot>(EMPTY_SNAPSHOT)
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)

  const hydrateDrafts = useCallback((items: AdminPlacesSnapshot['places']) => {
    editor.hydrate(items)
    setActivePlaceId((current) => current ?? items[0]?.id ?? null)
  }, [editor])

  const loadDashboard = useCallback(async (passwordOverride?: string, redirectOnAuthError = false) => {
    const password = (passwordOverride ?? adminPassword).trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Mekan listesi yukleniyor...' })

    try {
      const response = await fetch('/api/admin/places?limit=2000', {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })

      const envelope = (await response.json()) as ApiEnvelope<AdminPlacesSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Mekan paneli yuklenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.places)
      setStatus({
        tone: 'success',
        message: `${envelope.data.places.length} mekan yuklendi. Sweep kaynakli mekan sayisi ${envelope.data.stats.sweepedPlaces}.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mekan paneli yuklenemedi.'

      if (redirectOnAuthError && message.toLowerCase().includes('yetkisiz')) {
        logout()
        return
      }

      setStatus({ tone: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }, [adminPassword, hydrateDrafts, logout, persistPassword, router])

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

  const runPlaceAction = async (placeId: string, action: ExistingPlaceAction) => {
    const password = requireAuth()

    if (!password) {
      return
    }

    const draft = editor.drafts[placeId]

    if (!draft) {
      setStatus({ tone: 'error', message: 'Mekan editoru hazir degil.' })
      return
    }

    const nextDraft: PlaceEditorDraft =
      action === 'publish'
        ? { ...draft, status: 'published', verificationStatus: 'verified' }
        : { ...draft, status: draft.status === 'published' ? 'admin' : draft.status }

    setActiveActionId(placeId)
    setStatus({
      tone: 'neutral',
      message: action === 'publish' ? 'Mekan yayina aliniyor...' : 'Mekan kaydediliyor...',
    })

    try {
      const response = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ placeId, draft: nextDraft }),
      })

      const envelope = (await response.json()) as ApiEnvelope<AdminPlacesSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Mekan kaydi guncellenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.places)
      setStatus({
        tone: 'success',
        message: action === 'publish' ? 'Mekan yayina alindi.' : 'Mekan kaydedildi.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Mekan kaydi guncellenemedi.',
      })
    } finally {
      setActiveActionId(null)
    }
  }

  return {
    snapshot,
    drafts: editor.drafts,
    status,
    isLoading,
    activeActionId,
    activePlaceId,
    setActivePlaceId,
    loadDashboard,
    runPlaceAction,
    updateDraftField: editor.updateField,
    updateImageField: editor.updateImage,
    addImageField: editor.addImage,
    removeImageField: editor.removeImage,
    logout,
  }
}
