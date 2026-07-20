import Link from 'next/link'

import { HOME_MODIFIED_AT, HOME_PUBLISHED_AT } from './home-jsonld'

const PUBLISHED_LABEL = '15 Ocak 2026'
const MODIFIED_LABEL = '29 Nisan 2026'

const HOME_INTRO_SECTIONS = [
  {
    title: 'Kaş nasıl bir yer ve ilk hissi nasıldır?',
    content: (
      <>
        <p>
          Antalya&apos;ya bağlı Kaş ilçesi, Akdeniz&apos;in en güzel kıyı şeritlerinden birinde yer alan, tarih ve
          doğanın iç içe geçtiği küçük bir sahil kasabasıdır. Likya uygarlığının izlerini taşıyan antik tiyatrosu,
          kristal berraklığındaki suları ve rengarenk sokaklarıyla her yıl binlerce ziyaretçiyi ağırlar.
        </p>
        <p>
          Kasaba merkezi yürüyerek gezilebilecek kompakt bir yapıya sahiptir; marinalar, balık restoranları,
          butik oteller ve sanat atölyeleri birbirine birkaç dakika yürüme mesafesindedir. Çukurbağ yarımadası,
          Kaş&apos;ın sakin ve panoramik yüzünü sunarken, merkez ise canlı gece hayatı ve kozmopolit restoran
          çeşitliliğiyle öne çıkar.
        </p>
        <p>
          Kaş gezilecek yerler açısından son derece zengindir: Kekova batık şehri, Patara kumsalı, Likya
          Yolu&apos;nun en güzel etapları ve Çukurbağ yarımadası tek başına günlerce keşif sunar. Bunun yanında
          Yunan adası Meis&apos;e yapılan günlük vapur seferleri, Kaş&apos;ı çok daha fazla destinasyonun kapısı
          haline getirir.
        </p>
        <p>
          İster romantik bir hafta sonu kaçamağı, ister aile tatili, ister backpacker rotası arıyor olun, Kaş her
          bütçeye ve her tarza hitap eder. Kaş&apos;ta nerede kalınır konusunda detaylı bilgilerimizi{' '}
          <Link href="/kas-tekne-turu">Kaş tekne turu rehberinden</Link> bulabilirsiniz.
        </p>
      </>
    ),
  },
  {
    title: 'Kaş’ta en çok hangi deneyimler aranır?',
    content: (
      <>
        <p>
          Ziyaretçiler Kaş&apos;a geldiklerinde en çok plajlar, tekne turları, dalış noktaları ve yeme-içme
          deneyimleri hakkında arama yapıyor. Kaputaş, Büyük Çakıl, Küçük Çakıl ve Akçagerme her biri farklı bir
          deneyim sunan öne çıkan plajlar arasında yer alır.
        </p>
        <p>
          <Link href="/kas-en-guzel-plajlar">Kaş plajları rehberimizde</Link> tüm plajları karşılaştırmalı olarak
          bulabilirsiniz. Tekne turu ile Kekova&apos;yı keşfetmek ise Kaş&apos;ın en ikonik aktivitelerinden biridir;
          <Link href="/kas-tekne-turu"> Kaş tekne turu sayfamızda</Link> güzergah ve önerileri derledik.
        </p>
        <p>
          Kaş&apos;ın dalış merkezi olarak bilindiğini biliyor muydunuz? Uluburun batığı, tünel dalışları ve kaya
          dalışları ile Türkiye&apos;nin en iyi dalış noktalarından biri kabul edilir. Sabahları{' '}
          <Link href="/kas-kahvalti-mekanlari">serpme kahvaltı mekanları</Link>, akşamları ise limon ağaçları
          altında meze ve rakı sofraları öne çıkar.
        </p>
        <p>
          Gezi ve keşif rotaları için <Link href="/kas-merkez-gezilecek-yerler">Kaş gezilecek yerler rehberine</Link> göz
          atmanızı öneririz. Tarih meraklıları Likya kaya mezarlarından Patara antik kentine, doğa tutkunları ise
          Likya Yolu&apos;ndan Akdağ yaylalarına kadar çok sayıda rota bulacaktır.
        </p>
      </>
    ),
  },
  {
    title: 'Kaş Guide tam olarak ne sunuyor?',
    content: (
      <>
        <p>
          Kaş Guide, Kaş&apos;ı yerel bir perspektiften anlatan editoryal bir şehir rehberidir. Mekanları önce yerel
          uzmanlar inceler, ardından editoryal süzgeçten geçirilir ve yalnızca gerçekten önerilebilecek yerler
          yayına alınır.
        </p>
        <p>
          Restoranlar, kafeler, barlar, oteller, plajlar, dalış noktaları, aktiviteler ve daha fazlası için kategori
          bazlı keşif imkanı sunuyoruz. Her mekan için detaylı açıklamalar, pratik bilgiler ve yerel ipuçları
          bulabilirsiniz.
        </p>
        <p>
          Kategori sayfalarımız üzerinden <Link href="/kas-nerede-ne-yenir">restoran önerileri</Link>,{' '}
          <Link href="/kas-gece-hayati">bar ve gece hayatı</Link> ya da{' '}
          <Link href="/kas-dalis-noktalari">dalış noktaları</Link> gibi spesifik ilgi alanlarınıza göre arama
          yapabilirsiniz.
        </p>
      </>
    ),
  },
  {
    title: 'Kaş tatili nasıl planlanır?',
    content: (
      <>
        <p>
          Kaş tatili planlarken ilk karar konaklamadır. Merkez mi, yarımada mı, yoksa Patara civarı mı tercih
          edileceği tatil deneyimini doğrudan şekillendirir. Kısa bir hafta sonu kaçamağı için merkeze yakın bir
          butik otel idealdir.
        </p>
        <p>
          Daha uzun bir tatil planlıyorsanız Çukurbağ yarımadasındaki <Link href="/kas-otel-onerileri">butik
          oteller</Link> ya da <Link href="/kas-otel-onerileri">pansiyonlar</Link> sakinlik ve manzara arayanlar için
          güçlü seçenekler sunar.
        </p>
        <p>
          Aileler için Büyük Çakıl gibi sığ ve rahat plajlar, çocuk dostu restoranlar ve tekne turları önerilebilir.
          Çiftler için romantik akşam yemekleri ve gün batımı noktaları öne çıkar. Bütçe dostu bir rota için ise
          pansiyonlar, sokak lezzetleri ve ücretsiz plajlar oldukça iyi bir denge sunar.
        </p>
        <p>
          <Link href="/kas-tatil-rehberi">Kaş tatil rehberi sayfamız</Link> ilk kez gelenler için güçlü
          bir başlangıç noktasıdır. Her sezonun kendine özgü bir avantajı vardır: ilkbahar sakinlik, yaz canlılık,
          sonbahar ılıman deniz ve dalış, kış ise daha ekonomik fiyatlar sunar.
        </p>
      </>
    ),
  },
] as const

export function HomeIntroSection() {
  return (
    <section className="home-intro-section" aria-labelledby="home-intro-title">
      <div className="home-intro-shell">
        <details className="home-intro-hero home-intro-hero-accordion">
          <summary className="home-intro-card-summary home-intro-hero-summary">
            <span className="home-intro-hero-summary-copy">
              <span className="home-intro-eyebrow">Kaş Rehberi</span>
              <h1 id="home-intro-title" className="home-intro-title">
                Kaş Gezi Rehberi ile gezilecek yerleri, plajları ve yerel önerileri nasıl keşfedersiniz?
              </h1>
            </span>
            <span className="home-intro-card-icon" aria-hidden="true" />
          </summary>

          <div className="home-intro-hero-body">
            <p id="home-intro-summary" className="home-intro-lead">
              Kaş gezi rehberi nedir? Kaş gezi rehberi; plaj, dalış, tekne turu, yeme-içme ve konaklama kararlarını ilk
              kez gelen biri için tek sayfada toparlayan güncel başlangıç kaynağıdır. Kaş tatili planlamak isteyenler
              için gezilecek yerleri, en iyi bölgeleri, plaj tercihlerini ve günlük rota mantığını kısa cevaplarla
              açıklıyoruz; kısaca Kaş tatil planlaması, hangi deneyime öncelik vereceğinizi erkenden netleştirip doğru
              mahalle, doğru koy ve doğru aktiviteyi seçmek demektir.
            </p>

            <div className="home-intro-rich-grid" aria-label="Kaş tatili için hızlı özet blokları">
              <article className="home-intro-rich-card">
                <h2 className="home-intro-rich-title">Kaş&apos;ta ilk kez gelenler için hızlı özet</h2>
                <ul className="home-intro-list">
                  <li>Merkez, yürüyerek gezmek ve akşamları çarşıya karışmak isteyenler için en pratik bölgedir.</li>
                  <li>Çukurbağ Yarımadası, manzara ve sakinlik arayanlar için güçlü bir konaklama alternatifidir.</li>
                  <li>Dalış, tekne turu ve koy keşfi Kaş&apos;ta ilk üç deneyim olarak öne çıkar.</li>
                </ul>
              </article>

              <article className="home-intro-rich-card">
                <h2 className="home-intro-rich-title">Kaş tatili nasıl planlanır?</h2>
                <ul className="home-intro-list home-intro-list-bulleted">
                  <li>Önce merkeze mi yoksa yarımadaya mı yakın kalacağını belirle.</li>
                  <li>Bir gününü tekne turu veya dalış gibi yüksek niyetli deneyimlere ayır.</li>
                  <li>Plaj, akşam yemeği ve çarşı ritmini aynı gün içinde dengele.</li>
                </ul>
              </article>

              <article className="home-intro-rich-card home-intro-rich-card-wide">
                <h2 className="home-intro-rich-title">Hangi tatil tarzı sana daha uygun?</h2>
                <div className="home-intro-table-wrap">
                  <table className="home-intro-table">
                    <thead>
                      <tr>
                        <th scope="col">Tatil odağı</th>
                        <th scope="col">En uygun bölge</th>
                        <th scope="col">Kimler için iyi?</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Merkez odaklı</td>
                        <td>Kaş merkez</td>
                        <td>Yürüyerek gezen, restoran ve gece hayatını öne alanlar</td>
                      </tr>
                      <tr>
                        <td>Manzara ve sakinlik</td>
                        <td>Çukurbağ Yarımadası</td>
                        <td>Çiftler, sakin konaklama arayanlar ve uzun tatil yapanlar</td>
                      </tr>
                      <tr>
                        <td>Dalış ve aktivite</td>
                        <td>Liman çevresi</td>
                        <td>Dalış merkezlerine, tekne turlarına ve sabah çıkışlarına yakın olmak isteyenler</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <figure className="home-intro-figure">
                <picture>
                  <source media="(min-width: 768px)" srcSet="/og.jpg" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/og.jpg"
                    alt="Kaş kıyı hattını, taş merkez dokusunu ve turkuaz koylarını özetleyen görünüm"
                    className="home-intro-figure-image"
                    loading="lazy"
                  />
                </picture>
                <figcaption className="home-intro-figure-caption">
                  Kaş&apos;ın taş sokakları, turkuaz koyları ve dalışa uygun berrak suları aynı rotada buluşur; bu yüzden
                  ilk kez gelenler için merkez, plaj ve aktivite dengesini birlikte planlamak önemlidir.
                </figcaption>
              </figure>
            </div>

            <p className="home-intro-dive-note">
              Kaş dalış rehberi arıyorsanız fiyat, merkez, okul ve deneme dalışı niyetlerini{' '}
              <Link href="/kas-dalis-noktalari">Kaş dalış noktaları sayfasında</Link> ayrı ayrı toparlıyoruz.
            </p>

            <div className="home-intro-accordion">
              {HOME_INTRO_SECTIONS.map((section) => (
                <details key={section.title} className="home-intro-card">
                  <summary className="home-intro-card-summary">
                    <span className="home-intro-card-title">{section.title}</span>
                    <span className="home-intro-card-icon" aria-hidden="true" />
                  </summary>
                  <div className="home-intro-card-body">{section.content}</div>
                </details>
              ))}
            </div>

            <p className="home-intro-meta">
              <time dateTime={HOME_PUBLISHED_AT}>Yayınlandı: {PUBLISHED_LABEL}</time>
              {' • '}
              <time dateTime={HOME_MODIFIED_AT}>Son güncelleme: {MODIFIED_LABEL}</time>
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}
