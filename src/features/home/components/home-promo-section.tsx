import Link from 'next/link'

import { CATEGORY_MAP } from '@/lib/categories'

const PROMO_CARDS = [
  {
    title: 'Kaş tatili günlük olarak nasıl planlanır?',
    description: 'Kararsız kaldığında 25 soruluk planner ile gününü ritmine, bütçene ve ilgi alanına göre şekillendir.',
    href: '/planner',
    cta: 'Planlamaya başla',
    imageUrl: CATEGORY_MAP.get('gezi')?.imageUrl ?? '',
    imageAlt: 'Kaş tatili için günlük plan ilhamı',
    toneClassName: 'home-promo-card-plan',
  },
  {
    title: 'Kaş hakkında daha fazla sorunun cevabı nerede?',
    description: 'Eski FAQ arşivindeki yüzlerce soruyu tek yerde toplayan, arama destekli Kaş bilgi bankasına göz at.',
    href: '/faq',
    cta: 'SSS sayfasını keşfet',
    imageUrl: CATEGORY_MAP.get('oss')?.imageUrl ?? '',
    imageAlt: 'Kaş hakkında sık sorulan sorular',
    toneClassName: 'home-promo-card-faq',
  },
  {
    title: "Kaş'ı farklı bakış açılarından nasıl okuyabilirsin?",
    description: "Kaş'ı başka tatilcilerden ve yerlisinden dinleyin. İlham veren yazıları ve rotaları keşfedin.",
    href: '/result?categories=yazilar',
    cta: 'Yazı dizilerine git',
    imageUrl: CATEGORY_MAP.get('yazilar')?.imageUrl ?? '',
    imageAlt: 'Kaş yazı dizileri',
    toneClassName: 'home-promo-card-series',
  },
  {
    title: "Kaş'ı daha yerel bir gözle keşfetmek ister misin?",
    description: 'Daha içeriden, daha yerel bir Kaş rehberi için hazırladığımız yeni alanın ilk iskeletini keşfedin.',
    href: '/local',
    cta: 'Local sayfasına git',
    imageUrl: CATEGORY_MAP.get('kas-local')?.imageUrl ?? CATEGORY_MAP.get('roportaj')?.imageUrl ?? '',
    imageAlt: 'Kaş local rehberi',
    toneClassName: 'home-promo-card-local',
  },
] as const

export function HomePromoSection() {
  return (
    <section className="home-promo-section" aria-label="Kaş Guide tanıtım kartları">
      <div className="home-promo-shell">
        <div className="home-promo-grid">
          {PROMO_CARDS.map((card) => (
            <Link key={card.title} href={card.href} className={`home-promo-card ${card.toneClassName}`}>
              <div className="home-promo-copy">
                <h3 className="home-promo-title">{card.title}</h3>
                <span className="home-promo-separator" aria-hidden="true" />
                <p className="home-promo-description">{card.description}</p>
                <span className="home-promo-cta">{card.cta}</span>
              </div>
              <div className="home-promo-media-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.imageUrl} alt={card.imageAlt} className="home-promo-media" loading="lazy" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
