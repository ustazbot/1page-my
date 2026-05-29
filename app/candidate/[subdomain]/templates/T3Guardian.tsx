// app/candidate/[subdomain]/templates/T3Guardian.tsx
import type { CandidateBrief } from '../types'
import type { Palette } from '@/lib/candidate-colors'

interface Props { candidate: CandidateBrief; palette: Palette }

const STYLES = `
  @keyframes t3FadeIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .t3-hero-content > * { animation: t3FadeIn 0.65s ease both; }
  .t3-hero-content > *:nth-child(1) { animation-delay: 0.1s; }
  .t3-hero-content > *:nth-child(2) { animation-delay: 0.2s; }
  .t3-hero-content > *:nth-child(3) { animation-delay: 0.3s; }
  .t3-hero-content > *:nth-child(4) { animation-delay: 0.4s; }
  .t3-hero-content > *:nth-child(5) { animation-delay: 0.5s; }
  @supports (animation-timeline: scroll()) {
    .t3-reveal {
      animation: t3FadeIn 0.7s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .t3-stats-bar { display: flex; flex-wrap: wrap; justify-content: space-around; }
  .t3-stats-bar > div + div { border-left: 1px solid #d4c9a8; }
  @media (max-width: 480px) { .t3-stats-bar > div + div { border-left: none; border-top: 1px solid #d4c9a8; } }
  .t3-fokus-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 16px; }
  .t3-galeri-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 12px; }
  details.t3-accordion summary { list-style: none; cursor: pointer; }
  details.t3-accordion summary::-webkit-details-marker { display: none; }
  details.t3-accordion[open] .t3-acc-icon { transform: rotate(180deg); }
  .t3-acc-icon { transition: transform 0.25s ease; display: inline-block; }
`

function buildStats(c: CandidateBrief) {
  return [
    c.umur != null             ? { label: 'Tahun Umur',      value: String(c.umur) }             : null,
    c.bilangan_anak != null    ? { label: 'Anak',            value: String(c.bilangan_anak) }    : null,
    c.tahun_pengalaman != null ? { label: 'Thn Pengalaman',  value: String(c.tahun_pengalaman) } : null,
    c.nama_syarikat            ? { label: 'Syarikat',        value: c.nama_syarikat }             : null,
  ].filter((s): s is { label: string; value: string } => s !== null)
}

function buildSosmed(c: CandidateBrief) {
  return [
    c.facebook_url  ? { href: c.facebook_url,  label: 'Facebook' }  : null,
    c.instagram_url ? { href: c.instagram_url, label: 'Instagram' } : null,
    c.tiktok_url    ? { href: c.tiktok_url,    label: 'TikTok' }    : null,
  ].filter((s): s is { href: string; label: string } => s !== null)
}

const PATTERN_BG = `repeating-linear-gradient(
  45deg,
  rgba(201,168,76,0.06) 0px,
  rgba(201,168,76,0.06) 1px,
  transparent 1px,
  transparent 10px
), repeating-linear-gradient(
  -45deg,
  rgba(201,168,76,0.06) 0px,
  rgba(201,168,76,0.06) 1px,
  transparent 1px,
  transparent 10px
)`

export default function T3Guardian({ candidate: c, palette }: Props) {
  const stats   = buildStats(c)
  const sosmed  = buildSosmed(c)
  const mengapa = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  const penutup = c.ai_copy?.ayat_penutup
  const accent  = palette.accent
  const warm    = '#faf6ee'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main style={{ fontFamily: 'var(--font-dm)', overflowX: 'hidden', background: warm }}>

        {/* S1 HERO */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textAlign: 'center', padding: 'clamp(60px,8vw,100px) 24px' }}>
          {c.kawasan_image_url && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.kawasan_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px)', transform: 'scale(1.08)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${palette.primary}ee 0%, ${palette.primary}cc 100%)` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: PATTERN_BG }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

          <div className="t3-hero-content" style={{ position: 'relative', zIndex: 1, maxWidth: 560, width: '100%' }}>
            {c.parti_logo_url && (
              <img src={c.parti_logo_url} alt={c.parti_name}
                style={{ height: 48, objectFit: 'contain', marginBottom: 24, filter: 'brightness(0) invert(1)' }} />
            )}
            {c.photo_url && (
              <div style={{ marginBottom: 20 }}>
                <img src={c.photo_url} alt={`Foto ${c.full_name}`}
                  style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: `4px solid ${accent}`, boxShadow: `0 0 0 8px rgba(201,168,76,0.15)` }} />
              </div>
            )}
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 999, border: `1px solid ${accent}`, color: accent, fontFamily: 'var(--font-dm)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 16, background: 'rgba(201,168,76,0.08)' }}>
              {c.kawasan_jenis} {c.kawasan}&nbsp;&nbsp;·&nbsp;&nbsp;{c.parti_name}
            </div>
            <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
              {c.full_name}
            </h1>
            {c.tagline && (
              <p style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
                &ldquo;{c.tagline}&rdquo;
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
              {c.whatsapp && (
                <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  style={{ background: accent, color: '#1a1208', fontFamily: 'var(--font-lora)', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 999, textDecoration: 'none' }}>
                  Hubungi {c.preferred_name || c.full_name}
                </a>
              )}
              {sosmed.map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-dm)', fontSize: 13, padding: '13px 20px', borderRadius: 999, textDecoration: 'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* S2 STATS BAR */}
        {stats.length > 0 && (
          <div className="t3-stats-bar" style={{ background: warm, borderBottom: '1px solid #e0d5bc' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '18px 28px' }}>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 28, fontWeight: 700, color: palette.primary, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-dm)', fontSize: 10, color: '#8a7a5a', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* S3 MENGAPA BERTANDING */}
        {mengapa && (
          <section className="t3-reveal" style={{ background: palette.primary, padding: 'clamp(60px,8vw,100px) 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: PATTERN_BG }} />
            <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative' }}>
              <p style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 'clamp(17px,2.5vw,23px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, textAlign: 'center' }}>
                {mengapa}
              </p>
            </div>
          </section>
        )}

        {/* S4 KENALI CALON — vertical timeline */}
        {(c.profil_ringkas || c.pencapaian?.length > 0) && (
          <section className="t3-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: warm }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 48 }}>
                Kenali {c.preferred_name || c.full_name}
              </h2>
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${accent}, ${accent}88)` }} />
                {c.profil_ringkas && (
                  <div style={{ position: 'relative', marginBottom: 36 }}>
                    <div style={{ position: 'absolute', left: -28, top: 4, width: 16, height: 16, borderRadius: '50%', background: accent, border: '3px solid ' + warm }} />
                    <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 13, color: accent, letterSpacing: '0.06em', marginBottom: 8 }}>Latar Belakang</div>
                    <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 15, color: '#3a2e1a', lineHeight: 1.7 }}>{c.profil_ringkas}</p>
                  </div>
                )}
                {c.pencapaian?.map((p, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 24 }}>
                    <div style={{ position: 'absolute', left: -28, top: 6, width: 12, height: 12, borderRadius: '50%', background: warm, border: `2px solid ${accent}` }} />
                    <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 15, color: '#3a2e1a', lineHeight: 1.65 }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S5 FOKUS UTAMA */}
        {c.fokus?.length > 0 && (
          <section className="t3-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: '#f0ebe0' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 40 }}>
                Fokus Saya untuk {c.kawasan}
              </h2>
              <div className="t3-fokus-grid">
                {c.fokus.map((f, i) => (
                  <div key={i} style={{ background: warm, borderRadius: 12, padding: '22px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: palette.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 700, fontSize: 14, color: accent }}>{i + 1}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 15, color: '#3a2e1a', lineHeight: 1.6 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S6 GALERI */}
        {c.galeri_urls?.length > 0 && (
          <section className="t3-reveal" style={{ padding: 'clamp(48px,6vw,80px) 24px', background: warm }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 32 }}>
                Gerak Kerja di Lapangan
              </h2>
              <div className="t3-galeri-grid">
                {c.galeri_urls.slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt={`Gerak kerja ${i + 1}`}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 12 }} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S7 TESTIMONI */}
        {c.testimoni?.length > 0 && (
          <section className="t3-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: '#f0ebe0' }}>
            <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 80, color: accent, lineHeight: 0.5, marginBottom: 20 }}>&ldquo;</div>
              <p style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 'clamp(16px,2.5vw,21px)', color: '#2a2018', lineHeight: 1.85 }}>
                {c.testimoni[0].quote}
              </p>
              <div style={{ marginTop: 24, fontFamily: 'var(--font-dm)', fontSize: 12, color: palette.primary, letterSpacing: '0.08em' }}>
                {c.testimoni[0].nama}&nbsp;&nbsp;·&nbsp;&nbsp;{c.testimoni[0].kawasan_asal}
              </div>
            </div>
          </section>
        )}

        {/* S8 ISU & PENYELESAIAN — CSS accordion */}
        {c.isu_kawasan?.length > 0 && (
          <section className="t3-reveal" style={{ padding: 'clamp(60px,8vw,96px) 24px', background: warm }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700, color: palette.primary, textAlign: 'center', marginBottom: 40 }}>
                Isu Kawasan &amp; Penyelesaian
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.isu_kawasan.map((isu, i) => (
                  <details key={i} className="t3-accordion" style={{ background: '#f0ebe0', borderRadius: 10, overflow: 'hidden', border: '1px solid #e0d5bc' }}>
                    <summary style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 15, color: '#3a2018', lineHeight: 1.4 }}>{isu.masalah}</span>
                      <span className="t3-acc-icon" style={{ color: accent, fontSize: 18, flexShrink: 0 }}>▾</span>
                    </summary>
                    <div style={{ padding: '0 20px 18px', borderTop: `2px solid ${accent}` }}>
                      <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>Penyelesaian</div>
                      <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 400, fontSize: 15, color: '#3a2018', lineHeight: 1.65 }}>{isu.penyelesaian}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S9 CTA FOOTER */}
        <section style={{ background: palette.primary, padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: PATTERN_BG }} />
          <div style={{ position: 'relative', maxWidth: 540, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, color: '#fff', lineHeight: 1.35, marginBottom: 14 }}>
              {penutup || `Amanah untuk ${c.kawasan}, khidmat untuk rakyat.`}
            </h2>
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 36 }}>
              {c.kawasan_jenis} {c.kawasan}&nbsp;&nbsp;·&nbsp;&nbsp;{c.parti_name}
            </p>
            {c.whatsapp && (
              <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ background: accent, color: '#1a1208', fontFamily: 'var(--font-lora)', fontWeight: 700, fontSize: 16, padding: '15px 36px', borderRadius: 999, textDecoration: 'none', display: 'inline-block' }}>
                Hubungi {c.preferred_name || c.full_name}
              </a>
            )}
            {sosmed.length > 0 && (
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                {sosmed.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-dm)', fontSize: 12, letterSpacing: '0.08em', textDecoration: 'none' }}>
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
