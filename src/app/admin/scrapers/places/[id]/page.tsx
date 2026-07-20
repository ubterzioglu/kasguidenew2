'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { AdminSectionLinks } from '../../../components/AdminSectionLinks'
import { Button } from '@/components/ui/button'
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
import type { PlaceScraperCandidate, PlaceScraperJob } from '@/lib/place-scraper/types'

type StatusTone = 'neutral' | 'success' | 'error'

type PanelStatus = {
  tone: StatusTone
  message: string
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Is detayi yukleniyor...',
}

export default function AdminPlaceScraperJobDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const jobId = params.id

  const [adminPassword, setAdminPassword] = useState('')
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [job, setJob] = useState<PlaceScraperJob | null>(null)
  const [candidates, setCandidates] = useState<PlaceScraperCandidate[]>([])
  const [actioningId, setActioningId] = useState<string | null>(null)

  async function loadData(passwordOverride?: string, redirectOnAuthError = false) {
    const password = (passwordOverride ?? adminPassword).trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Is detayi yukleniyor...' })

    try {
      const response = await fetch(`/api/admin/scrapers/places/jobs/${jobId}`, {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })

      const payload = (await response.json()) as ApiEnvelope<{ job: PlaceScraperJob; candidates: PlaceScraperCandidate[] }>

      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Is detayi yuklenemedi.')
      }

      storeAdminPassword(password)
      setAdminPassword(password)
      setJob(payload.data.job)
      setCandidates(payload.data.candidates)
      setStatus({ tone: 'success', message: 'Is detayi yuklendi.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Panel yuklenemedi.'

      if (redirectOnAuthError && message.toLowerCase().includes('yetkisiz')) {
        logout()
        return
      }

      setStatus({ tone: 'error', message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const storedPassword = getStoredAdminPassword()

    if (!storedPassword) {
      router.replace('/admin')
      return
    }

    setAdminPassword(storedPassword)
    void loadData(storedPassword, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, jobId])

  function logout() {
    clearStoredAdminPassword()
    setAdminPassword('')
    router.replace('/admin')
  }

  async function actOnCandidate(candidateId: string, action: 'promote' | 'reject') {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    setActioningId(candidateId)

    try {
      const response = await fetch(`/api/admin/scrapers/places/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ action }),
      })

      const payload = (await response.json()) as ApiEnvelope<unknown>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Islem basarisiz.')
      }

      setStatus({
        tone: 'success',
        message: action === 'promote' ? 'Aday mekan olarak eklendi.' : 'Aday reddedildi.',
      })
      await loadData()
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Islem basarisiz.' })
    } finally {
      setActioningId(null)
    }
  }

  return (
    <main className="container admin-shell admin-shell-places">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">{job ? `${job.professionLabel} — ${job.locationLabel}` : 'Is detayi'}</h1>
          <p className="admin-places-subtitle">
            <Link href="/admin/scrapers/places">Isler listesine don</Link>
          </p>
        </div>

        <div className="admin-places-header-actions">
          <AdminSectionLinks
            current="scrapers"
            onRefresh={() => loadData()}
            refreshLabel="Yenile"
            refreshing={isLoading}
            onLogout={logout}
          />

          <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
            <span>{status.message}</span>
          </div>
        </div>
      </section>

      {job ? (
        <section className="admin-updates-panel">
          <h2 className="admin-section-title">Is bilgisi</h2>
          <p className="admin-section-copy">
            Durum: {job.status} — Maliyet: ${job.costTotalUsd.toFixed(4)} / ${job.hardCapUsd.toFixed(2)}
          </p>
          {job.errorMessage ? <p className="admin-status admin-status-error">{job.errorMessage}</p> : null}
        </section>
      ) : null}

      <section className="admin-updates-panel">
        <h2 className="admin-section-title">Adaylar</h2>
        <div className="admin-updates-list">
          {candidates.length === 0 ? (
            <p className="admin-section-copy">Bu is icin henuz aday yok.</p>
          ) : (
            candidates.map((candidate) => (
              <div key={candidate.id} className="admin-updates-row">
                <div>
                  <strong>{candidate.canonicalName}</strong>
                  <p>{candidate.services.join(', ') || 'Hizmet bilgisi yok'}</p>
                  <span className="admin-updates-meta">
                    Guven: {candidate.confidenceScore ?? '—'} — Durum: {candidate.reviewStatus}
                    {candidate.websiteUrl ? ` — ${candidate.websiteUrl}` : ''}
                  </span>
                </div>
                {candidate.reviewStatus === 'pending' ? (
                  <div className="admin-card-actions">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => actOnCandidate(candidate.id, 'promote')}
                      disabled={actioningId === candidate.id}
                    >
                      Onayla
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => actOnCandidate(candidate.id, 'reject')}
                      disabled={actioningId === candidate.id}
                    >
                      Reddet
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
