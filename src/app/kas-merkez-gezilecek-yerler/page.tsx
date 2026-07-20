import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

export const metadata: Metadata = {
  title: 'Kaş Merkez Gezilecek Yerler | Şehir İçi Rotalar',
  description: 'Kaş merkez gezilecek yerler: Antik tiyatro, çarşı, marina, Likya kaya mezarları ve yürüyüş rotaları.',
  alternates: { canonical: '/kas-merkez-gezilecek-yerler' },
  openGraph: {
    url: '/kas-merkez-gezilecek-yerler',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasMerkezGezilecekYerlerPage() {
  return (
    <SiteFrame>
      <main className="kas-merkez-page">
        <section className="page-hero kas-merkez-hero">
          <h1>Kaş Merkez Gezilecek Yerler</h1>
          <p>
            Kaş merkezi kompakt bir yapıya sahiptir. Antik tiyatro, çarşı, marina ve sahil
            yürüyüşü ile günü kolayca planlayabilirsiniz.
          </p>
        </section>

        <section className="page-content">
          <h2>Antik Tiyatro</h2>
          <p>
            Kaş antik tiyatrosu, Akdeniz manzaralı Helenistik dönem kalıntısıdır. Giriş ücretsizdir.
            Gün batımı saatleri özellikle güzeldir.
          </p>

          <h2>Kaş Çarşısı</h2>
          <p>
            Dar sokaklar, butik dükkanlar, el sanatları ve yerel ürünler. Hediyelik eşya,
            takı, tekstil ve yerel gıda ürünleri bulabilirsiniz.
          </p>

          <h2>Likya Kaya Mezarları</h2>
          <p>
            Merkezdeki kaya mezarları, Likya dönemi mimarisini yansıtır. Teleferik tepesindeki
            mezarlar en iyi örneklerdendir.
          </p>

          <h2>Marina ve Sahil Yürüyüşü</h2>
          <p>
            Marina çevresindeki yürüyüş yolu, gün batımı için idealdir. Balık restoranları,
            kafeler ve tekneler manzaranın bir parçasıdır.
          </p>

          <h2>1 Günlük Merkez Rotası</h2>
          <p>
            Sabah: Antik tiyatro + çarşı gezisi<br/>
            Öğle: Marina çevresinde öğle yemeği<br/>
            Öğleden sonra: Kaya mezarları + sahil yürüyüşü<br/>
            Akşam: Gün batımı + meyhane
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> |{' '}
            <Link href="/kas-tatil-rehberi">Tatil Rehberi</Link> |{' '}
            <Link href="/kas-nerede-ne-yenir">Nerede Ne Yenir</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Merkez Gezilecek Yerler', 'https://www.kasguide.de/kas-merkez-gezilecek-yerler')) }}
        />
      </main>
    </SiteFrame>
  )
}
