import type { NewsItem } from '@/types/updates'
import type { ParsedFeedItem } from '@/lib/news-scraper/types'

/**
 * Ayni olay farkli gazetelerde farkli basliklarla cikiyor:
 *   "Demre'de orman yangini"
 *   "Demre'de Orman Yangini - SonDakika"
 *   "Demre’de orman yangini Ihlas Haber Ajansi - Ihlas Haber Ajansi"
 * Birebir string karsilastirmasi bunlari yakalayamaz. Bu yuzden basliklari
 * anlamli kelime kumesine indirgeyip Jaccard benzerligine bakiyoruz.
 */

const SIMILARITY_THRESHOLD = 0.6

// Google News basliklarindaki " - Kaynak Adi" ekini atar.
function stripSourceSuffix(title: string): string {
  return title.replace(/\s+[-–—|]\s+[^-–—|]{2,40}$/u, '')
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Turkce yaygin baglaclar/edatlar - benzerlik hesabinda gurultu yapiyorlar.
const STOP_WORDS = new Set([
  've', 'ile', 'icin', 'bir', 'bu', 'da', 'de', 'den', 'dan', 'nin', 'nin', 'ya',
  'ki', 'mi', 'ama', 'gibi', 'daha', 'cok', 'olarak', 'sonra', 'once', 'kadar',
])

function toTokenSet(title: string): Set<string> {
  const words = normalize(stripSourceSuffix(title))
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  return new Set(words)
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0
  }

  let intersection = 0
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1
    }
  }

  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

export function isDuplicateNews(item: ParsedFeedItem, existingNews: NewsItem[]): boolean {
  const incomingTokens = toTokenSet(item.title)

  return existingNews.some((existing) => {
    // 1) Ayni kaynak URL'i - kesin kopya.
    if (item.link && existing.sourceUrl && existing.sourceUrl === item.link) {
      return true
    }

    // 2) Baslik benzerligi - ayni olayin farkli gazetelerdeki versiyonu.
    return jaccardSimilarity(incomingTokens, toTokenSet(existing.title)) >= SIMILARITY_THRESHOLD
  })
}
