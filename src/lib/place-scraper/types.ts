export type PlaceScraperJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'budget_stopped'
  | 'cancelled'

export type PlaceScraperCandidateReviewStatus = 'pending' | 'promoted' | 'rejected' | 'duplicate'

export type PlaceScraperJobQueryLogEntry = {
  query: string
  provider: 'tavily' | 'serpapi'
  resultCount: number
  costUsd: number
  at: string
}

export type PlaceScraperJobSourceLogEntry = {
  url: string
  status: 'extracted' | 'failed' | 'skipped_robots' | 'skipped_duplicate'
  costUsd: number
  at: string
}

export type PlaceScraperJobEventLogEntry = {
  type: 'job_started' | 'soft_cap_reached' | 'budget_stopped' | 'job_completed' | 'job_failed'
  message: string
  at: string
}

export type PlaceScraperJob = {
  id: string
  status: PlaceScraperJobStatus
  locationLabel: string
  countryCode: string
  region: string | null
  city: string
  professionLabel: string
  categorySlug: string | null
  languageTerms: string[]
  queryTemplates: string[]
  maxQueries: number
  maxSourceUrls: number
  maxExtractUrls: number
  maxCandidates: number
  softCapUsd: number
  hardCapUsd: number
  costTotalUsd: number
  queriesLog: PlaceScraperJobQueryLogEntry[]
  sourcesLog: PlaceScraperJobSourceLogEntry[]
  eventsLog: PlaceScraperJobEventLogEntry[]
  errorMessage: string | null
  createdBy: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PlaceScraperJobInput = {
  locationLabel: string
  countryCode: string
  region?: string | null
  city: string
  professionLabel: string
  categorySlug?: string | null
  languageTerms: string[]
  queryTemplates: string[]
  maxQueries: number
  maxSourceUrls: number
  maxExtractUrls: number
  maxCandidates: number
  softCapUsd: number
  hardCapUsd: number
  createdBy?: string | null
}

export type PlaceScraperContact = {
  type: 'phone' | 'email' | 'website' | 'appointment_url'
  value: string
}

export type PlaceScraperEvidence = {
  quote: string
  sourceUrl: string
}

export type PlaceScraperCandidate = {
  id: string
  jobId: string
  canonicalName: string
  organizationName: string | null
  categorySlug: string | null
  languages: string[]
  services: string[]
  contacts: PlaceScraperContact[]
  websiteUrl: string | null
  addressText: string | null
  lat: number | null
  lng: number | null
  sourceUrls: string[]
  evidence: PlaceScraperEvidence[]
  confidenceScore: number | null
  duplicateKey: string | null
  reviewStatus: PlaceScraperCandidateReviewStatus
  promotedPlaceId: string | null
  createdAt: string
  updatedAt: string
}

export type CandidateDraft = {
  canonicalName: string
  organizationName: string | null
  categorySlug: string | null
  languages: string[]
  services: string[]
  contacts: PlaceScraperContact[]
  websiteUrl: string | null
  addressText: string | null
  lat: number | null
  lng: number | null
  sourceUrls: string[]
  evidence: PlaceScraperEvidence[]
  confidenceScore: number | null
}

export type TavilySearchResultItem = {
  url: string
  title: string
  content: string
}

export type TavilySearchResult = {
  results: TavilySearchResultItem[]
}

export type TavilyExtractResultItem = {
  url: string
  rawContent: string
}

export type TavilyExtractResult = {
  results: TavilyExtractResultItem[]
  failedResults: string[]
}

export type GeminiClassificationResult = {
  candidates: CandidateDraft[]
}
