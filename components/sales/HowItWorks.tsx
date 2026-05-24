'use client'
import AnimateIn from './AnimateIn'

const steps = [
  {
    num: '01',
    title: 'Isi Brief',
    duration: '5 minit',
    body: 'Jawab soalan ringkas dalam Google Form. Cerita pasal bisnes, produk, dan target pelanggan anda.',
  },
  {
    num: '02',
    title: 'Kami Setup & Hantar Preview',
    duration: '24 jam bekerja',
    body: 'Dalam 24 jam bekerja, kami siapkan landing page dan hantar preview untuk semakan anda.',
  },
  {
    num: '03',
    title: 'Setuju, Bayar, Live',
    duration: 'Sejam selepas bayar',
    body: 'Anda puas hati → bayar RM150 → page live. Tiada surprises, tiada hidden fees.',
  },
]

export default function HowItWorks() {
  return (
    <section
      style={{
        background: '#F8F6F1',
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 60px)',
        position: 'relative',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 72,
          background: '#FFFFFF',
          clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
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
            Cara Kerja
          </p>
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
              color: '#1C1917',
              marginBottom: 'clamp(48px, 7vw, 80px)',
            }}
          >
            Tiga langkah. Selesai.
          </h2>
        </AnimateIn>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(32px, 4vw, 48px)',
            position: 'relative',
          }}
        >
          {steps.map((step, i) => (
            <AnimateIn key={i} delay={i * 140}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Large step number */}
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 'clamp(64px, 7vw, 88px)',
                    lineHeight: 1,
                    color: '#E7E5E4',
                    letterSpacing: '-0.04em',
                    marginBottom: 12,
                  }}
                >
                  {step.num}
                </div>

                {/* Duration badge */}
                <div style={{ marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 500,
                      color: '#F97316',
                      background: '#FEF3E2',
                      border: '1px solid #FED7AA',
                      borderRadius: 100,
                      padding: '3px 10px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {step.duration}
                  </span>
                </div>

                {/* Divider line */}
                <div
                  style={{
                    height: 2,
                    background: 'linear-gradient(to right, #F97316, #E7E5E4)',
                    borderRadius: 2,
                    marginBottom: 20,
                    width: 80,
                  }}
                />

                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(18px, 2.2vw, 22px)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.25,
                    color: '#1C1917',
                    margin: '0 0 12px',
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(14px, 1.7vw, 17px)',
                    lineHeight: 1.65,
                    color: '#78716C',
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
