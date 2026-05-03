import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const HERO_CHIPS = ['Serpme ve modern seçenekler', 'Bahçe ve deniz manzarası', 'Yavaş sabah ritmi'] as const

const SUMMARY_CARDS = [
  {
    title: 'Nasıl bir deneyim?',
    text: 'Kaş’ta kahvaltı yalnızca masaya gelen ürünlerden ibaret değil; acele etmeden, uzun sohbetlerle güne yayılmış bir başlangıç hissi sunuyor.',
  },
  {
    title: 'İki ana tarz',
    text: 'Bölgede en sık iki yaklaşım öne çıkıyor: klasik serpme kahvaltı sunan mekanlar ve omlet, bowl, pancake, kahve odaklı modern kahvaltı kafeleri.',
  },
  {
    title: 'Ne zaman daha keyifli?',
    text: 'Özellikle yaz aylarında sabah erken saatler hem daha serin hem daha sakin oluyor. Popüler mekanlar öğlene doğru hızlı dolabiliyor.',
  },
] as const

const BREAKFAST_STYLES = [
  {
    title: 'Serpme kahvaltı mekanları',
    text: 'Masaya çeşit çeşit ürün gelir; pişi, sigara böreği, peynirler, zeytinler, domates-salatalık, bal-kaymak, ev yapımı reçeller ve yöresel tatlar bu deneyimin temelini oluşturur.',
  },
  {
    title: 'Modern kahvaltı kafeleri',
    text: 'Omlet çeşitleri, pancake’ler, granola bowl’lar ve kahve çeşitleriyle daha hafif, daha hızlı ama yine keyifli bir sabah kurgusu sunarlar.',
  },
  {
    title: 'Deniz manzaralı başlangıçlar',
    text: 'Denizin hemen yanında yapılan kahvaltı Kaş’ın en çok sevilen sabah ritüellerinden biridir. Bazı mekanlarda kahvaltı günü doğrudan plaj keyfine bağlanır.',
  },
  {
    title: 'Merkezde pratik duraklar',
    text: 'Simit, açma, sandviç ve kahve gibi daha hızlı seçenekler arayanlar için merkezdeki küçük kafeler güçlü ve erişilebilir bir alternatif oluşturur.',
  },
] as const

const VENUE_EXAMPLES = [
  {
    title: 'Dudu Mutfak',
    text: 'Farklı omlet çeşitleri ve ev yapımı ürünleriyle öne çıkan, daha karakterli bir sabah tabağı arayanların dikkatini çeken adreslerden biri.',
  },
  {
    title: 'Miskin Kahvaltı',
    text: 'Doyurucu serpme kahvaltısı ve hızlı servisiyle bilinen, klasik Kaş sabahı yaşamak isteyenler için güçlü bir seçenek.',
  },
  {
    title: 'Mumi Cafe Beach',
    text: 'Denize sıfır konumuyla kahvaltıyı plaj hissiyle birleştirir; sabahı daha ferah ve güne yayılmış yaşamak isteyenlere hitap eder.',
  },
  {
    title: 'Simitçim',
    text: 'Daha hızlı ve pratik bir kahvaltı isteyenler için uygun; özellikle sabah temposunu uzun sofralar yerine kısa bir mola üzerinden kuranlara iyi gelir.',
  },
] as const

const BREAKFAST_TIPS = [
  'Erken gitmek önemli; popüler mekanlar özellikle yaz aylarında hızlı dolabiliyor.',
  'Serpme kahvaltıyı paylaşmak mantıklı; porsiyonlar çoğu zaman birden fazla kişi için yeterli oluyor.',
  'Deniz manzaralı yerlerde rezervasyon ciddi avantaj sağlar.',
  'Yerel ürün kullanan mekanları seçmek deneyimi daha karakterli ve doyurucu hale getirir.',
] as const

const INTERNAL_LINKS = [
  {
    href: '/kas-nerede-ne-yenir',
    title: 'Kaş’ta Nerede Ne Yenir',
    text: 'Kahvaltıdan sonra balık, meyhane ve sokak lezzeti tarafını da aynı rehber içinde karşılaştır.',
  },
  {
    href: '/kas-otel-onerileri',
    title: 'Kaş Otel Önerileri',
    text: 'Kahvaltı deneyimini hangi bölgede yaşamak istediğine göre konaklama tarafını netleştir.',
  },
  {
    href: '/planner',
    title: 'Gezi Planlayıcı',
    text: 'Kahvaltıyı plaj, tekne ve akşam planıyla aynı güne nasıl bağlayacağını görmek için planlayıcıya geç.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş’ta Kahvaltı: Güne Nasıl Başlanır?',
  description:
    'Kaş kahvaltı rehberi: serpme kahvaltı, modern kahvaltı kafeleri, deniz manzaralı mekanlar, öne çıkan örnekler ve pratik sabah ipuçları.',
  alternates: { canonical: '/kas-kahvalti-mekanlari' },
  openGraph: {
    url: '/kas-kahvalti-mekanlari',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default function KasKahvaltiMekanlariPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Sabah Ritmi</span>
            <h1 className="kas-tekne-title">Kaş’ta Kahvaltı: Güne Nasıl Başlanır?</h1>
            <p className="kas-tekne-lead">
              Kaş’ta kahvaltı, sıradan bir öğünden çok daha fazlası. Burası sabahın yavaş aktığı, güne acele etmeden
              başlanan bir yer. Masaya gelen her şeyin bir hikayesi var: ev yapımı reçeller, köy yumurtası, zeytinler,
              taze otlar. Deniz manzarası ya da yemyeşil bir bahçe eşliğinde uzun uzun yapılan kahvaltılar, Kaş
              tatilinin en keyifli ritüellerinden birine dönüşüyor.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş kahvaltı rehberi öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#kahvalti-deneyimleri" className="kas-tekne-primary-link">
                Deneyimleri İncele
              </a>
              <a href="#kahvalti-ipuclari" className="kas-tekne-secondary-link">
                İpuçlarına Geç
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>Serpme</strong>
              <span>Yerel ürün ve uzun masa ritmi</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Modern</strong>
              <span>Omlet, bowl, pancake ve kahve</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Yavaş sabah</strong>
              <span>Acele etmeden başlayan Kaş temposu</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş kahvaltı hızlı özet">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.title} className="kas-tekne-surface kas-tekne-summary-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="kas-tekne-stack">
          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Genel çerçeve</span>
            <h2>Kaş’ta kahvaltı kültürü iki ana hatta ayrılıyor</h2>
            <p>
              Kaş’ta kahvaltı kültürü genel olarak ikiye ayrılır: klasik serpme kahvaltı sunan mekanlar ve daha modern,
              menü bazlı kahvaltı sunan kafeler. Serpme kahvaltılarda masaya çeşit çeşit ürün gelir; pişi, sigara
              böreği, peynirler, zeytinler, domates-salatalık, bal-kaymak gibi klasiklerin yanında ev yapımı reçeller
              ve yöresel tatlar öne çıkar.
            </p>
            <p>
              Özellikle doğal ve organik ürün kullanımı Kaş’ta oldukça yaygındır ve birçok mekan bu konuda iddialıdır.
              Modern kahvaltı mekanlarında ise omlet çeşitleri, pancake’ler, granola bowl’lar ve kahve çeşitleri ön
              plana çıkar. Bu tarz mekanlar genelde daha hafif ve hızlı bir kahvaltı isteyenler için ideal olur; Kaş
              merkezde veya sahil boyunca bu tarz seçenekleri kolayca bulmak mümkündür.
            </p>
          </article>

          <article id="kahvalti-deneyimleri" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Deneyim katmanları</span>
            <h2>Kaş’ta öne çıkan kahvaltı deneyimleri</h2>
            <div className="kas-tekne-route-grid">
              {BREAKFAST_STYLES.map((style) => (
                <section key={style.title} className="kas-tekne-route-card">
                  <h3>{style.title}</h3>
                  <p>{style.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Lezzet detayları</span>
            <h2>Neden bu sofralar akılda kalıyor?</h2>
            <p>
              Kaş’ta kahvaltı denince akla gelen ilk şeylerden biri serpme kahvaltıdır. Özellikle bahçeli ve sakin
              mekanlarda sunulan bu kahvaltılar, tatilin en huzurlu anlarından birine dönüşür. Yumuşacık pişiler, ev
              yapımı reçeller ve yöresel ürünler sofranın yıldızıdır. Bazı mekanlar sadece kahvaltıya odaklanarak
              tamamen bu deneyimi mükemmelleştirmeye çalışır.
            </p>
            <p>
              Diğer tarafta deniz manzaralı mekanlar vardır. Sabah saatlerinde denizin hemen yanında yapılan kahvaltı,
              Kaş’ta en çok tercih edilen deneyimlerden biridir. Bu mekanlar genelde kahvaltıdan sonra gün boyu plaj
              keyfi sunarak tam bir güne yayılmış deneyim yaratır. Kaş merkezde yer alan küçük kafeler ise daha pratik
              ama bir o kadar lezzetli alternatifler sunar.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Mekan örnekleri</span>
            <h2>Öne çıkan bazı kahvaltı durakları</h2>
            <div className="kas-tekne-type-grid">
              {VENUE_EXAMPLES.map((venue) => (
                <section key={venue.title} className="kas-tekne-type-card">
                  <h3>{venue.title}</h3>
                  <p>{venue.text}</p>
                </section>
              ))}
            </div>
            <p className="kas-tekne-support-note">
              Bunun yanında Kaş’ta yerel üreticilerden alınan malzemelerle hazırlanan kahvaltılar da oldukça yaygındır.
              Bazı mekanlar özellikle Ege otları, doğal zeytinler ve bölgeye özgü tatlarla fark yaratır.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Atmosfer</span>
            <h2>Kaş’ta kahvaltının en güçlü tarafı acele yok hissidir</h2>
            <p>
              İnsanlar saatlerce masada oturur, sohbet eder, çay üstüne çay içer. Kahvaltı sadece yemek değil, aynı
              zamanda sosyal bir deneyimdir. Özellikle yaz aylarında sabah erken saatlerde başlayan bu keyif, öğlene
              kadar devam eder.
            </p>
            <p>
              Bahçeli mekanlarda kuş sesleri eşliğinde kahvaltı yapmak ayrı bir huzur sunarken, deniz kenarında yapılan
              kahvaltılar daha enerjik ve ferah bir atmosfer yaratır. Kaş’ın küçük ve samimi yapısı sayesinde nereye
              giderseniz gidin sıcak bir karşılama görmek mümkündür.
            </p>
          </article>

          <article id="kahvalti-ipuclari" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Pratik notlar</span>
            <h2>Kaş’ta kahvaltı yaparken işinize yarayacak kısa ipuçları</h2>
            <ul className="kas-tekne-checklist">
              {BREAKFAST_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Sonuç</span>
            <h2>Kaş’ta kahvaltı neden tatilin unutulmaz bir parçasına dönüşüyor?</h2>
            <p>
              Kaş’ta kahvaltı, tatilin en unutulmaz parçalarından biri. İster bahçede sakin bir kahvaltı yapın, ister
              deniz kenarında güne başlayın; her seçenek kendine özgü bir deneyim sunuyor. Lezzet, doğallık ve atmosfer
              birleşince ortaya çıkan şey sadece bir öğün değil, Kaş’ın ruhunu hissetmenin en güzel yollarından biri
              oluyor.
            </p>
            <Link href="/kas-nerede-ne-yenir" className="kas-tekne-text-link">
              Yeme içme rehberinin tamamına geç
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
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş’ta Kahvaltı', 'https://www.kasguide.de/kas-kahvalti-mekanlari')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
