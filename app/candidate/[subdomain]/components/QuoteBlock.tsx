// app/candidate/[subdomain]/components/QuoteBlock.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'quote_peribadi' | 'full_name'>
  warna: string
}

export default function QuoteBlock({ c, warna }: Props) {
  if (!c.quote_peribadi) return null

  return (
    <section className="section-reveal" style={{
      padding: '80px 24px',
      background: warna,
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 80,
          color: '#d4a853',
          lineHeight: 0.8,
          marginBottom: 16,
        }}>
          &ldquo;
        </div>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 22,
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.7,
          marginBottom: 24,
        }}>
          {c.quote_peribadi}
        </p>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          — {c.full_name}
        </p>
      </div>
    </section>
  )
}
