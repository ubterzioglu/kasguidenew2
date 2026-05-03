import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type SeriesSourceItem = {
  title: string
  url: string
  language: string
  type: string
  summary: string
}

export type SeriesTimelineStep = {
  section: string
  step: string
  detail: string
}

export type SeriesPageData = {
  summaryParagraphs: string[]
  webSources: Record<string, SeriesSourceItem[]>
  videoSources: Record<string, SeriesSourceItem[]>
  implementationNotes: string[]
  timeline: SeriesTimelineStep[]
}

const SERIES_SOURCE_PATH = path.join(process.cwd(), 'kas_deep-research-report.md')

function cleanArtifacts(value: string): string {
  return value
    .replace(/cite[^]+/g, '')
    .replace(/entity[^]+/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\(\[[^\]]+\]\[\d+\]\)/g, '')
    .replace(/\[(\d+)\]/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function parseReferenceLinks(source: string): Map<string, string> {
  const references = new Map<string, string>()
  const lines = source.split(/\r?\n/)

  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]:\s+(\S+)/)
    if (!match) {
      continue
    }

    references.set(match[1], match[2])
  }

  return references
}

function resolveReferenceLinks(source: string, references: Map<string, string>): string {
  return source.replace(/\[([^\]]+)\]\[(\d+)\]/g, (_, label: string, refId: string) => {
    const href = references.get(refId)

    if (!href) {
      return label
    }

    return `[${label}](${href})`
  })
}

function getSection(source: string, heading: string): string {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`## ${escapedHeading}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`)
  const match = source.match(pattern)

  return match?.[1]?.trim() ?? ''
}

function extractSummaryParagraphs(section: string): string[] {
  return section
    .split(/\r?\n\r?\n/)
    .map((paragraph) => cleanArtifacts(paragraph.replace(/\r?\n/g, ' ')))
    .filter(Boolean)
    .slice(0, 3)
}

function parseMarkdownTable(tableSource: string): SeriesSourceItem[] {
  const lines = tableSource
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const dataLines = lines.filter((line, index) => index > 1 && line.startsWith('|'))

  return dataLines
    .map((line) => {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cleanArtifacts(cell.replace(/`/g, '').trim()))

      if (cells.length < 5) {
        return null
      }

      return {
        title: cells[0],
        url: cells[1],
        language: cells[2],
        type: cells[3],
        summary: cells[4],
      } satisfies SeriesSourceItem
    })
    .filter((item): item is SeriesSourceItem => item !== null)
}

function parseNamedTables(section: string): Record<string, SeriesSourceItem[]> {
  const result: Record<string, SeriesSourceItem[]> = {}
  const lines = section.split(/\r?\n/)
  let currentLabel = ''
  let collectingTable = false
  let currentTableLines: string[] = []

  function flushCurrentTable() {
    if (!currentLabel || currentTableLines.length === 0) {
      currentTableLines = []
      collectingTable = false
      return
    }

    result[currentLabel] = parseMarkdownTable(currentTableLines.join('\n'))
    currentTableLines = []
    collectingTable = false
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const labelMatch = line.match(/^\*\*(.+?)\*\*$/)

    if (labelMatch) {
      flushCurrentTable()
      currentLabel = cleanArtifacts(labelMatch[1])
      continue
    }

    if (line.startsWith('| Title |')) {
      collectingTable = true
      currentTableLines = [line]
      continue
    }

    if (collectingTable) {
      if (line.startsWith('|')) {
        currentTableLines.push(line)
      } else {
        flushCurrentTable()
      }
    }
  }

  flushCurrentTable()

  return result
}

function extractImplementationNotes(section: string): string[] {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => cleanArtifacts(line.replace(/^- /, '')))
}

function extractTimeline(section: string): SeriesTimelineStep[] {
  const lines = section.split(/\r?\n/).map((line) => line.trim())
  const steps: SeriesTimelineStep[] = []
  let currentSection = ''

  for (const line of lines) {
    if (!line || line === '```mermaid' || line === '```' || line === 'timeline' || line.startsWith('title ')) {
      continue
    }

    if (line.startsWith('section ')) {
      currentSection = cleanArtifacts(line.replace(/^section /, ''))
      continue
    }

    const [step, detail] = line.split(/\s+:\s+/, 2)

    if (!step || !detail) {
      continue
    }

    steps.push({
      section: currentSection,
      step: cleanArtifacts(step),
      detail: cleanArtifacts(detail),
    })
  }

  return steps
}

export async function getSeriesPageData(): Promise<SeriesPageData | null> {
  try {
    const source = await readFile(SERIES_SOURCE_PATH, 'utf8')
    const references = parseReferenceLinks(source)
    const resolvedSource = resolveReferenceLinks(source, references)

    const summarySection = getSection(resolvedSource, 'Yönetici özeti')
    const webSection = getSection(resolvedSource, 'Web kaynak tabloları')
    const videoSection = getSection(resolvedSource, 'YouTube video tabloları')
    const implementationSection = getSection(resolvedSource, 'Uygulama ve uyumluluk notları')
    const timelineSection = getSection(resolvedSource, 'Araştırma zaman çizelgesi')

    return {
      summaryParagraphs: extractSummaryParagraphs(summarySection),
      webSources: parseNamedTables(webSection),
      videoSources: parseNamedTables(videoSection),
      implementationNotes: extractImplementationNotes(implementationSection),
      timeline: extractTimeline(timelineSection),
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }

    throw error
  }
}
