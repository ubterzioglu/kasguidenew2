/**
 * Single source of truth for all category definitions.
 *
 * Merges three previously duplicated sources:
 *   - CATEGORIES in supabase.ts (display data: name/icon/imageUrl)
 *   - PLACE_CATEGORY_OPTIONS in place-taxonomy.ts (pipeline data: googleTypes)
 *   - CATEGORY_GROUPS / CATEGORY_ICONS in category-section.tsx (UI grouping)
 *
 * Import from here everywhere. Do NOT define category data in component files.
 */

export type CategoryDefinition = {
  id: string
  label: string
  icon: string
  imageUrl: string
  googleTypes: string[]
  group: 'food' | 'explore' | 'fun' | 'editorial' | null
  tone: 'food' | 'explore' | 'fun' | 'editorial' | null
}

export const CATEGORIES: CategoryDefinition[] = [
  // ── YEME & İÇME & KONAKLAMA ──────────────────────────────────────────────
  {
    id: 'bar',
    label: 'Bar',
    icon: '🍸',
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['bar', 'pub'],
    group: 'food',
    tone: 'food',
  },
  {
    id: 'meyhane',
    label: 'Meyhane',
    icon: '🍷',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['turkish_restaurant'],
    group: 'food',
    tone: 'food',
  },
  {
    id: 'restoran',
    label: 'Restoran',
    icon: '🍽️',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['restaurant', 'seafood_restaurant'],
    group: 'food',
    tone: 'food',
  },
  {
    id: 'cafe',
    label: 'Kafe',
    icon: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['cafe', 'coffee_shop', 'bakery'],
    group: 'food',
    tone: 'food',
  },
  {
    id: 'kahvalti',
    label: 'Kahvaltı',
    icon: '🍳',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['breakfast_restaurant'],
    group: 'food',
    tone: 'food',
  },
  {
    id: 'oteller',
    label: 'Oteller',
    icon: '🛏️',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['hotel', 'guest_house', 'hostel', 'bed_and_breakfast', 'lodging', 'resort_hotel', 'motel', 'inn'],
    group: 'food',
    tone: 'food',
  },

  // ── GEZİ & KEŞİF ─────────────────────────────────────────────────────────
  {
    id: 'tarih',
    label: 'Tarih',
    icon: '🕰️',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'explore',
    tone: 'explore',
  },
  {
    id: 'doga',
    label: 'Doğa',
    icon: '🌿',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'explore',
    tone: 'explore',
  },
  {
    id: 'plaj',
    label: 'Plaj',
    icon: '🏖️',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['beach'],
    group: 'explore',
    tone: 'explore',
  },
  {
    id: 'carsi',
    label: 'Çarşı',
    icon: '🛍️',
    imageUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['gift_shop', 'shopping_mall', 'supermarket', 'convenience_store'],
    group: 'explore',
    tone: 'explore',
  },
  {
    id: 'gezi',
    label: 'Gezi',
    icon: '🧭',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['museum', 'art_gallery', 'tourist_information_center'],
    group: 'explore',
    tone: 'explore',
  },

  // ── AKTİVİTE & EĞLENCE ───────────────────────────────────────────────────
  {
    id: 'dalis',
    label: 'Dalış',
    icon: '🤿',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    googleTypes: ['marina'],
    group: 'fun',
    tone: 'fun',
  },
  {
    id: 'aktivite',
    label: 'Aktivite',
    icon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [
      'gym', 'yoga_studio', 'wellness_center', 'massage', 'massage_spa',
      'spa', 'park', 'tour_agency', 'travel_agency', 'tourist_attraction',
    ],
    group: 'fun',
    tone: 'fun',
  },
  {
    id: 'etkinlik',
    label: 'Etkinlik',
    icon: '✨',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'fun',
    tone: 'fun',
  },

  // ── İÇERİK & MEDYA ───────────────────────────────────────────────────────
  {
    id: 'yazilar',
    label: 'Yazılar',
    icon: '📝',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'editorial',
    tone: 'editorial',
  },
  {
    id: 'roportaj',
    label: 'Röportaj',
    icon: '🎙️',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'editorial',
    tone: 'editorial',
  },
  {
    id: 'fotograf',
    label: 'Fotoğraf',
    icon: '📷',
    imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'editorial',
    tone: 'editorial',
  },
  {
    id: 'oss',
    label: 'O.S.S.',
    icon: '🧠',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'editorial',
    tone: 'editorial',
  },
  {
    id: 'kas-local',
    label: 'Kaş Local',
    icon: '📍',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: 'editorial',
    tone: 'editorial',
  },

  // ── GENEL ─────────────────────────────────────────────────────────────────
  {
    id: 'acil-durum',
    label: 'Acil Durum',
    icon: '🚨',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: null,
    tone: null,
  },
  {
    id: 'patililer',
    label: 'Patililer',
    icon: '🐾',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    googleTypes: [],
    group: null,
    tone: null,
  },
]

/** Category groups for the homepage filter UI. Defines display order and tone. */
export const CATEGORY_GROUPS = [
  {
    title: 'YEME & İÇME & KONAKLAMA',
    tone: 'food' as const,
    ids: ['bar', 'meyhane', 'restoran', 'cafe', 'kahvalti', 'oteller'] as const,
  },
  {
    title: 'GEZİ & KEŞİF',
    tone: 'explore' as const,
    ids: ['tarih', 'doga', 'plaj', 'carsi', 'gezi'] as const,
  },
  {
    title: 'AKTİVİTE & EĞLENCE',
    tone: 'fun' as const,
    ids: ['dalis', 'aktivite', 'etkinlik'] as const,
  },
  {
    title: 'İÇERİK & MEDYA',
    tone: 'editorial' as const,
    ids: ['yazilar', 'roportaj', 'fotograf', 'oss', 'kas-local'] as const,
  },
] as const

/** Flat ordered list of category IDs as shown in the homepage filter. */
export const CATEGORY_IDS = CATEGORY_GROUPS.flatMap((group) => group.ids)

/** O(1) lookup map: category id → CategoryDefinition */
export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]))

/** Returns the display label for a category ID. */
export function getCategoryLabel(categoryId: string | null | undefined): string {
  if (!categoryId) return 'Kategori seçin'
  return CATEGORY_MAP.get(categoryId)?.label ?? categoryId
}

/** Returns the CategoryDefinition for an ID, or undefined. */
export function getCategoryById(id: string | null | undefined): CategoryDefinition | undefined {
  if (!id) return undefined
  return CATEGORY_MAP.get(id)
}

/**
 * Suggests a category ID from a raw Google Places type string.
 * Falls back to 'aktivite' if no match is found.
 */
export function suggestCategoryFromRaw(rawCategory: string | null | undefined): string {
  const normalized = rawCategory?.trim().toLowerCase()

  if (!normalized) return 'aktivite'

  const direct = CATEGORIES.find((c) => c.id === normalized)
  if (direct) return direct.id

  const matched = CATEGORIES.find((c) => c.googleTypes.includes(normalized))
  if (matched) return matched.id

  return 'aktivite'
}
