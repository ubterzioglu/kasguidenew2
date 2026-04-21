import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Tatil Rehberi | Kapsamlı Planlama Kılavuzu',
  description: 'Kaş tatil rehberi: Ulaşım, konaklama, aktiviteler, bütçe planlama ve sezon önerileri ile kapsamlı tatil kılavuzu.',
  alternates: { canonical: '/kas-tatil-rehberi' },
  openGraph: {
    url: '/kas-tatil-rehberi',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasTatilRehberiPage() {
  return (
    <SiteFrame>
      <main className="kas-tatil-rehberi-page">
        <section className="page-hero kas-tatil-hero">
          <h1>Kaş Tatil Rehberi</h1>
          <p>
            Kaş tatilinizi planlamak için kapsamlı kılavuz. Ulaşım, konaklama, aktiviteler,
            bütçe ve en iyi seyahat zamanı burada.
          </p>
        </section>

        <section className="page-content">
          <h2>En İyi Seyahat Zamanı</h2>
          <p>
            <strong>İlkbahar (Nisan-Haziran):</strong> Ilıman hava, sakinlik, doğa yürüyüşleri için ideal.<br/>
            <strong>Yaz (Temmuz-Ağustos):</strong> Sıcak, canlı, plaj ve su sporları için en iyi zaman.<br/>
            <strong>Sonbahar (Eylül-Ekim):</strong> Ilık deniz, sakinleşen kalabalık, dalış için uygun.<br/>
            <strong>Kış (Kasım-Mart):</strong> Soğuk değil (10-18°C), ekonomik fiyatlar, bazı tesisler kapalı.
          </p>

          <h2>Ulaşım</h2>
          <p>
            <strong>Havaalanı:</strong> Dalaman (DLM) 220 km, Antalya (AYT) 190 km. Transferler 3-4 saat sürer.<br/>
            <strong>Otobüs:</strong> Antalya ve Ankara gibi büyük şehirlerden direkt otobüsler var.<br/>
            <strong>Araç Kiralama:</strong> Önerilir. Havaalanında veya merkezde birçok kiralama ofisi var.
          </p>

          <h2>Konaklama</h2>
          <p>
            Merkezde butik oteller, yarımada pansiyonları, Patara bölgesinde aile otelleri.
            Bütçe: Ekonomik 800-1.500 TL, orta 1.500-3.500 TL, lüks 3.500+ TL (kişi başı/gece).
          </p>

          <h2>3 Günlük Örnek Plan</h2>
          <p>
            <strong>Gün 1:</strong> Merkez gezisi (antik tiyatro, çarşı, marina) + akşam meyhane.<br/>
            <strong>Gün 2:</strong> Tekne turu (Kekova) + gün batımı bar.<br/>
            <strong>Gün 3:</strong> Dalış veya plaj + Çukurbağ Yarımadası gezisi.
          </p>

          <h2>Bütçe Planlama</h2>
          <p>
            Günlük ortalama harcama (kişi başı):<br/>
            Ekonomik: 500-800 TL (sokak lezzeti, pansiyon, ücretsiz aktiviteler)<br/>
            Orta: 1.000-2.000 TL (restoran, butik otel, turlar)<br/>
            Lüks: 2.500+ TL (balık restoranı, lüks otel, özel turlar)
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> |{' '}
            <Link href="/kas-otel-onerileri">Otel Önerileri</Link> |{' '}
            <Link href="/kas-aktiviteler">Aktiviteler</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Tatil Rehberi', 'https://www.kasguide.de/kas-tatil-rehberi')) }}
        />
      </main>
    </SiteFrame>
  )
}
