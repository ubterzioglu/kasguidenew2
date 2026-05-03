import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const BAY_IMAGES = [
  'https://images.openai.com/static-rsc-4/Yg3S-XlDMjpYlmOfgme7JGqVUH-wEbN3U1ujBJpmgpOHa5ejgjZVrhO3k1umGpKwoKKVLb6Fh3-_kEDP_5zptHwU_dbDnww6uvnH2OIab8MI3qI1KF5RjTSPX5jkZSJy2iEWE7rWF19f9waOI34d8G3tDrXTvMLDkKGiE8_vZ-KIgbi2U40LJsEMLx7yfanN?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/9e8Zq3HgzqtMDyXdt4wq-vvEYFGsRo1BE9H-V1tgcD-3R8gaM3g8Xsxsnu3i3a-O_biUEJWJquxw82J970eIIGI6dTS0XEMxgEXEwKm7bRXU2GjQBcn7A5x9gjY4R7EMJ_rDOJQgtldrLWVenV0A8A5E5kp-sIxN30CoUFtq1lo3kraImhaVPwJenNPQcq_1?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/xuAea_W7Zg7rJP07XNxsfcYlVXIyQ2JgLuTe-wE9p12Fj8Oz2lDfpJnrYrXWmqptm23psIipvQyEgWawiZGRrGBoN7dKOQXD6EOS7fxla7ax9TnvPUwFKub4DWPMBI86c9aralDAsgm75AyMsgcnRt_64JMDalR6xSrY6ii-T1iSMzmwPbKYoWcbfOax7Epf?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/vszoGi7BeV9rwIieyO5JROgHsm2D1khBNTccjNOd23gDpxdg9zgQbHGsz6FS2Le6GYrIDi3e3-Ua_nLQoJpQTnpLigCxjJCrMqp-AhOvWMvkUm9lvgH0wyAyKPxnFqzCAJ63b7SinXzISFi0n0KvEKlle-VpZ-_AwSnQ2QgAqqRDZGcvrANLXHBAfSnPXMaX?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/xUtsswKxD2Nl3_59fk3uNH2O5uvQ0tooy9u3qjvFyYg1fteEp9Fk-FA7x0zGKGaIipG6nJYL6T5CwTOvUqzqGutNc_JTZI_RVjcj7w68Nt_JjD5h8YWiltBDxCfPYPIo4jr1CWL7m_cIDMX4t4aHKOtGQnWnhWshi6TPqmx-v8gEZVs5Om4x3h6b4xkO8srn?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/Y4WqpxZIA7W_XWvNoJVvA3_f1FB6iD16pH213RkXy5psvcJrXTvfEi9Y_McjtXHuum-KfEHNTOMTokF6IdUm_HsrONMQwYoLq12lcsF5_GlcCcXQNnAIbifBmT9-uAef7rEnVWhX4xnDgbovXvDshUcJ8C_LnrSu9HjNy0MxoEuM7F7Yw1lugNIDTFcdT5mK?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/CaguJ1tWO2_23sEgiWbQnauJmm-bbyWYUwiUkIVVRyNt7HlIJtyqNj111XcSCtmkDjp8SuZIXMObO59e0XdWftrQ5GXWuZYpwdx7kZyIvFLp-LRyNgDsGgNDpOoKQL0IW8DKEUVzaF_oa8DX8Z5aPRoEDFMBJ3d6AuNmi5cO0DOKtAkwhOV5SyqOvLMu-5nA?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/Y9Daw3iU7Js9iMLkYM8KG3TJVRNBvvDnFzS6nU5EI7FvODedMsfO392x6aFQJnrHBR3l43TrzOwyiM6NlDJQ2APKh2P_ujkMKvsI4CV_pfXLsPau0WwiAqKD0A9YzjdLbwb48dLUf3-VYkruS2OyUIx_rgMfrdrtmxbuSafuwtfi-788N0vwwrHTk49YB7oA?purpose=fullsize',
] as const

const HERO_CHIPS = ['Doğal ve sakin koylar', 'Tekne ve yürüyüş erişimi', 'Şnorkel ve dalış için güçlü'] as const

const SUMMARY_CARDS = [
  {
    title: 'Neden bu kadar özel?',
    text: 'Kaş koyları, doğanın, tarihin ve denizin birbirine karıştığı daha sakin, daha az dokunulmuş bir kıyı deneyimi sunar.',
  },
  {
    title: 'Nasıl bir deniz yapısı var?',
    text: 'Turkuazdan laciverte uzanan tonlar, berrak su ve çoğu yerde taşlık zemin sayesinde su altı görüşü oldukça yüksektir.',
  },
  {
    title: 'Kimler için iyi?',
    text: 'Kalabalıktan uzak yüzmek, tekneyle keşfe çıkmak, şnorkel yapmak ya da sadece doğayla baş başa kalmak isteyenler için çok güçlü bir rota.',
  },
] as const

const FEATURED_BAYS = [
  {
    title: 'Hidayet Koyu',
    text: 'Merkeze yakın konumu sayesinde kolay ulaşılır. Kayalık yapısı nedeniyle klasik kumsal hissi vermez ama berrak suyu ve dalış potansiyeliyle öne çıkar.',
  },
  {
    title: 'Limanağzı Koyu',
    text: 'Kaş merkezine en yakın doğal koylardan biridir. Yürüyerek ya da tekneyle ulaşılabilir; tarihi izler ile doğal güzellik burada iç içe geçer.',
  },
  {
    title: 'Çoban Koyu',
    text: 'Yerel halkın daha çok tercih ettiği, doğal yapısını koruyan ve daha sakin bir deniz günü arayanlara hitap eden koylardan biridir.',
  },
  {
    title: 'Ufakdere (Fakdere) Koyu',
    text: 'Ulaşımı daha zor olduğu için bakir kalmayı başarmış, sessizlik ve keşif hissi arayanlara daha güçlü karşılık veren bir duraktır.',
  },
  {
    title: 'Muar Koyu',
    text: 'Su altı zenginliğiyle bilinir. Şnorkelle keşif yapmak isteyenler için Kaş çevresindeki en keyifli seçeneklerden biri gibi hissedilir.',
  },
] as const

const BOAT_ONLY_BAYS = [
  {
    title: 'Fırnaz Koyu',
    text: 'Çam ormanlarıyla çevrili yapısı ve sakin atmosferi sayesinde Kaş’ın daha saf ve yavaş ritimli doğasını hissettirir.',
  },
  {
    title: 'Yağlıca Koyu',
    text: 'El değmemiş hissi ve kristal berraklığındaki suyu ile doğayla baş başa kalmak isteyenler için en güçlü tekne duraklarından biridir.',
  },
] as const

const BAY_EXPERIENCES = [
  'Bazı koylar tamamen dinlenme ve huzur odaklıdır.',
  'Bazı koylar macera, keşif ve ulaşım zorluğu nedeniyle daha özel hissettirir.',
  'Şnorkel, dalış ve yüzme için güçlü koylarla yalnızca manzara odaklı duraklar yan yana bulunur.',
  'Tekne turu, kamp, kısa yüzme molası veya tüm günü denizde geçirme gibi çok farklı kullanım biçimleri mümkündür.',
] as const

const INTERNAL_LINKS = [
  {
    href: '/kas-tekne-turu',
    title: 'Kaş Tekne Turu',
    text: 'Koyları en verimli şekilde görmek için tekne rotalarını ve tam gün planını karşılaştır.',
  },
  {
    href: '/kas-en-guzel-plajlar',
    title: 'Kaş Plajları',
    text: 'Koylarla birlikte daha kolay erişilen plaj tarafını da görmek istersen bu rehbere geç.',
  },
  {
    href: '/kas-dalis-noktalari',
    title: 'Dalış Noktaları',
    text: 'Berrak su ve su altı görünürlüğü ilgini çekiyorsa dalış tarafında detaylı keşfe devam et.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş Koyları: Akdeniz’in Saklı Cennetleri',
  description:
    'Kaş koyları rehberi: Hidayet, Limanağzı, Çoban, Ufakdere, Muar, Kekova hattı ve tekneyle ulaşılan saklı koylar.',
  alternates: { canonical: '/kas-koylari' },
  openGraph: {
    url: '/kas-koylari',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default function KasKoylariPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Kıyı Boyunca Keşif</span>
            <h1 className="kas-tekne-title">Kaş Koyları: Akdeniz’in Saklı Cennetleri</h1>
            <p className="kas-tekne-lead">
              Antalya’nın en özel destinasyonlarından biri olan Kaş, sadece bir tatil beldesi değil; aynı zamanda
              doğanın, tarihin ve denizin kusursuz bir birleşimidir. Kaş koyları ise bu güzelliğin en saf, en
              dokunulmamış halini sunar. Kaş ile Demre arasında uzanan kıyı şeridi boyunca onlarca farklı koy bulunur
              ve her biri kendine özgü karakteriyle ziyaretçilerine farklı bir deneyim yaşatır.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş koyları rehberi öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#one-cikan-koylar" className="kas-tekne-primary-link">
                Koyları İncele
              </a>
              <a href="#kekova-hatti" className="kas-tekne-secondary-link">
                Kekova Hattına Geç
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>Doğal yapı</strong>
              <span>Daha az dokunulmuş kıyı çizgisi</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Berrak su</strong>
              <span>Şnorkel ve dalış için yüksek görünürlük</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Farklı erişim</strong>
              <span>Yol, yürüyüş ve tekne kombinasyonu</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş koyları hızlı özet">
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
                <span className="kas-tekne-section-kicker">Genel karakter</span>
                <h2>Kaş koylarını özel yapan şey büyük ölçüde doğal kalmış olmaları</h2>
                <p>
                  Birçoğuna kara yolu ile ulaşım oldukça zor, hatta bazılarına sadece tekneyle ulaşılabilir. Bu da Kaş
                  koylarını kalabalıktan uzak, daha sakin ve huzurlu bir kaçış noktası haline getirir. Turkuazdan
                  laciverte uzanan deniz tonları, berrak su yapısı ve taşlık zemin sayesinde su altı görüşü oldukça
                  yüksektir.
                </p>
                <p>
                  Bu nedenle bölge yalnızca yüzme için değil, aynı zamanda dalış ve şnorkel için de son derece
                  uygundur. Kaş’ta koy deneyimi, klasik plaj gününden çok daha fazla keşif ve doğayla temas hissi
                  taşır.
                </p>
              </div>
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BAY_IMAGES[0]} alt="Kaş kıyı şeridinde berrak suya açılan sakin koy görünümü" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article id="one-cikan-koylar" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Öne çıkan koylar</span>
            <h2>İlk bakışta en çok öne çıkan Kaş koyları</h2>
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-route-grid">
                {FEATURED_BAYS.map((bay) => (
                  <section key={bay.title} className="kas-tekne-route-card">
                    <h3>{bay.title}</h3>
                    <p>{bay.text}</p>
                  </section>
                ))}
              </div>
              <figure className="kas-tekne-inline-figure kas-tekne-inline-figure-tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BAY_IMAGES[1]} alt="Kaş çevresinde kayalık kıyıların sardığı turkuaz koy" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-card-copy">
                <span className="kas-tekne-section-kicker">Sessizlik ve keşif</span>
                <h2>Daha sakin hissettiren koylar neden daha çok akılda kalıyor?</h2>
                <p>
                  Çoban Koyu, Ufakdere ve Muar gibi duraklar daha yoğun keşif hissi sunar. Ulaşımın biraz daha zahmetli
                  olması, bu koyların daha bakir ve daha sessiz kalmasına yardım eder. Bu yüzden bazı ziyaretçiler için
                  Kaş’ın asıl büyüsü tam olarak bu koylarda başlar.
                </p>
                <p>
                  Özellikle Muar Koyu’nun su altı zenginliği ve Ufakdere’nin dinginliği, günü yalnızca yüzerek değil,
                  çevreyi gözlemleyerek geçirmek isteyenler için daha karakterli bir deneyim yaratır.
                </p>
              </div>
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BAY_IMAGES[2]} alt="Kaş'ın daha bakir ve sessiz koylarından birinde taşlık kıyı ve berrak deniz" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
          </article>

          <article id="kekova-hatti" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Kekova hattı</span>
            <h2>Denizin tarihle birleştiği en büyüleyici bölge</h2>
            <p>
              Kaş koylarının en büyüleyici bölgelerinden biri Kekova hattıdır. Kaleköy ve Batık Şehir gibi tarihi
              alanların bulunduğu bu bölgede deniz, tarih ile birleşir. Antik kalıntıların su altında görülebildiği bu
              koylar, dünyada nadir bulunan bir deneyim sunar.
            </p>
            <p>
              Aynı zamanda bu hat, tekne turlarının en popüler durakları arasındadır. Yani Kekova tarafı yalnızca güzel
              bir yüzme noktası değil; aynı gün içinde manzara, tarih ve deniz deneyimini tek hatta toplayan daha derin
              bir rota gibi çalışır.
            </p>
            <div className="kas-tekne-type-grid">
              <section className="kas-tekne-type-card">
                <h3>Kaleköy (Simena)</h3>
                <p>Tarihi doku ile küçük kıyı atmosferinin birleştiği, tekne rotalarında sık durulan en ikonik noktalardan biridir.</p>
              </section>
              <section className="kas-tekne-type-card">
                <h3>Batık Şehir</h3>
                <p>Su altında görülen antik izler sayesinde yalnızca denize değil, geçmişe de bakıyormuş hissi yaratır.</p>
              </section>
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <div className="kas-tekne-card-grid">
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BAY_IMAGES[3]} alt="Kekova hattında tarih ve berrak denizin bir araya geldiği görünüm" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
              <div className="kas-tekne-card-copy">
                <span className="kas-tekne-section-kicker">Tekneyle ulaşılan duraklar</span>
                <h2>Fırnaz ve Yağlıca gibi koylar Kaş’ın en saf doğasını gösterir</h2>
                <p>
                  Fırnaz Koyu ve Yağlıca Koyu gibi yalnızca tekneyle ulaşılabilen koylar, Kaş’ın en saf doğasını
                  yansıtır. Özellikle Yağlıca’nın el değmemiş yapısı ve kristal berraklığındaki suyu, doğayla baş başa
                  kalmak isteyenler için eşsiz bir ortam sunar.
                </p>
                <p>
                  Fırnaz ise çam ormanlarıyla çevrili yapısı ve sakin atmosferiyle öne çıkar. Bu tür koylar, tekne
                  günü planlayanlar için Kaş’ın neden bu kadar sevildiğini çok hızlı anlatır.
                </p>
              </div>
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Tekneyle ulaşılan koylar</span>
            <h2>Bu koylar neden daha ayrıcalıklı hissediliyor?</h2>
            <div className="kas-tekne-type-grid">
              {BOAT_ONLY_BAYS.map((bay) => (
                <section key={bay.title} className="kas-tekne-type-card">
                  <h3>{bay.title}</h3>
                  <p>{bay.text}</p>
                </section>
              ))}
            </div>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Çeşitlilik</span>
            <h2>Kaş’ta herkes için uygun bir koy mutlaka var</h2>
            <ul className="kas-tekne-checklist">
              {BAY_EXPERIENCES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="kas-tekne-support-note">
              Kaş koylarını bu kadar özel yapan şey sadece güzellikleri değil; aynı zamanda sundukları çeşitlilik.
              Bazıları macera ve keşif, bazıları ise tamamen dinlenme ve huzur odaklı hissettirir.
            </p>
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <div className="kas-tekne-card-grid">
              <div className="kas-tekne-card-copy">
                <span className="kas-tekne-section-kicker">Kısa karar</span>
                <h2>Kaş koyları neden kaçış hissini bu kadar güçlü veriyor?</h2>
                <p>
                  Kaş koyları, Türkiye’nin en etkileyici doğal miraslarından biridir. Kalabalık tatil merkezlerinden
                  sıkılanlar için adeta bir kaçış noktasıdır. Eğer gerçekten denizle baş başa kalmak ne demek
                  deneyimlemek istiyorsanız, Kaş koyları bu hissi en saf haliyle yaşatan nadir yerlerden biridir.
                </p>
                <Link href="/kas-tekne-turu" className="kas-tekne-text-link">
                  Koy rotalarını tekne turuyla birleştir
                </Link>
              </div>
              <figure className="kas-tekne-inline-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BAY_IMAGES[4]} alt="Kaş koylarında sakin deniz ve kıyı çizgisi" className="kas-tekne-inline-image" loading="lazy" />
              </figure>
            </div>
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
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Koyları', 'https://www.kasguide.de/kas-koylari')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
