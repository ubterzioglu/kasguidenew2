import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { AdminPlacesSnapshot, PanelStatus, PlaceEditorDraft } from '@/types/review'

import { adminLogout, hasSessionCookie } from '@/lib/admin-session-client'
import { useDraftEditor } from '../review/useDraftEditor'

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Mekanlar paneli yükleniyor...',
}

const EMPTY_SNAPSHOT: AdminPlacesSnapshot = {
  places: [],
  stats: {
    totalPlaces: 0,
    publishedPlaces: 0,
    draftPlaces: 0,
  },
  categoryOptions: [],
  badgeOptions: [],
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export function usePlacesDashboard() {
  const router = useRouter()
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

  const loadDashboard = useCallback(async (redirectOnAuthError = false) => {
    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Mekan listesi yükleniyor...' })

    try {
      const response = await fetch('/api/admin/places?limit=2000', {
        credentials: 'include',
        cache: 'no-store',
      })

      const envelope = (await response.json()) as ApiEnvelope<AdminPlacesSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Mekan paneli yüklenemedi.')
      }

      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.places)
      setStatus({
        tone: 'success',
        message: `${envelope.data.places.length} mekan yüklendi.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mekan paneli yüklenemedi.'

      if (redirectOnAuthError && message.toLowerCase().includes('yetkisiz')) {
        await logout()
        return
      }

      setStatus({ tone: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }, [hydrateDrafts, router])

  useEffect(() => {
    if (!hasSessionCookie()) {
      router.replace('/admin')
      return
    }

    void loadDashboard(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function logout() {
    await adminLogout()
    router.replace('/admin')
  }

  const runPlaceAction = async (placeId: string) => {
    const draft = editor.drafts[placeId]

    if (!draft) {
      setStatus({ tone: 'error', message: 'Mekan editörü hazır değil.' })
      return
    }

    const nextDraft: PlaceEditorDraft = {
      ...draft,
      status: draft.status === 'published' ? 'published' : 'admin',
      verificationStatus: draft.status === 'published' ? 'verified' : 'reviewed',
    }

    setActiveActionId(placeId)
    setStatus({
      tone: 'neutral',
      message: nextDraft.status === 'published' ? 'Yayin durumu kaydediliyor...' : 'Mekan kaydediliyor...',
    })

    try {
      const response = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ placeId, draft: nextDraft }),
      })

      const envelope = (await response.json()) as ApiEnvelope<AdminPlacesSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Mekan kaydı güncellenemedi.')
      }

      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.places)
      setStatus({
        tone: 'success',
        message: nextDraft.status === 'published' ? 'Mekan yayinda olarak kaydedildi.' : 'Mekan taslak olarak kaydedildi.',
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
