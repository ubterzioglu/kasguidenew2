import { randomUUID } from 'node:crypto'

import { jsonFail, jsonOk } from '@/lib/api-helpers'
import { UserPlaceSubmissionSchema } from '@/lib/api-schemas'
import { normalizePhone, normalizeText, normalizeWebsite, slugifyText } from '@/lib/place-review-utils'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

const DEFAULT_PLACE_IMAGE_URL = '/kasplaceholder.jpg'

export async function POST(request: Request) {
  const client = getSupabaseAdminClient()

  if (!client) {
    return jsonFail('Sunucu yapılandırma hatası.', 500)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonFail('Geçersiz istek gövdesi.')
  }

  const parsed = UserPlaceSubmissionSchema.safeParse(body)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return jsonFail(firstError?.message ?? 'Geçersiz form verisi.')
  }

  const { name, categoryIds, address, phone, website, shortDescription, lat, lng } = parsed.data

  const normalizedName = normalizeText(name)
  const normalizedAddress = normalizeText(address)
  const normalizedPhone = normalizePhone(phone ?? null)
  const normalizedWebsite = normalizeWebsite(website ?? null)
  const normalizedShortDescription = normalizeText(shortDescription ?? null)

  if (!normalizedName) {
    return jsonFail('Mekan adı zorunlu.')
  }

  if (!normalizedAddress) {
    return jsonFail('Adres zorunlu.')
  }

  const placeId = randomUUID()
  const slugBase = slugifyText(normalizedName) || `place-${placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase)

  const now = new Date().toISOString()

  const payload = {
    id: placeId,
    slug,
    name: normalizedName,
    headline: normalizedName,
    short_description: normalizedShortDescription || normalizedName,
    long_description: '',
    kasguide_badge: '',
    category_primary: categoryIds[0],
    category_secondary: null,
    category_ids: categoryIds,
    kasguide_badges: [],
    address: normalizedAddress,
    lat: lat ?? null,
    lng: lng ?? null,
    phone: normalizedPhone,
    website: normalizedWebsite,
    opening_hours: null,
    status: 'pending' as const,
    verification_status: 'pending' as const,
    primary_source_name: 'user_submission',
    primary_source_id: placeId,
    source_url: null,
    imported_at: now,
    grid_key: null,
    cell_id: null,
    google_maps_uri: null,
    intake_channel: 'user_submission' as const,
    is_sweeped: false,
    source_sweep_id: null,
    review_reason: 'Kullanıcı önerisi',
    review_notes: null,
    review_score: null,
    merge_target_place_id: null,
    images: [
      {
        url: DEFAULT_PLACE_IMAGE_URL,
        alt_text: `${normalizedName} fotograf 1`,
        source_name: 'user_submission',
        is_cover: true,
        sort_order: 0,
      },
    ],
    source_records: [
      {
        source_name: 'user_submission',
        source_id: placeId,
        source_url: null,
        is_primary: true,
        first_seen_at: now,
        last_seen_at: now,
        raw_place_id: null,
      },
    ],
    raw_snapshot: {
      source: 'user_submission',
      submitted_at: now,
      name_raw: normalizedName,
      address_raw: normalizedAddress,
      phone_raw: normalizedPhone,
      website_raw: normalizedWebsite,
      category_raw: categoryIds[0],
    },
  }

  const { error } = await client.from('places').insert(payload)

  if (error) {
    console.error('[submit] Insert error:', error.message)
    return jsonFail('Mekan kaydı oluşturulamadı. Lütfen daha sonra tekrar deneyin.', 500)
  }

  return jsonOk({ id: placeId, slug })
}

const MAX_SLUG_ITERATIONS = 100

async function ensureUniqueSlug(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  for (let iteration = 0; iteration < MAX_SLUG_ITERATIONS; iteration++) {
    const { data, error } = await client.from('places').select('id, slug').eq('slug', slug).maybeSingle()

    if (error) {
      throw new Error('Slug benzersizliği kontrol edilemedi.')
    }

    if (!data) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  throw new Error('Slug benzersizliği sağlanamadı. Lütfen farklı bir isim deneyin.')
}
