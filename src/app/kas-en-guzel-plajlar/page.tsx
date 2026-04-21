import type { Metadata } from 'next'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş En Güzel Plajlar | En İyi 10 Plaj Listesi',
  description: 'Kaş en güzel plajlar: Kaputaş, Büyük Çakıl, Akçagerme ve daha az bilinen gizli plajlar.',
  alternates: { canonical: '/kas-en-guzel-plajlar' },
  openGraph: {
    url: '/kas-en-guzel-plajlar',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasEnGuzelPlajlarPage() {
  return (
    <SiteFrame>
      <main className="kas-plajlar-page">
        <section className="page-hero kas-plajlar-hero">
          <h1>Kaş En Güzel Plajlar</h1>
          <p>
            Kaş&apos;ın plajları her zevke hitap eder. İster aile dostu kumsal, ister sakin bir koy,
            isterseniz de fotojenik bir plaj arayın, Kaş&apos;ta bulabilirsiniz.
          </p>
        </section>

        <section className="page-content">
          <h2>1. Kaputaş Plajı</h2>
          <p>
            <strong>Özellik:</strong> En fotojenik plaj, mavi bayraklı.<br/>
            <strong>Ulaşım:</strong> Kaş merkezden 20 dakika, 185 basamak merdiven.<br/>
            <strong>Kimler İçin:</strong> Fotoğraf severler, çiftler.<br/>
            <strong>Not:</strong> Sabah erken gidilirse kalabalıktan kaçınılır.
          </p>

          <h2>2. Büyük Çakıl Plajı</h2>
          <p>
            <strong>Özellik:</strong> Aile dostu, sığ su, donanım kiralama.<br/>
            <strong>Ulaşım:</strong> Merkezden otobüsle 15 dakika.<br/>
            <strong>Kimler İçin:</strong> Aileler, çocuklu gruplar.<br/>
            <strong>Not:</strong> Yeme-içme imkanı mevcut.
          </p>

          <h2>3. Akçagerme Plajı</h2>
          <p>
            <strong>Özellik:</strong> Uzun kumsal, sakin, kamp imkanı.<br/>
            <strong>Ulaşım:</strong> Merkezden 10 dakika.<br/>
            <strong>Kimler İçin:</strong> Sakinlik arayanlar, kampçılar.<br/>
            <strong>Not:</strong> Daha az kalabalık, daha ekonomik.
          </p>

          <h2>4. Küçük Çakıl Plajı</h2>
          <p>
            <strong>Özellik:</strong> Büyük Çakıl&apos;ın daha sakin alternatifi.<br/>
            <strong>Ulaşım:</strong> Büyük Çakıl&apos;a yürüme mesafesi.<br/>
            <strong>Kimler İçin:</strong> Aileler, sakinlik arayanlar.
          </p>

          <h2>5. Kalkan Plajları</h2>
          <p>
            <strong>Özellik:</strong> Kaputaş&apos;a yakın, daha sakin.<br/>
            <strong>Ulaşım:</strong> Kaş merkezden 30 dakika.<br/>
            <strong>Kimler İçin:</strong> Kaş&apos;ta kalan ama kalabalıktan kaçanlar.
          </p>

          <h2>Gizli Plajlar</h2>
          <p>
            Tekne turları ile ulaşılabilen birçok gizli plaj bulunur. Çukurbağ Yarımadası
            çevresinde yürüyüşle ulaşılan koylar da mevcuttur.
          </p>

          <h2>Plaj İpuçları</h2>
          <p>
            - Kaputaş&apos;a sabah 09:00&apos;a varın.<br/>
            - Güneş kremi ve su matarası yanınızda bulundurun.<br/>
            - Yüksek sezonda (Temmuz-Ağustos) şemsiye kiralama yapın.<br/>
            - Tekne turları gizli plajlar için en iyi seçenektir.
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <a href="/">Ana Sayfaya Dön</a> |{' '}
            <a href="/kas-koylari">Koylar Listesi</a> |{' '}
            <a href="/kas-tekne-turu">Tekne Turları</a>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş En Güzel Plajlar', 'https://www.kasguide.de/kas-en-guzel-plajlar')) }}
        />
      </main>
    </SiteFrame>
  )
}
