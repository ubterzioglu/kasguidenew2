import { appendFile } from 'node:fs/promises'

import {
  buildAddress,
  detectCategory,
  extractPhone,
  extractWebsite,
} from './lib/ingestion-config.ts'
import { getSupabaseAdminClient } from './lib/supabase-admin.ts'

type BoundingBox = {
  south: number
  west: number
  north: number
  east: number
}

type OsmElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: {
    lat: number
    lon: number
  }
  tags?: Record<string, string | undefined>
}

type OverpassResponse = {
  elements?: OsmElement[]
}

type PlaceUpsert = {
  slug?: null
  name: string
  category_primary: string
  address: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  website: string | null
  status: 'pending'
  verification_status: 'pending'
  headline: string
  short_description: string
  long_description: string
  primary_source_name: 'osm_overpass'
  primary_source_id: string
  source_url: string | null
  imported_at: string
  intake_channel: 'sweep'
  is_sweeped: true
  source_sweep_id: string | null
  grid_key: string
  cell_id: string
  google_maps_uri: null
  images: []
  source_records: Record<string, unknown>[]
  raw_snapshot: Record<string, unknown>
}

type GridTarget = {
  gridX: number
  gridY: number
  gridKey: string
  cellId: string
  centerLat: number
  centerLng: number
  bbox: BoundingBox
}

type QueryBucket = {
  key: string
  label: string
  selector: string
}

type QueryBucketResult = {
  key: string
  label: string
  fetchedCount: number
  preparedCount: number
  failed: boolean
  errorMessage: string | null
}

type NextCandidate = {
  direction: 'right' | 'left' | 'up' | 'down'
  gridX: number
  gridY: number
  gridKey: string
  cellId: string
}

const OVERPASS_ENDPOINTS = [
  process.env.OVERPASS_ENDPOINT,
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
].filter((value): value is string => Boolean(value))

const SEED_CENTER = {
  lat: 36.199383,
  lng: 29.641333,
}

const SEED_GRID = {
  x: 1,
  y: 1,
}

const DEFAULT_CELL_SIZE_METERS = 500
const DEFAULT_LAT_STEP = 0.0044915559
const DEFAULT_LNG_STEP = 0.0055659744
const REQUEST_TIMEOUT_MS = 45000
const MAX_RETRIES_PER_ENDPOINT = 2

const DEFAULT_QUERY_BUCKETS: QueryBucket[] = [
  {
    key: 'food-drink',
    label: 'Yeme icme',
    selector: `
      nwr({{bbox}})[amenity~"^(restaurant|cafe|bar|pub|fast_food)$"];
      nwr({{bbox}})[breakfast="yes"];
    `.trim(),
  },
  {
    key: 'stay',
    label: 'Konaklama',
    selector: `
      nwr({{bbox}})[tourism~"^(hotel|guest_house|motel|hostel|apartment)$"];
    `.trim(),
  },
  {
    key: 'experience',
    label: 'Deneyim',
    selector: `
      nwr({{bbox}})[tourism~"^(attraction|museum|gallery)$"];
      nwr({{bbox}})[leisure~"^(sports_centre|marina|park|water_park|beach_resort)$"];
      nwr({{bbox}})[natural="beach"];
      nwr({{bbox}})[sport="scuba_diving"];
      nwr({{bbox}})[shop="scuba_diving"];
    `.trim(),
  },
]

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const cellSizeMeters = parseInteger(getFlagValue('cell-size-meters')) ?? DEFAULT_CELL_SIZE_METERS
  const target = resolveGridTarget({
    gridXValue: getFlagValue('grid-x'),
    gridYValue: getFlagValue('grid-y'),
    gridKeyValue: getFlagValue('grid-key'),
    cellIdValue: getFlagValue('cell-id'),
    centerLatValue: getFlagValue('center-lat'),
    centerLngValue: getFlagValue('center-lng'),
    cellSizeMeters,
  })
  const regionName = getFlagValue('region') ?? `Kas Overpass Sweep ${target.gridKey}`
  const nextCandidates = buildNextCandidates(target.gridX, target.gridY)
  const startedAt = new Date().toISOString()
  const client = dryRun ? null : getSupabaseAdminClient()
  const sweepId = dryRun
    ? null
    : await createGridSweep(client!, {
        regionName,
        gridKey: target.gridKey,
        cellId: target.cellId,
        centerLat: target.centerLat,
        centerLng: target.centerLng,
        bbox: target.bbox,
        cellSizeMeters,
      })

  const byPlaceId = new Map<string, PlaceUpsert>()
  const bucketResults: QueryBucketResult[] = []
  let apiCalls = 0
  let totalFetched = 0

  for (const bucket of DEFAULT_QUERY_BUCKETS) {
    apiCalls += 1

    try {
      const elements = await fetchOverpassBucket(bucket, target.bbox)
      totalFetched += elements.length
      let preparedCount = 0

      for (const element of elements) {
        const mapped = mapElementToPlaceInsert(element, bucket.key, target)

        if (!mapped) {
          continue
        }

        preparedCount += 1
        const existing = byPlaceId.get(mapped.primary_source_id)

        if (!existing) {
          byPlaceId.set(mapped.primary_source_id, mapped)
          continue
        }

        const existingOsm = existing.raw_snapshot.osm as Record<string, unknown> | undefined
        const existingBuckets = Array.isArray(existingOsm?.matchedBuckets)
          ? (existingOsm?.matchedBuckets as string[])
          : []

        byPlaceId.set(mapped.primary_source_id, {
          ...existing,
          raw_snapshot: {
            ...existing.raw_snapshot,
            osm: {
              ...existingOsm,
              matchedBuckets: Array.from(new Set([...existingBuckets, bucket.key])),
            },
          },
        })
      }

      bucketResults.push({
        key: bucket.key,
        label: bucket.label,
        fetchedCount: elements.length,
        preparedCount,
        failed: false,
        errorMessage: null,
      })
    } catch (error) {
      bucketResults.push({
        key: bucket.key,
        label: bucket.label,
        fetchedCount: 0,
        preparedCount: 0,
        failed: true,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
      })
    }
  }

  const uniqueRows = [...byPlaceId.values()].map((row) => ({
    ...row,
    source_sweep_id: sweepId,
  }))
  const failedBuckets = bucketResults.filter((item) => item.failed).map((item) => item.key)
  const summary = {
    gridX: target.gridX,
    gridY: target.gridY,
    gridKey: target.gridKey,
    cellId: target.cellId,
    regionName,
    centerLat: target.centerLat,
    centerLng: target.centerLng,
    cellSizeMeters,
    bbox: target.bbox,
    apiCalls,
    fetched: totalFetched,
    uniquePlaces: uniqueRows.length,
    failedBuckets,
    bucketResults,
    nextCandidates,
    dryRun,
  }

  if (!dryRun && client) {
    let inserted = 0

    for (const chunk of chunkArray(uniqueRows, 100)) {
      const { data, error } = await client
        .from('places')
        .upsert(chunk, { onConflict: 'primary_source_name,primary_source_id' })
        .select('id')

      if (error) {
        throw error
      }

      inserted += data?.length ?? chunk.length
    }

    const status = await finalizeGridSweep(client, sweepId!, {
      bbox: target.bbox,
      totalFetched,
      uniquePlaces: uniqueRows.length,
      failedBuckets,
      bucketResults,
      gridKey: target.gridKey,
      cellId: target.cellId,
      inserted,
      startedAt,
    })

    await appendRunReport({
      processedCell: target.cellId,
      gridKey: target.gridKey,
      gridX: target.gridX,
      gridY: target.gridY,
      status,
      apiCalls,
      rawRowsWritten: inserted,
      nextCandidates,
      note: 'overpass tek grid islendi, run sonlandirildi',
    })

    console.log(JSON.stringify({ ...summary, inserted, status }, null, 2))
    return
  }

  console.log(JSON.stringify(summary, null, 2))
}

async function fetchOverpassBucket(bucket: QueryBucket, bbox: BoundingBox) {
  const query = buildBucketQuery(bucket, bbox)
  return fetchOverpass(query)
}

function buildBucketQuery(bucket: QueryBucket, bbox: BoundingBox) {
  const bboxValue = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`

  return `
[out:json][timeout:40];
(
  ${bucket.selector.replaceAll('{{bbox}}', bboxValue)}
);
out center tags;
`.trim()
}

async function fetchOverpass(query: string) {
  let lastError: unknown = null

  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_ENDPOINT; attempt += 1) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
          },
          body: query,
          signal: controller.signal,
        })

        if (!response.ok) {
          if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES_PER_ENDPOINT) {
            await delay(900 * attempt)
            continue
          }

          throw new Error(`Overpass istegi basarisiz oldu: ${response.status} ${response.statusText} (${endpoint})`)
        }

        const payload = (await response.json()) as OverpassResponse
        return Array.isArray(payload.elements) ? payload.elements : []
      } catch (error) {
        lastError = error

        if (attempt < MAX_RETRIES_PER_ENDPOINT) {
          await delay(900 * attempt)
          continue
        }
      } finally {
        clearTimeout(timeout)
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Tum Overpass endpointleri basarisiz oldu.')
}

function mapElementToPlaceInsert(element: OsmElement, matchedBucket: string, target: GridTarget): PlaceUpsert | null {
  const lat = element.lat ?? element.center?.lat ?? null
  const lng = element.lon ?? element.center?.lon ?? null

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null
  }

  if (!isInsideBoundingBox(lat, lng, target.bbox)) {
    return null
  }

  const tags = element.tags ?? {}
  const category = detectCategory(tags)

  if (!category) {
    return null
  }

  const sourceId = `${element.type}/${element.id}`
  const importedAt = new Date().toISOString()
  const name = cleanText(tags.name) ?? `OSM ${sourceId}`
  const website = normalizeWebsite(cleanText(extractWebsite(tags)))
  const phone = cleanText(extractPhone(tags))
  const address = cleanText(buildAddress(tags))

  return {
    slug: null,
    name,
    category_primary: category,
    address,
    lat,
    lng,
    phone,
    website,
    status: 'pending',
    verification_status: 'pending',
    headline: name,
    short_description: name,
    long_description: '',
    primary_source_name: 'osm_overpass',
    primary_source_id: sourceId,
    source_url: null,
    imported_at: importedAt,
    intake_channel: 'sweep',
    is_sweeped: true,
    source_sweep_id: null,
    grid_key: target.gridKey,
    cell_id: target.cellId,
    google_maps_uri: null,
    images: [],
    source_records: [{
      source_name: 'osm_overpass',
      source_id: sourceId,
      source_url: null,
      is_primary: true,
      first_seen_at: importedAt,
      last_seen_at: importedAt,
    }],
    raw_snapshot: {
      source_name: 'osm_overpass',
      source_id: sourceId,
      name_raw: cleanText(tags.name),
      address_raw: address,
      website_raw: website,
      phone_raw: phone,
      category_raw: category,
      osm: {
        type: element.type,
        id: element.id,
        tags,
        matchedBuckets: [matchedBucket],
        cellId: target.cellId,
        gridX: target.gridX,
        gridY: target.gridY,
        gridKey: target.gridKey,
        bbox: target.bbox,
      },
    },
  }
}

function resolveGridTarget(input: {
  gridXValue: string | null
  gridYValue: string | null
  gridKeyValue: string | null
  cellIdValue: string | null
  centerLatValue: string | null
  centerLngValue: string | null
  cellSizeMeters: number
}): GridTarget {
  const parsedGridKey = parseGridKey(input.gridKeyValue)
  const parsedCellId = parseCellId(input.cellIdValue)
  const gridX =
    parseInteger(input.gridXValue) ?? parsedGridKey?.gridX ?? parsedCellId?.gridX ?? SEED_GRID.x
  const gridY =
    parseInteger(input.gridYValue) ?? parsedGridKey?.gridY ?? parsedCellId?.gridY ?? SEED_GRID.y
  const gridKey = toGridKey(gridX, gridY)
  const cellId = toCellId(gridX, gridY)
  const centerLatOverride = parseNumber(input.centerLatValue)
  const centerLngOverride = parseNumber(input.centerLngValue)
  const centerLat = centerLatOverride ?? roundCoord(SEED_CENTER.lat + ((gridY - SEED_GRID.y) * scaledLatStep(input.cellSizeMeters)))
  const centerLng = centerLngOverride ?? roundCoord(SEED_CENTER.lng + ((gridX - SEED_GRID.x) * scaledLngStep(input.cellSizeMeters)))

  return {
    gridX,
    gridY,
    gridKey,
    cellId,
    centerLat,
    centerLng,
    bbox: readBoundingBox(centerLat, centerLng, input.cellSizeMeters),
  }
}

function buildNextCandidates(gridX: number, gridY: number): NextCandidate[] {
  const baseCandidates: Array<Pick<NextCandidate, 'direction' | 'gridX' | 'gridY'>> = [
    { direction: 'right', gridX: gridX + 1, gridY },
    { direction: 'left', gridX: gridX - 1, gridY },
    { direction: 'up', gridX, gridY: gridY + 1 },
    { direction: 'down', gridX, gridY: gridY - 1 },
  ]

  return baseCandidates.map((candidate) => ({
    ...candidate,
    gridKey: toGridKey(candidate.gridX, candidate.gridY),
    cellId: toCellId(candidate.gridX, candidate.gridY),
  }))
}

function isInsideBoundingBox(lat: number, lng: number, bbox: BoundingBox) {
  return lat >= bbox.south && lat < bbox.north && lng >= bbox.west && lng < bbox.east
}

function readBoundingBox(centerLat: number, centerLng: number, cellSizeMeters: number): BoundingBox {
  const halfLatStep = scaledLatStep(cellSizeMeters) / 2
  const halfLngStep = scaledLngStep(cellSizeMeters) / 2

  return {
    south: roundCoord(centerLat - halfLatStep),
    west: roundCoord(centerLng - halfLngStep),
    north: roundCoord(centerLat + halfLatStep),
    east: roundCoord(centerLng + halfLngStep),
  }
}

async function createGridSweep(
  client: ReturnType<typeof getSupabaseAdminClient>,
  input: {
    regionName: string
    gridKey: string
    cellId: string
    centerLat: number
    centerLng: number
    bbox: BoundingBox
    cellSizeMeters: number
  },
) {
  const { data, error } = await client
    .from('grid_sweeps')
    .insert({
      region_name: `${input.regionName} (${input.gridKey})`,
      preset_name: 'overpass_single_grid_v1',
      origin_lat: input.centerLat,
      origin_lng: input.centerLng,
      bbox_south: input.bbox.south,
      bbox_west: input.bbox.west,
      bbox_north: input.bbox.north,
      bbox_east: input.bbox.east,
      cell_size_meters: input.cellSizeMeters,
      total_cells: 1,
      processed_cells: 0,
      successful_cells: 0,
      failed_cells: 0,
      status: 'running',
    })
    .select('id')
    .single()

  if (error || !data) {
    throw error ?? new Error('Grid sweep kaydi olusturulamadi.')
  }

  return data.id as string
}

async function finalizeGridSweep(
  client: ReturnType<typeof getSupabaseAdminClient>,
  sweepId: string,
  input: {
    bbox: BoundingBox
    totalFetched: number
    uniquePlaces: number
    failedBuckets: string[]
    bucketResults: QueryBucketResult[]
    gridKey: string
    cellId: string
    inserted: number
    startedAt: string
  },
) {
  const completedAt = new Date().toISOString()
  const isFailed = input.bucketResults.every((item) => item.failed)
  const status = isFailed ? 'failed' : input.failedBuckets.length > 0 ? 'partial' : 'completed'

  const { error: cellError } = await client.from('grid_sweep_cells').insert({
    sweep_id: sweepId,
    cell_index: 1,
    south: input.bbox.south,
    west: input.bbox.west,
    north: input.bbox.north,
    east: input.bbox.east,
    status: isFailed ? 'failed' : 'success',
    fetched_count: input.totalFetched,
    prepared_count: input.uniquePlaces,
    error_message:
      input.failedBuckets.length > 0
        ? `Grid ${input.gridKey} basarisiz bucket'lar: ${input.failedBuckets.join(', ')}`
        : null,
    started_at: input.startedAt,
    completed_at: completedAt,
  })

  if (cellError) {
    throw cellError
  }

  const { error: sweepError } = await client
    .from('grid_sweeps')
    .update({
      processed_cells: 1,
      successful_cells: isFailed ? 0 : 1,
      failed_cells: isFailed ? 1 : 0,
      status,
      completed_at: completedAt,
    })
    .eq('id', sweepId)

  if (sweepError) {
    throw sweepError
  }

  return status
}

async function appendRunReport(input: {
  processedCell: string
  gridKey: string
  gridX: number
  gridY: number
  status: string
  apiCalls: number
  rawRowsWritten: number
  nextCandidates: NextCandidate[]
  note: string
}) {
  const timestamp = formatTimestamp(new Date())
  const block = [
    `\n## Session ${timestamp}`,
    `- processed_cell: ${input.processedCell}`,
    `- grid_key: ${input.gridKey}`,
    `- grid_x: ${input.gridX}`,
    `- grid_y: ${input.gridY}`,
    `- status: ${input.status}`,
    `- api_calls: ${input.apiCalls}`,
    `- raw_rows_written: ${input.rawRowsWritten}`,
    `- next_candidates:`,
    ...input.nextCandidates.map((candidate) => `  - ${candidate.gridKey}`),
    `- note: ${input.note}`,
    '',
  ].join('\n')

  await appendFile('docs/kas-run-report.md', block, 'utf8')
}

function cleanText(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeWebsite(value: string | null) {
  if (!value) {
    return null
  }

  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

function getFlagValue(name: string) {
  const direct = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  if (!direct) {
    return null
  }

  try {
    return decodeURIComponent(direct.slice(name.length + 3))
  } catch {
    return direct.slice(name.length + 3)
  }
}

function parseInteger(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseNumber(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseGridKey(value: string | null) {
  if (!value) {
    return null
  }

  const match = /^X(-?\d+)Y(-?\d+)$/i.exec(value.trim())
  if (!match) {
    return null
  }

  return {
    gridX: Number.parseInt(match[1]!, 10),
    gridY: Number.parseInt(match[2]!, 10),
  }
}

function parseCellId(value: string | null) {
  if (!value) {
    return null
  }

  const match = /^kas-overpass-grid-x(-?\d+)-y(-?\d+)$/i.exec(value.trim())
  if (!match) {
    return null
  }

  return {
    gridX: Number.parseInt(match[1]!, 10),
    gridY: Number.parseInt(match[2]!, 10),
  }
}

function toGridKey(gridX: number, gridY: number) {
  return `X${gridX}Y${gridY}`
}

function toCellId(gridX: number, gridY: number) {
  return `kas-overpass-grid-x${gridX}-y${gridY}`
}

function scaledLatStep(cellSizeMeters: number) {
  return (cellSizeMeters / DEFAULT_CELL_SIZE_METERS) * DEFAULT_LAT_STEP
}

function scaledLngStep(cellSizeMeters: number) {
  return (cellSizeMeters / DEFAULT_CELL_SIZE_METERS) * DEFAULT_LNG_STEP
}

function roundCoord(value: number) {
  return Number(value.toFixed(6))
}

function formatTimestamp(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize))
  }

  return chunks
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
