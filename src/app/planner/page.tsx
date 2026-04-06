import type { Metadata } from 'next'

import { PlannerPageClient } from '@/features/planner/components/planner-page-client'
import { getPlannerPlaces, PLANNER_QUESTIONS } from '@/lib/planner-data'

export const metadata: Metadata = {
  title: 'Günlük Planlayıcı | Kaş Guide',
  description: "25 soruluk Kaş planner'ı ile gününüze uygun rota ve mekan önerileri alın.",
}

export default async function PlannerPage() {
  const places = await getPlannerPlaces()

  return <PlannerPageClient questions={PLANNER_QUESTIONS} places={places} />
}
