import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const BOAT_TOUR_IMAGES = [
  'https://images.openai.com/static-rsc-4/-krA9B_T-VC7Y9ELuCFjaKmNudHcTk23qRSzm7-9BrwcFFlepCXYX213igFbwKdfg6LasoIuqP4BipaBDaLC7XdyM73IoX_-uHhV7pPm4qrcGm96K3-f6J4sW_DwDdXhNxiFF-LBCQh_RcE_7VxNY8Q72aU3qSOZNL8qGUkOi_NLT_Us0aQpO74OipvELAvk?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/YhP_wdXI2Z9d29LGWHn783ovwYvFmmBE3B48nt4DtUS8C8ZHCQq77QDqUe0lzi1krsb_UV8GwxCfNri5Zl1408UJgHD-BtE_4kZs16z0kpC8lP9SNFFf-t5D6diP75FSuSsAVBjiMkdrU17hinFvMC1xSahymdW1dLvC3-Ia47E4hptVQxlqTyrtEdIC3DeT?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/nG8f__U0Yj-9tB-uQDYgue3d6tyY1BDcOHf90B12JymgeryzppOhl-trdoEsJfzZSunBCQQX4Yl_UOYb1sgHn7vI41PzSeK7rVSBbFtJamxBdip80mOO_jn1Tfm684FUP1TGSbEkxCexGD9SlSZ-evbw6FWodXf8q2wKwLvGF4N6NvBQJ7SmehMSUGoF3SAf?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/pIkp46vsSWTxAqO6Vem8yQpl42yIZ1Cmx-s9zo2Mjdhsu1Ro2ZVTz4tbZoWfh3l_xwuXG-vSw1g5xMM9XWD4oIMg43mossoF2vd9kST36awhnvlW5exI5P9UL5r2pIe8hXZ9vQnM5WSnQAwIve4Jecr-Cxr7OWMYGTs7VtQq63bWbE3uSwgP01gizs_QTYtq?purpose=fullsize',
] as const

const HERO_CHIPS = ['Tam gün deneyim', 'Kekova ve koy rotaları', 'İlk kez gelenler için ideal'] as const

const SUMMARY_CARDS = [
  {
    title: 'Kimler için doğru seçim?',
    text: 'Deniz günü planlamak, kara yolu ile ulaşılmayan koyları görmek ve Kaş’ın ritmini sakin şekilde yaşamak isteyenler için en güçlü aktivite.',
  },
  {
    title: 'Tipik tur akışı',
    text: 'Sabah limandan çıkış, gün içinde 3-5 yüzme molası, teknede öğle yemeği ve akşamüstü merkeze dönüş şeklinde ilerler.',
  },
  {
    title: 'En iyi dönem',
    text: 'Haziran-Ekim arası su sıcaklığı ve deniz keyfi açısından en dengeli dönemdir. Temmuz-Ağustos daha canlı, Eylül daha huzurludur.',
  },
] as const

const ROUTE_CARDS = [
  {
    title: 'Kekova ve Batık Şehir',
    text: 'Tarihi kalıntıları denizden görme, geniş koy durakları ve klasik Kaş deneyimini tek günde toplama açısından en ikonik rota.',
  },
  {
    title: 'Akvaryum Koyu',
    text: 'Cam gibi su, şnorkel için yüksek görünürlük ve fotoğraf açısından güçlü bir yüzme molası isteyenler burada en çok keyif alır.',
  },
  {
    title: 'Limanağzı koyları',
    text: 'Kaş merkezine yakın, korunaklı ve dingin yüzme noktaları arayanlar için kısa ama çok tatmin edici duraklar sunar.',
  },
  {
    title: 'Ufakdere ve sakin duraklar',
    text: 'Daha az bilinen, daha doğal kalan ve kalabalıktan uzaklaşma hissini güçlendiren alternatif koylar bu hatta toplanır.',
  },
] as const

const TOUR_TYPES = [
  {
    title: 'Paylaşımlı günlük tur',
    text: 'Fiyat-performans odaklıdır. İlk kez gelenler, kısa tatil yapanlar ve klasik Kaş tekne günü yaşamak isteyenler için iyi başlangıçtır.',
  },
  {
    title: 'Özel tekne turu',
    text: 'Saat, rota ve tempo tamamen size göre şekillenir. Çiftler, aileler ve kendi grubuyla daha sakin bir gün planlayanlar için idealdir.',
  },
  {
    title: 'Gün batımı çıkışı',
    text: 'Daha kısa ama daha atmosferik bir deneyim sunar. Akşam ışığı, hafif müzik ve sakin deniz isteyenler tarafından tercih edilir.',
  },
  {
    title: 'Konaklamalı mavi tur',
    text: 'Kaş çevresini tek günde tüketmek istemeyenler için daha geniş bir deniz tatili kurgusudur. Zamanı olanlar için daha derin deneyim sunar.',
  },
] as const

const DAY_PLAN = [
  '09:30 civarı Kaş limanından hareket ve kısa rota bilgilendirmesi',
  'İlk koyda yüzme molası ve güverteye yayılma',
  'Gün içinde 3-5 farklı durakta yüzme, şnorkel ve dinlenme',
  'Teknede öğle yemeği, ardından meyve veya çay ikramı',
  'Akşamüstü merkeze dönüş ve çarşı-akşam yemeği ile günü tamamlama',
] as const

const BOOKING_TIPS = [
  'Yoğun sezonda özellikle özel tekne için 2-5 gün önceden rezervasyon avantaj sağlar.',
  'Sessiz bir gün istiyorsanız rota kadar tekne kapasitesini de sorun.',
  'Gölgelik alan, duş, tuvalet ve yemek içeriğini rezervasyon öncesi netleştirin.',
  'Eylül ayında deniz sıcak kalırken kalabalık biraz daha dengelenir.',
] as const

const INTERNAL_LINKS = [
  {
    href: '/kas-koylari',
    title: 'Kaş Koyları',
    text: 'Tekneyle ulaşınca daha anlamlı hale gelen koyları ve deniz duraklarını karşılaştır.',
  },
  {
    href: '/kas-dalis-noktalari',
    title: 'Dalış Noktaları',
    text: 'Tekne günü sonrası su altı deneyimini büyütmek istersen dalış tarafına geç.',
  },
  {
    href: '/kas-yapilacak-aktiviteler',
    title: 'Diğer Aktiviteler',
    text: 'Tekne turunu yürüyüş, plaj ve akşam planıyla birleştirmek için ek fikirler al.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş Tekne Turları: Akdeniz’in En Saf Haliyle Buluşma Deneyimi',
  description:
    'Kaş tekne turları rehberi: Kekova, Batık Şehir, Akvaryum Koyu ve Limanağzı rotaları, fiyat farkları, sezon bilgileri ve rezervasyon ipuçları.',
  alternates: { canonical: '/kas-tekne-turu' },
  openGraph: {
    url: '/kas-tekne-turu',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default function KasTekneTuruPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Denizde Bir Gün</span>
            <h1 className="kas-tekne-title">Kaş Tekne Turları: Akdeniz&apos;in En Saf Haliyle Buluşma Deneyimi</h1>
            <p className="kas-tekne-lead">
              Kaş&apos;ta tekne turu, yalnızca koy gezmek değil; kara kalabalığını arkada bırakıp gün boyunca berrak su,
              sakin ritim ve denizden açılan bir Kaş perspektifi yaşamak demektir. İlk kez gelenler için en güçlü
              başlangıç aktivitelerinden biridir.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş tekne turu öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#tekne-turu-plani" className="kas-tekne-primary-link">
                Turu Nasıl Planlarsın?
              </a>
              <a href="#tekne-turu-rotalari" className="kas-tekne-secondary-link">
                Rotaları İncele
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>Tam gün</strong>
              <span>Genelde 7-8 saatlik rota</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>3-5 durak</strong>
              <span>Yüzme ve dinlenme molaları</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Koy odaklı</strong>
              <span>Kara yolu ile zor ulaşılan noktalar</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş tekne turu hızlı özet">
          {SUMMARY_CARDS.map((card) => (
            <article key={card.title} className="kas-tekne-surface kas-tekne-summary-card">
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="kas-tekne-stack">
          <article className="kas-tekne-surface kas-tekne-article-card">
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-card-copy">
                <span className="kas-tekne-section-kicker">Neden bu kadar seviliyor?</span>
                <h2>Kaş&apos;ta tekne turu, şehrin en net “tatildeyim” hissini veren deneyimidir</h2>
                <p>
                  Kaş&apos;ın coğrafyası nedeniyle birçok koyu kara tarafından görmek mümkün olsa da gerçekten yaşamak için
                  denize açılmak gerekir. Tekne turu, kalabalığı kısa sürede arkada bırakır; gün boyunca berrak sularda
                  yüzme, güvertede dinlenme ve kıyı çizgisini farklı açıdan izleme imkanı sunar.
                </p>
                <p>
                  Özellikle ilk gelişte tekne turu yapmak, Kaş&apos;ın hangi tarafını daha çok sevdiğinizi hızlıca anlamanıza
                  yardım eder: sakin koylar mı, açık deniz hissi mi, daha sosyal tekneler mi, yoksa tamamen size ait özel
                  bir rota mı? Bu yüzden birçok ziyaretçi için tekne günü, tatilin merkez parçasına dönüşür.
                </p>
              </div>
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BOAT_TOUR_IMAGES[0]} alt="Kaş tekne turunda turkuaz koy manzarası" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article id="tekne-turu-rotalari" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Rotalar</span>
            <h2>En çok karşılaşacağınız Kaş tekne turu durakları</h2>
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-route-grid">
                {ROUTE_CARDS.map((route) => (
                  <section key={route.title} className="kas-tekne-route-card">
                    <h3>{route.title}</h3>
                    <p>{route.text}</p>
                  </section>
                ))}
              </div>
              <figure className="kas-tekne-inline-figure kas-tekne-inline-figure-tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BOAT_TOUR_IMAGES[1]} alt="Kaş tekne turu rotasında açık deniz görünümü" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Tur türleri</span>
            <h2>Hangi tekne turu tipi sana daha uygun?</h2>
            <div className="kas-tekne-type-grid">
              {TOUR_TYPES.map((tourType) => (
                <section key={tourType.title} className="kas-tekne-type-card">
                  <h3>{tourType.title}</h3>
                  <p>{tourType.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article id="tekne-turu-plani" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Planlama</span>
            <h2>Tipik bir Kaş tekne günü nasıl akar?</h2>
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-card-copy">
                <ol className="kas-tekne-timeline">
                  {DAY_PLAN.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="kas-tekne-support-note">
                  Çoğu teknede gölgelik alan, duş, tuvalet ve dinlenme bölümü bulunur. Gün sonunda doğrudan merkeze
                  dönüldüğü için akşam yemeği veya çarşı planına rahatça bağlanır.
                </p>
              </div>
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BOAT_TOUR_IMAGES[2]} alt="Kaş tekne turunda güvertede geçen sakin bir an" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Rezervasyon notu</span>
            <h2>Fiyatı ve deneyimi en çok ne değiştirir?</h2>
            <ul className="kas-tekne-checklist">
              <li>Teknenin tipi ve kapasitesi</li>
              <li>Paylaşımlı mı özel mi olduğu</li>
              <li>Yemek ve ikram içeriği</li>
              <li>Yüksek sezonda tarih esnekliği</li>
            </ul>
            <p>
              En ucuz seçenek her zaman en iyi deneyim olmayabilir. Özellikle kalabalık hassasiyetiniz varsa kapasite
              ve oturma düzeni, fiyat kadar belirleyicidir.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-card-copy">
                <span className="kas-tekne-section-kicker">Pratik ipuçları</span>
                <h2>Rezervasyon öncesi kısa kontrol listesi</h2>
                <ul className="kas-tekne-checklist">
                  {BOOKING_TIPS.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BOAT_TOUR_IMAGES[3]} alt="Kaş tekne turu için limandan çıkış hissi" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Kısa karar</span>
            <h2>İlk kez gelen biri için öneri</h2>
            <p>
              Eğer Kaş&apos;ta 2-4 günlük bir plan yapıyorsanız bir günü mutlaka tekne turuna ayırın. Geri kalan günleri
              plaj, merkez yürüyüşü ve akşam yemeği ritmiyle tamamlamak en dengeli ilk ziyaret kurgusudur.
            </p>
            <Link href="/kas-3-gunluk-gezi-plani" className="kas-tekne-text-link">
              3 günlük Kaş planına geç
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
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Tekne Turu', 'https://www.kasguide.de/kas-tekne-turu')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
