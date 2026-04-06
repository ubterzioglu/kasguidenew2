import Link from 'next/link'

import { CATEGORY_MAP } from '@/lib/categories'

const PROMO_CARDS = [
  {
    title: 'Kaş Tatili Günlük Planlayıcı',
    description: 'Kararsız mı kaldın? Planlayıcımızı kullan, gününü planla!',
    href: '/#categories',
    cta: 'Planlamaya başla',
    imageUrl: CATEGORY_MAP.get('gezi')?.imageUrl ?? '',
    imageAlt: 'Kaş tatili için günlük plan ilhamı',
    toneClassName: 'home-promo-card-plan',
  },
  {
    title: 'Sık Sorulan Sorular',
    description: 'Kaş hakkında her şeyi bize sorabilirsin! Geniş veritabanımızda binlerce soruya binlerce cevap var!',
    href: '/result?categories=oss',
    cta: 'SSS sayfasını keşfet',
    imageUrl: CATEGORY_MAP.get('oss')?.imageUrl ?? '',
    imageAlt: 'Kaş hakkında sık sorulan sorular',
    toneClassName: 'home-promo-card-faq',
  },
  {
    title: 'Yazı Dizileri',
    description: "Kaş'ı başka tatilcilerden ve yerlisinden dinleyin. İlham veren yazıları ve rotaları keşfedin.",
    href: '/result?categories=yazilar',
    cta: 'Yazı dizilerine git',
    imageUrl: CATEGORY_MAP.get('yazilar')?.imageUrl ?? '',
    imageAlt: 'Kaş yazı dizileri',
    toneClassName: 'home-promo-card-series',
  },
  {
    title: 'Röportajlar',
    description: 'Mekanları sahiplerinden dinleyin. Kaş’ın ritmini, hikâyelerini ve önerilerini birinci ağızdan okuyun.',
    href: '/result?categories=roportaj',
    cta: 'Röportajlara git',
    imageUrl: CATEGORY_MAP.get('roportaj')?.imageUrl ?? '',
    imageAlt: 'Kaş röportajları',
    toneClassName: 'home-promo-card-interview',
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
                <span className="home-promo-eyebrow">Kaş Guide</span>
                <h3 className="home-promo-title">{card.title}</h3>
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
