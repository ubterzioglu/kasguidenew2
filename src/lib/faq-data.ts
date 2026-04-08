import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { repairLegacyText } from '@/lib/legacy-text'

export type FaqItem = {
  id: string
  question: string
  answer: string
}

type LegacyFaqItem = {
  question?: string
  answer?: string
}

const FAQ_SOURCE_PATHS = [
  path.join(process.cwd(), 'faq', 'faq-list-data.js'),
  path.join(process.cwd(), 'temp', 'old', 'faq', 'faq-list-data.js'),
]

function parseLegacyFaqSource(source: string): FaqItem[] {
  const start = source.indexOf('[')
  const end = source.lastIndexOf(']')

  if (start === -1 || end === -1) {
    return []
  }

  const rawItems = JSON.parse(source.slice(start, end + 1)) as LegacyFaqItem[]

  return rawItems
    .map((item, index) => ({
      id: `faq-${index + 1}`,
      question: repairLegacyText(item.question ?? ''),
      answer: repairLegacyText(item.answer ?? ''),
    }))
    .filter((item) => item.question && item.answer)
}

export async function getFaqItems(): Promise<FaqItem[]> {
  for (const filePath of FAQ_SOURCE_PATHS) {
    try {
      const source = await readFile(filePath, 'utf8')
      return parseLegacyFaqSource(source)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  return []
}
