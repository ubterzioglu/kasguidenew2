'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AdminSectionLinks } from '../../components/AdminSectionLinks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
import type { PlaceScraperJob, PlaceScraperJobInput } from '@/lib/place-scraper/types'

type StatusTone = 'neutral' | 'success' | 'error'

type PanelStatus = {
  tone: StatusTone
  message: string
}

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Hizmet arama paneli yukleniyor...',
}

function createEmptyJobDraft(): PlaceScraperJobInput {
  return {
    locationLabel: 'Kaş, Antalya',
    countryCode: 'TR',
    region: 'Antalya',
    city: 'Kaş',
    professionLabel: '',
    categorySlug: '',
    languageTerms: [],
    queryTemplates: [],
    maxQueries: 6,
    maxSourceUrls: 15,
    maxExtractUrls: 10,
    maxCandidates: 10,
    softCapUsd: 0.5,
    hardCapUsd: 2,
  }
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

const STATUS_LABELS: Record<PlaceScraperJob['status'], string> = {
  queued: 'Kuyrukta',
  running: 'Calisiyor',
  completed: 'Tamamlandi',
  failed: 'Basarisiz',
  budget_stopped: 'Butce durdurdu',
  cancelled: 'Iptal edildi',
}

export default function AdminPlaceScraperPage() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [jobs, setJobs] = useState<PlaceScraperJob[]>([])
  const [jobDraft, setJobDraft] = useState<PlaceScraperJobInput>(createEmptyJobDraft())
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [runningJobId, setRunningJobId] = useState<string | null>(null)

  async function loadData(passwordOverride?: string, redirectOnAuthError = false) {
    const password = (passwordOverride ?? adminPassword).trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Isler yukleniyor...' })

    try {
      const response = await fetch('/api/admin/scrapers/places/jobs', {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })

      const payload = (await response.json()) as ApiEnvelope<PlaceScraperJob[]>

      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Isler yuklenemedi.')
      }

      storeAdminPassword(password)
      setAdminPassword(password)
      setJobs(payload.data)
      setStatus({ tone: 'success', message: 'Isler yuklendi.' })
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
  }, [router])

  function logout() {
    clearStoredAdminPassword()
    setAdminPassword('')
    router.replace('/admin')
  }

  async function createJob() {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return
    }

    setIsCreatingJob(true)
    setStatus({ tone: 'neutral', message: 'Is olusturuluyor...' })

    try {
      const response = await fetch('/api/admin/scrapers/places/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify(jobDraft),
      })

      const payload = (await response.json()) as ApiEnvelope<PlaceScraperJob>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Is olusturulamadi.')
      }

      setJobs((current) => [payload.data, ...current])
      setJobDraft(createEmptyJobDraft())
      setStatus({ tone: 'success', message: 'Is olusturuldu.' })
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Is olusturulamadi.' })
    } finally {
      setIsCreatingJob(false)
    }
  }

  async function runJob(jobId: string) {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return
    }

    setRunningJobId(jobId)
    setStatus({ tone: 'neutral', message: 'Is calisiyor...' })

    try {
      const response = await fetch(`/api/admin/scrapers/places/jobs/${jobId}/run`, {
        method: 'POST',
        headers: { 'X-Admin-Password': password },
      })

      const payload = (await response.json()) as ApiEnvelope<{ status: string; candidatesCreated: number; costTotalUsd: number }>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Is calistirilamadi.')
      }

      setStatus({
        tone: 'success',
        message: `Is tamamlandi: ${payload.data.candidatesCreated} aday bulundu, maliyet $${payload.data.costTotalUsd.toFixed(4)}.`,
      })
      await loadData()
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Is calistirilamadi.' })
    } finally {
      setRunningJobId(null)
    }
  }

  return (
    <main className="container admin-shell admin-shell-places">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Hizmet Arama Scraper</h1>
          <p className="admin-places-subtitle">
            Tavily ve Gemini tabanli scraper ile Kaş&apos;ta yeni mekan adaylari bul, incele ve onayla.
          </p>
        </div>

        <div className="admin-places-header-actions">
          <AdminSectionLinks
            current="scrapers"
            onRefresh={() => loadData()}
            refreshLabel="Listeyi yenile"
            refreshing={isLoading}
            onLogout={logout}
          />

          <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
            <span>{status.message}</span>
          </div>
        </div>
      </section>

      <section className="admin-updates-grid">
        <article className="admin-updates-panel">
          <div className="admin-list-header admin-list-header-places">
            <div>
              <h2 className="admin-section-title">Isler</h2>
              <p className="admin-section-copy">Olusturulan taramalari ve durumlarini buradan takip et.</p>
            </div>
          </div>

          <div className="admin-updates-list">
            {jobs.length === 0 ? (
              <p className="admin-section-copy">Henuz is olusturulmadi. Sagdaki formdan yeni is baslat.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="admin-updates-row">
                  <div>
                    <strong>{job.professionLabel} — {job.locationLabel}</strong>
                    <p>
                      {STATUS_LABELS[job.status]} — maliyet ${job.costTotalUsd.toFixed(4)} / ${job.hardCapUsd.toFixed(2)}
                    </p>
                  </div>
                  <div className="admin-card-actions">
                    <Link href={`/admin/scrapers/places/${job.id}`} className="admin-button admin-button-ghost">
                      Detay
                    </Link>
                    {job.status === 'queued' || job.status === 'failed' ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => runJob(job.id)}
                        disabled={runningJobId === job.id}
                      >
                        {runningJobId === job.id ? 'Calisiyor...' : 'Calistir'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="admin-updates-panel admin-updates-form-panel">
          <div className="admin-list-header admin-list-header-places">
            <div>
              <h2 className="admin-section-title">Yeni is</h2>
            </div>
          </div>

          <div className="admin-updates-form-grid">
            <Input
              label="Konum"
              value={jobDraft.locationLabel}
              onChange={(event) => setJobDraft((current) => ({ ...current, locationLabel: event.target.value }))}
            />
            <Input
              label="Meslek/Hizmet"
              value={jobDraft.professionLabel}
              onChange={(event) => setJobDraft((current) => ({ ...current, professionLabel: event.target.value }))}
              placeholder="ör. dalış merkezi"
            />
            <Input
              label="Kategori slug (opsiyonel)"
              value={jobDraft.categorySlug ?? ''}
              onChange={(event) => setJobDraft((current) => ({ ...current, categorySlug: event.target.value }))}
            />
            <Input
              label="Maks. sorgu"
              type="number"
              value={String(jobDraft.maxQueries)}
              onChange={(event) => setJobDraft((current) => ({ ...current, maxQueries: Number(event.target.value) || 1 }))}
            />
            <Input
              label="Maks. kaynak URL"
              type="number"
              value={String(jobDraft.maxSourceUrls)}
              onChange={(event) => setJobDraft((current) => ({ ...current, maxSourceUrls: Number(event.target.value) || 1 }))}
            />
            <Input
              label="Maks. extract URL"
              type="number"
              value={String(jobDraft.maxExtractUrls)}
              onChange={(event) => setJobDraft((current) => ({ ...current, maxExtractUrls: Number(event.target.value) || 1 }))}
            />
            <Input
              label="Maks. aday"
              type="number"
              value={String(jobDraft.maxCandidates)}
              onChange={(event) => setJobDraft((current) => ({ ...current, maxCandidates: Number(event.target.value) || 1 }))}
            />
            <Input
              label="Yumusak butce ($)"
              type="number"
              step="0.01"
              value={String(jobDraft.softCapUsd)}
              onChange={(event) => setJobDraft((current) => ({ ...current, softCapUsd: Number(event.target.value) || 0 }))}
            />
            <Input
              label="Sert butce ($)"
              type="number"
              step="0.01"
              value={String(jobDraft.hardCapUsd)}
              onChange={(event) => setJobDraft((current) => ({ ...current, hardCapUsd: Number(event.target.value) || 0 }))}
            />
          </div>

          <div className="admin-card-actions admin-updates-actions">
            <Button type="button" variant="primary" onClick={createJob} disabled={isCreatingJob || !jobDraft.professionLabel}>
              {isCreatingJob ? 'Olusturuluyor...' : 'Is olustur'}
            </Button>
          </div>
        </article>
      </section>
    </main>
  )
}
