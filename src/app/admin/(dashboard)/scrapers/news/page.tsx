'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAdminSidebarRefreshAction } from '../../AdminSidebarActionsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
import type { NewsScraperRunResult } from '@/lib/news-scraper/types'
import type { NewsScraperSource, NewsScraperSourceInput } from '@/lib/news-scraper/types'

type StatusTone = 'neutral' | 'success' | 'error'

type PanelStatus = {
  tone: StatusTone
  message: string
}

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Haber scraper paneli yukleniyor...',
}

function createEmptySourceDraft(): NewsScraperSourceInput {
  return {
    name: '',
    feedUrl: '',
    sourceType: 'rss',
    isEnabled: true,
  }
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export default function AdminNewsScraperPage() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [sources, setSources] = useState<NewsScraperSource[]>([])
  const [sourceDraft, setSourceDraft] = useState<NewsScraperSourceInput>(createEmptySourceDraft())
  const [isSavingSource, setIsSavingSource] = useState(false)
  const [lastRunResults, setLastRunResults] = useState<NewsScraperRunResult[] | null>(null)

  useAdminSidebarRefreshAction({
    label: 'Listeyi yenile',
    refreshing: isLoading,
    onRefresh: () => loadData(),
  })

  async function loadData(passwordOverride?: string, redirectOnAuthError = false) {
    const password = (passwordOverride ?? adminPassword).trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: 'Kaynaklar yukleniyor...' })

    try {
      const response = await fetch('/api/admin/scrapers/news/sources', {
        headers: { 'X-Admin-Password': password },
        cache: 'no-store',
      })

      const payload = (await response.json()) as ApiEnvelope<NewsScraperSource[]>

      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Kaynaklar yuklenemedi.')
      }

      storeAdminPassword(password)
      setAdminPassword(password)
      setSources(payload.data)
      setStatus({ tone: 'success', message: 'Kaynaklar yuklendi.' })
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

  async function saveSource() {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return
    }

    setIsSavingSource(true)
    setStatus({ tone: 'neutral', message: 'Kaynak kaydediliyor...' })

    try {
      const response = await fetch('/api/admin/scrapers/news/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify(sourceDraft),
      })

      const payload = (await response.json()) as ApiEnvelope<NewsScraperSource>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Kaynak kaydedilemedi.')
      }

      setSources((current) => [payload.data, ...current])
      setSourceDraft(createEmptySourceDraft())
      setStatus({ tone: 'success', message: 'Kaynak eklendi.' })
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Kaynak kaydedilemedi.' })
    } finally {
      setIsSavingSource(false)
    }
  }

  async function toggleSource(source: NewsScraperSource) {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    const response = await fetch(`/api/admin/scrapers/news/sources/${source.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': password,
      },
      body: JSON.stringify({ isEnabled: !source.isEnabled }),
    })

    const payload = (await response.json()) as ApiEnvelope<NewsScraperSource>
    if (!response.ok || !payload.success) {
      setStatus({ tone: 'error', message: !payload.success ? payload.error : 'Kaynak guncellenemedi.' })
      return
    }

    setSources((current) => current.map((item) => (item.id === source.id ? payload.data : item)))
  }

  async function removeSource(id: string) {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    const response = await fetch(`/api/admin/scrapers/news/sources/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password },
    })

    const payload = (await response.json()) as ApiEnvelope<{ id: string }>
    if (!response.ok || !payload.success) {
      setStatus({ tone: 'error', message: !payload.success ? payload.error : 'Kaynak silinemedi.' })
      return
    }

    setSources((current) => current.filter((item) => item.id !== id))
    setStatus({ tone: 'success', message: 'Kaynak silindi.' })
  }

  async function runScraper() {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return
    }

    setIsRunning(true)
    setStatus({ tone: 'neutral', message: 'Haber taramasi calisiyor...' })

    try {
      const response = await fetch('/api/admin/scrapers/news/run', {
        method: 'POST',
        headers: { 'X-Admin-Password': password },
      })

      const payload = (await response.json()) as ApiEnvelope<{ results: NewsScraperRunResult[]; totalInserted: number }>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Tarama calistirilamadi.')
      }

      setLastRunResults(payload.data.results)
      setStatus({ tone: 'success', message: `Tarama tamamlandi: ${payload.data.totalInserted} yeni haber eklendi.` })
      await loadData()
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Tarama calistirilamadi.' })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <main className="container admin-shell admin-shell-places">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Haber Scraper</h1>
          <p className="admin-places-subtitle">
            RSS/Atom kaynaklarini yonet, taramayi calistir, yeni haberler taslak olarak Haberler panelinde incelemeye
            hazir hale gelsin.
          </p>
        </div>

        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-toolbar-actions">
        <Button type="button" variant="primary" onClick={runScraper} disabled={isRunning}>
          {isRunning ? 'Taraniyor...' : 'Simdi Calistir'}
        </Button>
      </section>

      {lastRunResults && lastRunResults.length > 0 ? (
        <section className="admin-updates-panel">
          <h2 className="admin-section-title">Son tarama sonucu</h2>
          <div className="admin-updates-list">
            {lastRunResults.map((result) => (
              <div key={result.sourceId} className="admin-updates-row">
                <div>
                  <strong>{result.sourceName}</strong>
                  <p>
                    {result.found} bulundu, {result.inserted} eklendi ({result.published} yayinda),{' '}
                    {result.skipped} atlandi
                    {result.error ? ` — Hata: ${result.error}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="admin-updates-grid">
        <article className="admin-updates-panel">
          <div className="admin-list-header admin-list-places">
            <div>
              <h2 className="admin-section-title">Kaynaklar</h2>
              <p className="admin-section-copy">Taranacak RSS/Atom feed adreslerini buradan yonet.</p>
            </div>
          </div>

          <div className="admin-updates-list">
            {sources.length === 0 ? (
              <p className="admin-section-copy">Henuz kaynak eklenmedi. Sagdaki formdan ekleyebilirsin.</p>
            ) : (
              sources.map((source) => (
                <div key={source.id} className="admin-updates-row">
                  <div>
                    <strong>{source.name}</strong>
                    <p>{source.feedUrl}</p>
                    <span className="admin-updates-meta">
                      {source.isEnabled ? 'Aktif' : 'Pasif'}
                      {source.lastRunAt ? ` — son calisma: ${new Date(source.lastRunAt).toLocaleString('tr-TR')}` : ''}
                    </span>
                  </div>
                  <div className="admin-card-actions">
                    <Button type="button" variant="ghost" onClick={() => toggleSource(source)}>
                      {source.isEnabled ? 'Pasiflestir' : 'Aktiflestir'}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => removeSource(source.id)}>
                      Sil
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="admin-updates-panel admin-updates-form-panel">
          <div className="admin-list-header admin-list-header-places">
            <div>
              <h2 className="admin-section-title">Yeni kaynak ekle</h2>
            </div>
          </div>

          <div className="admin-updates-form-grid">
            <Input
              label="Ad"
              value={sourceDraft.name}
              onChange={(event) => setSourceDraft((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              label="Feed URL"
              value={sourceDraft.feedUrl}
              onChange={(event) => setSourceDraft((current) => ({ ...current, feedUrl: event.target.value }))}
            />
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={sourceDraft.isEnabled}
                onChange={(event) => setSourceDraft((current) => ({ ...current, isEnabled: event.target.checked }))}
              />
              <span>Aktif olsun</span>
            </label>
          </div>

          <div className="admin-card-actions admin-updates-actions">
            <Button type="button" variant="primary" onClick={saveSource} disabled={isSavingSource}>
              {isSavingSource ? 'Kaydediliyor...' : 'Kaynak ekle'}
            </Button>
          </div>
        </article>
      </section>
    </main>
  )
}
