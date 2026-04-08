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

export async function getFaqItems(): Promise<FaqItem[]> {
  const filePath = path.join(process.cwd(), 'temp', 'old', 'faq', 'faq-list-data.js')
  const source = await readFile(filePath, 'utf8')
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
