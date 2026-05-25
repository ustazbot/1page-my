// app/candidate/[subdomain]/components/GaleriGerakKerja.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'galeri_urls' | 'full_name'>
  warna: string
}

export default function GaleriGerakKerja({ c, warna }: Props) {
  const urls = c.galeri_urls || []
  if (!urls.length) return null

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: 12,
    display: 'block',
  }

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 36,
          textAlign: 'center',
        }}>
          Gerak Kerja di Lapangan
        </h2>

        {/* 1 gambar — full width 16:9 */}
        {urls.length === 1 && (
          <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}>
            <img src={urls[0]} alt={`Gerak kerja ${c.full_name} 1`} style={imgStyle} />
          </div>
        )}

        {/* 2 gambar — dua column equal */}
        {urls.length === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {urls.map((url, i) => (
              <div key={i} style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                <img src={url} alt={`Gerak kerja ${c.full_name} ${i + 1}`} style={imgStyle} />
              </div>
            ))}
          </div>
        )}

        {/* 3+ gambar — 1 besar atas, 2 kecil bawah */}
        {urls.length >= 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}>
              <img src={urls[0]} alt={`Gerak kerja ${c.full_name} 1`} style={imgStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                <img src={urls[1]} alt={`Gerak kerja ${c.full_name} 2`} style={imgStyle} />
              </div>
              <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                <img src={urls[2]} alt={`Gerak kerja ${c.full_name} 3`} style={imgStyle} />
                {urls.length > 3 && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-dm)',
                      color: '#fff',
                      fontSize: 24,
                      fontWeight: 600,
                    }}>
                      +{urls.length - 3} lagi
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
