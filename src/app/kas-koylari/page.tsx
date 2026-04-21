import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Koyları Listesi | En Güzel Koylar ve Plajlar',
  description: 'Kaş koyları listesi: Çukurbağ Yarımadası koyları, gizli plajlar, tekne turu rotaları ve ulaşım bilgileri.',
  alternates: { canonical: '/kas-koylari' },
  openGraph: {
    url: '/kas-koylari',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasKoylariPage() {
  return (
    <SiteFrame>
      <main className="kas-koylari-page">
        <section className="page-hero kas-koylari-hero">
          <h1>Kaş Koyları Listesi</h1>
          <p>
            Kaş&apos;ın koyları kristal berraklığında sular ve doğal güzellikleriyle ünlüdür.
            Çukurbağ Yarımadası ve çevresi keşfe değer.
          </p>
        </section>

        <section className="page-content">
          <h2>Çukurbağ Yarımadası Koyları</h2>
          <p>
            <strong>Karaada:</strong> Sakin, doğal, araçla ulaşım mümkün. Gün boyu sakinlik.<br/>
            <strong>İnceburun:</strong> Yarımada ucunda, panoramik manzara, yüzme için uygun.<br/>
            <strong>Kızılçukur Koyu:</strong> Kırmızı kayalıkları ile fotojenik, tekne ile erişim.
          </p>

          <h2>Kaputaş Plajı</h2>
          <p>
            Kaş-Kalkan arasında, merdivenlerle inilen ikonik plaj. Berrak su ve kumsal.
            Sabah erken veya öğleden sonra gitmek kalabalığı önler.
          </p>

          <h2>Büyük Çakıl ve Küçük Çakıl</h2>
          <p>
            Aileler için ideal, sığ su ve kumsal. Donanım kiralama ve yemek imkanı var.
            Merkezden otobüsle ulaşılabilir.
          </p>

          <h2>Akçagerme Plajı</h2>
          <p>
            Uzun kumsal, sakin atmosfer. Merkezden 10 dakika. Kamp ve pansiyon seçenekleri mevcut.
          </p>

          <h2>Gizli Koylar (Tekne ile Ulaşılır)</h2>
          <p>
            Kekova rotasında birçok gizli koy bulunur. Tekne turları ile bu koylarda yüzme molaları yapılır.
            Kişiye özel tekne kiralama ile daha esnek rotalar planlanabilir.
          </p>

          <h2>Koylara Ulaşım</h2>
          <p>
            Çoğu koy araçla ulaşılabilir. Bazı gizli koylar için tekne turu gerekir.
            Yürüyüşle ulaşılabilen koylar da mevcuttur (Likya Yolu üzerinden).
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> |{' '}
            <Link href="/kas-tekne-turu">Tekne Turları</Link> |{' '}
            <Link href="/kas-plajlari">Plajlar</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Koyları Listesi', 'https://www.kasguide.de/kas-koylari')) }}
        />
      </main>
    </SiteFrame>
  )
}
