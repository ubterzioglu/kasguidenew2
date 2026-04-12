import { SubmitPlaceForm } from './submit-place-form'

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
