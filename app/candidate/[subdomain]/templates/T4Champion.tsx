// app/candidate/[subdomain]/templates/T4Champion.tsx
import type { CandidateBrief } from '../types'
import type { Palette } from '@/lib/candidate-colors'

interface Props { candidate: CandidateBrief; palette: Palette }

const STYLES = `
  @keyframes t4FadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .t4-hero-text > * { animation: t4FadeUp 0.55s ease both; }
  .t4-hero-text > *:nth-child(1) { animation-delay: 0.1s; }
  .t4-hero-text > *:nth-child(2) { animation-delay: 0.2s; }
  .t4-hero-text > *:nth-child(3) { animation-delay: 0.3s; }
  .t4-hero-text > *:nth-child(4) { animation-delay: 0.4s; }
  @supports (animation-timeline: scroll()) {
    .t4-reveal {
      animation: t4FadeUp 0.65s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .t4-stats-pills { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 18px clamp(20px,5vw,60px); }
  .t4-fokus-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }
  .t4-galeri-sub { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
  @media (max-width: 480px) { .t4-galeri-sub { grid-template-columns: 1fr; } }
  .t4-testimoni-list { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; }
  .t4-testimoni-list > * { scroll-snap-align: start; }
  .t4-isu-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  @media (max-width: 520px) { .t4-isu-row { grid-template-columns: 1fr; } }
`

function buildStats(c: CandidateBrief) {
  return [
    c.umur != null             ? { label: 'Tahun',           value: String(c.umur) }             : null,
    c.bilangan_anak != null    ? { label: 'Anak',            value: String(c.bilangan_anak) }    : null,
    c.tahun_pengalaman != null ? { label: 'Thn Pengalaman',  value: String(c.tahun_pengalaman) } : null,
    c.nama_syarikat            ? { label: c.nama_syarikat,   value: '' }                          : null,
  ].filter((s): s is { label: string; value: string } => s !== null)
}

function buildSosmed(c: CandidateBrief) {
  return [
    c.facebook_url  ? { href: c.facebook_url,  label: 'Facebook' }  : null,
    c.instagram_url ? { href: c.instagram_url, label: 'Instagram' } : null,
    c.tiktok_url    ? { href: c.tiktok_url,    label: 'TikTok' }    : null,
  ].filter((s): s is { href: string; label: string } => s !== null)
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const init  = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  return <>{init.toUpperCase()}</>
}

export default function T4Champion({ candidate: c, palette }: Props) {
  const stats   = buildStats(c)
  const sosmed  = buildSosmed(c)
  const mengapa = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  const penutup = c.ai_copy?.ayat_penutup

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main style={{ fontFamily: 'var(--font-jakarta)', overflowX: 'hidden', background: '#f9f9f9' }}>

        {/* S1 HERO */}
        <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
          {c.kawasan_image_url
            ? <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.kawasan_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${palette.primary} 0%, #0a0a0a 100%)` }} />
          }
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }} />
          {c.photo_url && (
            <div style={{ position: 'absolute', right: 0, bottom: 0, width: 'clamp(220px,45%,480px)', height: '85%' }}>
              <img src={c.photo_url} alt={`Foto ${c.full_name}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 40%)' }} />
            </div>
          )}
          <div className="t4-hero-text" style={{ position: 'relative', zIndex: 2, padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)', paddingBottom: 'clamp(36px,5vw,60px)', maxWidth: 600 }}>
            {c.parti_logo_url && (
              <img src={c.parti_logo_url} alt={c.parti_name}
                style={{ height: 36, objectFit: 'contain', marginBottom: 16, filter: 'brightness(0) invert(1)' }} />
            )}
            <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(36px,7vw,72px)', fontWeight: 800, color: '#fff', lineHeight: 1.0, marginBottom: 14 }}>
              {c.full_name}
            </h1>
            <div style={{ display: 'inline-block', background: palette.primary, color: '#fff', fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 12, padding: '5px 14px', borderRadius: 999, marginBottom: 16 }}>
              {c.kawasan_jenis} {c.kawasan}
            </div>
            {c.tagline && (
              <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 24, maxWidth: 400 }}>
                {c.tagline}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {c.whatsapp && (
                <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#22c55e', color: '#fff', fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 15, padding: '13px 26px', borderRadius: 999, textDecoration: 'none' }}>
                  💬 Hubungi {c.preferred_name || c.full_name}
                </a>
              )}
              {sosmed.map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontSize: 13, padding: '13px 18px', borderRadius: 999, textDecoration: 'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* S2 STATS BAR */}
        {stats.length > 0 && (
          <div className="t4-stats-pills" style={{ background: palette.primary }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 13, padding: '7px 16px', borderRadius: 999 }}>
                {s.value ? <><strong>{s.value}</strong> {s.label}</> : s.label}
              </div>
            ))}
          </div>
        )}

        {/* S3 MENGAPA BERTANDING */}
        {mengapa && (
          <section className="t4-reveal" style={{ background: '#fff', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 12, color: palette.primary, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Mengapa Saya Bertanding
              </div>
              <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 'clamp(18px,2.8vw,26px)', color: '#111', lineHeight: 1.65 }}>
                {mengapa}
              </p>
            </div>
          </section>
        )}

        {/* S4 KENALI CALON */}
        {(c.profil_ringkas || c.pencapaian?.length > 0) && (
          <section className="t4-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)', background: '#f9f9f9' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#111', marginBottom: 36 }}>
                Kenali {c.preferred_name || c.full_name}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {c.profil_ringkas && (
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', borderLeft: `4px solid ${palette.primary}` }}>
                    <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 11, color: palette.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Latar Belakang</div>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 15, color: '#333', lineHeight: 1.7 }}>{c.profil_ringkas}</p>
                  </div>
                )}
                {c.pencapaian?.length > 0 && (
                  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', borderLeft: `4px solid ${palette.accent}` }}>
                    <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 11, color: palette.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Pencapaian</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {c.pencapaian.map((p, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ color: palette.primary, fontWeight: 800, flexShrink: 0 }}>✓</span>
                          <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 15, color: '#333', lineHeight: 1.6 }}>{p}</span>
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
          <section className="t4-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)', background: '#fff' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#111', marginBottom: 36 }}>
                Fokus Saya untuk {c.kawasan}
              </h2>
              <div className="t4-fokus-grid">
                {c.fokus.map((f, i) => (
                  <div key={i} style={{ background: '#f9f9f9', borderRadius: 14, padding: '20px', borderTop: `3px solid ${palette.primary}` }}>
                    <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 28, color: palette.primary, lineHeight: 1, marginBottom: 10 }}>{i + 1}</div>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 15, color: '#222', lineHeight: 1.6 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S6 GALERI — LARGEST SECTION */}
        {c.galeri_urls?.length > 0 && (
          <section className="t4-reveal" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', background: '#111' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#fff', marginBottom: 28 }}>
                Bersama Rakyat
              </h2>
              <div style={{ position: 'relative' }}>
                <img src={c.galeri_urls[0]} alt="Gerak kerja 1"
                  style={{ width: '100%', maxHeight: 560, objectFit: 'cover', display: 'block', borderRadius: 4 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>
                    {c.kawasan} — Gerak kerja lapangan
                  </span>
                </div>
              </div>
              {c.galeri_urls.length > 1 && (
                <div className="t4-galeri-sub">
                  {c.galeri_urls.slice(1, 3).map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt={`Gerak kerja ${i + 2}`}
                        style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', borderRadius: 4 }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
                        <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                          Program komuniti {c.kawasan}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* S7 TESTIMONI */}
        {c.testimoni?.length > 0 && (
          <section className="t4-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)', background: '#f9f9f9', overflow: 'hidden' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: '#111', marginBottom: 28 }}>
                Kata Mereka
              </h2>
              <div className="t4-testimoni-list">
                {c.testimoni.map((t, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', minWidth: 260, maxWidth: 320, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: palette.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 16 }}>
                      <Initials name={t.nama} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 14, color: '#333', lineHeight: 1.65, marginBottom: 16 }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 13, color: '#111' }}>{t.nama}</div>
                    <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 12, color: '#888' }}>{t.kawasan_asal}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S8 ISU & PENYELESAIAN */}
        {c.isu_kawasan?.length > 0 && (
          <section className="t4-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,5vw,60px)', background: '#fff' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 800, color: '#111', marginBottom: 36 }}>
                Isu &amp; Penyelesaian
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {c.isu_kawasan.map((isu, i) => (
                  <div key={i} className="t4-isu-row">
                    <div style={{ background: '#fef2f2', borderRadius: 12, padding: '16px 18px', borderLeft: '3px solid #ef4444' }}>
                      <div style={{ display: 'inline-block', background: '#ef4444', color: '#fff', fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 10, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.06em', marginBottom: 8 }}>ISU</div>
                      <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 14, color: '#991b1b', lineHeight: 1.6 }}>{isu.masalah}</p>
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '16px 18px', borderLeft: '3px solid #22c55e' }}>
                      <div style={{ display: 'inline-block', background: '#22c55e', color: '#fff', fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: 10, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.06em', marginBottom: 8 }}>PENYELESAIAN</div>
                      <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 14, color: '#166534', lineHeight: 1.6 }}>{isu.penyelesaian}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S9 CTA FOOTER */}
        <section style={{ background: '#1a2a1a', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 14 }}>
              {penutup || `Rakyat ${c.kawasan} adalah keutamaan saya.`}
            </h2>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
              {c.kawasan_jenis} {c.kawasan}&nbsp;&nbsp;·&nbsp;&nbsp;{c.parti_name}
            </p>
            {c.whatsapp && (
              <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ background: '#22c55e', color: '#fff', fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: 18, padding: '17px 40px', borderRadius: 999, textDecoration: 'none', display: 'inline-block' }}>
                💬 Hubungi {c.preferred_name || c.full_name}
              </a>
            )}
            {sosmed.length > 0 && (
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                {sosmed.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-jakarta)', fontSize: 13, textDecoration: 'none' }}>
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
