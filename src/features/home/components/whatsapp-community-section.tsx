export function WhatsAppCommunitySection() {
  return (
    <section className="whatsapp-community-section" aria-label="WhatsApp Topluluğuna Katıl">
      <div className="whatsapp-community-card">
        <div className="whatsapp-community-media" aria-hidden="true">
          <video
            className="whatsapp-community-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/kasguidevid.mp4" type="video/mp4" />
          </video>
          <div className="whatsapp-community-overlay" />
        </div>

        <div className="whatsapp-community-content">
          <div className="whatsapp-community-icon">
            <svg viewBox="0 0 24 24" fill="white" width="30" height="30" aria-hidden="true">
              <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04.01C5.55.01.29 5.27.29 11.76c0 2.08.54 4.11 1.57 5.9L0 24l6.53-1.71a11.73 11.73 0 0 0 5.51 1.4h.01c6.48 0 11.74-5.26 11.74-11.75 0-3.14-1.22-6.09-3.27-8.46zm-8.48 18.2h-.01a9.77 9.77 0 0 1-4.98-1.36l-.36-.21-3.88 1.02 1.04-3.78-.24-.39a9.75 9.75 0 0 1-1.5-5.19c0-5.39 4.39-9.78 9.79-9.78 2.61 0 5.06 1.01 6.91 2.87a9.7 9.7 0 0 1 2.87 6.91c0 5.39-4.39 9.79-9.78 9.79zm5.36-7.33c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.67.15-.2.29-.77.95-.95 1.15-.17.2-.35.22-.64.07-.29-.15-1.24-.46-2.36-1.47-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.03 1-1.03 2.44 0 1.44 1.05 2.83 1.2 3.03.15.2 2.07 3.15 5.02 4.42.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.14-.26-.21-.55-.36z" />
            </svg>
          </div>

          <div className="whatsapp-community-heading">
            <h2 className="whatsapp-community-title">
              Kaş&apos;a giderken WhatsApp topluluğuna katılmalı mısın?
            </h2>
            <span className="whatsapp-community-divider" aria-hidden="true" />
          </div>

          <p className="whatsapp-community-copy">
            Tabii ki! Kaş&apos;a gidecekler, yerliler ve Kaşseverler bir arada. Sorularını sor, deneyimlerini paylaş, ipuçlarını keşfet.
          </p>

          <a
            href="https://chat.whatsapp.com/GODQNmpRlAaDDtyaDnIyn4"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-community-cta"
          >
            <svg viewBox="0 0 24 24" fill="white" width="30" height="30" aria-hidden="true">
              <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04.01C5.55.01.29 5.27.29 11.76c0 2.08.54 4.11 1.57 5.9L0 24l6.53-1.71a11.73 11.73 0 0 0 5.51 1.4h.01c6.48 0 11.74-5.26 11.74-11.75 0-3.14-1.22-6.09-3.27-8.46zm-8.48 18.2h-.01a9.77 9.77 0 0 1-4.98-1.36l-.36-.21-3.88 1.02 1.04-3.78-.24-.39a9.75 9.75 0 0 1-1.5-5.19c0-5.39 4.39-9.78 9.79-9.78 2.61 0 5.06 1.01 6.91 2.87a9.7 9.7 0 0 1 2.87 6.91c0 5.39-4.39 9.79-9.78 9.79zm5.36-7.33c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.67.15-.2.29-.77.95-.95 1.15-.17.2-.35.22-.64.07-.29-.15-1.24-.46-2.36-1.47-.87-.78-1.46-1.75-1.63-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.03 1-1.03 2.44 0 1.44 1.05 2.83 1.2 3.03.15.2 2.07 3.15 5.02 4.42.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.73-.71 1.98-1.39.24-.68.24-1.26.17-1.39-.07-.14-.26-.21-.55-.36z" />
            </svg>
            Topluluğa Katıl
          </a>
        </div>
      </div>
    </section>
  )
}
