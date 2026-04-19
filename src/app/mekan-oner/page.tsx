import type { Metadata } from 'next'

import { SubmitPlaceForm } from './submit-place-form'

export const metadata: Metadata = {
  title: 'Mekan Öner | Kaş Guide\'a Yeni Yer Ekle',
  description:
    "Kaş'ta beğendiğin bir mekanı Kaş Guide'a önermek için formu doldur. Editoryal inceleme sonrası yayımlanır.",
  alternates: { canonical: '/mekan-oner' },
  openGraph: { url: '/mekan-oner', type: 'website', locale: 'tr_TR', siteName: 'Kaş Guide' },
  robots: { index: true, follow: true },
}

export default function MekanOnerPage() {
  return (
    <main className="container page-shell">
      <section className="page-hero">
        <div>
          <p className="page-eyebrow">Katkıda Bulun</p>
          <h1 className="page-title">Mekan Öner</h1>
          <p className="page-subtitle">
            Kaş&apos;ta sevdiğin bir mekanı paylaş, rehbere eklenmesi için inceleyelim.
          </p>
        </div>
      </section>

      <SubmitPlaceForm />
    </main>
  )
}
