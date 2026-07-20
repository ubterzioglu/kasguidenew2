const NEWS_IMAGE_COUNT = 50
const PLACE_IMAGE_COUNT = 50

function hashToIndex(seed: string, count: number): number {
  let hash = 0
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash % count
}

export function getRandomNewsImage(seed: string): string {
  const index = hashToIndex(seed, NEWS_IMAGE_COUNT) + 1
  return `/images/news/kas-news-${String(index).padStart(2, '0')}.jpg`
}

export function getRandomPlaceImage(seed: string): string {
  const index = hashToIndex(seed, PLACE_IMAGE_COUNT) + 1
  return `/images/places/kas-place-${String(index).padStart(2, '0')}.jpg`
}
