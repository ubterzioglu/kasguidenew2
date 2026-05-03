import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const HERO_CHIPS = ['20-30 metre görüş', '30+ dalış noktası', 'Başlangıçtan ileri seviyeye'] as const

const SUMMARY_CARDS = [
  {
    title: 'Kimler için doğru seçim?',
    text: 'İlk kez tüplü dalış denemek isteyenler, sertifikalı dalgıçlar ve Kaş’ı su altından tanımak isteyen herkes için güçlü bir seçenek.',
  },
  {
    title: 'Neden bu kadar özel?',
    text: 'Berrak su, kısa tekne transferleri, zengin deniz yaşamı ve batıklarla birleşen tarihsel katman Kaş’ı Türkiye’de ayrı bir yere koyar.',
  },
  {
    title: 'En iyi dönem',
    text: 'Sezon genelde Nisan-Kasım arasında sürer. Yazın su sıcaklığı ideal, bahar ve sonbaharda ise görüş çoğu zaman daha sakindir.',
  },
] as const

const DIVE_SITE_CARDS = [
  {
    title: 'Kaş Kanyonu',
    text: 'İki kaya duvarı arasında süzülme hissi veren, dramatik yapısıyla Kaş’ın en karakterli dalışlarından biridir.',
  },
  {
    title: 'Dimitri Batığı',
    text: 'Batık deneyimi arayan ileri seviye dalgıçlar için daha teknik ve keşif duygusu yüksek bir duraktır.',
  },
  {
    title: 'Resif ve kaya dalışları',
    text: 'Mercan oluşumları, oyuklar ve balık sürüleriyle daha yumuşak ama görsel olarak tatmin edici bir rota sunar.',
  },
  {
    title: 'Mağara ve tünel hatları',
    text: 'Her dalışta farklı bir hikaye hissi yaratan bu alanlar, Kaş’ın su altı çeşitliliğini en net gösteren bölümlerdendir.',
  },
] as const

const DIVE_TYPE_CARDS = [
  {
    title: 'Deneme dalışı',
    text: 'Daha önce hiç dalış yapmamış olanlar için eğitmen eşliğinde güvenli ve kontrollü ilk temas deneyimidir.',
  },
  {
    title: 'Sertifikalı günlük dalış',
    text: 'Brövesi olan dalgıçlar için aynı gün içinde birden fazla noktayı görmeye uygun standart Kaş kurgusudur.',
  },
  {
    title: 'Eğitim ve sertifika programları',
    text: 'Kaş’taki merkezlerde PADI gibi uluslararası geçerliliği olan eğitimlerle seviyenizi sistemli şekilde ilerletebilirsiniz.',
  },
  {
    title: 'İleri seviye keşif dalışları',
    text: 'Batık, derinlik ve özel topoğrafya ilgisi olan tecrübeli dalgıçlar için daha seçici rotalar planlanabilir.',
  },
] as const

const MARINE_LIFE = [
  'Rengarenk balık sürüleri ve kaya çevresinde yoğun hareket',
  'Orfoz, ahtapot, müren ve zaman zaman caretta caretta karşılaşmaları',
  'Mercan oluşumları ve ışığa göre sürekli değişen su altı renkleri',
  'Batıklar, amforalar ve enkazlarla birleşen tarih hissi',
] as const

const BEGINNER_TIPS = [
  'Deneme dalışında temel nefes, denge ve ekipman kullanımı kısa brifingle anlatılır.',
  'Kıyıya yakın noktalar ve kısa tekne transferleri ilk deneyimde konfor sağlar.',
  'Uluslararası sertifika düşünüyorsanız merkezlerin eğitim dili ve program yoğunluğunu önceden sorun.',
  'Kalabalık yerine daha sakin deneyim istiyorsanız yoğun sezon dışında tarih bakın.',
] as const

const INTERNAL_LINKS = [
  {
    href: '/kas-tekne-turu',
    title: 'Kaş Tekne Turu',
    text: 'Dalış gününü deniz üstü bir rota ile tamamlamak istersen tekne tarafına geç.',
  },
  {
    href: '/kas-koylari',
    title: 'Kaş Koyları',
    text: 'Su üstünden keşfetmek isteyeceğin sakin koyları ve berrak durakları karşılaştır.',
  },
  {
    href: '/kas-yapilacak-aktiviteler',
    title: 'Diğer Aktiviteler',
    text: 'Dalışı yürüyüş, plaj ve akşam planlarıyla birleştirmek için ek fikirler al.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş’ta Dalış: Akdeniz’in Sualtı Cenneti',
  description:
    'Kaş dalış rehberi: 20-30 metre görüş, 30’dan fazla dalış noktası, batıklar, deneme dalışları, sezon bilgileri ve sertifika seçenekleri.',
  alternates: { canonical: '/kas-dalis-noktalari' },
  openGraph: {
    url: '/kas-dalis-noktalari',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default function KasDalisNoktalariPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Suyun Altında Kaş</span>
            <h1 className="kas-tekne-title">Kaş’ta Dalış: Akdeniz’in Sualtı Cenneti</h1>
            <p className="kas-tekne-lead">
              Kaş, yalnızca yüzeydeki güzelliğiyle değil, su altındaki zenginliğiyle de Türkiye’nin en özel dalış
              destinasyonlarından biri. Berrak Akdeniz suları, çoğu zaman 20–30 metreye ulaşan görüş mesafesi ve kısa
              tekne transferleri sayesinde hem yeni başlayanlara hem de deneyimli dalgıçlara çok erişilebilir bir
              deneyim sunuyor.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş dalışı öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#dalis-noktalari" className="kas-tekne-primary-link">
                Noktaları İncele
              </a>
              <a href="#ilk-dalis" className="kas-tekne-secondary-link">
                İlk Dalış İçin Bak
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>20-30 m</strong>
              <span>Çoğu gün güçlü görüş mesafesi</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>30+ nokta</strong>
              <span>Farklı seviyelere uygun rota</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Nisan-Kasım</strong>
              <span>Uzun ve esnek dalış sezonu</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş dalış hızlı özet">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.title} className="kas-tekne-surface kas-tekne-summary-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="kas-tekne-stack">
          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Neden özel?</span>
            <h2>Kaş’ta dalış, doğa ve tarihin aynı hatta birleştiği nadir deneyimlerden biridir</h2>
            <p>
              Suyun altına indiğiniz anda sizi yalnızca berrak bir deniz değil; balık sürüleri, kaya oluşumları,
              mercan dokuları ve farklı ışık katmanları karşılar. Kaş’ı farklı yapan asıl şey, bu doğal zenginliğin
              tek başına kalmaması; batıklar, amfora izleri ve enkazlarla tarihsel bir derinlik kazanmasıdır.
            </p>
            <p>
              Bu yüzden Kaş’ta dalış yalnızca sportif bir aktivite gibi hissedilmez. Her iniş, bazen canlılık bazen
              sessizlik bazen de keşif duygusuyla farklılaşan küçük bir su altı yolculuğuna dönüşür.
            </p>
          </article>

          <article id="dalis-noktalari" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Dalış noktaları</span>
            <h2>Kaş’ta öne çıkan dalış deneyimleri</h2>
            <div className="kas-tekne-route-grid">
              {DIVE_SITE_CARDS.map((spot) => (
                <section key={spot.title} className="kas-tekne-route-card">
                  <h3>{spot.title}</h3>
                  <p>{spot.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Su altı yaşamı</span>
            <h2>Karşılaşabileceğiniz şey yalnızca manzara değil</h2>
            <ul className="kas-tekne-checklist">
              {MARINE_LIFE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Kaş’ta aynı dalış içinde hem doğal yaşam hem de tarihsel izlerle karşılaşabilmek, bölgeyi Türkiye içinde
              ayrıcalıklı hale getiriyor.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Seviyeler</span>
            <h2>Hangi dalış tipi sana daha uygun?</h2>
            <div className="kas-tekne-type-grid">
              {DIVE_TYPE_CARDS.map((type) => (
                <section key={type.title} className="kas-tekne-type-card">
                  <h3>{type.title}</h3>
                  <p>{type.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article id="ilk-dalis" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">İlk kez dalacaklar için</span>
            <h2>Kaş, başlangıç seviyesi için neden bu kadar rahat?</h2>
            <ul className="kas-tekne-checklist">
              {BEGINNER_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <p className="kas-tekne-support-note">
              Bölgedeki merkezlerin çoğu discovery dive formatında yeni başlayanlara güvenli bir giriş sunar; ilerlemek
              isteyenler için sertifika programları da aynı ekosistemde devam eder.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Sezon</span>
            <h2>Kaş’ta dalış için ne zaman gelmeli?</h2>
            <p>
              Dalış sezonu genellikle Nisan ayında başlar ve Kasım ayına kadar devam eder. Yaz aylarında su sıcaklığı
              daha konforludur ve deniz günü hissi zirveye çıkar. Bahar ve sonbaharda ise su altı görüşü çoğu zaman çok
              temiz kalır; bu da daha sakin ve dengeli bir deneyim arayanlar için önemli avantajdır.
            </p>
            <p>
              Kısacası en “iyi” dönem hedefinize göre değişir: sıcak ve canlı atmosfer istiyorsanız yaz, daha dingin bir
              dalış ritmi istiyorsanız sezon kenarları daha güçlü hissettirebilir.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Kısa karar</span>
            <h2>Kaş’ta dalış kime unutulmaz gelir?</h2>
            <p>
              Eğer su altını ilk kez görmek istiyor, berraklık senin için önemliyse veya tek tatilde hem doğa hem keşif
              hem de hafif tarih hissi arıyorsan Kaş çok güçlü bir başlangıç noktasıdır. Deneyimli dalgıçlar içinse
              çeşitlilik ve tekrar gelme isteği yaratan şey tam olarak budur: her dalış aynı görünmez.
            </p>
            <Link href="/kas-tekne-turu" className="kas-tekne-text-link">
              Deniz üstü plan için tekne turuna geç
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
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Dalış Noktaları', 'https://www.kasguide.de/kas-dalis-noktalari')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
