import { NextResponse } from 'next/server'

import { getPublishedPlaceCountsByCategory } from '@/lib/public-place-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const counts = await getPublishedPlaceCountsByCategory()

    return NextResponse.json(
      { counts },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kategori sayıları okunamadı.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
