import { ResultsPageClient } from '@/features/results/components/results-page-client'

type ResultPageProps = {
  searchParams: Promise<{
    categories?: string
  }>
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams
  const initialCategoryIds = (params.categories ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return <ResultsPageClient initialCategoryIds={initialCategoryIds} />
}
