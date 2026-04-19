import type { Metadata } from 'next'

import { FaqPageClient } from '@/features/faq/components/faq-page-client'
import { getFaqItems } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: 'Sık Sorulan Sorular | Kaş Guide',
  description:
    "Kaş tatili, konaklama, plajlar ve mekan önerileri hakkında en çok sorulan soruların yanıtlarını Kaş Guide SSS sayfasında bulun.",
  alternates: { canonical: '/faq' },
  openGraph: { url: '/faq', type: 'website', locale: 'tr_TR', siteName: 'Kaş Guide' },
}

export default async function FaqPage() {
  const items = await getFaqItems()

  const faqJsonLd = items.length > 0
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      })
    : null

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
      )}
      <FaqPageClient items={items} />
    </>
  )
}
