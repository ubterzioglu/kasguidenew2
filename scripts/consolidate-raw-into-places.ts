import { randomUUID } from 'node:crypto'

import { getSupabaseAdminClient } from './lib/supabase-admin.ts'

type RawPlaceRow = {
  id: string
  source_name: string
  source_id: string
  name_raw: string | null
  lat: number | null
  lng: number | null
  address_raw: string | null
  phone_raw: string | null
  website_raw: string | null
  category_raw: string | null
}

type PlaceSourceRow = {
  raw_place_id: string | null
  place_id: string
  source_name: string
  source_id: string
}

type PlaceRow = {
  id: string
  slug: string
}

const KNOWN_CATEGORY_IDS = new Set([
  'bar',
  'meyhane',
  'restoran',
  'cafe',
  'kahvalti',
  'plaj',
  'oteller',
  'dalis',
  'aktivite',
  'gezi',
  'carsi',
])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

function slugify(input: string) {
  return input
    .toLocaleLowerCase('tr')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function inferCategory(rawCategory: string | null) {
  const normalized = normalizeText(rawCategory)?.toLocaleLowerCase('tr') ?? ''
  if (KNOWN_CATEGORY_IDS.has(normalized)) {
    return normalized
  }
  if (normalized.includes('bar') || normalized.includes('pub')) {
    return 'bar'
  }
  if (normalized.includes('meyhane')) {
    return 'meyhane'
  }
  if (normalized.includes('restoran') || normalized.includes('restaurant')) {
    return 'restoran'
  }
  if (normalized.includes('cafe') || normalized.includes('coffee')) {
    return 'cafe'
  }
  if (normalized.includes('hotel') || normalized.includes('otel') || normalized.includes('lodging')) {
    return 'oteller'
  }
  if (normalized.includes('dalis') || normalized.includes('dive')) {
    return 'dalis'
  }
  if (normalized.includes('plaj') || normalized.includes('beach')) {
    return 'plaj'
  }
  if (normalized.includes('carsi') || normalized.includes('shop') || normalized.includes('market')) {
    return 'carsi'
  }
  if (normalized.includes('gezi') || normalized.includes('museum') || normalized.includes('attraction')) {
    return 'gezi'
  }
  return 'aktivite'
}

function fallbackName(raw: RawPlaceRow) {
  return (
    normalizeText(raw.name_raw) ??
    `${raw.source_name.toUpperCase()} ${raw.source_id.slice(0, 8)}`
  )
}

async function main() {
  const client = getSupabaseAdminClient()

  const { data: rawData, error: rawError } = await client
    .from('raw_places')
    .select(
      'id, source_name, source_id, name_raw, lat, lng, address_raw, phone_raw, website_raw, category_raw',
    )
    .order('imported_at', { ascending: true })

  if (rawError) {
    throw rawError
  }

  const rawPlaces = (rawData ?? []) as RawPlaceRow[]
  if (rawPlaces.length === 0) {
    console.log(JSON.stringify({ ok: true, message: 'raw_places bos', totalRaw: 0 }, null, 2))
    return
  }

  const [{ data: sourcesData, error: sourcesError }, { data: placesData, error: placesError }] = await Promise.all([
    client
      .from('place_sources')
      .select('raw_place_id, place_id, source_name, source_id'),
    client.from('places').select('id, slug'),
  ])

  if (sourcesError) {
    throw sourcesError
  }
  if (placesError) {
    throw placesError
  }

  const sources = (sourcesData ?? []) as PlaceSourceRow[]
  const places = (placesData ?? []) as PlaceRow[]
  const existingSlugSet = new Set(places.map((place) => place.slug))
  const sourceByRawId = new Map<string, PlaceSourceRow>()
  const sourceByPair = new Map<string, PlaceSourceRow>()

  for (const source of sources) {
    if (source.raw_place_id) {
      sourceByRawId.set(source.raw_place_id, source)
    }
    sourceByPair.set(`${source.source_name}::${source.source_id}`, source)
  }

  const placeRows: Array<Record<string, unknown>> = []
  const placeSourceRows: Array<Record<string, unknown>> = []
  const placeContentRows: Array<Record<string, unknown>> = []
  let created = 0
  let matched = 0

  for (const raw of rawPlaces) {
    const existingSource = sourceByRawId.get(raw.id) ?? sourceByPair.get(`${raw.source_name}::${raw.source_id}`) ?? null
    const placeId = existingSource?.place_id ?? randomUUID()

    if (existingSource) {
      matched += 1
    } else {
      created += 1
    }

    const name = fallbackName(raw)
    const baseSlug = slugify(name) || `mekan-${raw.id.slice(0, 8)}`
    let nextSlug = existingSource ? `keep-${placeId}` : `${baseSlug}-${raw.id.slice(0, 8)}`

    if (!existingSource) {
      let suffix = 1
      while (existingSlugSet.has(nextSlug)) {
        suffix += 1
        nextSlug = `${baseSlug}-${raw.id.slice(0, 8)}-${suffix}`
      }
      existingSlugSet.add(nextSlug)
    }

    placeRows.push({
      id: placeId,
      slug: nextSlug,
      name,
      category_primary: inferCategory(raw.category_raw),
      category_secondary: null,
      address: normalizeText(raw.address_raw),
      lat: raw.lat,
      lng: raw.lng,
      phone: normalizeText(raw.phone_raw),
      website: normalizeText(raw.website_raw),
      opening_hours: null,
      status: 'admin',
      verification_status: 'reviewed',
    })

    placeSourceRows.push({
      place_id: placeId,
      raw_place_id: raw.id,
      source_name: raw.source_name,
      source_id: raw.source_id,
      source_url: null,
      is_primary: true,
    })

    placeContentRows.push({
      place_id: placeId,
      headline: name,
      short_text: `${name} icin admin bekleyen mekan ozeti.`,
      long_text: `${name} icin detay metni admin panelinden duzenlenecek.`,
      tone_type: 'guide',
      last_generated_at: null,
    })
  }

  const newRows = placeRows.filter((row) => !String(row.slug).startsWith('keep-'))
  if (newRows.length > 0) {
    const { error: insertError } = await client.from('places').insert(newRows)
    if (insertError) {
      throw insertError
    }
  }

  const updateRows = placeRows.filter((row) => String(row.slug).startsWith('keep-'))
  for (const row of updateRows) {
    const placeId = row.id as string
    const { error: updateError } = await client
      .from('places')
      .update({
        name: row.name,
        category_primary: row.category_primary,
        category_secondary: null,
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        phone: row.phone,
        website: row.website,
        opening_hours: null,
        status: 'admin',
        verification_status: 'reviewed',
      })
      .eq('id', placeId)

    if (updateError) {
      throw updateError
    }
  }

  const { error: sourceUpsertError } = await client
    .from('place_sources')
    .upsert(placeSourceRows, { onConflict: 'source_name,source_id' })
  if (sourceUpsertError) {
    throw sourceUpsertError
  }

  const { error: contentUpsertError } = await client
    .from('place_content')
    .upsert(placeContentRows, { onConflict: 'place_id' })
  if (contentUpsertError) {
    throw contentUpsertError
  }

  const { data: statusRows, error: statusError } = await client.from('places').select('status, name, slug')
  if (statusError) {
    throw statusError
  }

  let adminCount = 0
  let publishedCount = 0
  for (const row of (statusRows ?? []) as Array<{ status: string }>) {
    if (row.status === 'admin') adminCount += 1
    if (row.status === 'published') publishedCount += 1
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        totalRaw: rawPlaces.length,
        matchedExisting: matched,
        createdNewPlaces: created,
        finalTotalPlaces: (statusRows ?? []).length,
        finalAdminCount: adminCount,
        finalPublishedCount: publishedCount,
        scannedSourcePairs: rawPlaces.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error(JSON.stringify(error, null, 2))
  }
  process.exit(1)
})
