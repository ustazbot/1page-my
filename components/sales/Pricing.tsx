'use client'
import AnimateIn from './AnimateIn'

const rows = [
  {
    service: '1 Landing Page',
    price: 'RM150',
    note: '',
    featured: true,
  },
  {
    service: 'Revision (selepas deploy)',
    price: 'RM50',
    note: '/ sesi',
    featured: false,
  },
  {
    service: 'Setup domain sendiri',
    price: '+RM30',
    note: '(sekali)',
    featured: false,
  },
  {
    service: 'Kami uruskan domain baru',
    price: '+RM120',
    note: '/ tahun',
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section
      style={{
        background: '#1C1917',
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 60px)',
        position: 'relative',
      }}
    >
      {/* Bottom section transition */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 72,
          background: '#FFFFFF',
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
        }}
      />

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <AnimateIn>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#F97316',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Harga
          </p>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 52px)',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: '#F8F6F1',
              marginBottom: 'clamp(36px, 5vw, 56px)',
            }}
          >
            Transparent.
            <br />
            Tiada hidden fees.
          </h2>
        </AnimateIn>

        <AnimateIn delay={100}>
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {rows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  padding: 'clamp(18px, 2.5vw, 24px) clamp(20px, 3.5vw, 36px)',
                  background: row.featured ? '#F97316' : i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {row.featured && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        fontWeight: 600,
                        background: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: 100,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      Paling popular
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: row.featured ? 700 : 500,
                      fontSize: row.featured ? 'clamp(16px, 2vw, 20px)' : 'clamp(14px, 1.8vw, 17px)',
                      color: row.featured ? '#FFFFFF' : '#D6D3D1',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {row.service}
                  </span>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: row.featured ? 'clamp(20px, 2.8vw, 32px)' : 'clamp(16px, 2vw, 20px)',
                      color: row.featured ? '#FFFFFF' : '#F8F6F1',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {row.price}
                  </span>
                  {row.note && (
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: row.featured ? 'rgba(255,255,255,0.75)' : '#78716C',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>

        <AnimateIn delay={200}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#78716C',
              textAlign: 'center',
              marginTop: 24,
              fontStyle: 'italic',
            }}
          >
            &ldquo;Tengok preview dulu. Bayar lepas setuju. Tiada hidden fees.&rdquo;
          </p>
        </AnimateIn>

        <AnimateIn delay={300}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              marginTop: 40,
            }}
          >
            <a
              href="/order"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 17,
                padding: '16px 36px',
                background: '#F97316',
                color: 'white',
                borderRadius: 10,
                textDecoration: 'none',
                letterSpacing: '-0.02em',
                transition: 'background 0.2s ease, transform 0.15s ease',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EA6A0A'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F97316'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Cuba Percuma — Bayar Lepas Setuju
            </a>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: '#78716C',
              }}
            >
              Tengok preview dulu. Bayar lepas setuju.
            </span>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
