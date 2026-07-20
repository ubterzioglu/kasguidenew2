import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import type {
  CandidateDraft,
  PlaceScraperCandidate,
  PlaceScraperCandidateReviewStatus,
  PlaceScraperJob,
  PlaceScraperJobEventLogEntry,
  PlaceScraperJobInput,
  PlaceScraperJobQueryLogEntry,
  PlaceScraperJobSourceLogEntry,
  PlaceScraperJobStatus,
} from '@/lib/place-scraper/types'

const JOBS_TABLE = 'place_scraper_jobs'
const CANDIDATES_TABLE = 'place_scraper_candidates'

type PlaceScraperJobRow = {
  id: string
  status: PlaceScraperJobStatus
  location_label: string
  country_code: string
  region: string | null
  city: string
  profession_label: string
  category_slug: string | null
  language_terms: string[]
  query_templates: string[]
  max_queries: number
  max_source_urls: number
  max_extract_urls: number
  max_candidates: number
  soft_cap_usd: number
  hard_cap_usd: number
  cost_total_usd: number
  queries_log: PlaceScraperJobQueryLogEntry[]
  sources_log: PlaceScraperJobSourceLogEntry[]
  events_log: PlaceScraperJobEventLogEntry[]
  error_message: string | null
  created_by: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

type PlaceScraperCandidateRow = {
  id: string
  job_id: string
  canonical_name: string
  organization_name: string | null
  category_slug: string | null
  languages: string[]
  services: string[]
  contacts: PlaceScraperCandidate['contacts']
  website_url: string | null
  address_text: string | null
  lat: number | null
  lng: number | null
  source_urls: string[]
  evidence: PlaceScraperCandidate['evidence']
  confidence_score: number | null
  duplicate_key: string | null
  review_status: PlaceScraperCandidateReviewStatus
  promoted_place_id: string | null
  created_at: string
  updated_at: string
}

function requireClient() {
  const client = getSupabaseAdminClient()

  if (!client) {
    throw new Error('Hizmet arama scraper veri deposu hazir degil.')
  }

  return client
}

function mapJob(row: PlaceScraperJobRow): PlaceScraperJob {
  return {
    id: row.id,
    status: row.status,
    locationLabel: row.location_label,
    countryCode: row.country_code,
    region: row.region,
    city: row.city,
    professionLabel: row.profession_label,
    categorySlug: row.category_slug,
    languageTerms: row.language_terms ?? [],
    queryTemplates: row.query_templates ?? [],
    maxQueries: row.max_queries,
    maxSourceUrls: row.max_source_urls,
    maxExtractUrls: row.max_extract_urls,
    maxCandidates: row.max_candidates,
    softCapUsd: Number(row.soft_cap_usd),
    hardCapUsd: Number(row.hard_cap_usd),
    costTotalUsd: Number(row.cost_total_usd),
    queriesLog: row.queries_log ?? [],
    sourcesLog: row.sources_log ?? [],
    eventsLog: row.events_log ?? [],
    errorMessage: row.error_message,
    createdBy: row.created_by,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapCandidate(row: PlaceScraperCandidateRow): PlaceScraperCandidate {
  return {
    id: row.id,
    jobId: row.job_id,
    canonicalName: row.canonical_name,
    organizationName: row.organization_name,
    categorySlug: row.category_slug,
    languages: row.languages ?? [],
    services: row.services ?? [],
    contacts: row.contacts ?? [],
    websiteUrl: row.website_url,
    addressText: row.address_text,
    lat: row.lat,
    lng: row.lng,
    sourceUrls: row.source_urls ?? [],
    evidence: row.evidence ?? [],
    confidenceScore: row.confidence_score,
    duplicateKey: row.duplicate_key,
    reviewStatus: row.review_status,
    promotedPlaceId: row.promoted_place_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function isPlaceScraperStoreConfigured() {
  return Boolean(getSupabaseAdminClient())
}

export async function listPlaceScraperJobs(): Promise<PlaceScraperJob[]> {
  const client = requireClient()
  const { data, error } = await client
    .from(JOBS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Is listesi okunamadi.')
  }

  return ((data ?? []) as PlaceScraperJobRow[]).map(mapJob)
}

export async function getPlaceScraperJob(id: string): Promise<PlaceScraperJob | null> {
  const client = requireClient()
  const { data, error } = await client.from(JOBS_TABLE).select('*').eq('id', id).maybeSingle()

  if (error) {
    throw new Error('Is detayi okunamadi.')
  }

  return data ? mapJob(data as PlaceScraperJobRow) : null
}

export async function createPlaceScraperJob(input: PlaceScraperJobInput): Promise<PlaceScraperJob> {
  const client = requireClient()
  const { data, error } = await client
    .from(JOBS_TABLE)
    .insert({
      status: 'queued',
      location_label: input.locationLabel,
      country_code: input.countryCode,
      region: input.region ?? null,
      city: input.city,
      profession_label: input.professionLabel,
      category_slug: input.categorySlug ?? null,
      language_terms: input.languageTerms,
      query_templates: input.queryTemplates,
      max_queries: input.maxQueries,
      max_source_urls: input.maxSourceUrls,
      max_extract_urls: input.maxExtractUrls,
      max_candidates: input.maxCandidates,
      soft_cap_usd: input.softCapUsd,
      hard_cap_usd: input.hardCapUsd,
      created_by: input.createdBy ?? null,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error('Is olusturulamadi.')
  }

  return mapJob(data as PlaceScraperJobRow)
}

type JobUpdatePatch = Partial<{
  status: PlaceScraperJobStatus
  costTotalUsd: number
  queriesLog: PlaceScraperJobQueryLogEntry[]
  sourcesLog: PlaceScraperJobSourceLogEntry[]
  eventsLog: PlaceScraperJobEventLogEntry[]
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
}>

export async function updatePlaceScraperJob(id: string, patch: JobUpdatePatch): Promise<void> {
  const client = requireClient()
  const payload: Record<string, unknown> = {}

  if (patch.status !== undefined) payload.status = patch.status
  if (patch.costTotalUsd !== undefined) payload.cost_total_usd = patch.costTotalUsd
  if (patch.queriesLog !== undefined) payload.queries_log = patch.queriesLog
  if (patch.sourcesLog !== undefined) payload.sources_log = patch.sourcesLog
  if (patch.eventsLog !== undefined) payload.events_log = patch.eventsLog
  if (patch.errorMessage !== undefined) payload.error_message = patch.errorMessage
  if (patch.startedAt !== undefined) payload.started_at = patch.startedAt
  if (patch.completedAt !== undefined) payload.completed_at = patch.completedAt

  const { error } = await client.from(JOBS_TABLE).update(payload).eq('id', id)

  if (error) {
    throw new Error('Is guncellenemedi.')
  }
}

export async function listCandidatesForJob(jobId: string): Promise<PlaceScraperCandidate[]> {
  const client = requireClient()
  const { data, error } = await client
    .from(CANDIDATES_TABLE)
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Adaylar okunamadi.')
  }

  return ((data ?? []) as PlaceScraperCandidateRow[]).map(mapCandidate)
}

export async function getPlaceScraperCandidate(id: string): Promise<PlaceScraperCandidate | null> {
  const client = requireClient()
  const { data, error } = await client.from(CANDIDATES_TABLE).select('*').eq('id', id).maybeSingle()

  if (error) {
    throw new Error('Aday okunamadi.')
  }

  return data ? mapCandidate(data as PlaceScraperCandidateRow) : null
}

export async function createPlaceScraperCandidate(
  jobId: string,
  draft: CandidateDraft,
  duplicateKey: string,
): Promise<PlaceScraperCandidate> {
  const client = requireClient()
  const { data, error } = await client
    .from(CANDIDATES_TABLE)
    .insert({
      job_id: jobId,
      canonical_name: draft.canonicalName,
      organization_name: draft.organizationName,
      category_slug: draft.categorySlug,
      languages: draft.languages,
      services: draft.services,
      contacts: draft.contacts,
      website_url: draft.websiteUrl,
      address_text: draft.addressText,
      lat: draft.lat,
      lng: draft.lng,
      source_urls: draft.sourceUrls,
      evidence: draft.evidence,
      confidence_score: draft.confidenceScore,
      duplicate_key: duplicateKey,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error('Aday kaydedilemedi.')
  }

  return mapCandidate(data as PlaceScraperCandidateRow)
}

export async function updateCandidateReviewStatus(
  id: string,
  reviewStatus: PlaceScraperCandidateReviewStatus,
  promotedPlaceId?: string | null,
): Promise<PlaceScraperCandidate> {
  const client = requireClient()
  const { data, error } = await client
    .from(CANDIDATES_TABLE)
    .update({ review_status: reviewStatus, promoted_place_id: promotedPlaceId ?? null })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error('Aday durumu guncellenemedi.')
  }

  return mapCandidate(data as PlaceScraperCandidateRow)
}
