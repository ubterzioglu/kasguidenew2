import { NextResponse } from 'next/server'

import { listPublishedPlaces } from '@/lib/public-place-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')?.trim() ?? ''
  const categoriesParam = searchParams.get('categories')?.trim() ?? ''
  const categoryIds = [
    ...new Set(
      (categoriesParam || category)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ]
  const limit = Math.max(1, Math.min(Number.parseInt(searchParams.get('limit') ?? '12', 10) || 12, 48))
  const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0)

  if (categoryIds.length === 0) {
    return NextResponse.json({ error: 'category veya categories zorunlu.' }, { status: 400 })
  }

  try {
    const result = await listPublishedPlaces({
      categoryIds,
      limit,
      offset,
    })

    return NextResponse.json(
      {
        category: categoryIds[0] ?? null,
        categories: categoryIds,
        places: result.places,
        hasMore: result.hasMore,
        offset,
        limit,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mekanlar okunamadi.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
