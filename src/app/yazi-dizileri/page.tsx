import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'
import { getSeriesPageData } from '@/lib/series-data'

const HERO_CHIPS = ['Türkçe, Almanca, İngilizce', 'Web ve video kaynakları', 'Editoryal seçki'] as const

const INTERNAL_LINKS = [
  {
    href: '/faq',
    title: 'SSS Arşivi',
    text: 'Kaş hakkında soru-cevap odaklı arama yapmak istersen bilgi bankasına geç.',
  },
  {
    href: '/kas-koylari',
    title: 'Kaş Koyları',
    text: 'Kaynakları okuduktan sonra doğal rota tarafında doğrudan rehbere geçebilirsin.',
  },
  {
    href: '/kas-tekne-turu',
    title: 'Kaş Tekne Turu',
    text: 'Okuma sonrası tekne günü planlamak istersen deniz rotalarını burada toparlıyoruz.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kaş Yazı Dizileri | Çok Dilli Kaynak Rehberi',
  description:
    'Kaş hakkında okunacak kaynaklar: Türkçe, Almanca ve İngilizce web rehberleri, video seçkileri ve pratik kullanım notları.',
  alternates: { canonical: '/yazi-dizileri' },
  openGraph: {
    url: '/yazi-dizileri',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

function getLanguageLabel(label: string): string {
  if (label.toLowerCase().includes('türkçe')) return 'TR'
  if (label.toLowerCase().includes('almanca')) return 'DE'
  if (label.toLowerCase().includes('ingilizce')) return 'EN'
  return label
}

export default async function YaziDizileriPage() {
  const data = await getSeriesPageData()
  const summaryCards = data?.summaryParagraphs.slice(0, 3) ?? []
  const webGroups = data ? Object.entries(data.webSources) : []
  const videoGroups = data ? Object.entries(data.videoSources) : []

  return (
    <SiteFrame>
      <main className="kas-tekne-page">
        <section className="kas-tekne-hero">
          <div className="kas-tekne-hero-copy">
            <span className="kas-tekne-eyebrow">Editoryal Kaynak Kütüphanesi</span>
            <h1 className="kas-tekne-title">Kaş Yazı Dizileri</h1>
            <p className="kas-tekne-lead">
              Kaş hakkında daha derin okumak isteyenler için Türkçe, Almanca ve İngilizce kaynakları tek bir editorial
              seçkide topluyoruz. Amaç ham bir araştırma raporu göstermek değil; Kaş’ı okumak, izlemek ve araştırmak
              isteyenler için güvenilir başlangıç noktalarını temiz bir rehber akışı içinde sunmak.
            </p>

            <div className="kas-tekne-hero-chips" aria-label="Kaş yazı dizileri öne çıkanlar">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="kas-tekne-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="kas-tekne-hero-actions">
              <a href="#web-kaynaklari" className="kas-tekne-primary-link">
                Web Kaynaklarına Geç
              </a>
              <a href="#video-kaynaklari" className="kas-tekne-secondary-link">
                Video Seçkisini Aç
              </a>
            </div>
          </div>

          <div className="kas-tekne-hero-visual" aria-hidden="true">
            <div className="kas-tekne-hero-stat">
              <strong>3 dil</strong>
              <span>TR, DE ve EN içerik kümeleri</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Kaynak seçkisi</strong>
              <span>Resmi, editorial ve video odaklı karışım</span>
            </div>
            <div className="kas-tekne-hero-stat">
              <strong>Pratik kullanım</strong>
              <span>Okuma, keşif ve dış link akışı birlikte</span>
            </div>
          </div>
        </section>

        <section className="kas-tekne-summary-grid" aria-label="Kaş yazı dizileri hızlı özet">
          {summaryCards.length > 0 ? (
            summaryCards.map((paragraph, index) => (
              <article key={index} className="kas-tekne-surface kas-tekne-summary-card">
                <h2>{index === 0 ? 'Türkçe çekirdek set' : index === 1 ? 'Almanca görünüm' : 'İngilizce seçki'}</h2>
                <p>{paragraph}</p>
              </article>
            ))
          ) : (
            <article className="kas-tekne-surface kas-tekne-summary-card">
              <h2>Kaynak dosyası okunamadı</h2>
              <p>Markdown raporu şu anda yüklenemedi. İçerik geri geldiğinde bu alan otomatik olarak doldurulacak.</p>
            </article>
          )}
        </section>

        <section className="kas-tekne-stack">
          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Nasıl kullanılmalı?</span>
            <h2>Bu sayfa ham rapor değil, okunabilir bir Kaş kaynak rehberi olarak tasarlandı</h2>
            <p>
              Buradaki seçki; resmi destinasyon sayfaları, büyük seyahat rehberleri, topluluk rehberleri ve YouTube
              videolarını aynı editorial akışta bir araya getirir. Böylece kullanıcı önce hangi dilde ve hangi formatta
              araştırma yapmak istediğini seçebilir, ardından doğrudan doğru kaynağa gidebilir.
            </p>
            <p>
              Özellikle ilk araştırma aşamasında resmi kaynaklarla editorial içerikleri, daha sonra da video ve rota
              anlatılarını birlikte görmek Kaş hakkında daha dengeli ve daha hızlı bir çerçeve kurmaya yardım eder.
            </p>
          </article>

          <article id="web-kaynaklari" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Web kaynakları</span>
            <h2>Dil bazında öne çıkan Kaş okuma kaynakları</h2>
            {webGroups.length > 0 ? (
              <div className="kas-tekne-stack">
                {webGroups.map(([groupLabel, items]) => (
                  <section key={groupLabel} className="kas-tekne-route-card">
                    <h3>{groupLabel}</h3>
                    <p>{`${getLanguageLabel(groupLabel)} dilinde Kaş’ı okumak için öne çıkan seçkiler.`}</p>
                    <div className="kas-tekne-type-grid">
                      {items.map((item) => (
                        <article key={item.url} className="kas-tekne-type-card">
                          <h3>{item.title}</h3>
                          <p>{item.summary}</p>
                          <p>{`${item.language} • ${item.type}`}</p>
                          <a
                            href={item.url}
                            className="kas-tekne-text-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Kaynağı aç
                          </a>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <p>Web kaynakları şu anda yüklenemedi.</p>
            )}
          </article>

          <article id="video-kaynaklari" className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Video seçkisi</span>
            <h2>Kaş’ı izleyerek keşfetmek isteyenler için video kaynakları</h2>
            {videoGroups.length > 0 ? (
              <div className="kas-tekne-stack">
                {videoGroups.map(([groupLabel, items]) => (
                  <section key={groupLabel} className="kas-tekne-route-card">
                    <h3>{groupLabel}</h3>
                    <p>{`${getLanguageLabel(groupLabel)} dilinde öne çıkan Kaş video rehberleri.`}</p>
                    <div className="kas-tekne-type-grid">
                      {items.map((item) => (
                        <article key={item.url} className="kas-tekne-type-card">
                          <h3>{item.title}</h3>
                          <p>{item.summary}</p>
                          <p>{`${item.language} • ${item.type}`}</p>
                          <a
                            href={item.url}
                            className="kas-tekne-text-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Videoyu aç
                          </a>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <p>Video kaynakları şu anda yüklenemedi.</p>
            )}
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Pratik notlar</span>
            <h2>Kaynakları kullanırken işinize yarayacak kısa uygulama notları</h2>
            {data?.implementationNotes?.length ? (
              <ul className="kas-tekne-checklist">
                {data.implementationNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p>Pratik notlar şu anda yüklenemedi.</p>
            )}
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Araştırma akışı</span>
            <h2>Rapor hangi mantıkla derlendi?</h2>
            {data?.timeline?.length ? (
              <div className="kas-tekne-type-grid">
                {data.timeline.map((step) => (
                  <section key={`${step.section}-${step.step}`} className="kas-tekne-type-card">
                    <h3>{step.step}</h3>
                    <p>{step.detail}</p>
                    <p>{step.section}</p>
                  </section>
                ))}
              </div>
            ) : (
              <p>Kaynak toplama, dil kümeleri, embed notları ve çıktı düzeni üzerinden ilerleyen bir araştırma akışı kullanıldı.</p>
            )}
          </article>

          <article className="kas-tekne-surface kas-tekne-article-card">
            <span className="kas-tekne-section-kicker">Kısa sonuç</span>
            <h2>Kaş hakkında daha derin okumak isteyenler için tek durak</h2>
            <p>
              Bu sayfa, Kaş hakkında dağınık duran çok dilli kaynakları tek bir editorial başlangıç alanında toplar.
              Hızlıca resmi kaynaklara gidebilir, daha editorial rehberleri açabilir ya da doğrudan video anlatılarına
              geçebilirsiniz.
            </p>
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
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Yazı Dizileri', 'https://www.kasguide.de/yazi-dizileri')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
