import type { Metadata } from 'next'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Gece Hayatı | Barlar, Meyhaneler ve Gece Mekanları',
  description: 'Kaş gece hayatı: Liman bölgesindeki barlar, meyhaneler, canlı müzik mekanları ve gece eğlencesi önerileri.',
  alternates: { canonical: '/kas-gece-hayati' },
  openGraph: {
    url: '/kas-gece-hayati',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasGeceHayatiPage() {
  return (
    <SiteFrame>
      <main className="kas-gece-hayati-page">
        <section className="page-hero kas-gece-hayati-hero">
          <h1>Kaş Gece Hayatı</h1>
          <p>
            Kaş&apos;ın gece hayatı samimi ve çeşitlidir. Liman bölgesindeki meyhanelerden,
            rooftop barlara kadar birçok seçenek mevcuttur.
          </p>
        </section>

        <section className="page-content">
          <h2>Liman Bölgesi Meyhaneleri</h2>
          <p>
            Kaş limanı gün batımından sonra canlanır. Mezeler, rakı ve canlı müzik eşliğinde
            akşamlarını geçirebileceğiniz meyhaneler sıralanır. Rezervasyon yapmanızı öneririz.
          </p>

          <h2>Rooftop Barlar</h2>
          <p>
            Gün batımı manzaralı rooftop barlar, kokteyller ve rahat atmosfer sunar. Özellikle
            yaz sezonunda canlı müzik performansları da düzenlenir.
          </p>

          <h2>Klup ve Gece Kulüpleri</h2>
          <p>
            Kaş büyük bir gece kulübü kültürüne sahip değildir. Ancak bazı oteller ve barlar
            yaz sezonunda DJ performansları ve parti geceleri düzenler.
          </p>

          <h2>Sakin Gece Seçenekleri</h2>
          <p>
            Daha sakin bir akşam için çarşı içindeki kafeler, şarap barları ve küçük restoranlar
            uygundur. 23:00-00:00 civarı genellikle sakinleşir.
          </p>

          <h2>Gece Hayatı İpuçları</h2>
          <p>
            - Liman bölgesi en canlı bölgedir.<br/>
            - Yaz sezonunda (Haziran-Eylül) daha fazla aktivite vardır.<br/>
            - Ulaşım için taksi veya otel transferi kullanın.<br/>
            - Bütçe: Kokteyl 80-150 TL, meze tabağı 150-400 TL.
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <a href="/">Ana Sayfaya Dön</a> |{' '}
            <a href="/kas-nerede-ne-yenir">Nerede Ne Yenir</a> |{' '}
            <a href="/kas-otel-onerileri">Otel Önerileri</a>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Gece Hayatı', 'https://www.kasguide.de/kas-gece-hayati')) }}
        />
      </main>
    </SiteFrame>
  )
}
