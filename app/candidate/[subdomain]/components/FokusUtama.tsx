// app/candidate/[subdomain]/components/FokusUtama.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'fokus' | 'kawasan'>
  warna: string
}

export default function FokusUtama({ c, warna }: Props) {
  if (!c.fokus?.length) return null

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 48,
          textAlign: 'center',
        }}>
          Fokus Saya untuk {c.kawasan}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {c.fokus.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              padding: '24px 28px',
              background: '#fff',
              borderRadius: 12,
              borderLeft: `4px solid #d4a853`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <span style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 52,
                fontWeight: 900,
                color: '#f1f5f9',
                lineHeight: 1,
                minWidth: 52,
                userSelect: 'none',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{
                fontFamily: 'var(--font-dm)',
                fontWeight: 500,
                fontSize: 16,
                color: '#1f2937',
                lineHeight: 1.5,
                paddingTop: 12,
              }}>
                {f}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
