// app/candidate/[subdomain]/templates/T2Reformer.tsx
import type { CandidateBrief } from '../types'
import type { Palette } from '@/lib/candidate-colors'

interface Props { candidate: CandidateBrief; palette: Palette }

const STYLES = `
  @keyframes t2SlideLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .t2-hero-text > * { animation: t2SlideLeft 0.5s ease both; }
  .t2-hero-text > *:nth-child(1) { animation-delay: 0.05s; }
  .t2-hero-text > *:nth-child(2) { animation-delay: 0.15s; }
  .t2-hero-text > *:nth-child(3) { animation-delay: 0.25s; }
  .t2-hero-text > *:nth-child(4) { animation-delay: 0.35s; }
  .t2-hero-text > *:nth-child(5) { animation-delay: 0.45s; }
  @supports (animation-timeline: scroll()) {
    .t2-reveal {
      animation: t2SlideLeft 0.6s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .t2-kenali-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  @media (max-width: 640px) { .t2-kenali-grid { grid-template-columns: 1fr; } }
  .t2-isu-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @media (max-width: 600px) { .t2-isu-row { grid-template-columns: 1fr; } }
  .t2-stats-bar { display: flex; flex-wrap: wrap; gap: 32px; align-items: center; }
`

function buildStats(c: CandidateBrief) {
  return [
    c.umur != null             ? { label: 'TAHUN',          value: String(c.umur) }             : null,
    c.bilangan_anak != null    ? { label: 'ANAK',           value: String(c.bilangan_anak) }    : null,
    c.tahun_pengalaman != null ? { label: 'THN PENGALAMAN', value: String(c.tahun_pengalaman) } : null,
    c.nama_syarikat            ? { label: 'SYARIKAT',       value: c.nama_syarikat.toUpperCase() } : null,
  ].filter((s): s is { label: string; value: string } => s !== null)
}

function buildSosmed(c: CandidateBrief) {
  return [
    c.facebook_url  ? { href: c.facebook_url,  label: 'FACEBOOK' }  : null,
    c.instagram_url ? { href: c.instagram_url, label: 'INSTAGRAM' } : null,
    c.tiktok_url    ? { href: c.tiktok_url,    label: 'TIKTOK' }    : null,
  ].filter((s): s is { href: string; label: string } => s !== null)
}

export default function T2Reformer({ candidate: c, palette }: Props) {
  const stats  = buildStats(c)
  const sosmed = buildSosmed(c)
  const mengapa = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  const penutup = c.ai_copy?.ayat_penutup
  const accent  = palette.accent

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main style={{ fontFamily: 'var(--font-dm)', overflowX: 'hidden', background: '#000' }}>

        {/* S1 HERO */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', background: '#000' }}>
          {/* Foto background */}
          {c.photo_url && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${c.photo_url})`,
              backgroundSize: 'cover', backgroundPosition: 'center top',
              filter: 'blur(2px)', transform: 'scale(1.04)',
            }} />
          )}
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />
          {/* Diagonal accent strip */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '32%', height: '100%',
            background: accent,
            clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 18% 100%)',
            opacity: 0.88,
          }} />
          {/* Content */}
          <div className="t2-hero-text" style={{ position: 'relative', zIndex: 2, padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', paddingBottom: 80, maxWidth: 720 }}>
            {c.parti_logo_url && (
              <img src={c.parti_logo_url} alt={c.parti_name}
                style={{ height: 38, objectFit: 'contain', marginBottom: 20, filter: 'brightness(0) invert(1)' }} />
            )}
            <div style={{ background: accent, display: 'inline-block', padding: '4px 14px', fontFamily: 'var(--font-bebas)', fontSize: 14, letterSpacing: '0.12em', color: '#000', marginBottom: 16 }}>
              {c.kawasan_jenis} {c.kawasan}&nbsp;&nbsp;·&nbsp;&nbsp;{c.parti_name}
            </div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(56px,10vw,104px)', color: '#fff', lineHeight: 0.92, letterSpacing: '0.01em', marginBottom: 20 }}>
              {c.full_name.toUpperCase()}
            </div>
            {c.tagline && (
              <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 300, fontSize: 16, color: 'rgba(255,255,255,0.75)', borderLeft: `3px solid ${accent}`, paddingLeft: 14, marginBottom: 28, maxWidth: 460 }}>
                {c.tagline}
              </p>
            )}
            {c.whatsapp && (
              <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ background: accent, color: '#000', fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: '0.08em', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
                HUBUNGI SEKARANG
              </a>
            )}
          </div>
        </section>

        {/* S2 STATS BAR */}
        {stats.length > 0 && (
          <div className="t2-stats-bar" style={{ background: '#111', padding: '20px clamp(20px,5vw,60px)' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 38, color: accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* S3 MENGAPA BERTANDING */}
        {mengapa && (
          <section className="t2-reveal" style={{ background: '#0a0a0a', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 20, left: 'clamp(20px,5vw,60px)', fontFamily: 'var(--font-bebas)', fontSize: 140, color: accent, opacity: 0.07, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>→</div>
            <div style={{ maxWidth: 700, position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: '0.2em', color: accent, marginBottom: 20 }}>MENGAPA SAYA BERTANDING</div>
              <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 'clamp(16px,2.5vw,22px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75 }}>
                {mengapa}
              </p>
            </div>
          </section>
        )}

        {/* S4 KENALI CALON */}
        {(c.profil_ringkas || c.pencapaian?.length > 0) && (
          <section className="t2-reveal" style={{ background: '#111', padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(32px,5vw,52px)', color: '#fff', letterSpacing: '0.02em', marginBottom: 40 }}>
                KENALI {(c.preferred_name || c.full_name).toUpperCase()}
              </div>
              <div className="t2-kenali-grid">
                {c.profil_ringkas && (
                  <div style={{ borderTop: `3px solid ${accent}`, paddingTop: 18 }}>
                    <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 12, letterSpacing: '0.15em', color: accent, marginBottom: 10 }}>LATAR BELAKANG</div>
                    <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>{c.profil_ringkas}</p>
                  </div>
                )}
                {c.pencapaian?.length > 0 && (
                  <div style={{ borderTop: `3px solid ${accent}`, paddingTop: 18 }}>
                    <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 12, letterSpacing: '0.15em', color: accent, marginBottom: 10 }}>PENCAPAIAN</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {c.pencapaian.map((p, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-dm)', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                          <span style={{ color: accent, flexShrink: 0 }}>›</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{ borderTop: `3px solid ${accent}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 12, letterSpacing: '0.15em', color: accent, marginBottom: 10 }}>KAWASAN</div>
                  <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>
                    {c.kawasan_jenis} {c.kawasan}&nbsp;·&nbsp;{c.parti_name}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* S5 FOKUS UTAMA */}
        {c.fokus?.length > 0 && (
          <section className="t2-reveal" style={{ background: '#0a0a0a', padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(32px,5vw,52px)', color: '#fff', letterSpacing: '0.02em', marginBottom: 40 }}>FOKUS UTAMA</div>
              <div>
                {c.fokus.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '22px 0', borderBottom: '1px solid #181818' }}>
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 60, color: accent, lineHeight: 1, flexShrink: 0, minWidth: 44 }}>{i + 1}</span>
                    <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 20, paddingTop: 6 }}>
                      <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 500, fontSize: 16, color: '#fff', lineHeight: 1.55 }}>{f}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S6 GALERI */}
        {c.galeri_urls?.length > 0 && (
          <section className="t2-reveal" style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,60px)', background: '#111' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(32px,5vw,52px)', color: '#fff', letterSpacing: '0.02em', marginBottom: 28 }}>GERAK KERJA</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                <img src={c.galeri_urls[0]} alt="Gerak kerja 1"
                  style={{ width: c.galeri_urls.length > 1 ? '56%' : '100%', minWidth: 200, aspectRatio: '4/3', objectFit: 'cover', display: 'block', border: `4px solid ${accent}` }} />
                {c.galeri_urls.length > 1 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {c.galeri_urls.slice(1, 3).map((url, i) => (
                      <img key={i} src={url} alt={`Gerak kerja ${i + 2}`}
                        style={{ width: '100%', flex: 1, objectFit: 'cover', display: 'block', border: `4px solid ${accent}`, borderLeft: 'none', ...(i > 0 ? { borderTop: 'none' } : {}) }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* S7 TESTIMONI */}
        {c.testimoni?.length > 0 && (
          <section className="t2-reveal" style={{ background: '#0a0a0a', padding: 'clamp(60px,8vw,96px) 24px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', background: '#111', padding: '40px', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 88, color: accent, lineHeight: 0.55, marginBottom: 20 }}>&ldquo;</div>
              <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 300, fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                {c.testimoni[0].quote}
              </p>
              <div style={{ marginTop: 24, fontFamily: 'var(--font-bebas)', fontSize: 14, letterSpacing: '0.15em', color: accent }}>
                {c.testimoni[0].nama.toUpperCase()}&nbsp;&nbsp;·&nbsp;&nbsp;{c.testimoni[0].kawasan_asal.toUpperCase()}
              </div>
            </div>
          </section>
        )}

        {/* S8 ISU & PENYELESAIAN */}
        {c.isu_kawasan?.length > 0 && (
          <section className="t2-reveal" style={{ background: '#111', padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(32px,5vw,52px)', color: '#fff', letterSpacing: '0.02em', marginBottom: 40 }}>ISU &amp; PENYELESAIAN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {c.isu_kawasan.map((isu, i) => (
                  <div key={i} className="t2-isu-row">
                    <div style={{ background: 'rgba(220,38,38,0.08)', padding: '18px 20px', borderLeft: '3px solid #dc2626' }}>
                      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 11, letterSpacing: '0.15em', color: '#dc2626', marginBottom: 8 }}>ISU</div>
                      <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{isu.masalah}</p>
                    </div>
                    <div style={{ background: 'rgba(201,168,76,0.06)', padding: '18px 20px', borderLeft: `3px solid ${accent}` }}>
                      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 11, letterSpacing: '0.15em', color: accent, marginBottom: 8 }}>PENYELESAIAN</div>
                      <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{isu.penyelesaian}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S9 CTA FOOTER */}
        <section style={{ background: '#000', padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,60px)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(42px,8vw,84px)', color: '#fff', lineHeight: 0.92, letterSpacing: '0.01em', marginBottom: 28, whiteSpace: 'pre-line' }}>
              {penutup ? penutup.toUpperCase() : `UNDI PERUBAHAN\nUNTUK ${c.kawasan.toUpperCase()}`}
            </div>
            {c.whatsapp && (
              <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ background: accent, color: '#000', fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: '0.08em', padding: '18px 40px', textDecoration: 'none', display: 'inline-block', width: '100%', maxWidth: 420, textAlign: 'center', boxSizing: 'border-box' }}>
                HUBUNGI {(c.preferred_name || c.full_name).toUpperCase()}
              </a>
            )}
            {sosmed.length > 0 && (
              <div style={{ marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {sosmed.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: '0.1em', textDecoration: 'none' }}>
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
    </>
  )
}
