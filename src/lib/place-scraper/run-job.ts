import 'server-only'

import { buildQueries } from '@/lib/place-scraper/queries'
import { tavilySearch, tavilyExtract } from '@/lib/place-scraper/tavily'
import { serpApiSearch, isSerpApiConfigured } from '@/lib/place-scraper/serpapi'
import { isAllowedByRobots } from '@/lib/place-scraper/robots'
import { classifyExtractedText } from '@/lib/place-scraper/gemini'
import { BudgetExceededError, CostLedger, estimateCost } from '@/lib/place-scraper/cost'
import { computeDuplicateKey, isDuplicateOfExistingPlace } from '@/lib/place-scraper/dedupe'
import {
  createPlaceScraperCandidate,
  getPlaceScraperJob,
  updatePlaceScraperJob,
} from '@/lib/place-scraper/job-store'
import type {
  PlaceScraperJobEventLogEntry,
  PlaceScraperJobQueryLogEntry,
  PlaceScraperJobSourceLogEntry,
} from '@/lib/place-scraper/types'

export type RunPlaceScraperJobResult = {
  status: 'completed' | 'failed' | 'budget_stopped'
  candidatesCreated: number
  costTotalUsd: number
}

export async function runPlaceScraperJob(jobId: string): Promise<RunPlaceScraperJobResult> {
  const job = await getPlaceScraperJob(jobId)

  if (!job) {
    throw new Error('Is bulunamadi.')
  }

  const ledger = new CostLedger(job.softCapUsd, job.hardCapUsd)
  const queriesLog: PlaceScraperJobQueryLogEntry[] = [...job.queriesLog]
  const sourcesLog: PlaceScraperJobSourceLogEntry[] = [...job.sourcesLog]
  const eventsLog: PlaceScraperJobEventLogEntry[] = [...job.eventsLog]
  let candidatesCreated = 0

  eventsLog.push({ type: 'job_started', message: 'Tarama basladi.', at: new Date().toISOString() })

  await updatePlaceScraperJob(jobId, {
    status: 'running',
    startedAt: new Date().toISOString(),
    eventsLog,
  })

  try {
    const queries = buildQueries(job)
    const discoveredUrls = new Map<string, string>()

    for (const query of queries) {
      const useCheapMode = ledger.isCheapMode
      const provider: 'tavily' | 'serpapi' = process.env.TAVILY_API_KEY ? 'tavily' : 'serpapi'

      let searchResults: Array<{ url: string; title: string; content: string }> = []

      try {
        if (provider === 'tavily') {
          const result = await tavilySearch(query, { maxResults: useCheapMode ? 3 : 5 })
          searchResults = result.results
        } else if (isSerpApiConfigured()) {
          const result = await serpApiSearch(query, { countryCode: job.countryCode, maxResults: useCheapMode ? 3 : 5 })
          searchResults = result.results
        }
      } catch {
        if (isSerpApiConfigured()) {
          const fallback = await serpApiSearch(query, { countryCode: job.countryCode, maxResults: 5 })
          searchResults = fallback.results
        }
      }

      const searchCost = estimateCost('search')
      ledger.add(searchCost)
      queriesLog.push({ query, provider, resultCount: searchResults.length, costUsd: searchCost, at: new Date().toISOString() })

      for (const result of searchResults) {
        if (discoveredUrls.size >= job.maxSourceUrls) break
        discoveredUrls.set(result.url, result.title)
      }

      if (discoveredUrls.size >= job.maxSourceUrls) break
    }

    const urlsToExtract = Array.from(discoveredUrls.keys()).slice(0, job.maxExtractUrls)
    const allowedUrls: string[] = []

    for (const url of urlsToExtract) {
      const allowed = await isAllowedByRobots(url)
      if (!allowed) {
        sourcesLog.push({ url, status: 'skipped_robots', costUsd: 0, at: new Date().toISOString() })
        continue
      }
      allowedUrls.push(url)
    }

    const extractResult = await tavilyExtract(allowedUrls)
    const extractCostEach = estimateCost('extract')

    for (const failedUrl of extractResult.failedResults) {
      ledger.add(extractCostEach)
      sourcesLog.push({ url: failedUrl, status: 'failed', costUsd: extractCostEach, at: new Date().toISOString() })
    }

    for (const extracted of extractResult.results) {
      if (candidatesCreated >= job.maxCandidates) break

      ledger.add(extractCostEach)

      const cheapMode = ledger.isCheapMode
      const classifyCostEach = estimateCost('classify', { cheapMode })
      ledger.add(classifyCostEach)

      const classification = await classifyExtractedText(
        extracted.url,
        extracted.rawContent,
        job.professionLabel,
        { cheapMode },
      )

      sourcesLog.push({ url: extracted.url, status: 'extracted', costUsd: extractCostEach + classifyCostEach, at: new Date().toISOString() })

      for (const draft of classification.candidates) {
        if (candidatesCreated >= job.maxCandidates) break

        const candidateWithSource = {
          ...draft,
          sourceUrls: [extracted.url],
          evidence: [{ quote: draft.canonicalName, sourceUrl: extracted.url }],
        }

        const isDuplicate = await isDuplicateOfExistingPlace(candidateWithSource)
        if (isDuplicate) {
          continue
        }

        const duplicateKey = computeDuplicateKey(candidateWithSource)
        await createPlaceScraperCandidate(jobId, candidateWithSource, duplicateKey)
        candidatesCreated += 1
      }
    }

    eventsLog.push({ type: 'job_completed', message: `${candidatesCreated} aday olusturuldu.`, at: new Date().toISOString() })

    await updatePlaceScraperJob(jobId, {
      status: 'completed',
      costTotalUsd: ledger.totalUsd,
      queriesLog,
      sourcesLog,
      eventsLog,
      completedAt: new Date().toISOString(),
    })

    return { status: 'completed', candidatesCreated, costTotalUsd: ledger.totalUsd }
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      eventsLog.push({ type: 'budget_stopped', message: error.message, at: new Date().toISOString() })

      await updatePlaceScraperJob(jobId, {
        status: 'budget_stopped',
        costTotalUsd: ledger.totalUsd,
        queriesLog,
        sourcesLog,
        eventsLog,
        completedAt: new Date().toISOString(),
      })

      return { status: 'budget_stopped', candidatesCreated, costTotalUsd: ledger.totalUsd }
    }

    const message = error instanceof Error ? error.message : 'Bilinmeyen hata.'
    eventsLog.push({ type: 'job_failed', message, at: new Date().toISOString() })

    await updatePlaceScraperJob(jobId, {
      status: 'failed',
      costTotalUsd: ledger.totalUsd,
      queriesLog,
      sourcesLog,
      eventsLog,
      errorMessage: message,
      completedAt: new Date().toISOString(),
    })

    return { status: 'failed', candidatesCreated, costTotalUsd: ledger.totalUsd }
  }
}
