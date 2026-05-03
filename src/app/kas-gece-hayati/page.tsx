import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const HERO_CHIPS = ['Barlar Sokağı odağı', 'Canlı müzik kültürü', 'Gürültü değil atmosfer'] as const

const SUMMARY_CARDS = [
  {
    title: 'Kaş gecesi nasıl hissettirir?',
    text: 'Büyük kulüplerden çok küçük ama karakter sahibi mekanlarla ilerleyen, daha samimi ve keşif odaklı bir gece sunar.',
  },
  {
    title: 'Asıl fark ne?',
    text: 'Kaş’ta gece hayatı tek bir mekana kapanmaz; yemekle başlar, barlar arasında akar ve herkes kendi rotasını kurar.',
  },
  {
    title: 'Kimler daha çok sever?',
    text: 'Atmosfer, canlı müzik, manzara ve sosyal ama abartısız bir gece arayanlar Kaş gecesine daha hızlı bağlanır.',
  },
] as const

const NIGHT_SPOTS = [
  {
    title: 'Barlar Sokağı',
    text: 'Kaş gecesinin kalbidir. Kısa bir hatta birçok farklı müzik ve mekan tipi bulunduğu için kendi ritmini burada kolayca bulursun.',
  },
  {
    title: 'Canlı müzik mekanları',
    text: 'Jazz, blues, rock ve akustik performanslarla geceyi yalnızca içki değil aynı zamanda sahne deneyimine dönüştürür.',
  },
  {
    title: 'Manzaralı teraslar',
    text: 'Meis’e karşı, deniz manzaralı ve daha yumuşak tempolu akşamlar için Kaş’ın en güçlü saklı kozlarından biridir.',
  },
  {
    title: 'Pub ve sosyal barlar',
    text: 'Daha hareketli, daha kalabalık ve mekanlar arası geçiş hissini güçlendiren gece durakları bu hatta yoğunlaşır.',
  },
] as const

const VENUE_TYPES = [
  {
    title: 'Kokteyl barlar',
    text: 'Sohbet, estetik atmosfer ve daha rafine bir akşam ritmi isteyenler için öne çıkar.',
  },
  {
    title: 'Canlı müzik sahneleri',
    text: 'Geceyi bir performans etrafında yaşamak isteyenler için daha karakterli ve hatırlanır bir deneyim sunar.',
  },
  {
    title: 'Pub ve eğlence barları',
    text: 'Daha sosyal, daha hareketli ve gece ilerledikçe kalabalığın yoğunlaştığı alanlardır.',
  },
  {
    title: 'Gün batımı ve plaj konseptleri',
    text: 'Akşamı sert başlatmak istemeyen, geçişi daha yumuşak yaşamak isteyenler için ideal ilk duraktır.',
  },
] as const

const NIGHT_FLOW = [
  'Gün batımında sahil ya da terasa geçiş',
  'Uzun bir akşam yemeği ile geceye giriş',
  'Barlar Sokağı tarafına yürüyüş',
  'Mekandan mekana geçerek kendi ritmini bulma',
  '00:00 sonrası hareketin artması',
  'Sabaha karşı kalabalığın yavaşça dağılması',
] as const

const NIGHT_NOTES = [
  'Kaş’ta eğlence yüksek ses değil, doğru atmosferi bulma meselesidir.',
  'Mekanlar küçük olduğu için spontane keşif çoğu zaman planlı geceye göre daha keyifli olur.',
  'Tek bir müzik tarzı baskın değildir; birkaç sokak içinde farklı ritimler arasında geçiş yapabilirsiniz.',
  'Geceyi daha manzaralı yaşamak istiyorsanız başlangıcı teras veya sahil hattında yapmak iyi çalışır.',
] as const

const INTERNAL_LINKS = [
  {
    href: '/kas-nerede-ne-yenir',
    title: 'Nerede Ne Yenir',
    text: 'Geceye iyi bir yemekle başlamak istiyorsan önce yeme-içme tarafına bak.',
  },
  {
    href: '/kas-otel-onerileri',
    title: 'Otel Önerileri',
    text: 'Merkezde kalmanın gece hayatına erişimi nasıl değiştirdiğini konaklama rehberiyle birlikte düşün.',
  },
  {
    href: '/kas-kahvalti-mekanlari',
    title: 'Kaş Kahvaltı',
    text: 'Geceyi uzun yaşadıysan ertesi sabahı nerede toparlayacağını da planla.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş Gece Hayatı | Barlar, Canlı Müzik ve Atmosfer Rehberi',
  description:
    'Kaş gece hayatı rehberi: Barlar Sokağı, canlı müzik, manzaralı teraslar, mekan türleri ve Kaş gecesinin ritmi.',
  alternates: { canonical: '/kas-gece-hayati' },
  openGraph: {
    url: '/kas-gece-hayati',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default function KasGeceHayatiPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Gece Rehberi</span>
            <h1 className="kas-tekne-title">Kaş Gece Hayatı: Gürültü Değil, Atmosfer Arayanların Yeri</h1>
            <p className="kas-tekne-lead">
              Kaş’ta gece hayatını anlamanın en doğru yolu, onu klasik parti destinasyonlarıyla kıyaslamamaktır. Burası
              dev kulüplerin değil; küçük barların, canlı müziğin, manzaralı terasların ve mekanlar arasında organik
              şekilde akan gecelerin yeridir. Kaş gecesi, yüksek sesten çok doğru ortamı bulmakla ilgilidir.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş gece hayatı öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#mekanlar" className="kas-tekne-primary-link">
                Mekanları İncele
              </a>
              <a href="#gece-akisi" className="kas-tekne-secondary-link">
                Gece Nasıl Akar?
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>Barlar Sokağı</strong>
              <span>Gece hareketinin ana hattı</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Canlı müzik</strong>
              <span>Jazz, blues, rock, akustik</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Atmosfer</strong>
              <span>Samimiyet ve keşif ön planda</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş gece hayatı hızlı özet">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.title} className="kas-tekne-surface kas-tekne-summary-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="kas-tekne-stack">
          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Temel mantık</span>
            <h2>Kaş’ta gece hayatı sabit değil, akış halinde yaşanır</h2>
            <p>
              Akşam yemeğiyle başlayan gece, çoğu zaman tek bir mekanda kalmaz. İnsanlar barlar arasında geçiş yapar,
              müzik değişir, tempo değişir ve herkes kendi eğlence rotasını kendisi kurar. Bu organik akış, Kaş gecesini
              diğer turistik bölgelerin daha tekdüze kulüp düzeninden ayırır.
            </p>
            <p>
              Burada amaç “en yüksek sesli” yeri bulmak değil; o gece sana iyi gelecek atmosferi yakalamaktır. Bu da
              Kaş’ı daha sosyal, daha samimi ve daha keşif odaklı hissettirir.
            </p>
          </article>

          <article id="mekanlar" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Mekan haritası</span>
            <h2>Kaş gecesinde öne çıkan duraklar</h2>
            <div className="kas-tekne-route-grid">
              {NIGHT_SPOTS.map((spot) => (
                <section key={spot.title} className="kas-tekne-route-card">
                  <h3>{spot.title}</h3>
                  <p>{spot.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Barlar Sokağı</span>
            <h2>Kaş gecesinin kalbi neden burada atıyor?</h2>
            <p>
              Barlar Sokağı küçük ama yoğun bir alanda çok farklı müzik ve mekan tipini bir araya getirir. Birkaç adımda
              rock’tan akustiğe, oradan daha ritmik bir bara geçebilmek Kaş’ın en güçlü gece avantajlarından biridir.
            </p>
            <p>
              Gecenin ilerleyen saatlerinde sokak daha da canlanır ve insanlar tek bir yere kapanmak yerine mekanlar
              arasında dolaşarak kendi akşam senaryosunu kurar. Kaş’ın “keşif” duygusu en net burada hissedilir.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Mekan türleri</span>
            <h2>Kaş’ta hangi gece tipi sana daha yakın?</h2>
            <div className="kas-tekne-type-grid">
              {VENUE_TYPES.map((type) => (
                <section key={type.title} className="kas-tekne-type-card">
                  <h3>{type.title}</h3>
                  <p>{type.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Canlı müzik ve manzara</span>
            <h2>Kaş’ta geceyi özel yapan şey yalnızca içki değil, sahne ve manzaradır</h2>
            <ul className="kas-tekne-checklist">
              {NIGHT_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="kas-tekne-support-note">
              Özellikle küçük sahnelerde müzisyenle arandaki mesafenin azalması ve Meis’e karşı içilen bir içkinin
              kattığı atmosfer, Kaş gecesini daha hissedilir hale getirir.
            </p>
          </article>

          <article id="gece-akisi" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Gece akışı</span>
            <h2>Kaş’ta gece genellikle nasıl başlar, nasıl biter?</h2>
            <ol className="kas-tekne-timeline">
              {NIGHT_FLOW.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="kas-tekne-support-note">
              Kaş gecesi planlamaktan çok yaşamaya uygundur; en iyi akşamlar çoğu zaman en az kasılmış olanlardır.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Kısa sonuç</span>
            <h2>Kaş gece hayatı herkese göre olmayabilir ama doğru beklentiyle çok güçlüdür</h2>
            <p>
              Eğer aradığın şey dev kulüpler, tek tip müzik ve kesintisiz gürültüyse Kaş sana hafif gelebilir. Ama
              karakteri olan, ruhu olan, bir sokaktan diğerine değişen ve seni içine çeken bir gece istiyorsan Kaş tam
              olarak bu yüzden unutulmaz olur.
            </p>
            <Link href="/kas-otel-onerileri" className="kas-tekne-text-link">
              Geceye yakın konaklama için otel önerilerine geç
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
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Gece Hayatı', 'https://www.kasguide.de/kas-gece-hayati')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
