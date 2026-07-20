import 'server-only'

import type { CandidateDraft, GeminiClassificationResult } from '@/lib/place-scraper/types'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.5-flash-lite'
const FALLBACK_MODEL = 'gemini-2.5-flash'
const REQUEST_TIMEOUT_MS = 30000

const CANDIDATE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          canonicalName: { type: 'string' },
          organizationName: { type: 'string', nullable: true },
          categorySlug: { type: 'string', nullable: true },
          languages: { type: 'array', items: { type: 'string' } },
          services: { type: 'array', items: { type: 'string' } },
          contacts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['phone', 'email', 'website', 'appointment_url'] },
                value: { type: 'string' },
              },
              required: ['type', 'value'],
            },
          },
          websiteUrl: { type: 'string', nullable: true },
          addressText: { type: 'string', nullable: true },
          lat: { type: 'number', nullable: true },
          lng: { type: 'number', nullable: true },
          evidenceQuote: { type: 'string' },
          confidenceScore: { type: 'number' },
        },
        required: ['canonicalName', 'languages', 'services', 'contacts', 'evidenceQuote', 'confidenceScore'],
      },
    },
  },
  required: ['candidates'],
}

function requireApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tanimli degil.')
  }

  return apiKey
}

function buildPrompt(sourceUrl: string, text: string, professionLabel: string): string {
  return [
    `Asagidaki web sayfasi metninden "${professionLabel}" mesleğine/kategorisine uyan isletme veya kisi kayitlarini cikar.`,
    'Yalnizca metinde acikca gecen bilgileri kullan, uydurma yapma.',
    'Her aday icin bir kanit alintisi (evidenceQuote) ve 0-1 arasi bir guven skoru (confidenceScore) ver.',
    `Kaynak URL: ${sourceUrl}`,
    '---',
    text.slice(0, 12000),
  ].join('\n')
}

async function callGemini(model: string, prompt: string): Promise<GeminiClassificationResult> {
  const apiKey = requireApiKey()

  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: CANDIDATE_RESPONSE_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Gemini siniflandirma basarisiz (HTTP ${response.status}).`)
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    return { candidates: [] }
  }

  const parsed = JSON.parse(rawText) as {
    candidates?: Array<{
      canonicalName: string
      organizationName?: string | null
      categorySlug?: string | null
      languages: string[]
      services: string[]
      contacts: Array<{ type: 'phone' | 'email' | 'website' | 'appointment_url'; value: string }>
      websiteUrl?: string | null
      addressText?: string | null
      lat?: number | null
      lng?: number | null
      evidenceQuote: string
      confidenceScore: number
    }>
  }

  return {
    candidates: (parsed.candidates ?? []).map(
      (item): CandidateDraft => ({
        canonicalName: item.canonicalName,
        organizationName: item.organizationName ?? null,
        categorySlug: item.categorySlug ?? null,
        languages: item.languages ?? [],
        services: item.services ?? [],
        contacts: item.contacts ?? [],
        websiteUrl: item.websiteUrl ?? null,
        addressText: item.addressText ?? null,
        lat: item.lat ?? null,
        lng: item.lng ?? null,
        sourceUrls: [],
        evidence: [],
        confidenceScore: item.confidenceScore,
      }),
    ),
  }
}

export async function classifyExtractedText(
  sourceUrl: string,
  text: string,
  professionLabel: string,
  opts: { cheapMode?: boolean } = {},
): Promise<GeminiClassificationResult> {
  const prompt = buildPrompt(sourceUrl, text, professionLabel)
  const model = opts.cheapMode ? DEFAULT_MODEL : FALLBACK_MODEL

  try {
    return await callGemini(model, prompt)
  } catch (error) {
    if (model === FALLBACK_MODEL) {
      return callGemini(DEFAULT_MODEL, prompt)
    }
    throw error
  }
}
