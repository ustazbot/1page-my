// app/candidate/[subdomain]/components/CtaFooter.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'preferred_name' | 'full_name' | 'kawasan' | 'parti_name' | 'whatsapp' | 'facebook_url' | 'instagram_url' | 'tiktok_url' | 'subdomain' | 'ai_copy'>
  warna: string
}

export default function CtaFooter({ c, warna }: Props) {
  const displayName = c.preferred_name || c.full_name
  const ayatPenutup = c.ai_copy?.ayat_penutup || `Bersama kita perkasakan ${c.kawasan}`

  return (
    <>
      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        background: `linear-gradient(160deg, ${warna} 0%, #0f172a 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 12,
          }}>
            Sokong {displayName}
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 17,
            marginBottom: 36,
            fontWeight: 300,
          }}>
            {ayatPenutup}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            {c.whatsapp && (
              <a
                href={`https://wa.me/${c.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  fontWeight: 600,
                  padding: '16px 32px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  fontSize: 17,
                  fontFamily: 'var(--font-dm)',
                }}
              >
                💬 WhatsApp
              </a>
            )}
            {c.facebook_url && (
              <a href={c.facebook_url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 500,
                padding: '16px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 15,
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm)',
              }}>Facebook</a>
            )}
            {c.instagram_url && (
              <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 500,
                padding: '16px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 15,
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm)',
              }}>Instagram</a>
            )}
            {c.tiktok_url && (
              <a href={c.tiktok_url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 500,
                padding: '16px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 15,
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm)',
              }}>TikTok</a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a0f1a',
        color: '#4b5563',
        textAlign: 'center',
        padding: '24px',
      }}>
        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12 }}>
          {c.full_name} — {c.parti_name} — {c.kawasan}
        </p>
        <p style={{ marginTop: 6, fontFamily: 'var(--font-dm)', fontSize: 11 }}>
          Powered by{' '}
          <a href="https://1page.my" style={{ color: '#d4a853', textDecoration: 'none' }}>
            1page.my
          </a>
        </p>
      </footer>
    </>
  )
}
