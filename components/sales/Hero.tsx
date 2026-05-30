'use client'
import AnimateIn from './AnimateIn'

const HeroArt = () => (
  <svg
    viewBox="0 0 520 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: 'auto', maxWidth: 520 }}
    aria-hidden="true"
  >
    {/* Warm glow backdrop */}
    <ellipse cx="330" cy="230" rx="250" ry="230" fill="#FEF3E2" />
    <ellipse cx="400" cy="160" rx="140" ry="130" fill="#FDBA74" opacity="0.25" />

    {/* Shadow layer behind card */}
    <ellipse cx="252" cy="415" rx="160" ry="28" fill="#F97316" opacity="0.08" />

    {/* Main page card - tilted */}
    <g transform="rotate(-7 250 250)">
      {/* Card body */}
      <rect x="72" y="44" width="300" height="390" rx="18" fill="white" />

      {/* Orange header bar */}
      <rect x="72" y="44" width="300" height="68" rx="18" fill="#F97316" />
      {/* Fix header bottom edge */}
      <rect x="72" y="90" width="300" height="22" fill="#F97316" />

      {/* URL bar */}
      <rect x="96" y="59" width="176" height="22" rx="11" fill="rgba(255,255,255,0.22)" />
      <text
        x="184"
        y="74"
        fill="white"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="9"
        textAnchor="middle"
        opacity="0.85"
      >
        bisnes-anda.1page.my
      </text>

      {/* Fake hero image area */}
      <rect x="92" y="134" width="260" height="116" rx="10" fill="#FEF3E2" />
      <circle cx="222" cy="192" rx="28" r="28" fill="#FED7AA" />
      <circle cx="222" cy="192" rx="14" r="14" fill="#FDBA74" />

      {/* Fake headline lines */}
      <rect x="92" y="270" width="190" height="16" rx="8" fill="#1C1917" opacity="0.18" />
      <rect x="92" y="297" width="248" height="10" rx="5" fill="#E7E5E4" />
      <rect x="92" y="315" width="210" height="10" rx="5" fill="#E7E5E4" />
      <rect x="92" y="333" width="230" height="10" rx="5" fill="#E7E5E4" />

      {/* CTA button inside card */}
      <rect x="92" y="364" width="148" height="44" rx="22" fill="#F97316" />
      <text
        x="166"
        y="391"
        fill="white"
        fontFamily="'DM Sans', sans-serif"
        fontSize="12"
        textAnchor="middle"
        fontWeight="600"
      >
        Hubungi Kami
      </text>
    </g>

    {/* Orange accent orbs - top right */}
    <circle cx="462" cy="82" r="72" fill="#F97316" opacity="0.10" />
    <circle cx="472" cy="72" r="42" fill="#F97316" opacity="0.20" />
    <circle cx="482" cy="62" r="22" fill="#F97316" opacity="0.55" />

    {/* Small floating accents */}
    <circle cx="52" cy="160" r="11" fill="#F97316" opacity="0.45" />
    <circle cx="38" cy="310" r="7" fill="#FED7AA" />
    <rect x="430" y="360" width="54" height="54" rx="12" fill="#FEF3E2" transform="rotate(18 457 387)" />
    <circle cx="498" cy="355" r="16" fill="#F97316" opacity="0.18" />

    {/* Decorative tick/check mark */}
    <g transform="translate(30, 400)">
      <circle cx="16" cy="16" r="16" fill="#F97316" opacity="0.15" />
      <polyline
        points="8,16 13,21 24,11"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </g>
  </svg>
)

export default function Hero() {
  return (
    <section
      style={{
        background: '#F8F6F1',
        padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 60px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Diagonal bottom divider */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 80,
          background: '#FFFFFF',
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
        }}
      >
        {/* Text column */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AnimateIn delay={0}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FEF3E2',
                border: '1px solid #FED7AA',
                borderRadius: 100,
                padding: '6px 14px',
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#F97316',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#EA580C',
                  letterSpacing: '-0.01em',
                }}
              >
                Preview percuma · Bayar lepas setuju
              </span>
            </div>
          </AnimateIn>

          <AnimateIn delay={80}>
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(36px, 5.5vw, 68px)',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                color: '#1C1917',
                margin: '0 0 20px',
              }}
            >
              Landing Page{' '}
              <br />
              untuk Bisnes Anda.{' '}
              <br />
              <span style={{ color: '#F97316' }}>Professional.</span>{' '}
              <br />
              Cepat.{' '}
              <span
                style={{
                  display: 'inline-block',
                  background: '#F97316',
                  color: 'white',
                  padding: '0 12px 4px',
                  borderRadius: 6,
                  lineHeight: 1.15,
                }}
              >
                RM150.
              </span>
            </h1>
          </AnimateIn>

          <AnimateIn delay={160}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(16px, 2vw, 20px)',
                lineHeight: 1.65,
                color: '#78716C',
                margin: '0 0 36px',
                maxWidth: 460,
              }}
            >
              Pelanggan nampak bisnes anda serius —
              <br />
              tanpa perlu faham benda teknikal.
            </p>
          </AnimateIn>

          <AnimateIn delay={240}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
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
                  transition: 'background 0.2s, transform 0.15s',
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
                  paddingLeft: 4,
                }}
              >
                Tengok preview dulu. Bayar lepas setuju.
              </span>
            </div>
          </AnimateIn>
        </div>

        {/* SVG art column — grid-breaking */}
        <AnimateIn
          delay={120}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 540,
              marginRight: 'clamp(-20px, -4vw, -60px)',
            }}
          >
            <HeroArt />
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
