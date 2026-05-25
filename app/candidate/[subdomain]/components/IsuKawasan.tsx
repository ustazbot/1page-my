// app/candidate/[subdomain]/components/IsuKawasan.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'isu_kawasan'>
  warna: string
}

export default function IsuKawasan({ c, warna }: Props) {
  const list = c.isu_kawasan || []
  if (!list.length) return null

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
          Isu Kawasan &amp; Penyelesaian
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {list.map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                padding: '20px 24px',
                background: '#fef2f2',
                borderBottom: '1px solid #fee2e2',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#991b1b',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {item.masalah}
                </p>
              </div>
              <div style={{
                padding: '20px 24px',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>✅</span>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  fontWeight: 400,
                  fontSize: 15,
                  color: '#166534',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {item.penyelesaian}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
