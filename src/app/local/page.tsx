import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kaş Local | Kaş Guide',
  description: "Kaş Local yakında daha derin yerel içeriklerle genişleyecek.",
  alternates: { canonical: '/local' },
}

export default function LocalPage() {
  return (
    <main className="local-page">
      <section className="local-hero">
        <p className="local-eyebrow">Kaş Local</p>
        <h1>Kaş Local: Ben Yerlisiyim</h1>
        <p>
          Bu alanı Kaş&apos;ı daha içeriden okumak, yerel bakışla rota ve öneriler toplamak için hazırlıyoruz.
        </p>
      </section>

      <section className="local-grid">
        <article className="local-card">
          <h2>Yakında burada</h2>
          <p>Yerel öneriler, mahalle içgörüleri ve sadece kısa listelere sığmayan küçük notlar yer alacak.</p>
        </article>
        <article className="local-card">
          <h2>İlk yapı hazır</h2>
          <p>Bu turda sayfa iskeleti kuruldu. Sonraki adım içerik blokları ve editoryal veri akışını bağlamak olacak.</p>
        </article>
      </section>
    </main>
  )
}
