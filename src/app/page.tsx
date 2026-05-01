import type { Metadata } from 'next'

import { CategorySection } from '@/features/home/components/category-section'
import { HeroCarousel } from '@/features/home/components/hero-carousel'
import { HeroQuickLinksSection } from '@/features/home/components/hero-quick-links-section'
import { HomeFaqSection } from '@/features/home/components/home-faq-section'
import { HomeIntroSection } from '@/features/home/components/home-intro-section'
import { HomeJsonLd, HOME_MODIFIED_AT, HOME_OG_IMAGE_URL, HOME_PUBLISHED_AT } from '@/features/home/components/home-jsonld'
import { HomePromoSection } from '@/features/home/components/home-promo-section'
import { NewsAnnouncementsCarousel } from '@/features/home/components/news-announcements-carousel'
import { QuickLinksSection } from '@/features/home/components/quick-links-section'
import { WhatsAppCommunitySection } from '@/features/home/components/whatsapp-community-section'
import { listPublicHeroSlides } from '@/lib/hero-slide-store'
import { listUpdatesCarouselItems } from '@/lib/updates-store'

export const metadata: Metadata = {
  title: 'Kaş Gezi Rehberi | Gezilecek Yerler ve Tatil İpuçları',
  description:
    'Kaş gezi rehberi: gezilecek yerler, plajlar, restoranlar, dalış noktaları, tekne turları ve konaklama ipuçları tek sayfada.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Kaş Gezi Rehberi | Gezilecek Yerler ve Tatil İpuçları',
    description:
      'Kaş gezi rehberi: gezilecek yerler, plajlar, restoranlar, dalış noktaları, tekne turları ve konaklama ipuçları tek sayfada.',
    url: '/',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
    images: [
      {
        url: HOME_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Kaş Guide ana sayfa sosyal paylaşım görseli',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaş Gezi Rehberi | Gezilecek Yerler ve Tatil İpuçları',
    description:
      'Kaş gezi rehberi: gezilecek yerler, plajlar, restoranlar, dalış noktaları, tekne turları ve konaklama ipuçları tek sayfada.',
    images: [HOME_OG_IMAGE_URL],
    creator: '@thekasguide',
  },
  other: {
    'article:published_time': HOME_PUBLISHED_AT,
    'article:modified_time': HOME_MODIFIED_AT,
  },
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const heroSnapshot = await listPublicHeroSlides()
  const updates = await listUpdatesCarouselItems(9).catch((error) => {
    console.error('[HomePage] Updates carousel data could not be loaded.', error)
    return []
  })
  return (
    <>
      <HeroCarousel initialSlides={heroSnapshot.slides} />
      <HeroQuickLinksSection />

      <NewsAnnouncementsCarousel items={updates} />
      <CategorySection />
      <QuickLinksSection />
      <HomeFaqSection />
      <div className="home-section-separator" aria-hidden="true" />
      <HomeIntroSection />
      <div className="home-section-separator" aria-hidden="true" />
      <HomePromoSection />
      <WhatsAppCommunitySection />

      <HomeJsonLd />
    </>
  )
}
