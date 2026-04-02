export default function PlaceDetailLoading() {
  return (
    <main className="place-detail-page" aria-busy="true" aria-label="Mekan yükleniyor...">
      <section className="place-detail-shell">
        <div className="place-detail-top-grid">
          <section className="place-detail-hero skeleton-block" style={{ minHeight: '315px' }} />
          <aside className="place-detail-hero-aside">
            <div className="skeleton-block" style={{ height: '120px', borderRadius: '20px' }} />
            <div className="skeleton-block" style={{ height: '140px', borderRadius: '20px', marginTop: '1rem' }} />
          </aside>
        </div>
        <section className="place-detail-content-grid" style={{ marginTop: '2rem' }}>
          <div className="skeleton-block" style={{ height: '200px', borderRadius: '20px' }} />
          <div className="skeleton-block" style={{ height: '200px', borderRadius: '20px' }} />
        </section>
      </section>
    </main>
  )
}
