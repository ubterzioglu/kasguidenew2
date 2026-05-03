import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const HERO_CHIPS = ['Merkez veya yarımada', 'Butik ağırlıklı konaklama', 'Sezona göre büyük fiyat farkı'] as const

const SUMMARY_CARDS = [
  {
    title: 'Asıl karar ne?',
    text: 'Kaş’ta otel seçimi yalnızca nerede uyuyacağınızı değil, tatilin ritmini, manzarasını ve günlük akışını da belirler.',
  },
  {
    title: 'Kaş neden farklı?',
    text: 'Büyük zincirlerden çok küçük ölçekli, karakter sahibi, çoğu zaman aile işletmesi olan butik yapılar öne çıkar.',
  },
  {
    title: 'En kritik ayrım',
    text: 'Sosyal ve yürünebilir bir tatil mi, yoksa sakinlik ve manzara mı istediğiniz; doğru bölgeyi seçmenizi sağlar.',
  },
] as const

const REGION_CARDS = [
  {
    title: 'Kaş Merkez',
    text: 'Restoranlar, barlar, liman ve çarşıya yürüme mesafesinde, sosyal ve keşif odaklı tatil isteyenler için en güçlü bölgedir.',
  },
  {
    title: 'Çukurbağ Yarımadası',
    text: 'Sessizlik, gün batımı ve deniz manzarası arayanlar için daha sakin, daha yavaş ve çoğu zaman daha özel hissettiren bir hattır.',
  },
  {
    title: 'Patara ve çevre bölgeler',
    text: 'Daha geniş alan, uzun plaj hissi ve Kaş merkezden farklı bir tempo isteyenler için alternatif bir konaklama coğrafyası sunar.',
  },
  {
    title: 'Kalkan tarafı',
    text: 'Daha villa ve lüks ağırlıklı, farklı ölçek ve bütçeye hitap eden ayrı bir tatil dili yaratır.',
  },
] as const

const STAY_TYPES = [
  {
    title: 'Butik oteller',
    text: 'Kaş’ın ruhunu en iyi yansıtan konaklama türüdür; küçük ölçek, estetik detay ve kişisel dokunuş burada belirgindir.',
  },
  {
    title: 'Pansiyonlar',
    text: 'Daha ekonomik ama çoğu zaman daha sıcak bir deneyim sunar. Teknik olarak konaklama, hissiyat olarak misafirlik gibidir.',
  },
  {
    title: 'Apartlar ve villalar',
    text: 'Uzun konaklamalar, kalabalık arkadaş grupları ya da daha bağımsız bir tatil kurgusu isteyenler için uygundur.',
  },
  {
    title: 'Lüks oteller',
    text: 'Sayı olarak daha az olsa da özel plaj, geniş alan ve yüksek servis standardı arayanlar için güçlü seçenekler bulunur.',
  },
] as const

const DECISION_NOTES = [
  'Sosyal, hareketli ve spontane bir tatil istiyorsanız merkez daha doğru hissettirir.',
  'Sessizlik, manzara ve terasta uzun akşamlar arıyorsanız yarımada daha güçlü bir tercihtir.',
  'Araçsız gezecekseniz merkez büyük avantaj sağlar; yarımadada ulaşım planı önem kazanır.',
  'Temmuz-Ağustos döneminde küçük işletmeler hızlı dolduğu için erken rezervasyon kritik hale gelir.',
] as const

const PRICE_NOTES = [
  'Merkezdeki pansiyonlar daha ekonomik bir giriş sunabilir.',
  'Yarımada ve özel konumlu oteller genelde daha yüksek bütçe ister.',
  'Mayıs, Haziran ve Eylül daha dengeli fiyat ve kalabalık seviyesi sunar.',
  'Temmuz ve Ağustos hem en yoğun hem de en pahalı dönemdir.',
] as const

const INTERNAL_LINKS = [
  {
    href: '/kas-tatil-rehberi',
    title: 'Kaş Tatil Rehberi',
    text: 'Konaklama kararını günlük plan, bölge ve sezon bilgisiyle birlikte düşünmek istersen buradan devam et.',
  },
  {
    href: '/kas-kahvalti-mekanlari',
    title: 'Kaş Kahvaltı',
    text: 'Konaklayacağın bölgeye göre güne nerede başlayacağını karşılaştır.',
  },
  {
    href: '/kas-gece-hayati',
    title: 'Kaş Gece Hayatı',
    text: 'Merkezde kalmanın akşam ritmine nasıl etki ettiğini görmek için gece tarafına bak.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş Otel Önerileri | Butik Oteller, Pansiyonlar ve Bölge Rehberi',
  description:
    'Kaş otel önerileri rehberi: merkez mi yarımada mı, butik oteller, pansiyonlar, sezon farkları, fiyat dengesi ve konaklama ipuçları.',
  alternates: { canonical: '/kas-otel-onerileri' },
  openGraph: {
    url: '/kas-otel-onerileri',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default function KasOtelOnerileriPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Konaklama Rehberi</span>
            <h1 className="kas-tekne-title">Kaş Otel Önerileri: Doğru Otel, Doğru Tatil Ritmi</h1>
            <p className="kas-tekne-lead">
              Kaş’ta konaklama seçimi yalnızca “nerede kalacağım?” sorusunun cevabı değildir; nasıl bir tatil
              yaşayacağınızı belirleyen en kritik karardır. Burada otel, çoğu zaman yalnızca oda değil; sabah
              kahvaltısındaki sohbet, gün batımı manzarası ve günün temposunu belirleyen ana parçadır.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş otel önerileri öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#bolgeler" className="kas-tekne-primary-link">
                Bölgeleri İncele
              </a>
              <a href="#karar-rehberi" className="kas-tekne-secondary-link">
                Nasıl Seçilir?
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>Merkez</strong>
              <span>Sosyal ve yürünebilir tatil</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Yarımada</strong>
              <span>Sessizlik ve manzara odağı</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Erken rezervasyon</strong>
              <span>Küçük işletmeler hızlı dolar</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş konaklama hızlı özet">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.title} className="kas-tekne-surface kas-tekne-summary-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="kas-tekne-stack">
          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Konaklama yaklaşımı</span>
            <h2>Kaş’ta kaldığınız yer, tatilin fonu değil doğrudan deneyimin kendisidir</h2>
            <p>
              Kaş’ı birçok tatil beldesinden ayıran şey, büyük zincir otellerin ve kitlesel turizmin baskın olmamasıdır.
              Bunun yerine daha küçük, daha karakter sahibi, çoğu zaman aile işletmesi olan butik oteller ve pansiyonlar
              öne çıkar. Bu da konaklamayı daha kişisel, daha sıcak ve daha gerçek hale getirir.
            </p>
            <p>
              Burada seçtiğiniz otel yalnızca odanın kalitesini belirlemez; sabah nasıl uyanacağınızı, akşam nerede
              vakit geçireceğinizi ve tatilin ne kadar hareketli ya da dingin hissedileceğini de belirler.
            </p>
          </article>

          <article id="bolgeler" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Bölgeler</span>
            <h2>Kaş’ın konaklama coğrafyasını anlamadan doğru seçim yapmak zor</h2>
            <div className="kas-tekne-route-grid">
              {REGION_CARDS.map((region) => (
                <section key={region.title} className="kas-tekne-route-card">
                  <h3>{region.title}</h3>
                  <p>{region.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Merkez mi yarımada mı?</span>
            <h2>İki ana bölge, iki farklı tatil dili sunar</h2>
            <p>
              Kaş merkezde kalmak; restoranlar, barlar, küçük dükkanlar ve limanın tam ortasında olmak demektir.
              Yürüme mesafesi, spontane planları kolaylaştırır ve daha sosyal bir tatil ritmi yaratır. Buna karşılık
              yaz aylarında yoğunluk ve akşam gürültüsü daha görünür olabilir.
            </p>
            <p>
              Çukurbağ Yarımadası ise daha yavaş, daha sessiz ve daha manzaralı bir Kaş sunar. Gün batımı, özel plaj
              hissi ve daha sakin teraslar burada öne çıkar. Ama bu konforun karşılığında ulaşım esnekliği azalabilir;
              araçsız hareket etmek daha sınırlayıcı olabilir.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Konaklama türleri</span>
            <h2>Kaş’ta hangi tarz konaklama sana daha yakın?</h2>
            <div className="kas-tekne-type-grid">
              {STAY_TYPES.map((type) => (
                <section key={type.title} className="kas-tekne-type-card">
                  <h3>{type.title}</h3>
                  <p>{type.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Fiyat ve sezon</span>
            <h2>Konaklama bütçesini en çok ne değiştirir?</h2>
            <ul className="kas-tekne-checklist">
              {PRICE_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="kas-tekne-support-note">
              Kaş’ta küçük ölçekli işletmeler baskın olduğu için iyi seçenekler özellikle yoğun sezonda hızlı dolar;
              bu yüzden erken rezervasyon burada konfordan çok erişim meselesidir.
            </p>
          </article>

          <article id="karar-rehberi" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Karar rehberi</span>
            <h2>Kaş’ta otel seçerken asıl önemli olan şey ne?</h2>
            <ul className="kas-tekne-checklist">
              {DECISION_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p>
              Kaş’ta “en iyi otel” diye tek bir cevap yoktur. Burada daha doğru soru şudur: nasıl bir tatil istiyorsun?
              Bunu netleştirdiğinde doğru bölge ve doğru otel tipi zaten çok daha görünür hale gelir.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Kısa sonuç</span>
            <h2>Doğru oteli seçmek, aslında nasıl bir Kaş yaşayacağını seçmektir</h2>
            <p>
              Kaş’ta konaklama klasik bir “oda bulma” sürecinden daha fazlasıdır. Her sokağın başka bir ritmi, her
              terasın başka bir manzarası ve her işletmenin başka bir karakteri vardır. Bu yüzden burada doğru otel,
              yalnızca iyi yorum alan yer değil; senin tatil beklentine en çok uyan yerdir.
            </p>
            <Link href="/kas-tatil-rehberi" className="kas-tekne-text-link">
              Genel tatil planı için rehbere geç
            </Link>
          </article>
        </section>

        <section className="kas-tekne-discovery">
          <div className="kas-tekne-discovery-shell">
            <h2>Daha Fazla Keşif</h2>
            <div className="kas-tekne-discovery-grid">
              {INTERNAL_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="kas-tekne-discovery-card">
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  <span>Sayfaya git</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Otel Önerileri', 'https://www.kasguide.de/kas-otel-onerileri')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
