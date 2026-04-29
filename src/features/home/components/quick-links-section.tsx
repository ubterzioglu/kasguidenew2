import Link from 'next/link'

const QUICK_LINKS = [
  {
    title: 'Kaş Tekne Turu',
    excerpt:
      "Kekova rotası, batık şehir ve gizli koylar. Tekne turları ile Kaş'ın en ikonik deneyimini yaşayın. Grup veya özel tur seçenekleri mevcuttur.",
    link: '/kas-tekne-turu',
    linkText: 'Tekne Turu Rehberi',
  },
  {
    title: 'Kaş Dalış Noktaları',
    excerpt:
      "Uluburun batığı, tünel dalışı ve kaya dalışları. Türkiye'nin en iyi dalış destinasyonlarından birinde sualtı keşfine hazır mısınız?",
    link: '/kas-dalis-noktalari',
    linkText: 'Dalış Noktalarını Keşfet',
  },
  {
    title: 'Kaş Otel Önerileri',
    excerpt:
      "Merkezde butik oteller, yarımada pansiyonları ve aile dostu tesisler. Konaklama tercihiniz tatil deneyiminizi şekillendirir.",
    link: '/kas-otel-onerileri',
    linkText: 'Konaklama Rehberi',
  },
  {
    title: 'Kaş Gece Hayatı',
    excerpt:
      "Liman bölgesindeki barlar, meyhaneler ve rooftop mekanlar. Gün batımından sonra Kaş'ın canlı tarafını keşfedin.",
    link: '/kas-gece-hayati',
    linkText: 'Gece Hayatı Rehberi',
  },
  {
    title: 'Kaş Koyları',
    excerpt:
      "Çukurbağ Yarımadası'nın saklı cennetleri, kristal berraklığında sular ve doğal güzellikler. Tekne ile veya araçla ulaşılabilen koylar.",
    link: '/kas-koylari',
    linkText: 'Koylar Listesi',
  },
  {
    title: 'Kaş Kahvaltı',
    excerpt:
      'Serpme kahvaltı, deniz manzaralı masalar ve bahçeli mekanlar. Güne Kaş merkezde veya yarımada tarafında uzun bir kahvaltıyla başlayın.',
    link: '/kas-kahvalti-mekanlari',
    linkText: 'Kahvaltı Rehberi',
  },
] as const

export function QuickLinksSection() {
  return (
    <section className="quick-links-section" aria-labelledby="quick-links-title">
      <div className="quick-links-shell">
        <h2 id="quick-links-title" className="quick-links-title">
          Kaş&apos;ta en çok hangi rehberler açılıyor?
        </h2>
        <p className="quick-links-intro">
          Kaş&apos;ın en çok aranan konularını özetledik. Detaylı rehberler için tıklayın.
        </p>
        <div className="quick-links-grid">
          {QUICK_LINKS.map((item) => (
            <Link key={item.link} href={item.link} className="quick-links-card">
              <h3 className="quick-links-card-title">{item.title}</h3>
              <p className="quick-links-card-excerpt">{item.excerpt}</p>
              <span className="quick-links-card-link">{item.linkText} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
