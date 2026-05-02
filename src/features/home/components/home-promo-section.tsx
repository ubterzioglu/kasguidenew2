import Link from 'next/link'

import { CATEGORY_MAP } from '@/lib/categories'

const PROMO_CARDS = [
  {
    copy:
      'Kaş tatilini günlük olarak planlamak için, kararsız kaldığında 25 soruluk planner ile gününü ritmine, bütçene ve ilgi alanına göre şekillendirebilirsin.',
    href: '/planner',
    cta: 'Planlamaya başla',
    imageUrl: CATEGORY_MAP.get('gezi')?.imageUrl ?? '',
    imageAlt: 'Kaş tatili için günlük plan ilhamı',
    toneClassName: 'home-promo-card-plan',
  },
  {
    copy:
      'Kaş hakkında daha fazla sorunun cevabını, eski FAQ arşivindeki yüzlerce soruyu tek yerde toplayan arama destekli bilgi bankasında bulabilirsin.',
    href: '/faq',
    cta: 'SSS sayfasını keşfet',
    imageUrl: CATEGORY_MAP.get('oss')?.imageUrl ?? '',
    imageAlt: 'Kaş hakkında sık sorulan sorular',
    toneClassName: 'home-promo-card-faq',
  },
  {
    copy:
      "Kaş'ı farklı bakış açılarından okumak istersen, başka tatilcilerin ve yerlilerin anlattığı ilham veren yazıları ve rotaları keşfedebilirsin.",
    href: '/result?categories=yazilar',
    cta: 'Yazı dizilerine git',
    imageUrl: CATEGORY_MAP.get('yazilar')?.imageUrl ?? '',
    imageAlt: 'Kaş yazı dizileri',
    toneClassName: 'home-promo-card-series',
  },
  {
    copy:
      "Kaş'ı daha yerel bir gözle keşfetmek istersen, daha içeriden ve daha yerel bir rehber için hazırladığımız yeni alanın ilk iskeletine göz atabilirsin.",
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
            <Link key={card.href} href={card.href} className={`home-promo-card ${card.toneClassName}`}>
              <div className="home-promo-copy">
                <p className="home-promo-description">{card.copy}</p>
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
