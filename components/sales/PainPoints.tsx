'use client'
import AnimateIn from './AnimateIn'

const pains = [
  {
    title: 'Orang dah Google nama bisnes anda.',
    body: 'Tapi tak jumpa apa-apa.\nDiorang terus cari yang lain.',
    index: '01',
  },
  {
    title: 'Nak hire designer? Mahal.\nWant to DIY? Pening.',
    body: 'Nak pakai Canva?\nNampak macam Canva.',
    index: '02',
  },
  {
    title: 'Dah ada FB page, IG..',
    body: 'Tapi bila orang tanya link, takde tempat yang cerita lengkap pasal bisnes anda.',
    index: '03',
  },
]

export default function PainPoints() {
  return (
    <section
      style={{
        background: '#FFFFFF',
        padding: 'clamp(64px, 10vw, 112px) clamp(20px, 5vw, 60px) clamp(80px, 10vw, 128px)',
        position: 'relative',
      }}
    >
      {/* Bottom diagonal to next section */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 72,
          background: '#F8F6F1',
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
            Situasi yang familiar?
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
              maxWidth: 600,
            }}
          >
            Anda bukan seorang sahaja.
          </h2>
        </AnimateIn>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(16px, 2.5vw, 28px)',
          }}
        >
          {pains.map((pain, i) => (
            <AnimateIn key={i} delay={i * 120}>
              <div
                style={{
                  padding: 'clamp(28px, 3.5vw, 40px)',
                  borderLeft: '4px solid #F97316',
                  background: '#F8F6F1',
                  borderRadius: '0 12px 12px 0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background number */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -16,
                    right: 20,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 96,
                    fontWeight: 700,
                    color: '#E7E5E4',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {pain.index}
                </span>

                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(18px, 2.2vw, 24px)',
                    lineHeight: 1.25,
                    letterSpacing: '-0.025em',
                    color: '#1C1917',
                    margin: 0,
                    position: 'relative',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {pain.title}
                </h3>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(15px, 1.8vw, 18px)',
                    lineHeight: 1.6,
                    color: '#78716C',
                    margin: 0,
                    position: 'relative',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {pain.body}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
