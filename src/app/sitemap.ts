import type { MetadataRoute } from 'next'

import { listPublishedPlaceSitemapEntries } from '@/lib/public-place-store'
import { listPublicNews, listPublicAnnouncements } from '@/lib/updates-store'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://www.kasguide.de'

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/biz-kimiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/mekan-oner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const [places, news, announcements] = await Promise.all([
    listPublishedPlaceSitemapEntries().catch((): Array<{ slug: string; updatedAt: string }> => []),
    listPublicNews(100).catch(() => []),
    listPublicAnnouncements(100).catch(() => []),
  ])

  const placeEntries: MetadataRoute.Sitemap = places.map((p) => ({
    url: `${BASE}/mekan/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const newsEntries: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${BASE}/haberler/${n.slug}`,
    lastModified: new Date(n.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const announcementEntries: MetadataRoute.Sitemap = announcements.map((a) => ({
    url: `${BASE}/duyurular/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...placeEntries, ...newsEntries, ...announcementEntries]
}
