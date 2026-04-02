import { getSupabaseAdminClient } from './lib/supabase-admin.ts'

type PlaceRow = {
  id: string
  name: string
  slug: string
  status: string
  verification_status: string
}

async function main() {
  const client = getSupabaseAdminClient()

  const { data: rows, error: readError } = await client
    .from('places')
    .select('id, name, slug, status, verification_status')
    .or('name.ilike.%Placeholder Mekan%,slug.ilike.%placeholder-mekan%')

  if (readError) {
    throw readError
  }

  const places = (rows ?? []) as PlaceRow[]

  if (places.length === 0) {
    console.log(JSON.stringify({ ok: true, matched: 0, updated: 0 }, null, 2))
    return
  }

  const ids = places.map((place) => place.id)

  const { error: updateError } = await client
    .from('places')
    .update({ status: 'published', verification_status: 'verified' })
    .in('id', ids)

  if (updateError) {
    throw updateError
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        matched: places.length,
        updated: ids.length,
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
