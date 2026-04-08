export function WhatsAppCommunitySection() {
  return (
    <section
      aria-label="WhatsApp Topluluğuna Katıl"
      style={{
        width: 'var(--main-shell-width)',
        margin: '1.4rem auto 0',
        paddingBottom: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          padding: '2.5rem 2rem',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.10) 0%, rgba(0, 168, 150, 0.10) 100%)',
          border: '1px solid rgba(37, 211, 102, 0.22)',
          boxShadow: '0 22px 52px rgba(26, 78, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.72)',
        }}
      >
        {/* WhatsApp ikonu */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" width="30" height="30" aria-hidden="true">
            <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04.01C5.55.01.29 5.27.29 11.76c0 2.08.54 4.11 1.57 5.9L0 24l6.53-1.71a11.73 11.73 0 0 0 5.51 1.4h.01c6.48 0 11.74-5.26 11.74-11.75 0-3.14-1.22-6.09-3.27-8.46zm-8.48 18.2h-.01a9.77 9.77 0 0 1-4.98-1.36l-.36-.21-3.88 1.02 1.04-3.78-.24-.39a9.75 9.75 0 0 1-1.5-5.19c0-5.39 4.39-9.78 9.79-9.78 2.61 0 5.06 1.01 6.91 2.87a9.7 9.7 0 0 1 2.87 6.91c0 5.39-4.39 9.79-9.78 9.79zm5.36-7.33c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.67.15-.2.29-.77.95-.95 1.15-.17.2-.35.22-.64.07-.29-.15-1.24-.46-2.36-1.47-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.03 1-1.03 2.44 0 1.44 1.05 2.83 1.2 3.03.15.2 2.07 3.15 5.02 4.42.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.14-.26-.21-.55-.36z" />
          </svg>
        </div>

        {/* Başlık */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center' }}>
          <h2
            style={{
              margin: 0,
              color: '#004d40',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            WhatsApp Topluluğuna Katıl!
          </h2>
          <span
            style={{
              display: 'block',
              width: 'min(96px, 28%)',
              height: '4px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #25D366 0%, rgba(37, 211, 102, 0.2) 100%)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Açıklama */}
        <p
          style={{
            margin: 0,
            color: 'var(--med-meta)',
            fontSize: '1rem',
            lineHeight: 1.65,
            maxWidth: '48ch',
          }}
        >
          Kaş&apos;a gidecekler, yerliler ve Kaşseverler bir arada. Sorularını sor,
          deneyimlerini paylaş, ipuçlarını keşfet.
        </p>

        {/* CTA Butonu */}
        <a
          href="https://chat.whatsapp.com/GODQNmpRlAaDDtyaDnIyn4"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-community-cta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '16px',
            background: '#25D366',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
            <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04.01C5.55.01.29 5.27.29 11.76c0 2.08.54 4.11 1.57 5.9L0 24l6.53-1.71a11.73 11.73 0 0 0 5.51 1.4h.01c6.48 0 11.74-5.26 11.74-11.75 0-3.14-1.22-6.09-3.27-8.46zm-8.48 18.2h-.01a9.77 9.77 0 0 1-4.98-1.36l-.36-.21-3.88 1.02 1.04-3.78-.24-.39a9.75 9.75 0 0 1-1.5-5.19c0-5.39 4.39-9.78 9.79-9.78 2.61 0 5.06 1.01 6.91 2.87a9.7 9.7 0 0 1 2.87 6.91c0 5.39-4.39 9.79-9.78 9.79zm5.36-7.33c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.67.15-.2.29-.77.95-.95 1.15-.17.2-.35.22-.64.07-.29-.15-1.24-.46-2.36-1.47-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.03 1-1.03 2.44 0 1.44 1.05 2.83 1.2 3.03.15.2 2.07 3.15 5.02 4.42.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.14-.26-.21-.55-.36z" />
          </svg>
          Topluluğa Katıl
        </a>
      </div>
    </section>
  )
}
