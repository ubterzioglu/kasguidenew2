import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { getSupabaseAdminClient } from './lib/supabase-admin.ts'
import { haversineDistanceMeters, normalizePlaceName, slugifyPlaceName } from './lib/ingestion-config.ts'

type LegacyItem = {
  id: number | string
  item_number?: string | null
  item_type?: string | null
  slug?: string | null
  title?: string | null
  phone?: string | null
  website?: string | null
  instagram?: string | null
  location?: string | null
  coordinates_lat?: string | number | null
  coordinates_lng?: string | number | null
  status?: string | null
  attributes?: {
    categories?: string[] | null
  } | null
  photos?: unknown
}

type RawPlaceRow = {
  id: string
  source_name: string
  source_id: string
  name_raw: string | null
  lat: number | null
  lng: number | null
}

type PlaceRow = {
  id: string
  name: string
  slug: string
  lat: number | null
  lng: number | null
}

type ReviewQueueRow = {
  id: string
  raw_place_id: string
  status: string
}

const LEGACY_SOURCE_NAME = 'legacy_items'

async function main() {
  const client = getSupabaseAdminClient()
  const dryRun = process.argv.includes('--dry-run')
  const limit = parseOptionalIntFlag('limit')
  const dumpDir = (await resolveDumpDir(getFlagValue('dump-dir'))) ?? fail('Dump klasoru bulunamadi.')

  const itemsPath = join(dumpDir, 'items.json')
  const itemsRaw = await readFile(itemsPath, 'utf8')
  const parsed = JSON.parse(itemsRaw) as unknown
  const items = Array.isArray(parsed) ? (parsed as LegacyItem[]) : []

  const placeItems = items
    .filter((item) => (item.item_type ?? '').toLowerCase() === 'place')
    .filter((item) => Boolean(normalizePlaceName(item.title)))

  const scopedItems = limit && limit > 0 ? placeItems.slice(0, limit) : placeItems

  const [rawPlacesResult, placesResult, reviewResult] = await Promise.all([
    client.from('raw_places').select('id, source_name, source_id, name_raw, lat, lng'),
    client.from('places').select('id, name, slug, lat, lng'),
    client.from('review_queue').select('id, raw_place_id, status'),
  ])

  if (rawPlacesResult.error) {
    throw new Error(`raw_places okunamadi: ${rawPlacesResult.error.message}`)
  }
  if (placesResult.error) {
    throw new Error(`places okunamadi: ${placesResult.error.message}`)
  }
  if (reviewResult.error) {
    throw new Error(`review_queue okunamadi: ${reviewResult.error.message}`)
  }

  const rawPlaces = (rawPlacesResult.data ?? []) as RawPlaceRow[]
  const places = (placesResult.data ?? []) as PlaceRow[]
  const reviewQueue = (reviewResult.data ?? []) as ReviewQueueRow[]

  const rawBySourceKey = new Map<string, RawPlaceRow>()
  for (const row of rawPlaces) {
    rawBySourceKey.set(`${row.source_name}::${row.source_id}`, row)
  }

  const reviewByRawPlace = new Map<string, ReviewQueueRow[]>()
  for (const row of reviewQueue) {
    const bucket = reviewByRawPlace.get(row.raw_place_id) ?? []
    bucket.push(row)
    reviewByRawPlace.set(row.raw_place_id, bucket)
  }

  const rawInserts: Array<{
    source_name: string
    source_id: string
    name_raw: string
    lat: number | null
    lng: number | null
    address_raw: string | null
    website_raw: string | null
    phone_raw: string | null
    category_raw: string | null
    raw_payload: Record<string, unknown>
    processing_status: 'review'
  }> = []

  const queueInserts: Array<{
    raw_place_id: string
    candidate_place_id: null
    reason: string
    status: 'pending'
    notes: string
  }> = []

  let skippedAlreadyInNew = 0
  let skippedMissingCoordinates = 0
  let reusedRawRowForQueue = 0

  for (const item of scopedItems) {
    const normalizedTitle = normalizePlaceName(item.title)
    if (!normalizedTitle) {
      continue
    }

    const sourceId = (item.item_number || item.slug || String(item.id)).trim()
    const key = `${LEGACY_SOURCE_NAME}::${sourceId}`
    const itemLat = toNumberOrNull(item.coordinates_lat)
    const itemLng = toNumberOrNull(item.coordinates_lng)

    const existingBySource = rawBySourceKey.get(key) ?? null
    const existingRawBySimilarity = findMatchingRawPlace(rawPlaces, normalizedTitle, itemLat, itemLng)
    const existingPlace = findMatchingPlace(places, normalizedTitle, itemLat, itemLng)

    if (existingPlace && !existingBySource && !existingRawBySimilarity) {
      skippedAlreadyInNew += 1
      continue
    }

    let rawPlaceId: string | null = existingBySource?.id ?? existingRawBySimilarity?.id ?? null

    if (!rawPlaceId) {
      if (itemLat === null || itemLng === null) {
        skippedMissingCoordinates += 1
      }

      rawInserts.push({
        source_name: LEGACY_SOURCE_NAME,
        source_id: sourceId,
        name_raw: normalizedTitle,
        lat: itemLat,
        lng: itemLng,
        address_raw: normalizeNullableString(item.location),
        website_raw: normalizeNullableString(item.website) ?? normalizeNullableString(item.instagram),
        phone_raw: normalizeNullableString(item.phone),
        category_raw: firstCategory(item),
        raw_payload: {
          legacy_item: {
            id: item.id,
            item_number: item.item_number ?? null,
            slug: item.slug ?? null,
            status: item.status ?? null,
            photos: item.photos ?? null,
          },
        },
        processing_status: 'review',
      })
      continue
    }

    const existingReviews = reviewByRawPlace.get(rawPlaceId) ?? []
    if (existingReviews.length === 0) {
      queueInserts.push({
        raw_place_id: rawPlaceId,
        candidate_place_id: null,
        reason: 'legacy_backfill',
        status: 'pending',
        notes: `Eski items tablosundan eklendi (${sourceId}).`,
      })
      reusedRawRowForQueue += 1
    }
  }

  let insertedRaw = 0
  let insertedQueue = 0

  if (!dryRun && rawInserts.length > 0) {
    const { data, error } = await client
      .from('raw_places')
      .insert(rawInserts)
      .select('id, source_id')

    if (error) {
      throw new Error(`raw_places insert hatasi: ${error.message}`)
    }

    insertedRaw = data?.length ?? 0

    const insertedRows = (data ?? []) as Array<{ id: string; source_id: string }>
    for (const row of insertedRows) {
      queueInserts.push({
        raw_place_id: row.id,
        candidate_place_id: null,
        reason: 'legacy_backfill',
        status: 'pending',
        notes: `Eski items tablosundan eklendi (${row.source_id}).`,
      })
    }
  }

  if (!dryRun && queueInserts.length > 0) {
    const { error } = await client.from('review_queue').insert(queueInserts)
    if (error) {
      throw new Error(`review_queue insert hatasi: ${error.message}`)
    }
    insertedQueue = queueInserts.length
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        dumpDir,
        scannedPlaceItems: scopedItems.length,
        rawToInsert: rawInserts.length,
        queueToInsert: queueInserts.length,
        insertedRaw,
        insertedQueue,
        reusedRawRowForQueue,
        skippedAlreadyInNew,
        skippedMissingCoordinates,
      },
      null,
      2,
    ),
  )
}

function findMatchingRawPlace(
  rows: RawPlaceRow[],
  normalizedTitle: string,
  lat: number | null,
  lng: number | null,
): RawPlaceRow | null {
  const normalizedSlug = slugifyPlaceName(normalizedTitle)

  for (const row of rows) {
    const rowName = normalizePlaceName(row.name_raw)
    if (!rowName) {
      continue
    }

    if (slugifyPlaceName(rowName) === normalizedSlug) {
      if (lat !== null && lng !== null && row.lat !== null && row.lng !== null) {
        const distance = haversineDistanceMeters(lat, lng, row.lat, row.lng)
        if (distance <= 90) {
          return row
        }
      } else {
        return row
      }
    }
  }

  return null
}

function findMatchingPlace(
  rows: PlaceRow[],
  normalizedTitle: string,
  lat: number | null,
  lng: number | null,
): PlaceRow | null {
  const normalizedSlug = slugifyPlaceName(normalizedTitle)

  for (const row of rows) {
    if (slugifyPlaceName(row.name) === normalizedSlug || row.slug === normalizedSlug) {
      if (lat !== null && lng !== null && row.lat !== null && row.lng !== null) {
        const distance = haversineDistanceMeters(lat, lng, row.lat, row.lng)
        if (distance <= 90) {
          return row
        }
      } else {
        return row
      }
    }
  }

  return null
}

function firstCategory(item: LegacyItem): string | null {
  const categories = item.attributes?.categories
  if (!categories || categories.length === 0) {
    return null
  }
  const first = categories[0]?.trim()
  return first ? first.toLowerCase() : null
}

function normalizeNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseOptionalIntFlag(name: string): number | null {
  const value = getFlagValue(name)
  if (!value) {
    return null
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function getFlagValue(name: string): string | null {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`))
  return arg ? arg.slice(name.length + 3) : null
}

async function resolveDumpDir(preferred: string | null): Promise<string | null> {
  if (preferred) {
    return preferred
  }

  const baseDir = join(process.cwd(), 'db', 'local-dump')
  const entries = await readdir(baseDir, { withFileTypes: true })
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  if (dirs.length === 0) {
    return null
  }
  return join(baseDir, dirs[dirs.length - 1])
}

function fail(message: string): never {
  throw new Error(message)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
