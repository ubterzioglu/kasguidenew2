import type { PlaceScraperJob } from '@/lib/place-scraper/types'

const DEFAULT_LANGUAGE_TERMS = ['Türkçe', 'Turkish speaking']

const DEFAULT_QUERY_TEMPLATES = [
  '{{language_term}} {{profession}} {{location}}',
  '{{profession}} {{location}} {{language_term}}',
]

function fillTemplate(
  template: string,
  job: Pick<PlaceScraperJob, 'city' | 'region' | 'countryCode' | 'locationLabel' | 'professionLabel'>,
  languageTerm: string,
): string {
  return template
    .replace(/\{\{\s*city\s*\}\}/g, job.city)
    .replace(/\{\{\s*region\s*\}\}/g, job.region ?? '')
    .replace(/\{\{\s*country\s*\}\}/g, job.countryCode)
    .replace(/\{\{\s*location(_label)?\s*\}\}/g, job.locationLabel)
    .replace(/\{\{\s*profession\s*\}\}/g, job.professionLabel)
    .replace(/\{\{\s*language_term\s*\}\}/g, languageTerm)
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildQueries(
  job: Pick<
    PlaceScraperJob,
    'city' | 'region' | 'countryCode' | 'locationLabel' | 'professionLabel' | 'languageTerms' | 'queryTemplates' | 'maxQueries'
  >,
): string[] {
  const languageTerms = job.languageTerms.length > 0 ? job.languageTerms : DEFAULT_LANGUAGE_TERMS
  const templates = job.queryTemplates.length > 0 ? job.queryTemplates : DEFAULT_QUERY_TEMPLATES

  const queries: string[] = []

  for (const template of templates) {
    for (const languageTerm of languageTerms) {
      queries.push(fillTemplate(template, job, languageTerm))
      if (queries.length >= job.maxQueries * 2) break
    }
    if (queries.length >= job.maxQueries * 2) break
  }

  const seen = new Set<string>()
  const unique: string[] = []

  for (const query of queries) {
    const key = query.toLocaleLowerCase('tr-TR')
    if (!query || seen.has(key)) continue
    seen.add(key)
    unique.push(query)
    if (unique.length >= job.maxQueries) break
  }

  return unique
}
