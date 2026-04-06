import type { Metadata } from 'next'

import { FaqPageClient } from '@/features/faq/components/faq-page-client'
import { getFaqItems } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: 'Sık Sorulan Sorular | Kaş Guide',
  description: 'Kaş hakkında merak edilen sorulara tek sayfada hızlıca ulaşın.',
}

export default async function FaqPage() {
  const items = await getFaqItems()

  return <FaqPageClient items={items} />
}
