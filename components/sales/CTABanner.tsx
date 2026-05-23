'use client'
import AnimateIn from './AnimateIn'

export default function CTABanner() {
  return (
    <section
      id="form"
      style={{
        background: '#F97316',
        padding: 'clamp(72px, 10vw, 112px) clamp(20px, 5vw, 60px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -100,
          left: -40,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimateIn>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: '#FFFFFF',
              margin: '0 0 16px',
            }}
          >
            Nak landing page untuk bisnes anda?
          </h2>
        </AnimateIn>

        <AnimateIn delay={100}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(15px, 2vw, 20px)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.88)',
              margin: '0 0 40px',
            }}
          >
            Isi borang ringkas — kami hantar preview dulu,
            <br />
            bayar lepas setuju.
          </p>
        </AnimateIn>

        <AnimateIn delay={200}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Primary CTA */}
            <a
              href="/order"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(15px, 2vw, 18px)',
                padding: 'clamp(14px, 1.8vw, 18px) clamp(28px, 4vw, 48px)',
                background: '#1C1917',
                color: '#FFFFFF',
                borderRadius: 10,
                textDecoration: 'none',
                letterSpacing: '-0.02em',
                display: 'inline-block',
                transition: 'background 0.2s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#292524'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1C1917'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Isi Brief Sekarang — Percuma
            </a>

            {/* WhatsApp fallback — Malaysian SME preferred channel */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '60192323043'}?text=${encodeURIComponent('Hai, saya berminat nak buat landing page dengan 1page.my. Boleh tahu lebih lanjut?')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Tanya via WhatsApp
            </a>

            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              Preview percuma · Bayar lepas setuju
            </span>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
