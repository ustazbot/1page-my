// app/candidate/[subdomain]/templates/T1Statesman.tsx
import type { CandidateBrief } from '../types'
import type { Palette } from '@/lib/candidate-colors'

interface Props { candidate: CandidateBrief; palette: Palette }

const STYLES = `
  @keyframes t1FadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .t1-hero-content > * { animation: t1FadeUp 0.6s ease both; }
  .t1-hero-content > *:nth-child(1) { animation-delay: 0.1s; }
  .t1-hero-content > *:nth-child(2) { animation-delay: 0.2s; }
  .t1-hero-content > *:nth-child(3) { animation-delay: 0.3s; }
  .t1-hero-content > *:nth-child(4) { animation-delay: 0.4s; }
  .t1-hero-content > *:nth-child(5) { animation-delay: 0.5s; }
  @supports (animation-timeline: scroll()) {
    .t1-reveal {
      animation: t1FadeUp 0.7s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .t1-hero { display: grid; grid-template-columns: 40% 60%; min-height: 100vh; }
  @media (max-width: 768px) {
    .t1-hero { grid-template-columns: 1fr; }
    .t1-photo-col { min-height: 55vw; }
  }
  .t1-stats-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; }
  .t1-kenali-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 640px) { .t1-kenali-grid { grid-template-columns: 1fr; } }
  .t1-isu-row { display: grid; grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { .t1-isu-row { grid-template-columns: 1fr; } }
  .t1-galeri-sub { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px; }
`

function buildStats(c: CandidateBrief) {
  return [
    c.umur != null            ? { label: 'TAHUN UMUR',      value: String(c.umur) }            : null,
    c.bilangan_anak != null   ? { label: 'ANAK',            value: String(c.bilangan_anak) }   : null,
    c.tahun_pengalaman != null? { label: 'THN PENGALAMAN',  value: String(c.tahun_pengalaman) }: null,
    c.nama_syarikat           ? { label: 'SYARIKAT',        value: c.nama_syarikat }            : null,
  ].filter((s): s is { label: string; value: string } => s !== null)
}

function buildSosmed(c: CandidateBrief) {
  return [
    c.facebook_url  ? { href: c.facebook_url,  label: 'Facebook' }  : null,
    c.instagram_url ? { href: c.instagram_url, label: 'Instagram' } : null,
    c.tiktok_url    ? { href: c.tiktok_url,    label: 'TikTok' }    : null,
  ].filter((s): s is { href: string; label: string } => s !== null)
}

export default function T1Statesman({ candidate: c, palette }: Props) {
  const stats  = buildStats(c)
  const sosmed = buildSosmed(c)
  const mengapa = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  const penutup = c.ai_copy?.ayat_penutup

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main style={{ fontFamily: 'var(--font-source-serif)', overflowX: 'hidden', background: '#fff' }}>

        {/* S1 HERO */}
        <section className="t1-hero">
          {/* Left — photo */}
          <div className="t1-photo-col" style={{ position: 'relative', overflow: 'hidden', background: '#120d06' }}>
            {c.kawasan_image_url && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${c.kawasan_image_url})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: 0.15,
              }} />
            )}
            {c.photo_url && (
              <img src={c.photo_url} alt={`Foto ${c.full_name}`} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top',
              }} />
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
              background: `linear-gradient(to top, ${palette.primary}cc, transparent)`,
            }} />
          </div>

          {/* Right — content */}
          <div style={{
            background: palette.primary,
            padding: 'clamp(44px,6vw,80px) clamp(28px,5vw,64px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Noise overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }} />

            <div className="t1-hero-content" style={{ position: 'relative', maxWidth: 480 }}>
              {c.parti_logo_url && (
                <img src={c.parti_logo_url} alt={c.parti_name}
                  style={{ height: 44, objectFit: 'contain', marginBottom: 24 }} />
              )}
              <div style={{ fontFamily: 'var(--font-source-serif)', fontSize: 11, letterSpacing: '0.16em', color: palette.accent, textTransform: 'uppercase', marginBottom: 14 }}>
                {c.kawasan_jenis} {c.kawasan}&nbsp;&nbsp;·&nbsp;&nbsp;{c.parti_name}
              </div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
                {c.full_name}
              </h1>
              {c.tagline && (
                <p style={{ fontFamily: 'var(--font-source-serif)', fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, borderLeft: `4px solid ${palette.accent}`, paddingLeft: 18, marginBottom: 32, maxWidth: 400 }}>
                  &ldquo;{c.tagline}&rdquo;
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    style={{ background: palette.accent, color: '#1a0800', fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 14, padding: '12px 26px', textDecoration: 'none', letterSpacing: '0.02em' }}>
                    Hubungi Beliau
                  </a>
                )}
                {sosmed.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.78)', fontFamily: 'var(--font-source-serif)', fontSize: 13, padding: '12px 18px', textDecoration: 'none' }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* S2 STATS BAR */}
        {stats.length > 0 && (
          <div className="t1-stats-bar" style={{ background: palette.accent, padding: '18px 32px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 900, color: '#1a0800', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-source-serif)', fontSize: 9, letterSpacing: '0.14em', color: '#3a2010', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* S3 MENGAPA BERTANDING */}
        {mengapa && (
          <section className="t1-reveal" style={{ background: palette.primary, padding: 'clamp(60px,8vw,100px) 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, left: 16, fontFamily: 'var(--font-playfair)', fontSize: 220, color: palette.accent, opacity: 0.07, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
              &ldquo;
            </div>
            <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
              <p style={{ fontFamily: 'var(--font-source-serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.5vw,23px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.85, textAlign: 'center' }}>
                {mengapa}
              </p>
            </div>
          </section>
        )}

        {/* S4 KENALI CALON */}
        {(c.profil_ringkas || c.pencapaian?.length > 0) && (
          <section className="t1-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: '#faf8f4' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 48 }}>
                Kenali {c.preferred_name || c.full_name}
              </h2>
              <div className="t1-kenali-grid">
                {c.profil_ringkas && (
                  <div style={{ border: '1px solid #e8e0d0', padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-source-serif)', fontSize: 9, letterSpacing: '0.14em', color: palette.accent, textTransform: 'uppercase', marginBottom: 12 }}>Latar Belakang</div>
                    <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: 15, color: '#3a3028', lineHeight: 1.75 }}>{c.profil_ringkas}</p>
                  </div>
                )}
                {c.pencapaian?.length > 0 && (
                  <div style={{ border: '1px solid #e8e0d0', padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-source-serif)', fontSize: 9, letterSpacing: '0.14em', color: palette.accent, textTransform: 'uppercase', marginBottom: 12 }}>Pencapaian</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {c.pencapaian.map((p, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ color: palette.accent, fontFamily: 'var(--font-playfair)', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>—</span>
                          <span style={{ fontFamily: 'var(--font-source-serif)', fontSize: 15, color: '#3a3028', lineHeight: 1.6 }}>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* S5 FOKUS UTAMA */}
        {c.fokus?.length > 0 && (
          <section className="t1-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: '#fff' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 48 }}>
                Fokus Saya untuk {c.kawasan}
              </h2>
              <div>
                {c.fokus.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'flex-start', padding: '28px 0', borderBottom: i < c.fokus.length - 1 ? '1px solid #e8e0d0' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 60, fontWeight: 900, color: '#f0ebe0', lineHeight: 1, flexShrink: 0, minWidth: 52, userSelect: 'none' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: 17, color: '#2a2018', lineHeight: 1.65, paddingTop: 8 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S6 GALERI */}
        {c.galeri_urls?.length > 0 && (
          <section className="t1-reveal" style={{ padding: 'clamp(48px,6vw,80px) 24px', background: '#faf8f4' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 32 }}>
                Gerak Kerja di Lapangan
              </h2>
              <img src={c.galeri_urls[0]} alt="Gerak kerja 1"
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
              {c.galeri_urls.length > 1 && (
                <div className="t1-galeri-sub">
                  {c.galeri_urls.slice(1, 3).map((url, i) => (
                    <img key={i} src={url} alt={`Gerak kerja ${i + 2}`}
                      style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* S7 TESTIMONI */}
        {c.testimoni?.length > 0 && (
          <section className="t1-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: '#fff' }}>
            <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 88, color: palette.accent, lineHeight: 0.5, marginBottom: 24 }}>&ldquo;</div>
              <p style={{ fontFamily: 'var(--font-source-serif)', fontStyle: 'italic', fontSize: 'clamp(16px,2.5vw,21px)', color: '#2a2018', lineHeight: 1.8 }}>
                {c.testimoni[0].quote}
              </p>
              <div style={{ marginTop: 24, fontFamily: 'var(--font-source-serif)', fontSize: 11, letterSpacing: '0.1em', color: palette.primary, textTransform: 'uppercase' }}>
                {c.testimoni[0].nama}&nbsp;&nbsp;·&nbsp;&nbsp;{c.testimoni[0].kawasan_asal}
              </div>
            </div>
          </section>
        )}

        {/* S8 ISU & PENYELESAIAN */}
        {c.isu_kawasan?.length > 0 && (
          <section className="t1-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: '#faf8f4' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 48 }}>
                Isu Kawasan &amp; Penyelesaian
              </h2>
              <div style={{ border: '1px solid #e8e0d0' }}>
                <div className="t1-isu-row" style={{ background: palette.primary }}>
                  <div style={{ padding: '12px 20px', fontFamily: 'var(--font-source-serif)', fontSize: 9, letterSpacing: '0.14em', color: palette.accent, textTransform: 'uppercase' }}>Isu Kawasan</div>
                  <div style={{ padding: '12px 20px', borderLeft: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-source-serif)', fontSize: 9, letterSpacing: '0.14em', color: palette.accent, textTransform: 'uppercase' }}>Penyelesaian</div>
                </div>
                {c.isu_kawasan.map((isu, i) => (
                  <div key={i} className="t1-isu-row" style={{ borderTop: '1px solid #e8e0d0' }}>
                    <div style={{ padding: '20px', borderLeft: '3px solid #dc2626', fontFamily: 'var(--font-source-serif)', fontSize: 14, color: '#3a2018', lineHeight: 1.65 }}>{isu.masalah}</div>
                    <div style={{ padding: '20px', borderLeft: `3px solid ${palette.accent}`, fontFamily: 'var(--font-source-serif)', fontSize: 14, color: '#3a2018', lineHeight: 1.65 }}>{isu.penyelesaian}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S9 CTA FOOTER */}
        <section style={{ background: palette.primary, padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 16 }}>
              {penutup || `Bersama membina ${c.kawasan} yang lebih baik.`}
            </h2>
            <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 36, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {c.kawasan_jenis} {c.kawasan}&nbsp;&nbsp;·&nbsp;&nbsp;{c.parti_name}
            </p>
            {c.whatsapp && (
              <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ background: palette.accent, color: '#1a0800', fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 16, padding: '16px 36px', textDecoration: 'none', display: 'inline-block', letterSpacing: '0.02em' }}>
                Hubungi {c.preferred_name || c.full_name}
              </a>
            )}
            {sosmed.length > 0 && (
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                {sosmed.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-source-serif)', fontSize: 11, letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase' }}>
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
