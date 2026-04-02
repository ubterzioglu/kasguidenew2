import { createClient } from '@supabase/supabase-js'

type SeedOptions = {
  count: number
}

const DEFAULT_COUNT = 19
const CATEGORY_IDS = [
  'bar',
  'meyhane',
  'restoran',
  'cafe',
  'kahvalti',
  'oteller',
  'tarih',
  'doga',
  'plaj',
  'carsi',
  'gezi',
  'dalis',
  'aktivite',
  'etkinlik',
  'yazilar',
  'roportaj',
  'fotograf',
  'oss',
  'kas-local',
]

function parseOptions(): SeedOptions {
  const countArg = process.argv.find((arg) => arg.startsWith('--count='))
  const parsedCount = countArg ? Number.parseInt(countArg.split('=')[1] ?? '', 10) : DEFAULT_COUNT
  const count = Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : DEFAULT_COUNT
  return { count }
}

function slugify(input: string) {
  return input
    .toLocaleLowerCase('tr')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase bağlantısı için NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY eksik.')
  }

  const { count } = parseOptions()
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const now = Date.now()
  const placesPayload: Array<Record<string, unknown>> = []
  const contentPayload: Array<Record<string, unknown>> = []
  const imagePayload: Array<Record<string, unknown>> = []

  for (let i = 0; i < count; i += 1) {
    const sequence = i + 1
    const suffix = `${now}-${sequence}`
    const name = `Placeholder Mekan ${sequence}`
    const slug = slugify(`placeholder-mekan-${suffix}`)
    const id = crypto.randomUUID()
    const categoryId = CATEGORY_IDS[i % CATEGORY_IDS.length]!

    placesPayload.push({
      id,
      slug,
      name,
      category_primary: categoryId,
      category_secondary: null,
      address: null,
      lat: null,
      lng: null,
      phone: null,
      website: null,
      opening_hours: null,
      status: 'published',
      verification_status: 'verified',
    })

    contentPayload.push({
      place_id: id,
      headline: name,
      short_text: `${name} için kısa placeholder açıklama.`,
      long_text: `${name} için uzun placeholder açıklama. İçerik daha sonra gerçek veriyle güncellenecek.`,
      tone_type: 'guide',
      last_generated_at: null,
    })

    imagePayload.push({
      place_id: id,
      storage_path: `https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80`,
      public_url: `https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80`,
      alt_text: `${name} görsel`,
      source_name: 'placeholder_seed',
      is_cover: true,
      sort_order: 0,
    })
  }

  const { error: placeError } = await client.from('places').insert(placesPayload)
  if (placeError) {
    throw new Error(`places insert hatası: ${placeError.message}`)
  }

  const { error: contentError } = await client.from('place_content').insert(contentPayload)
  if (contentError) {
    throw new Error(`place_content insert hatası: ${contentError.message}`)
  }

  const { error: imageError } = await client.from('place_images').insert(imagePayload)
  if (imageError) {
    throw new Error(`place_images insert hatası: ${imageError.message}`)
  }

  console.log(`Tamamlandı: ${count} placeholder mekan published olarak eklendi.`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Hata: ${message}`)
  process.exit(1)
})
