'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAdminSidebarRefreshAction } from '../AdminSidebarActionsContext'
import { Button } from '@/components/ui/button'
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
import type { ActivityEntry, ActivityKind, ManualTask } from '@/types/activity'

type StatusTone = 'neutral' | 'success' | 'error'

type PanelStatus = {
  tone: StatusTone
  message: string
}

type FilterKey = 'all' | ActivityKind

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Aktiviteler yükleniyor...',
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'place', label: 'Mekan' },
  { key: 'news', label: 'Haber' },
  { key: 'announcement', label: 'Duyuru' },
  { key: 'hero_slide', label: 'Hero' },
]

const KIND_LABEL: Record<ActivityKind, string> = {
  place: 'Mekan',
  news: 'Haber',
  announcement: 'Duyuru',
  hero_slide: 'Hero',
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value))
}

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: string }

export default function AdminActivityPage() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [filter, setFilter] = useState<FilterKey>('all')
  const [tasks, setTasks] = useState<ManualTask[]>([])
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [isSavingTask, setIsSavingTask] = useState(false)

  useAdminSidebarRefreshAction({
    label: 'Aktiviteleri yenile',
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
    setStatus({ tone: 'neutral', message: 'Aktiviteler yükleniyor...' })

    try {
      const headers = { 'X-Admin-Password': password }
      const [activityResponse, tasksResponse] = await Promise.all([
        fetch('/api/admin/activity', { headers, cache: 'no-store' }),
        fetch('/api/admin/manual-tasks', { headers, cache: 'no-store' }),
      ])

      const activityPayload = (await activityResponse.json()) as ApiEnvelope<ActivityEntry[]>
      const tasksPayload = (await tasksResponse.json()) as ApiEnvelope<ManualTask[]>

      if (!activityResponse.ok || !activityPayload.success) {
        throw new Error(!activityPayload.success ? activityPayload.error : 'Aktiviteler yüklenemedi.')
      }

      if (!tasksResponse.ok || !tasksPayload.success) {
        throw new Error(!tasksPayload.success ? tasksPayload.error : 'Yapılacaklar yüklenemedi.')
      }

      storeAdminPassword(password)
      setAdminPassword(password)
      setEntries(activityPayload.data)
      setTasks(tasksPayload.data)
      setStatus({ tone: 'success', message: 'Aktiviteler ve yapılacaklar yüklendi.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Panel yüklenemedi.'

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

  const filteredEntries = useMemo(() => {
    if (filter === 'all') {
      return entries
    }

    return entries.filter((entry) => entry.kind === filter)
  }, [entries, filter])

  const pendingTasks = useMemo(() => tasks.filter((task) => !task.isDone), [tasks])
  const doneTasks = useMemo(() => tasks.filter((task) => task.isDone), [tasks])

  async function addTask() {
    const password = adminPassword.trim()
    const label = newTaskLabel.trim()

    if (!password) {
      router.replace('/admin')
      return
    }

    if (!label) {
      return
    }

    setIsSavingTask(true)

    try {
      const response = await fetch('/api/admin/manual-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ task: { label } }),
      })

      const payload = (await response.json()) as ApiEnvelope<ManualTask[]>
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : 'Görev oluşturulamadı.')
      }

      setTasks(payload.data)
      setNewTaskLabel('')
    } catch (error) {
      setStatus({ tone: 'error', message: error instanceof Error ? error.message : 'Görev oluşturulamadı.' })
    } finally {
      setIsSavingTask(false)
    }
  }

  async function toggleTask(task: ManualTask) {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    const response = await fetch(`/api/admin/manual-tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': password,
      },
      body: JSON.stringify({ isDone: !task.isDone }),
    })

    const payload = (await response.json()) as ApiEnvelope<ManualTask[]>
    if (!response.ok || !payload.success) {
      setStatus({ tone: 'error', message: !payload.success ? payload.error : 'Görev güncellenemedi.' })
      return
    }

    setTasks(payload.data)
  }

  async function removeTask(id: string) {
    const password = adminPassword.trim()
    if (!password) {
      return
    }

    const response = await fetch(`/api/admin/manual-tasks/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password },
    })

    const payload = (await response.json()) as ApiEnvelope<ManualTask[]>
    if (!response.ok || !payload.success) {
      setStatus({ tone: 'error', message: !payload.success ? payload.error : 'Görev silinemedi.' })
      return
    }

    setTasks(payload.data)
  }

  return (
    <main className="container admin-shell admin-shell-places admin-shell-activity">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Aktiviteler</h1>
          <p className="admin-places-subtitle">
            Son 7 gün içindeki mekan, haber, duyuru ve hero güncellemelerini ve manuel yapılacakları tek panelden takip et.
          </p>
        </div>

        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-updates-panel">
        <div className="admin-list-header admin-list-header-places">
          <div>
            <h2 className="admin-section-title">Son 7 Günün Güncellemeleri</h2>
            <p className="admin-section-copy">Yeni eklenen veya güncellenen kayıtlar en yeniden eskiye sıralanır.</p>
          </div>

          <div className="admin-updates-tabs">
            {FILTERS.map((option) => (
              <Button
                key={option.key}
                type="button"
                variant={filter === option.key ? 'primary' : 'secondary'}
                onClick={() => setFilter(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="admin-updates-list">
          {filteredEntries.length === 0 ? (
            <p className="admin-section-copy">Son 7 günde bu kategoride bir güncelleme yok.</p>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="admin-updates-row">
                <div>
                  <strong>{entry.label}</strong>
                  <p>
                    {KIND_LABEL[entry.kind]} · {entry.action === 'created' ? 'eklendi' : 'güncellendi'}
                    {entry.detail ? ` · ${entry.detail}` : ''}
                  </p>
                </div>
                <span className="admin-updates-meta">{formatTimestamp(entry.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="admin-updates-panel">
        <div className="admin-list-header admin-list-header-places">
          <div>
            <h2 className="admin-section-title">Manuel Yapılacaklar</h2>
            <p className="admin-section-copy">Veritabanı dışı, elle tamamlanması gereken adımlar (örn. Search Console işlemleri).</p>
          </div>
        </div>

        <div className="admin-updates-form-grid">
          <input
            className="admin-input"
            value={newTaskLabel}
            onChange={(event) => setNewTaskLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void addTask()
              }
            }}
            placeholder="Yeni görev ekle"
          />
          <Button type="button" variant="primary" onClick={addTask} disabled={isSavingTask || !newTaskLabel.trim()}>
            {isSavingTask ? 'Ekleniyor...' : 'Görev ekle'}
          </Button>
        </div>

        <div className="admin-updates-list">
          {pendingTasks.map((task) => (
            <div key={task.id} className="admin-updates-row">
              <label className="admin-toggle">
                <input type="checkbox" checked={task.isDone} onChange={() => void toggleTask(task)} />
                <span>
                  <strong>{task.label}</strong>
                  {task.note ? <p>{task.note}</p> : null}
                </span>
              </label>
              <Button type="button" variant="danger" onClick={() => void removeTask(task.id)}>
                Sil
              </Button>
            </div>
          ))}

          {doneTasks.length > 0 ? (
            <>
              <p className="admin-section-copy">Tamamlananlar</p>
              {doneTasks.map((task) => (
                <div key={task.id} className="admin-updates-row is-done">
                  <label className="admin-toggle">
                    <input type="checkbox" checked={task.isDone} onChange={() => void toggleTask(task)} />
                    <span>
                      <strong>{task.label}</strong>
                      {task.note ? <p>{task.note}</p> : null}
                    </span>
                  </label>
                  <Button type="button" variant="danger" onClick={() => void removeTask(task.id)}>
                    Sil
                  </Button>
                </div>
              ))}
            </>
          ) : null}

          {tasks.length === 0 ? <p className="admin-section-copy">Henüz manuel görev yok.</p> : null}
        </div>
      </section>
    </main>
  )
}
