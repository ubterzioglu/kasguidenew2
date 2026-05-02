import Link from 'next/link'

const HOME_FAQ_ITEMS = [
  {
    question: "Kaş'ta kaç gün kalınır?",
    answer:
      "Kaş'ı rahatça keşfetmek için en az 3 gece kalmanızı öneririz. 3 gün boyunca merkezi, plajları, bir tekne turu ve en az bir dalış deneyimi sığdırabilirsiniz. 5–7 gece kalırsanız Patara, Kekova, Likya Yolu etapları ve Çukurbağ yarımadasını da keşfetme fırsatı bulursunuz.",
  },
  {
    question: "Kaş'ta ilk kez gelenler için en iyi bölge hangisi?",
    answer:
      "İlk kez gelenler için Kaş merkezi en pratik seçimdir. Restoranlar, barlar, marina, Çarşı ve minibüs duraklarına yürüyerek ulaşabilirsiniz. Daha sakin bir tatil istiyorsanız Çukurbağ yarımadası merkezden sadece 10–15 dakika uzaklıkta olup muhteşem manzaralar sunar.",
  },
  {
    question: "Kaş'ta en iyi plajlar hangileri?",
    answer:
      "Kaputaş plajı dramatik falezleriyle en fotojenik plajdır. Büyük Çakıl aileler için ideal, sığ ve rahattır. Küçük Çakıl merkeze en yakın seçenektir. Akçagerme ve Limanağzı ise tekne ile ulaşılan, daha sakin alternatiflerdir. Her plajın farklı bir karakteri vardır; detaylı karşılaştırma için plajlar rehberimize göz atabilirsiniz.",
  },
  {
    question: "Kaş'ta nerede kahvaltı yapılır?",
    answer:
      "Kaş'ta serpme kahvaltı geleneği çok güçlüdür. Merkezdeki kahvaltı mekanları deniz manzaralı serpme sofralarıyla ünlüdür. Çukurbağ yarımadasındaki butik oteller de konuk kahvaltısıyla öne çıkar. Kahvaltı mekanları kategorimizde tüm seçenekleri filtreleyip karşılaştırabilirsiniz.",
  },
  {
    question: "Kaş'ta dalış için en uygun dönem ne zaman?",
    answer:
      "Kaş'ta dalış sezonu mayıs ortasından kasım başına kadar sürer. En iyi su sıcaklığı ve görüş mesafesi temmuz–ekim arası elde edilir. Eylül ve ekim ayları su sıcaklığının hâlâ yüksek, kalabalığın ise azaldığı ideal dalış dönemleridir. Kış aylarında da dalış yapılabilmektedir ancak su sıcaklığı düşer.",
  },
  {
    question: "Kaş bütçe dostu bir destinasyon mu?",
    answer:
      "Evet, Kaş her bütçeye uygun seçenekler sunar. Merkezdeki pansiyonlar ve butik oteller uygun fiyatlarla konaklama imkânı sağlarken, sokak aralarındaki lokantalar ve meyhane tarzı mekanlar bütçe dostu yeme-içme deneyimleri sunar. Plajlar genellikle ücretsizdir ve yürüyerek keşfedilebilen kompakt yapısı sayesinde ulaşım masrafı minimumda tutulabilir.",
  },
  {
    question: "Kaş'ta tekne turu ne kadar sürer?",
    answer:
      "Kaş tekne turları genelde tam gün (09:00-18:00) sürer. Yarım gün turlar da mevcuttur. Kekova rotası tam gün, koy turları yarım gün veya tam gün seçenekleriyle sunulur.",
  },
  {
    question: "Kaş'ta dalış noktaları nerelerdir?",
    answer:
      "Uluburun batığı, Tünel dalışı, Kaya dalışları ve Kekova batık şehri öne çıkan dalış noktalarıdır. Her biri farklı seviye ve deneyim sunar.",
  },
  {
    question: "Kaş'ta nerede ne yenir?",
    answer:
      "Merkezdeki balık restoranları, Çarşı'daki meyhaneler ve limandaki gün batımı mekanları öne çıkar. Vegan ve geleneksel Türk mutfağı seçenekleri de boldur.",
  },
  {
    question: "Kaş'ta günlük gezi planı nasıl yapılır?",
    answer:
      "3 günlük plan: Gün 1 - Merkez gezisi + plaj, Gün 2 - Tekne turu, Gün 3 - Dalış + Çukurbağ. Her gün farklı bir tema ile planlanabilir.",
  },
  {
    question: "Kaş en güzel plajlar hangileri?",
    answer:
      "Kaputaş (en fotojenik), Büyük Çakıl (aileler için), Akçagerme (sakinlik) en iyileridir. Her plaj farklı bir deneyim sunar.",
  },
] as const

export function HomeFaqSection() {
  return (
    <section className="home-faq-section" aria-labelledby="home-faq-title">
      <div className="home-faq-shell">
        <details className="home-faq-header home-faq-header-card">
          <summary className="home-faq-header-summary">
            <span className="home-faq-header-copy">
              <span className="home-faq-eyebrow">Hızlı Başlangıç</span>
              <h2 id="home-faq-title" className="home-faq-title">
                Kaş hakkında ilk bakışta en çok ne merak ediliyor?
              </h2>
            </span>
            <span className="home-faq-question-icon" aria-hidden="true" />
          </summary>

          <div className="home-faq-copy home-faq-copy-combined home-faq-header-body">
            <p className="home-faq-description">
              İlk geliş, konaklama bölgesi, plaj seçimi ve bütçe gibi temel sorular için hazırladığımız {HOME_FAQ_ITEMS.length}{' '}
              temel sorunun kısa cevaplarını burada bulabilir, daha detaylı cevaplar ve arama destekli tüm içerik için geniş
              SSS arşivine geçebilirsiniz.
            </p>
            <div className="home-faq-list">
              {HOME_FAQ_ITEMS.map((item, index) => (
                <details key={index} className="home-faq-item">
                  <summary className="home-faq-question">
                    <span className="home-faq-question-text">{item.question}</span>
                    <span className="home-faq-question-icon" aria-hidden="true" />
                  </summary>
                  <p className="home-faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
            <Link href="/faq" className="home-faq-link">
              Tüm SSS sayfasını aç
            </Link>
          </div>
        </details>
      </div>
    </section>
  )
}

export { HOME_FAQ_ITEMS }
