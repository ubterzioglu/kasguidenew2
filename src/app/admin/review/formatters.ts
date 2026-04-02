import { GridSweepStatus, GridSweepCellItem, ReviewQueueStatus } from './types'

export function decodeLabel(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function formatSweepStatus(status: GridSweepStatus) {
  switch (status) {
    case 'completed':
      return 'Tamamlandi'
    case 'running':
      return 'Calisiyor'
    case 'partial':
      return 'Kismen tamam'
    case 'failed':
      return 'Hata'
    default:
      return status
  }
}

export function formatCellStatus(status: GridSweepCellItem['status']) {
  switch (status) {
    case 'success':
      return 'Basarili'
    case 'failed':
      return 'Hata'
    case 'pending':
      return 'Bekliyor'
    default:
      return status
  }
}

export function formatReviewStatus(status: ReviewQueueStatus) {
  switch (status) {
    case 'pending':
      return 'Bekliyor'
    case 'in_review':
      return 'Inceleniyor'
    case 'approved':
      return 'Onaylandi'
    case 'merged':
      return 'Birlestirildi'
    case 'rejected':
      return 'Reddedildi'
    default:
      return status
  }
}

export function mapProcessingStatusTone(status: string) {
  if (status === 'review' || status === 'normalized') {
    return 'completed'
  }

  if (status === 'rejected' || status === 'error') {
    return 'failed'
  }

  return 'pending'
}

export function formatProcessingStatus(status: string) {
  switch (status) {
    case 'pending':
      return 'Ham kayıt'
    case 'review':
      return 'Admin bekliyor'
    case 'normalized':
      return 'Hazirlandi'
    case 'rejected':
      return 'Reddedildi'
    case 'error':
      return 'Hata'
    default:
      return status
  }
}

export function formatPlaceStatus(status: string) {
  switch (status) {
    case 'draft':
      return 'Taslak'
    case 'review':
      return 'Review'
    case 'admin':
      return 'Admin'
    case 'published':
      return 'Yayında'
    case 'archived':
      return 'Arsiv'
    default:
      return status
  }
}

export function formatVerificationStatus(status: string) {
  switch (status) {
    case 'pending':
      return 'Bekliyor'
    case 'reviewed':
      return 'Gozden gecirildi'
    case 'verified':
      return 'Dogrulandi'
    case 'rejected':
      return 'Reddedildi'
    default:
      return status
  }
}

export function formatSweepMode(presetName: string | null, cellSizeMeters: number) {
  const mode = presetName ? presetName.replaceAll('_', ' ') : 'manuel sweep'
  return `${mode} • ${cellSizeMeters}m kare grid`
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'Tarih yok'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatBbox(bbox: { south: number; west: number; north: number; east: number }) {
  return `${bbox.south.toFixed(3)}, ${bbox.west.toFixed(3)} • ${bbox.north.toFixed(3)}, ${bbox.east.toFixed(3)}`
}
