// app/candidate/[subdomain]/components/HeroSection.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: CandidateBrief
  warna: string
}

export default function HeroSection({ c, warna }: Props) {
  const hasKawasanImage = Boolean(c.kawasan_image_url)

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 24px',
      overflow: 'hidden',
      background: hasKawasanImage ? 'transparent' : `linear-gradient(160deg, ${warna} 0%, #0f172a 100%)`,
    }}>
      {/* Blurred background layer */}
      {hasKawasanImage && (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${c.kawasan_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(14px)',
            transform: 'scale(1.12)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'rgba(0,0,0,0.62)',
          }} />
        </>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, width: '100%' }}>
        {/* Logo parti */}
        {c.parti_logo_url && (
          <div className="hero-parti" style={{ marginBottom: 20 }}>
            <img
              src={c.parti_logo_url}
              alt={`Logo ${c.parti_name}`}
              style={{ height: 52, objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Foto calon */}
        {c.photo_url && (
          <div className="hero-photo" style={{ marginBottom: 24 }}>
            <img
              src={c.photo_url}
              alt={`Foto ${c.full_name}`}
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'top',
                border: '4px solid rgba(255,255,255,0.25)',
                boxShadow: '0 0 48px rgba(255,255,255,0.12)',
              }}
            />
          </div>
        )}

        {/* Nama */}
        <h1 className="hero-nama" style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(30px, 6vw, 54px)',
          fontWeight: 900,
          color: '#fff',
          marginBottom: 12,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}>
          {c.full_name}
        </h1>

        {/* Kawasan badge */}
        <div className="hero-nama" style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 18px',
            borderRadius: 999,
            border: '1px solid #d4a853',
            color: '#d4a853',
            fontSize: 12,
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-dm)',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}>
            {c.kawasan_jenis} {c.kawasan} &nbsp;·&nbsp; {c.parti_name}
          </span>
        </div>

        {/* Tagline */}
        {c.tagline && (
          <p className="hero-tagline" style={{
            fontSize: 18,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.88)',
            maxWidth: 480,
            margin: '0 auto 32px',
            lineHeight: 1.65,
            borderLeft: '3px solid #d4a853',
            paddingLeft: 18,
            textAlign: 'left',
            fontFamily: 'var(--font-dm)',
            fontWeight: 300,
          }}>
            &ldquo;{c.tagline}&rdquo;
          </p>
        )}

        {/* CTA row */}
        <div className="hero-cta" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
        }}>
          {c.whatsapp && (
            <a
              href={`https://wa.me/${c.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#22c55e',
                color: '#fff',
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 16,
                fontFamily: 'var(--font-dm)',
              }}
            >
              💬 Hubungi {c.preferred_name || c.full_name}
            </a>
          )}
          {c.facebook_url && (
            <a href={c.facebook_url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-dm)',
            }}>Facebook</a>
          )}
          {c.instagram_url && (
            <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-dm)',
            }}>Instagram</a>
          )}
          {c.tiktok_url && (
            <a href={c.tiktok_url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-dm)',
            }}>TikTok</a>
          )}
        </div>
      </div>
    </section>
  )
}
