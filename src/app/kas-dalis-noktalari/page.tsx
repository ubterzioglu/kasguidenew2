import type { Metadata } from 'next'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Dalış Noktaları | En İyi Dalış Noktaları ve Merkezler',
  description: 'Kaş dalış noktaları: Uluburun batığı, Tünel dalışı, Kaya dalışları ve Kekova batık şehri. Dalış merkezleri, fiyatlar ve sertifikasyon bilgileri.',
  alternates: { canonical: '/kas-dalis-noktalari' },
  openGraph: {
    url: '/kas-dalis-noktalari',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasDalisNoktalariPage() {
  return (
    <SiteFrame>
      <main className="kas-dalis-noktalari-page">
        <section className="page-hero kas-dalis-hero">
          <h1>Kaş Dalış Noktaları</h1>
          <p>
            Kaş, Türkiye&apos;nin en iyi dalış destinasyonlarından biri. Uluburun batığı, tünel dalışları
            ve zengin deniz yaşamı ile dalış tutkunlarını cezbetmektedir.
          </p>
        </section>

        <section className="page-content">
          <h2>Uluburun Batığı</h2>
          <p>
            3300 yıllık Tunç Çağı batığı, 40-50 metre derinlikte yer alır. Sertifikalı dalgıçlar için
            uygundur. Amforalar, bakır ve kalay yükü ile arkeolojik açıdan çok değerlidir.
          </p>

          <h2>Tünel Dalışı</h2>
          <p>
            Doğal bir tünel içinde gerçekleşen bu dalış, orta seviye dalgıçlar için idealdir.
            Tünelin her iki ucu farklı manzaralar sunar. Genelde 18-25 metre derinlikte yapılır.
          </p>

          <h2>Kaya Dalışları</h2>
          <p>
            Kaş çevresindeki kaya dalışları, renkli mercanlar ve çeşitli balık türleri ile bilinir.
            Başlangıç seviyesi dalgıçlar için de uygundur. 10-20 metre derinliklerde gerçekleşir.
          </p>

          <h2>Kekova Batık Şehir</h2>
          <p>
            Su altında kalmış Roma dönemi yapıları, özel izinle dalışa açıktır. Rehberli turlarla
            keşfedilebilir. Tarih ve dalış tutkunları için eşsiz bir deneyim.
          </p>

          <h2>Dalış Merkezleri ve Fiyatlar</h2>
          <p>
            Kaş merkezde 10+ PADI sertifikalı dalış merkezi bulunur. İki dalış + ekipman kiralama
            ortalama 1.500-2.500 TL arasında değişir. Otel transferi genellikle dahildir.
          </p>

          <h2>Dalış İçin İdeal Zaman</h2>
          <p>
            Su sıcaklığı Mayıs-Ekim arasında 22-28°C arasındadır. En iyi görünürlük Haziran-Eylül
            aylarında sağlanır. Kış aylarında bazı merkezler kapalı olabilir.
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <a href="/">Ana Sayfaya Dön</a> |{' '}
            <a href="/kas-tekne-turu">Tekne Turları</a> |{' '}
            <a href="/kas-aktiviteler">Aktiviteler</a>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Dalış Noktaları', 'https://www.kasguide.de/kas-dalis-noktalari')) }}
        />
      </main>
    </SiteFrame>
  )
}
