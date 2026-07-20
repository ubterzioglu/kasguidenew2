export type ActivityKind = 'place' | 'news' | 'announcement' | 'hero_slide'

export type ActivityAction = 'created' | 'updated'

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  action: ActivityAction
  label: string
  detail: string | null
  timestamp: string
}

export interface ManualTask {
  id: string
  label: string
  note: string | null
  isDone: boolean
  createdAt: string
  updatedAt: string
}

export interface ManualTaskInput {
  label: string
  note?: string | null
}
