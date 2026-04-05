import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { PanelStatus, RawPlaceAction, RecentRawPlaceItem, SweepDashboardSnapshot } from '@/types/review'

import { useAdminAuth } from '../review/useAdminAuth'
import { useDraftEditor } from '../review/useDraftEditor'

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Sweep paneli yükleniyor...',
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

type RunOverpassSweepPayload = {
  gridX: number
  gridY: number
  cellSizeMeters: number
  regionName?: string
  dryRun?: boolean
}

type OverpassSweepRunResponse = {
  message: string
  result: {
    gridKey?: string
    cellId?: string
    inserted?: number
    uniquePlaces?: number
    fetched?: number
    status?: string
    dryRun?: boolean
  }
  snapshot: SweepDashboardSnapshot
}

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
    setStatus({ tone: 'neutral', message: 'Sweep oturumları ve sweep kaynaklı mekanlar yükleniyor...' })

    try {
      const response = await fetch('/api/admin/sweeps?limit=500', {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })

      const envelope = (await response.json()) as ApiEnvelope<SweepDashboardSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Sweep paneli yüklenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.sweepPlaces)
      setStatus({
        tone: 'success',
        message: `${envelope.data.sweeps.length} sweep oturumu ve ${envelope.data.sweepPlaces.length} sweep kaynaklı mekan yüklendi.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sweep paneli yüklenemedi.'

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
      setStatus({ tone: 'error', message: 'Sweep mekan editörü hazır değil.' })
      return
    }

    setActiveActionId(placeId)
    setStatus({
      tone: 'neutral',
      message: action === 'publish' ? 'Sweep mekan yayına alınıyor...' : 'Sweep mekan kaydı güncelleniyor...',
    })

    try {
      const response = await fetch('/api/admin/sweeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ placeId, action, draft }),
      })

      const envelope = (await response.json()) as ApiEnvelope<SweepDashboardSnapshot>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Sweep mekan kaydı güncellenemedi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data)
      hydrateDrafts(envelope.data.sweepPlaces)
      setStatus({
        tone: 'success',
        message:
          action === 'publish'
            ? 'Sweep mekan onaylandı ve yayına alındı.'
            : action === 'reject'
              ? 'Sweep mekan reddedildi.'
              : 'Sweep mekan taslağı kaydedildi.',
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Sweep mekan kaydı güncellenemedi.',
      })
    } finally {
      setActiveActionId(null)
    }
  }

  const runOverpassSweep = async (payload: RunOverpassSweepPayload) => {
    const password = requireAuth()

    if (!password) {
      return
    }

    setIsLoading(true)
    setStatus({
      tone: 'neutral',
      message: payload.dryRun
        ? 'Overpass dry-run baslatiliyor...'
        : 'Overpass sweep calistiriliyor...',
    })

    try {
      const response = await fetch('/api/admin/sweeps/overpass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify(payload),
      })

      const envelope = (await response.json()) as ApiEnvelope<OverpassSweepRunResponse>

      if (!response.ok || !envelope.success) {
        throw new Error(!envelope.success ? envelope.error : 'Overpass sweep calistirilamadi.')
      }

      persistPassword(password)
      setSnapshot(envelope.data.snapshot)
      hydrateDrafts(envelope.data.snapshot.sweepPlaces)
      setStatus({
        tone: 'success',
        message: envelope.data.message,
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Overpass sweep calistirilamadi.',
      })
    } finally {
      setIsLoading(false)
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
    runOverpassSweep,
    runSweepPlaceAction,
    updateDraftField: draftEditor.updateField,
    updateImageField: draftEditor.updateImage,
    addImageField: draftEditor.addImage,
    removeImageField: draftEditor.removeImage,
    logout,
  }
}
