import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş&apos;ta Nerede Ne Yenir | Yeme-İçme Rehberi',
  description: 'Kaş&apos;ta nerede ne yenir: Balık restoranları, meyhaneler, kahvaltı mekanları ve sokak lezzetleri.',
  alternates: { canonical: '/kas-nerede-ne-yenir' },
  openGraph: {
    url: '/kas-nerede-ne-yenir',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasNeredeNeYenirPage() {
  return (
    <SiteFrame>
      <main className="kas-nerede-ne-yenir-page">
        <section className="page-hero kas-yemecik-hero">
          <h1>Kaş&apos;ta Nerede Ne Yenir</h1>
          <p>
            Kaş&apos;ın mutfak kültürü Akdeniz ve yerel lezzetlerin birleşimidir. Taze balık,
            mezeler ve ev yemekleri öne çıkar.
          </p>
        </section>

        <section className="page-content">
          <h2>Balık Restoranları</h2>
          <p>
            Liman ve marina çevresindeki balık restoranları taze günlük balık sunar.
            Levrek, çupra, lüfer ve mezeler öne çıkar.
          </p>

          <h2>Meyhaneler</h2>
          <p>
            Geleneksel Türk meze kültürü ve rakı eşliğinde akşam yemekleri için idealdir.
            Çarşı ve liman bölgesinde birçok meyhane bulunur.
          </p>

          <h2 id="kahvalti-mekanlari">Kahvaltı Mekanları</h2>
          <p>
            Serpme kahvaltı, yerel peynirler, zeytinyağlılar ve menemen ile güne başlayın.
            Çarşı içindeki kafeler ve merkez dışındaki bahçeli mekanlar önerilir.
          </p>

          <h2>Vegan ve Vegetaryen Seçenekler</h2>
          <p>
            Kaş vegan dostu bir şehirdir. Bi&apos;Lokma gibi mekanlar ev yemekleri ve
            vegan seçenekler sunar.
          </p>

          <h2>Sokak Lezzetleri</h2>
          <p>
            Döner, simit, gözleme ve bal-ekmek sokak lezzetleri arasında yer alır.
            Bütçe dostu ve hızlı çözümlerdir.
          </p>

          <h2>Bütçe Rehberi</h2>
          <p>
            Sokak lezzeti: 50-100 TL<br/>
            Orta seviye restoran: 200-400 TL/kişi<br/>
            Balık restoranı: 400-800 TL/kişi
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> |{' '}
            <Link href="/kas-merkez-gezilecek-yerler">Merkez Gezisi</Link> |{' '}
            <Link href="/kas-otel-onerileri">Otel Önerileri</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş&apos;ta Nerede Ne Yenir', 'https://www.kasguide.de/kas-nerede-ne-yenir')) }}
        />
      </main>
    </SiteFrame>
  )
}
