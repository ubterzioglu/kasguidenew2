export function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function normalizePhone(value: string | null | undefined): string | null {
  return normalizeText(value)
}

export function normalizeWebsite(value: string | null | undefined): string | null {
  const normalized = normalizeText(value)

  if (!normalized) {
    return null
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  return `https://${normalized}`
}

export function uniqueImageUrls(imageUrls: string[]): string[] {
  return Array.from(new Set(imageUrls.map((item) => item.trim()).filter(Boolean)))
}

export function slugifyText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
