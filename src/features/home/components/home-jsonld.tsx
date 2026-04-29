import { HOME_FAQ_ITEMS } from './home-faq-section'

type JsonLdGraph =
  | Record<string, unknown>
  | Record<string, unknown>[]

const HOME_PUBLISHED_AT = '2026-01-15T09:00:00+03:00'
const HOME_MODIFIED_AT = '2026-04-29T08:48:15+03:00'
const HOME_OG_IMAGE_URL = 'https://www.kasguide.de/og.jpg'

function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kaş Guide',
    url: 'https://www.kasguide.de',
    logo: 'https://www.kasguide.de/logo.png',
    sameAs: [
      'https://instagram.com/guidekas',
      'https://facebook.com/kasguide',
      'https://x.com/thekasguide',
      'https://wa.me/4915258450111',
      'mailto:info@kasguide.de',
    ],
  }
}

function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://www.kasguide.de',
    name: 'Kaş Guide',
    inLanguage: 'tr-TR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.kasguide.de/arama?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

function buildCollectionPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Kaş Rehberi — Gezilecek Yerler, Restoranlar ve Tatil Önerileri',
    url: 'https://www.kasguide.de',
    description:
      "Kaş'ın en kapsamlı yerel rehberi. Gezilecek yerler, restoranlar, plajlar, dalış noktaları ve konaklama önerileri.",
    image: HOME_OG_IMAGE_URL,
    datePublished: HOME_PUBLISHED_AT,
    dateModified: HOME_MODIFIED_AT,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 9,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Kaş Restoranlar', url: 'https://www.kasguide.de/kas-restoran-onerileri' },
        { '@type': 'ListItem', position: 2, name: 'Kaş Kahvaltı Mekanları', url: 'https://www.kasguide.de/kas-kahvalti-mekanlari' },
        { '@type': 'ListItem', position: 3, name: 'Kaş Plajları', url: 'https://www.kasguide.de/kas-plajlari' },
        { '@type': 'ListItem', position: 4, name: 'Kaş Barlar ve Gece Hayatı', url: 'https://www.kasguide.de/kas-barlar-ve-gece-hayati' },
        { '@type': 'ListItem', position: 5, name: 'Kaş Oteller', url: 'https://www.kasguide.de/kas-oteller' },
        { '@type': 'ListItem', position: 6, name: 'Kaş Butik Oteller', url: 'https://www.kasguide.de/kas-butik-oteller' },
        { '@type': 'ListItem', position: 7, name: 'Kaş Dalış Noktaları', url: 'https://www.kasguide.de/kas-dalis-noktalari' },
        { '@type': 'ListItem', position: 8, name: 'Kaş Tekne Turu', url: 'https://www.kasguide.de/kas-tekne-turu' },
        { '@type': 'ListItem', position: 9, name: 'Kaş Gezilecek Yerler', url: 'https://www.kasguide.de/kas-gezilecek-yerler' },
      ],
    },
  }
}

function buildFaqPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function buildWebPageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.kasguide.de/#webpage',
    name: 'Kaş Gezi Rehberi',
    headline: 'Kaş Gezi Rehberi – Gezilecek Yerler, Plajlar ve Yerel Öneriler',
    description: "Kaş'ta gezilecek yerler, restoranlar, plajlar ve yerel öneriler.",
    url: 'https://www.kasguide.de/',
    image: HOME_OG_IMAGE_URL,
    datePublished: HOME_PUBLISHED_AT,
    dateModified: HOME_MODIFIED_AT,
    inLanguage: 'tr-TR',
    isPartOf: { '@type': 'WebSite', url: 'https://www.kasguide.de/' },
    breadcrumb: { '@id': 'https://www.kasguide.de/#breadcrumb' },
    primaryImageOfPage: { '@id': 'https://www.kasguide.de/#primaryimage' },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#home-intro-summary'],
    },
  }
}

function buildHomeBreadcrumbSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': 'https://www.kasguide.de/#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.kasguide.de/' },
    ],
  }
}

function buildPrimaryImageSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': 'https://www.kasguide.de/#primaryimage',
    contentUrl: HOME_OG_IMAGE_URL,
    url: HOME_OG_IMAGE_URL,
    width: 1200,
    height: 630,
    caption: 'Kaş kıyıları, plajları, dalış rotaları ve yerel önerileri bir araya getiren Kaş Guide kapak görseli.',
  }
}

function buildBreadcrumbListSchema(pageName: string, pageUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.kasguide.de/' },
      { '@type': 'ListItem', position: 2, name: pageName, item: pageUrl },
    ],
  }
}

export function HomeJsonLd() {
  const graphs: JsonLdGraph = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildCollectionPageSchema(),
    buildFaqPageSchema(),
    buildWebPageSchema(),
    buildHomeBreadcrumbSchema(),
    buildPrimaryImageSchema(),
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs) }}
    />
  )
}

export { buildBreadcrumbListSchema }
export { HOME_MODIFIED_AT, HOME_OG_IMAGE_URL, HOME_PUBLISHED_AT }
