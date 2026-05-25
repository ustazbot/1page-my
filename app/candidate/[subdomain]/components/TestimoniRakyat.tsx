// app/candidate/[subdomain]/components/TestimoniRakyat.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'testimoni'>
  warna: string
}

export default function TestimoniRakyat({ c, warna }: Props) {
  const list = c.testimoni || []
  if (!list.length) return null

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#0f172a' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: '#fff',
          marginBottom: 48,
          textAlign: 'center',
        }}>
          Suara Rakyat
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(list.length, 2)}, 1fr)`,
          gap: 20,
        }}>
          {list.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 28,
            }}>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 40,
                color: '#d4a853',
                lineHeight: 0.8,
                marginBottom: 12,
              }}>
                &ldquo;
              </div>
              <p style={{
                fontFamily: 'var(--font-dm)',
                fontSize: 15,
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.7,
                marginBottom: 20,
              }}>
                {t.quote}
              </p>
              <div>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  fontWeight: 500,
                  color: '#fff',
                  fontSize: 13,
                }}>
                  {t.nama}
                </p>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 12,
                  marginTop: 2,
                }}>
                  {t.kawasan_asal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
