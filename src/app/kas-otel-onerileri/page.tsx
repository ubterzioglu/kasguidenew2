import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Otel Önerileri | Butik Oteller ve Pansiyonlar',
  description: 'Kaş otel önerileri: Merkezde butik oteller, Çukurbağ Yarımadası pansiyonları, aile dostu tesisler ve fiyat karşılaştırması.',
  alternates: { canonical: '/kas-otel-onerileri' },
  openGraph: {
    url: '/kas-otel-onerileri',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasOtelOnerileriPage() {
  return (
    <SiteFrame>
      <main className="kas-otel-onerileri-page">
        <section className="page-hero kas-otel-hero">
          <h1>Kaş Otel Önerileri</h1>
          <p>
            Kaş&apos;ta konaklama tercihiniz tatil deneyiminizi doğrudan şekillendirir. Merkezde canlılık,
            yarımada sakinlik, Patara geniş plajlar sunar. Bölgeye göre otel önerileri burada.
          </p>
        </section>

        <section className="page-content">
          <h2>Merkezde Butik Oteller</h2>
          <p>
            Kaş merkezde yürüme mesafesinde restoranlar, barlar ve alışveriş imkanı bulunur. Antik tiyatro,
            çarşı ve marina 5-10 dakika mesafededir. Butik oteller genelde 3-10 oda kapasitesindedir ve
            kişisel hizmet sunar.
          </p>
          <p>
            Fiyat aralığı: Ekonomik pansiyonlar 800-1.500 TL, butik oteller 1.500-3.500 TL (kişi başı/gece).
          </p>

          <h2>Çukurbağ Yarımadası Pansiyonları</h2>
          <p>
            Merkeze 15-20 dakika mesafedeki yarımada, sakinlik ve manzara arayanlar için idealdir.
            Günbatımı manzaralı odalar, özel plajlar ve araç gerekliliği öne çıkar. Aileler ve çiftler
            için uygundur.
          </p>

          <h2>Aile Dostu Tesisler</h2>
          <p>
            Büyük Çakıl ve Akçagerme plajlarına yakın oteller aileler için uygundur. Çocuk havuzu,
            aile odaları ve erken check-in imkanı sunan tesisler yaz sezonunda erken doluyor.
            Rezervasyonu Nisan-Mayıs aylarında yapmanızı öneririz.
          </p>

          <h2>Konaklama İpuçları</h2>
          <p>
            - Merkezde kalırsanız araç gerekmez, ancak gece gürültüsü olabilir.<br/>
            - Yarımada için araç kiralama veya transfer planlaması yapın.<br/>
            - Yüksek sezonda (Temmuz-Ağustos) en az 5-7 gün önceden rezervasyon yapın.<br/>
            - Airbnb ve Booking.com dışında yerel otellerle doğrudan iletişime geçin.
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> |{' '}
            <Link href="/kas-plajlari">Kaş Plajları</Link> |{' '}
            <Link href="/kas-tatil-rehberi">Tatil Rehberi</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Otel Önerileri', 'https://www.kasguide.de/kas-otel-onerileri')) }}
        />
      </main>
    </SiteFrame>
  )
}
