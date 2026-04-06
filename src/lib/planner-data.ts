import 'server-only'

import type { PublicPlaceBadge } from '@/lib/public-place-types'
import { listPublishedPlannerPlaces, type PlannerPlaceListItem } from '@/lib/public-place-store'

export type PlannerQuestion = {
  id: number
  text: string
  type: 'binary' | 'multiple' | 'checkbox'
  options: string[]
}

export type PlannerPlace = {
  id: string
  slug: string
  name: string
  headline: string
  shortDescription: string
  categoryId: string
  categoryLabel: string
  tags: string[]
  budget: number | null
  rating: number | null
  address: string | null
  website: string | null
  imageUrl: string | null
  badges: PublicPlaceBadge[]
}

export const PLANNER_QUESTIONS: PlannerQuestion[] = [
  { id: 1, text: 'Bugün özel bir gün mü?', type: 'multiple', options: ['Hayır, normal bir gün', 'Evet, doğum günü', 'Evet, yıl dönümü', 'Evet, özel tatil'] },
  { id: 2, text: 'Alkol tüketimiyle ilgili tercihiniz?', type: 'multiple', options: ['Hiç tüketmem', 'Ara sıra hafif içki', 'Rakı severim', 'Bira severim', 'Şarap severim'] },
  { id: 3, text: 'Bugün enerjik misiniz?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 4, text: 'Akşamdan kalmış mısınız?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 5, text: 'Kaldığınız yer nerede?', type: 'multiple', options: ['Kaş Merkez', 'Kalkan', 'Kaleköy', 'Çıralı', 'Patara', 'Fethiye', 'Diğer'] },
  { id: 6, text: 'Arabanız var mı?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 7, text: 'Taksi tercih eder misiniz?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 8, text: 'Yürümeyi tercih eder misiniz?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 9, text: 'Hangi tür yemekleri tercih edersiniz?', type: 'checkbox', options: ['Balık', 'Et', 'Vejetaryen', 'Deniz ürünleri', 'Yerel mutfak'] },
  { id: 10, text: 'Hangi öğünleri planlamak istersiniz?', type: 'checkbox', options: ['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği'] },
  { id: 11, text: 'Deniz aktiviteleriyle ilgili tercihiniz?', type: 'checkbox', options: ['Beach', 'Sessiz koy', 'Ucuz beach', 'Merkezi beach', 'Kop kop beach'] },
  { id: 12, text: 'Hangi aktiviteleri tercih edersiniz?', type: 'checkbox', options: ['Deniz', 'Tarihi gezi', 'Doğa sporu', 'Alışveriş', 'Kültür sanat'] },
  { id: 13, text: 'Sabah kahvaltı tercihiniz?', type: 'multiple', options: ['Evde kahvaltı', 'Restoranda kahvaltı', 'Kahvaltı restoranı', 'Brunch', 'Atlayacağım'] },
  { id: 14, text: 'Siesta (öğle uykusu) yapıyor musunuz?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 15, text: 'Gece aktiviteleri tercihiniz?', type: 'multiple', options: ['Bar', 'Uzun yemek', 'Sessiz akşam', 'Canlı müzik', 'Dans'] },
  { id: 16, text: 'Dans etmeyi sever misiniz?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 17, text: 'Kaç kişiyle birliktesiniz?', type: 'multiple', options: ['Tek başıma', 'Çift olarak', 'Aile ile', 'Arkadaş grubu (3-5 kişi)', 'Büyük grup (6+)'] },
  { id: 18, text: 'Bütçe tercihiniz?', type: 'multiple', options: ['Ekonomik', 'Orta seviye', 'Lüks', 'Sınırsız'] },
  { id: 19, text: 'Dil tercihiniz?', type: 'multiple', options: ['Türkçe', 'İngilizce', 'Almanca', 'Rusça', 'Diğer'] },
  { id: 20, text: 'Önceki Kaş ziyaretiniz oldu mu?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 21, text: 'Fotoğraf çekmeyi sever misiniz?', type: 'binary', options: ['Evet', 'Hayır'] },
  { id: 22, text: "Kaş'ı daha çok ne için seçiyorsunuz?", type: 'multiple', options: ['Deniz için', 'Tarih için', 'Yemek için', 'Rahatlama için', 'Macera için'] },
  { id: 23, text: 'En çok neyi merak ediyorsunuz?', type: 'multiple', options: ['Antik kentler', 'Gizli koylar', 'Yerel lezzetler', 'Denizaltı aktiviteleri', 'Doğa yürüyüşleri'] },
  { id: 24, text: 'Hava durumu tercihiniz?', type: 'multiple', options: ['Güneşli', 'Bulutlu', 'Rüzgarlı', 'Yağmurlu', 'Önemli değil'] },
  { id: 25, text: 'Planınızda mutlaka olması gereken?', type: 'checkbox', options: ['Tarih', 'Deniz', 'Yemek', 'Doğa', 'Alışveriş', 'Kültür', 'Rahatlama'] },
]

const CATEGORY_LABELS: Record<string, string> = {
  kahvalti: 'Kahvaltı',
  cafe: 'Kafe',
  restoran: 'Restoran',
  meyhane: 'Meyhane',
  plaj: 'Plaj',
  gezi: 'Gezi',
  tarih: 'Tarih',
  doga: 'Doğa',
  dalis: 'Dalış',
  aktivite: 'Aktivite',
  carsi: 'Çarşı',
  bar: 'Bar',
}

function tokenize(value: string | null | undefined) {
  return (value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2)
}

function inferTagsFromPlace(place: PlannerPlaceListItem) {
  const tags = new Set<string>()
  const text = `${place.name} ${place.headline} ${place.shortDescription}`.toLocaleLowerCase('tr-TR')

  for (const token of tokenize(text)) {
    tags.add(token)
  }

  for (const badge of place.guideBadges) {
    tags.add(badge.slug.toLocaleLowerCase('tr-TR'))
    for (const token of tokenize(`${badge.label} ${badge.description}`)) {
      tags.add(token)
    }
  }

  if (['restoran', 'meyhane', 'kahvalti'].includes(place.categoryPrimary)) {
    tags.add('food')
  }

  if (place.categoryPrimary === 'plaj') {
    tags.add('beach')
    tags.add('sea')
  }

  if (place.categoryPrimary === 'tarih') {
    tags.add('history')
  }

  if (place.categoryPrimary === 'doga') {
    tags.add('nature')
  }

  if (place.categoryPrimary === 'carsi') {
    tags.add('shopping')
  }

  if (place.categoryPrimary === 'bar') {
    tags.add('party')
    tags.add('alcohol')
  }

  if (place.categoryPrimary === 'dalis') {
    tags.add('sea')
    tags.add('adventure')
  }

  return [...tags]
}

function inferBudget(place: PlannerPlaceListItem) {
  const text = `${place.headline} ${place.shortDescription}`.toLocaleLowerCase('tr-TR')

  if (/(lüks|fine dining|premium|özel deneyim)/.test(text)) {
    return 2
  }

  if (/(uygun fiyat|hesaplı|ekonomik|bütçe dostu)/.test(text)) {
    return 0
  }

  return 1
}

function mapPlannerPlace(place: PlannerPlaceListItem): PlannerPlace {
  return {
    id: place.id,
    slug: place.slug,
    name: place.name,
    headline: place.headline,
    shortDescription: place.shortDescription,
    categoryId: place.categoryPrimary,
    categoryLabel: CATEGORY_LABELS[place.categoryPrimary] ?? place.categoryPrimary,
    tags: inferTagsFromPlace(place),
    budget: inferBudget(place),
    rating: null,
    address: place.address,
    website: place.website,
    imageUrl: place.imageUrl,
    badges: place.guideBadges,
  }
}

export async function getPlannerPlaces() {
  const places = await listPublishedPlannerPlaces()
  return places.map((place) => mapPlannerPlace(place))
}
