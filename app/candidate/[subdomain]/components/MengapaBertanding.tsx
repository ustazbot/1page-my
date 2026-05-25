// app/candidate/[subdomain]/components/MengapaBertanding.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'mengapa_bertanding' | 'ai_copy'>
}

export default function MengapaBertanding({ c }: Props) {
  const content = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  if (!content) return null

  return (
    <section className="section-reveal" style={{
      padding: '80px 24px',
      background: '#0f172a',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 11,
          fontWeight: 500,
          color: '#d4a853',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Mengapa Saya Bertanding
        </p>
        <div style={{
          borderLeft: '3px solid #d4a853',
          paddingLeft: 28,
        }}>
          <p style={{
            fontFamily: 'var(--font-dm)',
            fontSize: 18,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.85,
          }}>
            {content}
          </p>
        </div>
      </div>
    </section>
  )
}
