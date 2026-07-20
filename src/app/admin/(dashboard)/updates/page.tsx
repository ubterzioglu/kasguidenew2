'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAdminSidebarRefreshAction } from '../AdminSidebarActionsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
import type {
  AnnouncementInput,
  AnnouncementItem,
  AnnouncementPriority,
  ContentStatus,
  NewsInput,
  NewsItem,
} from '@/types/updates'

type StatusTone = 'neutral' | 'success' | 'error'
type TabKey = 'news' | 'announcements'

type PanelStatus = {
  tone: StatusTone
  message: string
}

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Haberler ve duyurular paneli yukleniyor...',
}

const NEWS_STATUS_OPTIONS = [
  { value: 'draft', label: 'Taslak' },
  { value: 'published', label: 'Yayinda' },
  { value: 'archived', label: 'Arsiv' },
]

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Acil' },
  { value: 'normal', label: 'Normal' },
  { value: 'info', label: 'Bilgi' },
]

function createEmptyNewsDraft(): NewsInput {
  return {
    title: '',
    slug: '',
    summary: '',
    content: '',
    imageUrl: '',
    publishedAt: '',
    isActive: true,
    sortOrder: 0,
    status: 'draft',
  }
}

function createEmptyAnnouncementDraft(): AnnouncementInput {
  return {
    title: '',
    slug: '',
    summary: '',
    content: '',
    imageUrl: '',
    priority: 'normal',
    isPinned: false,
    isActive: true,
    startDate: '',
    endDate: '',
    publishedAt: '',
    sortOrder: 0,
    status: 'draft',
  }
}

function toDatetimeLocal(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function mapNewsToDraft(item: NewsItem): NewsInput {
  return {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    imageUrl: item.imageUrl ?? '',
    publishedAt: toDatetimeLocal(item.publishedAt),
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    status: item.status,
  }
}

function mapAnnouncementToDraft(item: AnnouncementItem): AnnouncementInput {
  return {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    imageUrl: item.imageUrl ?? '',
    priority: item.priority,
    isPinned: item.isPinned,
    isActive: item.isActive,
    startDate: toDatetimeLocal(item.startDate),
    endDate: toDatetimeLocal(item.endDate),
    publishedAt: toDatetimeLocal(item.publishedAt),
    sortOrder: item.sortOrder,
    status: item.status,
  }
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export default function AdminUpdatesPage() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('news')
  const [news, setNews] = useState<NewsItem[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [search, setSearch] = useState('')
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null)
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null)
  const [newsDraft, setNewsDraft] = useState<NewsInput>(createEmptyNewsDraft())
  const [announcementDraft, setAnnouncementDraft] = useState<AnnouncementInput>(createEmptyAnnouncementDraft())
  const [isSavingNews, setIsSavingNews] = useState(false)
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false)

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
    setStatus({ tone: 'neutral', message: 'Veriler yukleniyor...' })

    try {
      const headers = { 'X-Admin-Password': password }
      const [newsResponse, announcementsResponse] = await Promise.all([
        fetch('/api/admin/news', { headers, cache: 'no-store' }),
        fetch('/api/admin/announcements', { headers, cache: 'no-store' }),
      ])

      const newsPayload = (await newsResponse.json()) as ApiEnvelope<NewsItem[]>
      const announcementPayload = (await announcementsResponse.json()) as ApiEnvelope<AnnouncementItem[]>

      if (!newsResponse.ok || !newsPayload.success) {
        throw new Error(!newsPayload.success ? newsPayload.error : 'Haberler yuklenemedi.')
      }

      if (!announcementsResponse.ok || !announcementPayload.success) {
        throw new Error(!announcementPayload.success ? announcementPayload.error : 'Duyurular yuklenemedi.')
      }

      storeAdminPassword(password)
      setAdminPassword(password)
      setNews(newsPayload.data)
      setAnnouncements(announcementPayload.data)
      setStatus({ tone: 'success', message: 'Haberler ve duyurular yuklendi.' })
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

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return news
    }

    return news.filter((item) => `${item.title} ${item.summary}`.toLowerCase().includes(query))
  }, [news, search])

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return announcements
    }

    return announcements.filter((item) => `${item.title} ${item.summary}`.toLowerCase().includes(query))
  }, [announcements, search])

  async function saveNews() {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return
    }

    setIsSavingNews(true)
    setStatus({ tone: 'neutral', message: 'Haber kaydi kaydediliyor...' })

    try {
      const endpoint = activeNewsId ? `/api/admin/news/${activeNewsId}` : '/api/admin/news'
      const response = await fetch(endpoint, {
        method: activeNewsId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ news: newsDraft }),
      })

      const payload = (await response.json()) as ApiEnvelope<NewsItem[]>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Haber kaydi kaydedilemedi.')
      }

      setNews(payload.data)
      setActiveNewsId(null)
      setNewsDraft(createEmptyNewsDraft())
      setStatus({ tone: 'success', message: 'Haber kaydi guncellendi.' })
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Haber kaydi kaydedilemedi.' })
    } finally {
      setIsSavingNews(false)
    }
  }

  async function saveAnnouncement() {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return
    }

    setIsSavingAnnouncement(true)
    setStatus({ tone: 'neutral', message: 'Duyuru kaydi kaydediliyor...' })

    try {
      const endpoint = activeAnnouncementId ? `/api/admin/announcements/${activeAnnouncementId}` : '/api/admin/announcements'
      const response = await fetch(endpoint, {
        method: activeAnnouncementId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ announcement: announcementDraft }),
      })

      const payload = (await response.json()) as ApiEnvelope<AnnouncementItem[]>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Duyuru kaydi kaydedilemedi.')
      }

      setAnnouncements(payload.data)
      setActiveAnnouncementId(null)
      setAnnouncementDraft(createEmptyAnnouncementDraft())
      setStatus({ tone: 'success', message: 'Duyuru kaydi guncellendi.' })
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Duyuru kaydi kaydedilemedi.' })
    } finally {
      setIsSavingAnnouncement(false)
    }
  }

  async function removeNews(id: string) {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    const response = await fetch(`/api/admin/news/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password },
    })

    const payload = (await response.json()) as ApiEnvelope<NewsItem[]>
    if (!response.ok || !payload.success) {
      setStatus({ tone: 'error', message: !payload.success ? payload.error : 'Haber arsivlenemedi.' })
      return
    }

    setNews(payload.data)
    if (activeNewsId === id) {
      setActiveNewsId(null)
      setNewsDraft(createEmptyNewsDraft())
    }
    setStatus({ tone: 'success', message: 'Haber arsive alindi.' })
  }

  async function removeAnnouncement(id: string) {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    const response = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password },
    })

    const payload = (await response.json()) as ApiEnvelope<AnnouncementItem[]>
    if (!response.ok || !payload.success) {
      setStatus({ tone: 'error', message: !payload.success ? payload.error : 'Duyuru arsivlenemedi.' })
      return
    }

    setAnnouncements(payload.data)
    if (activeAnnouncementId === id) {
      setActiveAnnouncementId(null)
      setAnnouncementDraft(createEmptyAnnouncementDraft())
    }
    setStatus({ tone: 'success', message: 'Duyuru arsive alindi.' })
  }

  return (
    <main className="container admin-shell admin-shell-places admin-shell-updates">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Haberler ve Duyurular</h1>
          <p className="admin-places-subtitle">
            Carousel akışını besleyen haberleri ve duyuruları aynı panelde yönet.
          </p>
        </div>

        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-toolbar-actions admin-updates-topbar">
        <div className="admin-updates-tabs">
          <Button type="button" variant={activeTab === 'news' ? 'primary' : 'secondary'} onClick={() => setActiveTab('news')}>
            Haberler
          </Button>
          <Button type="button" variant={activeTab === 'announcements' ? 'primary' : 'secondary'} onClick={() => setActiveTab('announcements')}>
            Duyurular
          </Button>
        </div>

        <label className="admin-updates-search">
          <span>Arama</span>
          <input
            className="admin-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Baslik veya ozet ara"
          />
        </label>
      </section>

      {activeTab === 'news' ? (
        <section className="admin-updates-grid">
          <article className="admin-updates-panel">
            <div className="admin-list-header admin-list-header-places">
              <div>
                <h2 className="admin-section-title">Haber listesi</h2>
                <p className="admin-section-copy">Durum, tarih ve ozet bazinda tum haberleri tek listede gorebilirsin.</p>
              </div>
              <div className="admin-toolbar-actions">
                <Button type="button" variant="ghost" onClick={() => { setActiveNewsId(null); setNewsDraft(createEmptyNewsDraft()) }}>
                  Yeni haber
                </Button>
              </div>
            </div>

            <div className="admin-updates-list">
              {filteredNews.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-updates-row${activeNewsId === item.id ? ' is-active' : ''}`}
                  onClick={() => { setActiveNewsId(item.id); setNewsDraft(mapNewsToDraft(item)) }}
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                  </div>
                  <span className="admin-updates-meta">{item.status}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="admin-updates-panel admin-updates-form-panel">
            <div className="admin-list-header admin-list-header-places">
              <div>
                <h2 className="admin-section-title">{activeNewsId ? 'Haberi duzenle' : 'Yeni haber'}</h2>
              </div>
            </div>

            <div className="admin-updates-form-grid">
              <Input label="Baslik" value={newsDraft.title} onChange={(event) => setNewsDraft((current) => ({ ...current, title: event.target.value }))} />
              <Input label="Slug" value={newsDraft.slug ?? ''} onChange={(event) => setNewsDraft((current) => ({ ...current, slug: event.target.value }))} />
              <Input label="Gorsel URL" value={newsDraft.imageUrl ?? ''} onChange={(event) => setNewsDraft((current) => ({ ...current, imageUrl: event.target.value }))} />
              <Input label="Yayin tarihi" type="datetime-local" value={newsDraft.publishedAt ?? ''} onChange={(event) => setNewsDraft((current) => ({ ...current, publishedAt: event.target.value }))} />
              <Input label="Siralama" type="number" value={String(newsDraft.sortOrder)} onChange={(event) => setNewsDraft((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))} />
              <Select label="Durum" value={newsDraft.status} onChange={(event) => setNewsDraft((current) => ({ ...current, status: event.target.value as ContentStatus }))} options={NEWS_STATUS_OPTIONS} />
              <Textarea label="Ozet" rows={3} value={newsDraft.summary} onChange={(event) => setNewsDraft((current) => ({ ...current, summary: event.target.value }))} />
              <Textarea label="Icerik" rows={10} value={newsDraft.content} onChange={(event) => setNewsDraft((current) => ({ ...current, content: event.target.value }))} />
              <label className="admin-toggle">
                <input type="checkbox" checked={newsDraft.isActive} onChange={(event) => setNewsDraft((current) => ({ ...current, isActive: event.target.checked }))} />
                <span>Aktif olsun</span>
              </label>
            </div>

            <div className="admin-card-actions admin-updates-actions">
              <Button type="button" variant="primary" onClick={saveNews} disabled={isSavingNews}>
                {isSavingNews ? 'Kaydediliyor...' : 'Haberi kaydet'}
              </Button>
              {activeNewsId ? (
                <Button type="button" variant="danger" onClick={() => removeNews(activeNewsId)}>
                  Arsive al
                </Button>
              ) : null}
            </div>
          </article>
        </section>
      ) : (
        <section className="admin-updates-grid">
          <article className="admin-updates-panel">
            <div className="admin-list-header admin-list-header-places">
              <div>
                <h2 className="admin-section-title">Duyuru listesi</h2>
                <p className="admin-section-copy">Pinn, oncelik ve tarih araligiyla duyurulari yonet.</p>
              </div>
              <div className="admin-toolbar-actions">
                <Button type="button" variant="ghost" onClick={() => { setActiveAnnouncementId(null); setAnnouncementDraft(createEmptyAnnouncementDraft()) }}>
                  Yeni duyuru
                </Button>
              </div>
            </div>

            <div className="admin-updates-list">
              {filteredAnnouncements.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-updates-row${activeAnnouncementId === item.id ? ' is-active' : ''}`}
                  onClick={() => { setActiveAnnouncementId(item.id); setAnnouncementDraft(mapAnnouncementToDraft(item)) }}
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                  </div>
                  <span className="admin-updates-meta">{item.priority}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="admin-updates-panel admin-updates-form-panel">
            <div className="admin-list-header admin-list-header-places">
              <div>
                <h2 className="admin-section-title">{activeAnnouncementId ? 'Duyuruyu duzenle' : 'Yeni duyuru'}</h2>
              </div>
            </div>

            <div className="admin-updates-form-grid">
              <Input label="Baslik" value={announcementDraft.title} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, title: event.target.value }))} />
              <Input label="Slug" value={announcementDraft.slug ?? ''} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, slug: event.target.value }))} />
              <Input label="Gorsel URL" value={announcementDraft.imageUrl ?? ''} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, imageUrl: event.target.value }))} />
              <Input label="Baslangic" type="datetime-local" value={announcementDraft.startDate ?? ''} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, startDate: event.target.value }))} />
              <Input label="Bitis" type="datetime-local" value={announcementDraft.endDate ?? ''} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, endDate: event.target.value }))} />
              <Input label="Yayin tarihi" type="datetime-local" value={announcementDraft.publishedAt ?? ''} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, publishedAt: event.target.value }))} />
              <Input label="Siralama" type="number" value={String(announcementDraft.sortOrder)} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))} />
              <Select label="Oncelik" value={announcementDraft.priority} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, priority: event.target.value as AnnouncementPriority }))} options={PRIORITY_OPTIONS} />
              <Select label="Durum" value={announcementDraft.status} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, status: event.target.value as ContentStatus }))} options={NEWS_STATUS_OPTIONS} />
              <Textarea label="Ozet" rows={3} value={announcementDraft.summary} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, summary: event.target.value }))} />
              <Textarea label="Icerik" rows={10} value={announcementDraft.content} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, content: event.target.value }))} />
              <div className="admin-updates-toggle-stack">
                <label className="admin-toggle">
                  <input type="checkbox" checked={announcementDraft.isActive} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, isActive: event.target.checked }))} />
                  <span>Aktif olsun</span>
                </label>
                <label className="admin-toggle">
                  <input type="checkbox" checked={announcementDraft.isPinned} onChange={(event) => setAnnouncementDraft((current) => ({ ...current, isPinned: event.target.checked }))} />
                  <span>Sabitle</span>
                </label>
              </div>
            </div>

            <div className="admin-card-actions admin-updates-actions">
              <Button type="button" variant="primary" onClick={saveAnnouncement} disabled={isSavingAnnouncement}>
                {isSavingAnnouncement ? 'Kaydediliyor...' : 'Duyuruyu kaydet'}
              </Button>
              {activeAnnouncementId ? (
                <Button type="button" variant="danger" onClick={() => removeAnnouncement(activeAnnouncementId)}>
                  Arsive al
                </Button>
              ) : null}
            </div>
          </article>
        </section>
      )}
    </main>
  )
}