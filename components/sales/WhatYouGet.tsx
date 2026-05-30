'use client'
import AnimateIn from './AnimateIn'

const items = [
  { label: '1 landing page', sub: 'Pilih dari 5 template premium' },
  { label: 'AI-assisted copywriting', sub: 'Copy ditulis khas untuk bisnes anda' },
  { label: 'Deploy + hosting percuma', sub: 'Cloudflare Pages — laju & selamat' },
  { label: 'Mobile responsive', sub: 'Nampak cantik di semua peranti' },
  { label: 'SEO basic included', sub: 'Meta title, description, OG tags' },
  { label: 'Preview percuma', sub: 'Tengok dulu, bayar lepas setuju' },
  { label: 'Siap dalam 24 jam', sub: 'Jam bekerja selepas brief diterima' },
]

const CheckIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <circle cx="11" cy="11" r="11" fill="#FEF3E2" />
    <polyline
      points="6,11.5 9.5,15 16,8"
      stroke="#F97316"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function WhatYouGet() {
  return (
    <section
      style={{
        background: '#FFFFFF',
        padding: 'clamp(64px, 10vw, 112px) clamp(20px, 5vw, 60px)',
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
          clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center',
          }}
        >
          {/* Left: Heading */}
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
              Apa Yang Dapat
            </p>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px, 4vw, 48px)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
                color: '#1C1917',
                marginBottom: 20,
              }}
            >
              Satu harga.
              <br />
              Semua dah
              <br />
              <span style={{ color: '#F97316' }}>termasuk.</span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(15px, 1.8vw, 18px)',
                lineHeight: 1.65,
                color: '#78716C',
                maxWidth: 380,
              }}
            >
              Tiada add-on tersembunyi. RM150 sahaja — dan anda dapat semuanya ini.
            </p>
          </AnimateIn>

          {/* Right: Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vw, 18px)' }}>
            {items.map((item, i) => (
              <AnimateIn key={i} delay={i * 80}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: 'clamp(14px, 2vw, 18px) clamp(16px, 2.5vw, 22px)',
                    background: '#F8F6F1',
                    borderRadius: 12,
                    border: '1px solid #E7E5E4',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = '#FED7AA'
                    el.style.background = '#FEFCE8'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = '#E7E5E4'
                    el.style.background = '#F8F6F1'
                  }}
                >
                  <CheckIcon />
                  <div>
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: 'clamp(14px, 1.7vw, 16px)',
                        color: '#1C1917',
                        letterSpacing: '-0.01em',
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: '#78716C',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
