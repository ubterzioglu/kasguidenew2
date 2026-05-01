import Image from 'next/image'
import Link from 'next/link'

const QUICK_LINKS = [
  {
    title: 'Kaş Tekne Turu',
    excerpt:
      "Kekova rotası, batık şehir ve gizli koylar. Tekne turları ile Kaş'ın en ikonik deneyimini yaşayın. Grup veya özel tur seçenekleri mevcuttur.",
    link: '/kas-tekne-turu',
    linkText: 'Tekne Turu Rehberi',
    imageUrl: '/og.jpg',
    imageAlt: 'Kaş kıyılarında marina, koylar ve deniz manzarası',
  },
  {
    title: 'Kaş Dalış Noktaları',
    excerpt:
      "Uluburun batığı, tünel dalışı ve kaya dalışları. Türkiye'nin en iyi dalış destinasyonlarından birinde sualtı keşfine hazır mısınız?",
    link: '/kas-dalis-noktalari',
    linkText: 'Dalış Noktalarını Keşfet',
    imageUrl: '/quick-links/diving.jpg',
    imageAlt: 'Mavi su altında dalış yapan bir dalgıç',
  },
  {
    title: 'Kaş Otel Önerileri',
    excerpt:
      "Merkezde butik oteller, yarımada pansiyonları ve aile dostu tesisler. Konaklama tercihiniz tatil deneyiminizi şekillendirir.",
    link: '/kas-otel-onerileri',
    linkText: 'Konaklama Rehberi',
    imageUrl: '/quick-links/hotel.jpg',
    imageAlt: 'Deniz manzaralı sakin ve modern bir otel odası',
  },
  {
    title: 'Kaş Gece Hayatı',
    excerpt:
      "Liman bölgesindeki barlar, meyhaneler ve rooftop mekanlar. Gün batımından sonra Kaş'ın canlı tarafını keşfedin.",
    link: '/kas-gece-hayati',
    linkText: 'Gece Hayatı Rehberi',
    imageUrl: '/quick-links/nightlife.jpg',
    imageAlt: 'Loş ışıklı canlı gece hayatını çağrıştıran bar atmosferi',
  },
  {
    title: 'Kaş Koyları',
    excerpt:
      "Çukurbağ Yarımadası'nın saklı cennetleri, kristal berraklığında sular ve doğal güzellikler. Tekne ile veya araçla ulaşılabilen koylar.",
    link: '/kas-koylari',
    linkText: 'Koylar Listesi',
    imageUrl: '/quick-links/bays.jpg',
    imageAlt: 'Turkuaz suyu ve kıyı hattı görünen sakin bir koy',
  },
  {
    title: 'Kaş Kahvaltı',
    excerpt:
      'Serpme kahvaltı, deniz manzaralı masalar ve bahçeli mekanlar. Güne Kaş merkezde veya yarımada tarafında uzun bir kahvaltıyla başlayın.',
    link: '/kas-kahvalti-mekanlari',
    linkText: 'Kahvaltı Rehberi',
    imageUrl: '/quick-links/breakfast.jpg',
    imageAlt: 'Kahvaltı masasında servis edilmiş sıcak içecek ve tabaklar',
  },
] as const

export function QuickLinksSection() {
  return (
    <section className="quick-links-section" aria-labelledby="quick-links-title">
      <div className="quick-links-shell">
        <h2 id="quick-links-title" className="quick-links-title">
          Kaş&apos;da en çok ne aranıyor ? Detaylı rehberler için tıklayın.
        </h2>
        <div className="quick-links-grid">
          {QUICK_LINKS.map((item) => (
            <Link key={item.link} href={item.link} className="quick-links-card">
              <div className="quick-links-card-copy">
                <h3 className="quick-links-card-title">{item.title}</h3>
                <p className="quick-links-card-excerpt">{item.excerpt}</p>
                <span className="quick-links-card-link">{item.linkText} →</span>
              </div>
              <div className="quick-links-card-media-wrap">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 220px"
                  className="quick-links-card-media"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
