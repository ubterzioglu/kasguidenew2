import Link from 'next/link'

export function HeroQuickLinksSection() {
  return (
    <section className="hero-quick-links-section" aria-label="Kaş Guide hızlı erişim bağlantıları">
      <div className="hero-quick-links-shell">
        <div className="hero-story-search-stack hero-quick-links-stack">
          <Link href="/arama" className="hero-story-search-button hero-quick-links-search-button">
            Kaş Guide içinde ayrıntılı ara
          </Link>
          <div className="hero-story-quick-links hero-quick-links-row" aria-label="Hızlı konu başlıkları">
            <Link href="/kas-gece-hayati" className="hero-story-quick-link">
              Gece Hayatı
            </Link>
            <Link href="/kas-en-guzel-plajlar" className="hero-story-quick-link">
              Kumsallar
            </Link>
            <Link href="/kas-dalis-noktalari" className="hero-story-quick-link">
              Dalış
            </Link>
            <Link href="/kas-kahvalti-mekanlari" className="hero-story-quick-link">
              Kahvaltı
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
