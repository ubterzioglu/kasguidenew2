import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı | Kaş Guide',
  description: "Aradığınız sayfa şu anda bulunamıyor. Kaş Guide'da ana sayfa, kategoriler ve rehber içeriklerine dönebilirsiniz.",
}

const QUICK_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/#categories', label: 'Kategoriler' },
  { href: '/faq', label: 'Sık Sorulan Sorular' },
  { href: '/iletisim', label: 'İletişim' },
] as const

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-layout" aria-labelledby="not-found-title">
        <div className="not-found-copy">
          <p className="not-found-eyebrow">404</p>
          <h1 id="not-found-title" className="not-found-title">
            Aradığınız sayfa Kaş sokaklarında biraz kaybolmuş olabilir.
          </h1>
          <p className="not-found-description">
            Bağlantı eski olabilir, sayfa taşınmış olabilir ya da adres küçük bir harf hatası yüzünden buraya düşmüş
            olabilir. En iyi rotaya geri dönmeniz için birkaç kısa yol bıraktık.
          </p>

          <div className="not-found-actions">
            <Link href="/" className="hero-primary-action">
              Ana sayfaya dön
            </Link>
            <Link href="/#categories" className="hero-secondary-action">
              Kategorileri keşfet
            </Link>
          </div>

          <div className="not-found-links" aria-label="Hızlı bağlantılar">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="not-found-link-chip">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="not-found-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kasplaceholder.jpg"
            alt="Kaş kıyısından deniz ve kasaba görünümü"
            className="not-found-image"
          />
          <div className="not-found-media-shade" />
          <div className="not-found-media-card" aria-hidden="true">
            <strong>Kaş Guide</strong>
            <span>Doğru yola dönmek için en iyi başlangıç ana sayfa.</span>
          </div>
        </div>
      </section>
    </main>
  )
}
