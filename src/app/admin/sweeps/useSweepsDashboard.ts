import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { PanelStatus, RawPlaceAction, RecentRawPlaceItem, SweepDashboardSnapshot } from '@/types/review'

import { useAdminAuth } from '../review/useAdminAuth'
import { useDraftEditor } from '../review/useDraftEditor'

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Sweep paneli yukleniyor...',
}

const EMPTY_SNAPSHOT: SweepDashboardSnapshot = {
  sweeps: [],
  sweepPlaces: [],
  stats: {
    trackedSweeps: 0,
    runningSweeps: 0,
    sweepPlaces: 0,
    pendingSweepPlaces: 0,
    publishedSweepPlaces: 0,
  },
  categoryOptions: [],
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export function useSweepsDashboard() {
  const router = useRouter()
  const {
    adminPassword,
    setAdminPassword,
    getStoredAdminPassword,
    logout,
    requireAuth,
    persistPassword,
  } = useAdminAuth()
  const draftEditor = useDraftEditor()

  const [snapshot, setSnapshot] = useState<SweepDashboardSnapshot>(EMPTY_SNAPSHOT)
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [activeSweepPlaceId, setActiveSweepPlaceId] = useState<string | null>(null)

  const hydrateDrafts = useCallback((items: RecentRawPlaceItem[]) => {
    draftEditor.hydrate(items)
    setActiveSweepPlaceId((current) => current ?? items[0]?.id ?? null)
  }, [draftEditor])

  const loadDashboard = useCallback(async (passwordOverride?: string, redirectOnAuthError = false) => {
    const password = (passwordOverride ?? adminPassword).trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Sweep oturumlari ve sweep kaynakli mekanlar yukleniyor...' })

    try {
      const response = await fetch('/api/admin/sweeps?limit=500', {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })

      const envelope = (await response.json()) as ApiEnvelope<SweepDashboardSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Sweep paneli yuklenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.sweepPlaces)
      setStatus({
        tone: 'success',
        message: `${envelope.data.sweeps.length} sweep oturumu ve ${envelope.data.sweepPlaces.length} sweep kaynakli mekan yuklendi.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sweep paneli yuklenemedi.'

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

  const runSweepPlaceAction = async (placeId: string, action: RawPlaceAction) => {
    const password = requireAuth()

    if (!password) {
      return
    }

    const draft = draftEditor.drafts[placeId]

    if (!draft && action !== 'reject') {
      setStatus({ tone: 'error', message: 'Sweep mekan editoru hazir degil.' })
      return
    }

    setActiveActionId(placeId)
    setStatus({
      tone: 'neutral',
      message: action === 'publish' ? 'Sweep mekan yayina aliniyor...' : 'Sweep mekan kaydi guncelleniyor...',
    })

    try {
      const response = await fetch('/api/admin/sweeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ placeId, action, draft }),
      })

      const envelope = (await response.json()) as ApiEnvelope<SweepDashboardSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Sweep mekan kaydi guncellenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.sweepPlaces)
      setStatus({
        tone: 'success',
        message:
          action === 'publish'
            ? 'Sweep mekan onaylandi ve yayina alindi.'
            : action === 'reject'
              ? 'Sweep mekan reddedildi.'
              : 'Sweep mekan taslagi kaydedildi.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Sweep mekan kaydi guncellenemedi.',
      })
    } finally {
      setActiveActionId(null)
    }
  }

  return {
    snapshot,
    drafts: draftEditor.drafts,
    status,
    isLoading,
    activeActionId,
    activeSweepPlaceId,
    setActiveSweepPlaceId,
    loadDashboard,
    runSweepPlaceAction,
    updateDraftField: draftEditor.updateField,
    updateImageField: draftEditor.updateImage,
    addImageField: draftEditor.addImage,
    removeImageField: draftEditor.removeImage,
    logout,
  }
}
