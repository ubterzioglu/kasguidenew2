import 'server-only'

import { randomUUID } from 'node:crypto'

import type { PlaceEditorDraft } from '@/types/review'
import { PLACE_CATEGORY_OPTIONS } from '@/lib/place-taxonomy'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

import { normalizeText, normalizePhone, normalizeWebsite, uniqueImageUrls, slugifyText } from './place-review-utils'

// ── Schema migration compat ───────────────────────────────────────────────────

export function isMissingKasguideBadgeColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const message = 'message' in error && typeof error.message === 'string' ? error.message : ''
  const details = 'details' in error && typeof error.details === 'string' ? error.details : ''
  const hint = 'hint' in error && typeof error.hint === 'string' ? error.hint : ''
  const text = `${message} ${details} ${hint}`.toLowerCase()

  return text.includes('kasguide_badge') && (text.includes('column') || text.includes('does not exist'))
}

// ── Private helpers ───────────────────────────────────────────────────────────

async function findPlaceSourceForRawPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
): Promise<{ raw_place_id: string | null; place_id: string } | null> {
  const { data, error } = await client
    .from('place_sources')
    .select('raw_place_id, place_id')
    .eq('raw_place_id', rawPlaceId)
    .maybeSingle()

  if (error) {
    throw new Error('Mekan kaynağı okunamadı.')
  }

  return data as { raw_place_id: string | null; place_id: string } | null
}

async function ensureUniqueSlug(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  baseSlug: string,
  currentPlaceId: string,
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const { data, error } = await client
      .from('places')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      throw new Error('Slug benzersizligi kontrol edilemedi.')
    }

    const existing = data as { id: string; slug: string } | null

    if (!existing || existing.id === currentPlaceId) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }
}

// ── Public write operations ───────────────────────────────────────────────────

export async function updateRawPlaceStatus(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
  status: 'review' | 'rejected' | 'normalized',
): Promise<void> {
  const { error } = await client
    .from('raw_places')
    .update({ processing_status: status })
    .eq('id', rawPlaceId)

  if (error) {
    throw new Error('Ham kayıt durumu güncellenemedi.')
  }
}

export async function rejectRawPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  rawPlaceId: string,
): Promise<void> {
  await updateRawPlaceStatus(client, rawPlaceId, 'rejected')

  const { error } = await client
    .from('review_queue')
    .update({ status: 'rejected', notes: 'Admin panelinden reddedildi.' })
    .eq('raw_place_id', rawPlaceId)
    .in('status', ['pending', 'in_review', 'approved'])

  if (error) {
    throw new Error('Review kaydi reddedilemedi.')
  }
}

export async function persistPlaceFromRaw(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  input: {
    rawPlaceId: string
    draft: PlaceEditorDraft
    publish: boolean
  },
): Promise<void> {
  const { data: rawPlace, error: rawPlaceError } = await client
    .from('raw_places')
    .select('id, source_name, source_id, name_raw, lat, lng, address_raw, phone_raw, website_raw, category_raw')
    .eq('id', input.rawPlaceId)
    .single()

  if (rawPlaceError || !rawPlace) {
    throw new Error('Ham mekan kaydi bulunamadi.')
  }

  const normalizedName = normalizeText(input.draft.name)
  const normalizedHeadline = normalizeText(input.draft.headline)
  const normalizedShortDescription = normalizeText(input.draft.shortDescription)
  const normalizedLongDescription = normalizeText(input.draft.longDescription)
  const normalizedKasguideBadge = normalizeText(input.draft.kasguideBadge)
  const normalizedCategory = normalizeText(input.draft.categoryPrimary)
  const normalizedAddress = normalizeText(input.draft.address)
  const normalizedPhone = normalizePhone(input.draft.phone)
  const normalizedWebsite = normalizeWebsite(input.draft.website)
  const normalizedImages = uniqueImageUrls(input.draft.imageUrls)

  if (!normalizedName) {
    throw new Error('Mekan adi zorunlu.')
  }

  if (!normalizedCategory) {
    throw new Error('Kategori seçilmesi zorunlu.')
  }

  if (!PLACE_CATEGORY_OPTIONS.some((option) => option.id === normalizedCategory)) {
    throw new Error('Geçersiz kategori seçimi.')
  }

  if (normalizedImages.length < 1 || normalizedImages.length > 5) {
    throw new Error('Her mekan için en az 1, en fazla 5 foto gerekli.')
  }

  const existingPlaceSource = await findPlaceSourceForRawPlace(client, input.rawPlaceId)
  const placeId = input.draft.placeId ?? existingPlaceSource?.place_id ?? randomUUID()
  const slugBase = slugifyText(input.draft.slug || normalizedName) || `place-${placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, placeId)
  const placeStatus = input.publish ? 'published' : 'admin'
  const verificationStatus = input.publish ? 'verified' : 'reviewed'

  const rawPlace2 = rawPlace as {
    id: string; source_name: string; source_id: string
    lat: number | null; lng: number | null
  }

  const placeUpsertWithBadge = {
    id: placeId,
    slug,
    name: normalizedName,
    kasguide_badge: normalizedKasguideBadge,
    category_primary: normalizedCategory,
    category_secondary: null,
    address: normalizedAddress,
    lat: rawPlace2.lat ?? null,
    lng: rawPlace2.lng ?? null,
    phone: normalizedPhone,
    website: normalizedWebsite,
    opening_hours: null,
    status: placeStatus,
    verification_status: verificationStatus,
  }
  const { kasguide_badge: _ignoredUpsertBadgeField, ...placeUpsertWithoutBadge } = placeUpsertWithBadge

  let { error: placeError } = await client.from('places').upsert(placeUpsertWithBadge, { onConflict: 'id' })

  if (placeError && isMissingKasguideBadgeColumnError(placeError)) {
    const fallback = await client.from('places').upsert(placeUpsertWithoutBadge, { onConflict: 'id' })
    placeError = fallback.error
  }

  if (placeError) {
    throw new Error('Mekan kaydi kaydedilemedi.')
  }

  const { error: contentError } = await client.from('place_content').upsert(
    {
      place_id: placeId,
      headline: normalizedHeadline || normalizedName,
      short_text: normalizedShortDescription,
      long_text: normalizedLongDescription,
      tone_type: 'guide',
      last_generated_at: null,
    },
    { onConflict: 'place_id' },
  )

  if (contentError) {
    throw new Error('Mekan icerigi kaydedilemedi.')
  }

  const { error: imageDeleteError } = await client.from('place_images').delete().eq('place_id', placeId)

  if (imageDeleteError) {
    throw new Error('Eski mekan gorselleri temizlenemedi.')
  }

  const { error: imageInsertError } = await client.from('place_images').insert(
    normalizedImages.map((url, index) => ({
      place_id: placeId,
      storage_path: url,
      public_url: url,
      alt_text: `${normalizedName} fotoğraf ${index + 1}`,
      source_name: 'admin_manual',
      is_cover: index === 0,
      sort_order: index,
    })),
  )

  if (imageInsertError) {
    throw new Error('Mekan gorselleri kaydedilemedi.')
  }

  const { error: sourceError } = await client.from('place_sources').upsert(
    {
      place_id: placeId,
      raw_place_id: rawPlace2.id,
      source_name: rawPlace2.source_name,
      source_id: rawPlace2.source_id,
      source_url: null,
      is_primary: true,
    },
    { onConflict: 'source_name,source_id' },
  )

  if (sourceError) {
    throw new Error('Kaynak iliskisi kaydedilemedi.')
  }

  const { error: rawStatusError } = await client
    .from('raw_places')
    .update({ processing_status: input.publish ? 'normalized' : 'review' })
    .eq('id', rawPlace2.id)

  if (rawStatusError) {
    throw new Error('Ham mekan durumu guncellenemedi.')
  }

  const { error: reviewUpdateError } = await client
    .from('review_queue')
    .update({
      candidate_place_id: placeId,
      status: input.publish ? 'approved' : 'in_review',
      notes: input.publish
        ? 'Admin panelinden onaylanıp yayına alındı.'
        : 'Admin panelinde düzenleniyor.',
    })
    .eq('raw_place_id', rawPlace2.id)
    .in('status', ['pending', 'in_review', 'approved'])

  if (reviewUpdateError) {
    throw new Error('Review kuyrugu guncellenemedi.')
  }
}

export async function persistExistingPlace(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  input: {
    placeId: string
    draft: PlaceEditorDraft
  },
): Promise<void> {
  const normalizedName = normalizeText(input.draft.name)
  const normalizedHeadline = normalizeText(input.draft.headline)
  const normalizedShortDescription = normalizeText(input.draft.shortDescription)
  const normalizedLongDescription = normalizeText(input.draft.longDescription)
  const normalizedKasguideBadge = normalizeText(input.draft.kasguideBadge)
  const normalizedCategory = normalizeText(input.draft.categoryPrimary)
  const normalizedAddress = normalizeText(input.draft.address)
  const normalizedPhone = normalizePhone(input.draft.phone)
  const normalizedWebsite = normalizeWebsite(input.draft.website)
  const normalizedImages = uniqueImageUrls(input.draft.imageUrls)

  if (!normalizedName) {
    throw new Error('Mekan adı zorunlu.')
  }

  if (!normalizedCategory) {
    throw new Error('Kategori seçilmesi zorunlu.')
  }

  if (!PLACE_CATEGORY_OPTIONS.some((option) => option.id === normalizedCategory)) {
    throw new Error('Geçersiz kategori seçimi.')
  }

  if (normalizedImages.length < 1 || normalizedImages.length > 5) {
    throw new Error('Her mekan için en az 1, en fazla 5 foto gerekli.')
  }

  const slugBase = slugifyText(input.draft.slug || normalizedName) || `place-${input.placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase, input.placeId)

  const placePayloadWithBadge = {
    slug,
    name: normalizedName,
    kasguide_badge: normalizedKasguideBadge,
    category_primary: normalizedCategory,
    address: normalizedAddress,
    phone: normalizedPhone,
    website: normalizedWebsite,
    status: input.draft.status,
    verification_status: input.draft.verificationStatus,
  }
  const { kasguide_badge: _ignoredBadgeField, ...placePayloadWithoutBadge } = placePayloadWithBadge

  let { error: placeError } = await client.from('places').update(placePayloadWithBadge).eq('id', input.placeId)

  if (placeError && isMissingKasguideBadgeColumnError(placeError)) {
    const fallback = await client.from('places').update(placePayloadWithoutBadge).eq('id', input.placeId)
    placeError = fallback.error
  }

  if (placeError) {
    throw new Error('Mevcut mekan kaydı güncellenemedi.')
  }

  const { error: contentError } = await client.from('place_content').upsert(
    {
      place_id: input.placeId,
      headline: normalizedHeadline || normalizedName,
      short_text: normalizedShortDescription,
      long_text: normalizedLongDescription,
      tone_type: 'guide',
      last_generated_at: null,
    },
    { onConflict: 'place_id' },
  )

  if (contentError) {
    throw new Error('Mevcut mekan içeriği güncellenemedi.')
  }

  const { error: imageDeleteError } = await client.from('place_images').delete().eq('place_id', input.placeId)

  if (imageDeleteError) {
    throw new Error('Mevcut mekan görselleri temizlenemedi.')
  }

  const { error: imageInsertError } = await client.from('place_images').insert(
    normalizedImages.map((url, index) => ({
      place_id: input.placeId,
      storage_path: url,
      public_url: url,
      alt_text: `${normalizedName} fotoğraf ${index + 1}`,
      source_name: 'admin_manual',
      is_cover: index === 0,
      sort_order: index,
    })),
  )

  if (imageInsertError) {
    throw new Error('Mevcut mekan görselleri güncellenemedi.')
  }
}
