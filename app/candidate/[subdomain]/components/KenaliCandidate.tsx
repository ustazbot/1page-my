// app/candidate/[subdomain]/components/KenaliCandidate.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'profil_ringkas' | 'pencapaian' | 'preferred_name' | 'full_name'>
  warna: string
}

export default function KenaliCandidate({ c, warna }: Props) {
  if (!c.profil_ringkas) return null
  const displayName = c.preferred_name || c.full_name

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 32,
          textAlign: 'center',
        }}>
          Siapa {displayName}?
        </h2>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 16,
          fontWeight: 400,
          color: '#374151',
          lineHeight: 1.85,
          marginBottom: c.pencapaian?.length ? 36 : 0,
        }}>
          {c.profil_ringkas}
        </p>
        {c.pencapaian?.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-dm)',
              fontWeight: 600,
              fontSize: 14,
              color: '#1f2937',
              marginBottom: 16,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Pencapaian &amp; Kelayakan
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.pencapaian.map((p, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontFamily: 'var(--font-dm)',
                  fontSize: 15,
                  color: '#374151',
                }}>
                  <span style={{ color: '#d4a853', marginTop: 3, flexShrink: 0 }}>✦</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
