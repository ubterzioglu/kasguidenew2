import 'server-only'

import { randomUUID } from 'node:crypto'

import { PLACE_CATEGORY_OPTIONS, suggestCategoryFromRaw } from '@/lib/place-taxonomy'
import { slugifyText } from '@/lib/place-review-utils'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { getPlaceScraperCandidate, updateCandidateReviewStatus } from '@/lib/place-scraper/job-store'
import type { PlaceScraperCandidate } from '@/lib/place-scraper/types'

const DEFAULT_PLACE_IMAGE_URL = '/kasplaceholder.jpg'
const MAX_SLUG_ITERATIONS = 100

function resolveCategoryId(categorySlug: string | null): { categoryId: string; wasGuessed: boolean } {
  const directMatch = PLACE_CATEGORY_OPTIONS.find((option) => option.id === categorySlug)
  if (directMatch) {
    return { categoryId: directMatch.id, wasGuessed: false }
  }

  return { categoryId: suggestCategoryFromRaw(categorySlug), wasGuessed: true }
}

function primaryContact(candidate: PlaceScraperCandidate, type: 'phone' | 'website'): string | null {
  return candidate.contacts.find((contact) => contact.type === type)?.value ?? null
}

async function ensureUniqueSlug(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  for (let iteration = 0; iteration < MAX_SLUG_ITERATIONS; iteration++) {
    const { data } = await client.from('places').select('id').eq('slug', slug).maybeSingle()

    if (!data) {
      return slug
    }

    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  throw new Error('Slug benzersizligi saglanamadi.')
}

export async function promoteCandidateToPlace(candidateId: string): Promise<{ placeId: string; slug: string }> {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Veri deposu hazir degil.')
  }

  const candidate = await getPlaceScraperCandidate(candidateId)

  if (!candidate) {
    throw new Error('Aday bulunamadi.')
  }

  const placeId = randomUUID()
  const slugBase = slugifyText(candidate.canonicalName) || `mekan-${placeId.slice(0, 8)}`
  const slug = await ensureUniqueSlug(client, slugBase)
  const categoryId = resolveCategoryId(candidate.categorySlug)
  const now = new Date().toISOString()

  const payload = {
    id: placeId,
    slug,
    name: candidate.canonicalName,
    headline: candidate.canonicalName,
    short_description: candidate.organizationName ?? candidate.canonicalName,
    long_description: candidate.services.join(', '),
    kasguide_badge: '',
    category_primary: categoryId,
    category_secondary: null,
    category_ids: [categoryId],
    kasguide_badges: [],
    address: candidate.addressText ?? '',
    lat: candidate.lat,
    lng: candidate.lng,
    phone: primaryContact(candidate, 'phone'),
    website: candidate.websiteUrl ?? primaryContact(candidate, 'website'),
    opening_hours: null,
    status: 'pending' as const,
    verification_status: 'pending' as const,
    primary_source_name: 'service_finder_scraper',
    primary_source_id: candidate.id,
    source_url: candidate.sourceUrls[0] ?? null,
    imported_at: now,
    grid_key: null,
    cell_id: null,
    google_maps_uri: null,
    intake_channel: 'scraper' as const,
    is_sweeped: false,
    source_sweep_id: null,
    review_reason: 'Hizmet arama scraper adayi',
    review_notes: null,
    review_score: candidate.confidenceScore,
    merge_target_place_id: null,
    images: [
      {
        url: DEFAULT_PLACE_IMAGE_URL,
        alt_text: `${candidate.canonicalName} fotograf 1`,
        source_name: 'service_finder_scraper',
        is_cover: true,
        sort_order: 0,
      },
    ],
    source_records: [
      {
        source_name: 'service_finder_scraper',
        source_id: candidate.id,
        source_url: candidate.sourceUrls[0] ?? null,
        is_primary: true,
        first_seen_at: candidate.createdAt,
        last_seen_at: now,
        raw_place_id: null,
      },
    ],
    raw_snapshot: {
      source: 'service_finder_scraper',
      confidenceScore: candidate.confidenceScore,
      evidence: candidate.evidence,
      contacts: candidate.contacts,
      sourceUrls: candidate.sourceUrls,
      duplicateKey: candidate.duplicateKey,
      languages: candidate.languages,
      services: candidate.services,
    },
  }

  const { error } = await client.from('places').insert(payload)

  if (error) {
    throw new Error('Mekan kaydi olusturulamadi.')
  }

  await updateCandidateReviewStatus(candidateId, 'promoted', placeId)

  return { placeId, slug }
}

export async function rejectCandidate(candidateId: string): Promise<void> {
  const candidate = await getPlaceScraperCandidate(candidateId)

  if (!candidate) {
    throw new Error('Aday bulunamadi.')
  }

  await updateCandidateReviewStatus(candidateId, 'rejected')
}
