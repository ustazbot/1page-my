'use client'
import AnimateIn from './AnimateIn'

const testimonials = [
  {
    bisnes: 'Kanopi Cikgu Rahman',
    jenis: 'Sewa kanopi & khemah',
    quote: 'Sebelum ni susah nak cerita pasal bisnes bila orang tanya. Sekarang hantar link je.',
    initials: 'KR',
  },
  {
    bisnes: 'Anas Saudagar Kambing',
    jenis: 'Ternakan & jualan kambing',
    quote: '24 jam siap, nampak professional. Pelanggan ingat kami hire designer mahal.',
    initials: 'AK',
  },
  {
    bisnes: 'Soya Abang Jamil',
    jenis: 'Minuman soya tempatan',
    quote: 'Tak sangka RM150 dah dapat page macam ni. Tengok preview dulu baru bayar — memang berbaloi.',
    initials: 'SJ',
  },
  {
    bisnes: 'Restoran Wadi Hayat',
    jenis: 'Restoran',
    quote: 'Setup senang, kami fokus masak je. Link dah boleh share terus ke customer.',
    initials: 'RH',
  },
]

export default function Testimonials() {
  return (
    <section
      style={{
        background: '#F8F6F1',
        padding: 'clamp(64px, 10vw, 112px) clamp(20px, 5vw, 60px) clamp(80px, 10vw, 128px)',
        position: 'relative',
      }}
    >
      {/* Bottom diagonal to HowItWorks (#FFFFFF bg) */}
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

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
            Testimoni
          </p>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: '#1C1917',
              marginBottom: 'clamp(40px, 6vw, 72px)',
            }}
          >
            Bisnes mereka dah online.
          </h2>
        </AnimateIn>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: 'clamp(16px, 2.5vw, 24px)',
          }}
        >
          {testimonials.map((t, i) => (
            <AnimateIn key={i} delay={i * 100}>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E4',
                  borderRadius: 14,
                  padding: 'clamp(24px, 3vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#FEF3E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#F97316',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#1C1917',
                        letterSpacing: '-0.01em',
                        marginBottom: 2,
                      }}
                    >
                      {t.bisnes}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: '#78716C',
                      }}
                    >
                      {t.jenis}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(15px, 1.8vw, 17px)',
                    lineHeight: 1.65,
                    color: '#44403C',
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
