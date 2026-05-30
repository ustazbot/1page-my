'use client'
import AnimateIn from './AnimateIn'

const templates = [
  { file: 'bold_minimal', name: 'Bold Minimal' },
  { file: 'warm_heritage', name: 'Warm Heritage' },
  { file: 'cool_professional', name: 'Cool Professional' },
  { file: 'fresh_editorial', name: 'Fresh Editorial' },
  { file: 'dark_mode', name: 'Dark Mode' },
]

export default function TemplateGallery() {
  return (
    <section
      style={{
        background: '#FFFFFF',
        padding: 'clamp(64px, 10vw, 112px) clamp(20px, 5vw, 60px)',
        position: 'relative',
      }}
    >
      {/* Bottom diagonal to Pricing (#1C1917 bg) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 72,
          background: '#1C1917',
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
            Template
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
            5 reka bentuk untuk pilih.
          </h2>
        </AnimateIn>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(16px, 2vw, 24px)',
          }}
        >
          {templates.map((t, i) => (
            <AnimateIn key={i} delay={i * 80}>
              <TemplateCard name={t.name} file={t.file} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function TemplateCard({ name, file }: { name: string; file: string }) {
  return (
    <div
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#F8F6F1',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'scale(1.02)'
        el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'scale(1)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Screenshot — padding-bottom trick for 16:9 ratio */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/templates/${file}.png`}
          alt={name}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      </div>

      {/* Label */}
      <div
        style={{
          padding: '10px 16px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: '#78716C',
          textAlign: 'center',
          borderTop: '1px solid #E7E5E4',
        }}
      >
        {name}
      </div>
    </div>
  )
}
