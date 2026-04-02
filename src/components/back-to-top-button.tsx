'use client'

export function BackToTopButton() {
  return (
    <button
      type="button"
      className="back-to-top"
      aria-label="Yukarı çık"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <span className="back-to-top-glyph" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </span>
    </button>
  )
}
