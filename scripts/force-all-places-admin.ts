import { getSupabaseAdminClient } from './lib/supabase-admin.ts'

type StatusRow = {
  status: string
}

async function main() {
  const client = getSupabaseAdminClient()

  const before = await readStatusDistribution(client)

  const { error: updateError } = await client
    .from('places')
    .update({ status: 'admin', verification_status: 'reviewed' })
    .neq('status', 'admin')

  if (updateError) {
    throw updateError
  }

  const after = await readStatusDistribution(client)
  const nonAdminCount = Object.entries(after)
    .filter(([status]) => status !== 'admin')
    .reduce((sum, [, count]) => sum + count, 0)

  console.log(
    JSON.stringify(
      {
        ok: true,
        before,
        after,
        allAdmin: nonAdminCount === 0,
      },
      null,
      2,
    ),
  )
}

async function readStatusDistribution(client: ReturnType<typeof getSupabaseAdminClient>) {
  const { data, error } = await client.from('places').select('status')

  if (error) {
    throw error
  }

  const distribution: Record<string, number> = {}
  for (const row of (data ?? []) as StatusRow[]) {
    distribution[row.status] = (distribution[row.status] ?? 0) + 1
  }

  return distribution
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
