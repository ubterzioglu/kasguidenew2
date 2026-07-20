import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { ActivityEntry, ManualTask, ManualTaskInput } from '@/types/activity'

const MANUAL_TASKS_TABLE = 'admin_manual_tasks'
const ACTIVITY_WINDOW_DAYS = 7

type PlaceActivityRow = {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
}

type NewsActivityRow = {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
}

type AnnouncementActivityRow = {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
}

type HeroSlideActivityRow = {
  id: string
  title: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type ManualTaskRow = {
  id: string
  label: string
  note: string | null
  is_done: boolean
  created_at: string
  updated_at: string
}

function requireClient() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Supabase admin bağlantısı hazır değil.')
  }

  return client
}

function windowStartIso() {
  return new Date(Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

function isCreateEvent(createdAt: string, updatedAt: string) {
  return Math.abs(new Date(updatedAt).getTime() - new Date(createdAt).getTime()) < 60_000
}

export function isActivityStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function getRecentActivity(): Promise<ActivityEntry[]> {
  const client = requireClient()
  const since = windowStartIso()

  const [placesResponse, newsResponse, announcementsResponse, heroSlidesResponse] = await Promise.all([
    client
      .from('places')
      .select('id, name, status, created_at, updated_at')
      .gte('updated_at', since)
      .order('updated_at', { ascending: false }),
    client
      .from('news')
      .select('id, title, status, created_at, updated_at')
      .gte('updated_at', since)
      .order('updated_at', { ascending: false }),
    client
      .from('announcements')
      .select('id, title, status, created_at, updated_at')
      .gte('updated_at', since)
      .order('updated_at', { ascending: false }),
    client
      .from('hero_slides')
      .select('id, title, is_active, created_at, updated_at')
      .gte('updated_at', since)
      .order('updated_at', { ascending: false }),
  ])

  if (placesResponse.error) {
    throw new Error('Mekan aktiviteleri okunamadı.')
  }

  if (newsResponse.error) {
    throw new Error('Haber aktiviteleri okunamadı.')
  }

  if (announcementsResponse.error) {
    throw new Error('Duyuru aktiviteleri okunamadı.')
  }

  if (heroSlidesResponse.error) {
    throw new Error('Hero slide aktiviteleri okunamadı.')
  }

  const entries: ActivityEntry[] = [
    ...((placesResponse.data ?? []) as PlaceActivityRow[]).map((row) => ({
      id: `place-${row.id}`,
      kind: 'place' as const,
      action: isCreateEvent(row.created_at, row.updated_at) ? ('created' as const) : ('updated' as const),
      label: row.name,
      detail: row.status,
      timestamp: row.updated_at,
    })),
    ...((newsResponse.data ?? []) as NewsActivityRow[]).map((row) => ({
      id: `news-${row.id}`,
      kind: 'news' as const,
      action: isCreateEvent(row.created_at, row.updated_at) ? ('created' as const) : ('updated' as const),
      label: row.title,
      detail: row.status,
      timestamp: row.updated_at,
    })),
    ...((announcementsResponse.data ?? []) as AnnouncementActivityRow[]).map((row) => ({
      id: `announcement-${row.id}`,
      kind: 'announcement' as const,
      action: isCreateEvent(row.created_at, row.updated_at) ? ('created' as const) : ('updated' as const),
      label: row.title,
      detail: row.status,
      timestamp: row.updated_at,
    })),
    ...((heroSlidesResponse.data ?? []) as HeroSlideActivityRow[]).map((row) => ({
      id: `hero_slide-${row.id}`,
      kind: 'hero_slide' as const,
      action: isCreateEvent(row.created_at, row.updated_at) ? ('created' as const) : ('updated' as const),
      label: row.title,
      detail: row.is_active ? 'aktif' : 'pasif',
      timestamp: row.updated_at,
    })),
  ]

  return entries.sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
}

function mapManualTask(row: ManualTaskRow): ManualTask {
  return {
    id: row.id,
    label: row.label,
    note: row.note,
    isDone: row.is_done,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listManualTasks(): Promise<ManualTask[]> {
  const client = requireClient()
  const { data, error } = await client
    .from(MANUAL_TASKS_TABLE)
    .select('id, label, note, is_done, created_at, updated_at')
    .order('is_done', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Yapılacaklar listesi okunamadı.')
  }

  return ((data ?? []) as ManualTaskRow[]).map(mapManualTask)
}

export async function createManualTask(input: ManualTaskInput): Promise<ManualTask[]> {
  const client = requireClient()
  const label = input.label.trim()

  if (!label) {
    throw new Error('Görev başlığı zorunlu.')
  }

  const { error } = await client.from(MANUAL_TASKS_TABLE).insert({
    label,
    note: input.note?.trim() || null,
  })

  if (error) {
    throw new Error('Görev oluşturulamadı.')
  }

  return listManualTasks()
}

export async function setManualTaskDone(id: string, isDone: boolean): Promise<ManualTask[]> {
  const client = requireClient()
  const { error } = await client.from(MANUAL_TASKS_TABLE).update({ is_done: isDone }).eq('id', id)

  if (error) {
    throw new Error('Görev güncellenemedi.')
  }

  return listManualTasks()
}

export async function deleteManualTask(id: string): Promise<ManualTask[]> {
  const client = requireClient()
  const { error } = await client.from(MANUAL_TASKS_TABLE).delete().eq('id', id)

  if (error) {
    throw new Error('Görev silinemedi.')
  }

  return listManualTasks()
}
