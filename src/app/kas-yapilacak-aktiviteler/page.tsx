import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş&apos;ta Yapılacak Aktiviteler | Aktivite Rehberi',
  description: 'Kaş&apos;ta yapılacak aktiviteler: Tekne turları, dalış, rafting, jeep safari, yayla gezileri ve daha fazlası.',
  alternates: { canonical: '/kas-yapilacak-aktiviteler' },
  openGraph: {
    url: '/kas-yapilacak-aktiviteler',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasYapilacakAktivitelerPage() {
  return (
    <SiteFrame>
      <main className="kas-aktiviteler-page">
        <section className="page-hero kas-aktiviteler-hero">
          <h1>Kaş&apos;ta Yapılacak Aktiviteler</h1>
          <p>
            Kaş sadece plaj ve tarih değil; doğa sporları, yayla gezileri ve macera aktiviteleri
            ile de zengindir.
          </p>
        </section>

        <section className="page-content">
          <h2>Su Sporları</h2>
          <p>
            Tekne turları, dalış, sörf, kayak ve su kayağı gibi aktiviteler mevcuttur.
            Plajlarda ekipman kiralama imkanı bulunur.
          </p>

          <h2>Kara Maceraları</h2>
          <p>
            Jeep safari, ATV turları, rafting ve yayla gezileri karada keşif için idealdir.
            Antik yollar, şelaleler ve köyler keşfedilir.
          </p>

          <h2>Yürüyüş ve Doğa Yürüyüşü</h2>
          <p>
            Likya Yolu Kaş bölümü, Çukurbağ Yarımadası yürüyüş rotaları ve antik tiyatro
            ziyaretleri yürüyüş severler için uygundur.
          </p>

          <h2>Kültürel Aktiviteler</h2>
          <p>
            Antik tiyatro, Likya kaya mezarları, çarşı gezileri ve yerel sanat atölyeleri
            kültürel deneyimler sunar.
          </p>

          <h2>Hafta Sonu Planı Önerisi</h2>
          <p>
            Gün 1: Tekne turu + akşam meyhane<br/>
            Gün 2: Dalış veya su sporları + gün batımı bar<br/>
            Gün 3: Jeep safari veya yayla gezisi + yerel pazar
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> |{' '}
            <Link href="/kas-tekne-turu">Tekne Turları</Link> |{' '}
            <Link href="/kas-dalis-noktalari">Dalış Noktaları</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş&apos;ta Yapılacak Aktiviteler', 'https://www.kasguide.de/kas-yapilacak-aktiviteler')) }}
        />
      </main>
    </SiteFrame>
  )
}
