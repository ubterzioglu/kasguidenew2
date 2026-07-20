import type { ParsedFeedItem } from '@/lib/news-scraper/types'

// Kas ve cevresine ozgu yer/konu adlari. "antalya" bilerek CEKIRDEK listede degil:
// tek basina Antalya gecen haberler (buyuksehir politikasi, Muratpasa, Elmali vb.)
// bir Kas rehberi icin alakasiz. Antalya yalnizca destekleyici sinyal olarak sayilir.
const CORE_KEYWORDS = [
  'kaş',
  'kalkan',
  'kekova',
  'kaputaş',
  'meis',
  'kastellorizo',
  'patara',
  'likya',
  'simena',
  'ucagiz',
  'demre',
  'myra',
  'xanthos',
  'letoon',
  'saklıkent',
  'çukurbağ',
  'antiphellos',
  'gelemiş',
  'islamlar',
  'bezirgan',
  'yeşilköy',
  'akçagerme',
  'limanağzı',
  'hidayet',
  'aperlai',
  'apollonia',
  'sıçak',
  'gökkaya',
  'besmi',
  'inceboğaz',
]

// Tek basina yeterli degil; cekirdek kelimeyle birlikte gecerse skoru guclendirir.
const SUPPORTING_KEYWORDS = ['antalya', 'akdeniz', 'turizm', 'tatil', 'plaj', 'dalış', 'tekne']

const RECENCY_HALF_LIFE_DAYS = 7

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

// "kas" gibi kisa kelimeler "kasaba", "kasim", "kasten" icinde yanlis eslesir.
// Bu yuzden includes() yerine kelime siniri kontrolu yapiyoruz.
function containsWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(haystack)
}

function countMatches(haystack: string, keywords: string[]): number {
  let matches = 0

  for (const keyword of keywords) {
    if (containsWord(haystack, normalize(keyword))) {
      matches += 1
    }
  }

  return matches
}

function recencyScore(item: ParsedFeedItem): number {
  if (!item.publishedAt) {
    return 0.5
  }

  const ageDays = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (ageDays < 0) {
    return 1
  }

  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS)
}

export function scoreRelevance(item: ParsedFeedItem, keywords: string[] = CORE_KEYWORDS): number {
  const haystack = normalize(`${item.title} ${item.summary}`)

  const coreMatches = countMatches(haystack, keywords)

  // Cekirdek eslesme yoksa haber Kas ile ilgili degildir: tazelik ne olursa olsun
  // skor 0. (Onceki surumde tek basina recency 0.30 uretip esigi geciyordu.)
  if (coreMatches === 0) {
    return 0
  }

  const coreScore = Math.min(coreMatches / 2, 1)
  const supportScore = Math.min(countMatches(haystack, SUPPORTING_KEYWORDS) / 3, 1)
  const recency = recencyScore(item)

  return coreScore * 0.6 + supportScore * 0.15 + recency * 0.25
}

// Kabul esigi: bunun altindaki haberler hic kaydedilmez.
export const RELEVANCE_ACCEPT_THRESHOLD = 0.38

// Otomatik yayin esigi: sadece bu skorun uzerindekiler dogrudan 'published'
// olarak siteye cikar. 0.38-0.45 arasi gri bolge 'draft' kalir ve admin onayi
// bekler; boylece esigi gevsetip daha fazla sonuc alirken sinirdaki icerik
// insan gozu gormeden yayina girmez.
export const RELEVANCE_AUTO_PUBLISH_THRESHOLD = 0.45
