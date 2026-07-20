import 'server-only'

import { slugifyText } from '@/lib/place-review-utils'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type { CandidateDraft, PlaceScraperContact } from '@/lib/place-scraper/types'

function normalizePhoneDigits(value: string): string {
  return value.replace(/[^0-9]/g, '')
}

function primaryContactValue(contacts: PlaceScraperContact[], type: 'phone' | 'website'): string | null {
  return contacts.find((contact) => contact.type === type)?.value ?? null
}

export function computeDuplicateKey(candidate: CandidateDraft): string {
  const nameSlug = slugifyText(candidate.canonicalName)
  const phone = primaryContactValue(candidate.contacts, 'phone')
  const website = candidate.websiteUrl ?? primaryContactValue(candidate.contacts, 'website')

  if (phone) {
    return `${nameSlug}:phone:${normalizePhoneDigits(phone)}`
  }

  if (website) {
    return `${nameSlug}:site:${slugifyText(website)}`
  }

  return `${nameSlug}:noref`
}

export async function isDuplicateOfExistingPlace(candidate: CandidateDraft): Promise<boolean> {
  const client = getSupabaseAdminClient()

  if (!client) {
    return false
  }

  const nameSlug = slugifyText(candidate.canonicalName)

  const { data: placeMatches } = await client
    .from('places')
    .select('id, slug')
    .ilike('slug', `${nameSlug}%`)
    .limit(1)

  if (placeMatches && placeMatches.length > 0) {
    return true
  }

  const duplicateKey = computeDuplicateKey(candidate)

  const { data: candidateMatches } = await client
    .from('place_scraper_candidates')
    .select('id')
    .eq('duplicate_key', duplicateKey)
    .neq('review_status', 'rejected')
    .limit(1)

  return Boolean(candidateMatches && candidateMatches.length > 0)
}
