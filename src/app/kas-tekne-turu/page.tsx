import type { Metadata } from 'next'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Tekne Turu | En İyi Rotalar ve Fiyatlar',
  description: 'Kaş tekne turu rehberi: Kekova rotası, özel tekne kiralama, grup turları, fiyatlar ve en iyi rotalar. Güncel 2026 bilgileri burada.',
  alternates: { canonical: '/kas-tekne-turu' },
  openGraph: {
    url: '/kas-tekne-turu',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasTekneTuruPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-turu-page">
        <section className="page-hero kas-tekne-hero">
          <h1>Kaş Tekne Turu</h1>
          <p>
            Kaş&apos;ın en ikonik deneyimi olan tekne turları, Akdeniz&apos;in berrak sularında unutulmaz bir gezi sunar.
            Kekova batık şehri, gizli koylar ve kristal plajlar tekne turu ile keşfe değer rotalar arasında.
          </p>
        </section>

        <section className="page-content">
          <h2>Kaş&apos;ta Tekne Turu Neden Yapılmalı?</h2>
          <p>
            Kaş, karadan erişimi zor koylara ve antik kalıntılara sahiptir. Tekne turu ile Kekova batık şehri,
            Simena antik kenti ve Kaputaş plajı gibi noktalara kolayca ulaşabilirsiniz. Özel veya grup turlarıyla
            kendi hızınızda bir deneyim yaşayın.
          </p>

          <h2>En Popüler Tekne Turu Rotaları</h2>
          <p>
            <strong>Kekova Batık Şehir Turu:</strong> En çok tercih edilen rota. Su altındaki Roma dönemi evlerini
            ve limanı uzaktan görebilirsiniz. Genelde 6-8 saat sürer.
          </p>
          <p>
            <strong>Kaş Koyları Turu:</strong> Çukurbağ Yarımadası&apos;nın sakin koylarını gezen, öğle yemeği ve
            yüz molaları içeren daha kısa bir rotadır.
          </p>
          <p>
            <strong>Kaş-Meis Gün Batımı Turu:</strong> Akşam saatlerinde düzenlenen, Yunan adası Meis manzaralı
            gün batımı deneyimi sunan özel turlardır.
          </p>

          <h2>Tekne Turu Fiyatları</h2>
          <p>
            2026 sezonunda grup turları kişi başı 750-1.200 TL arasında değişiyor. Özel tekne kiralama ise
            tekne kapasitesine göre 4.000-10.000 TL bandında. Fiyatlar genellikle öğle yemeği, içecekler ve
            yüzme molasını içerir.
          </p>

          <h2>Tekne Turu Nasıl Rezerve Edilir?</h2>
          <p>
            Kaş merkezdeki birçok dalış ve tur şirketi ön kayıt kabul ediyor. Yüksek sezonda (Haziran-Eylül)
            rezervasyonu 1-2 hafta önceden yapmanızı öneririz. WhatsApp veya e-posta ile doğrudan iletişim
            kurabilirsiniz.
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <a href="/">Ana Sayfaya Dön</a> |{' '}
            <a href="/kas-koylari">Kaş Koyları Listesi</a> |{' '}
            <a href="/kas-dalis-noktalari">Dalış Noktaları</a>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Tekne Turu', 'https://www.kasguide.de/kas-tekne-turu')) }}
        />
      </main>
      </main>
    </SiteFrame>
  )
}
