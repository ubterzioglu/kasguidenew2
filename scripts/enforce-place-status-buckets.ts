import { getSupabaseAdminClient } from './lib/supabase-admin.ts'

type PlaceRow = {
  id: string
  name: string
  slug: string
  status: string
  verification_status: string
}

function isPlaceholderPlace(place: Pick<PlaceRow, 'name' | 'slug'>) {
  const name = place.name.toLocaleLowerCase('tr')
  const slug = place.slug.toLocaleLowerCase('tr')
  return name.includes('placeholder mekan') || slug.includes('placeholder-mekan')
}

async function main() {
  const client = getSupabaseAdminClient()

  const { data, error } = await client
    .from('places')
    .select('id, name, slug, status, verification_status')

  if (error) {
    throw error
  }

  const places = (data ?? []) as PlaceRow[]
  const placeholderIds = places.filter(isPlaceholderPlace).map((place) => place.id)
  const nonPlaceholderIds = places.filter((place) => !isPlaceholderPlace(place)).map((place) => place.id)

  if (placeholderIds.length > 0) {
    const { error: publishError } = await client
      .from('places')
      .update({ status: 'published', verification_status: 'verified' })
      .in('id', placeholderIds)

    if (publishError) {
      throw publishError
    }
  }

  if (nonPlaceholderIds.length > 0) {
    const { error: adminError } = await client
      .from('places')
      .update({ status: 'admin', verification_status: 'reviewed' })
      .in('id', nonPlaceholderIds)

    if (adminError) {
      throw adminError
    }
  }

  const { data: finalRows, error: finalError } = await client
    .from('places')
    .select('id, name, slug, status, verification_status')

  if (finalError) {
    throw finalError
  }

  const finalPlaces = (finalRows ?? []) as PlaceRow[]
  const finalPlaceholder = finalPlaces.filter(isPlaceholderPlace)
  const finalNonPlaceholder = finalPlaces.filter((place) => !isPlaceholderPlace(place))
  const nonPlaceholderNonAdmin = finalNonPlaceholder.filter((place) => place.status !== 'admin').length
  const placeholderNonPublished = finalPlaceholder.filter((place) => place.status !== 'published').length

  console.log(
    JSON.stringify(
      {
        ok: true,
        total: finalPlaces.length,
        placeholder: finalPlaceholder.length,
        nonPlaceholder: finalNonPlaceholder.length,
        placeholderNonPublished,
        nonPlaceholderNonAdmin,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error(JSON.stringify(error, null, 2))
  }
  process.exit(1)
})
