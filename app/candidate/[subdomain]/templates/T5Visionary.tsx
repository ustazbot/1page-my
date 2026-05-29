// app/candidate/[subdomain]/templates/T5Visionary.tsx
import type { CandidateBrief } from '../types'
import type { Palette } from '@/lib/candidate-colors'

interface Props { candidate: CandidateBrief; palette: Palette }

const STYLES = `
  @keyframes t5FadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .t5-hero-content > * { animation: t5FadeUp 0.6s ease both; }
  .t5-hero-content > *:nth-child(1) { animation-delay: 0.05s; }
  .t5-hero-content > *:nth-child(2) { animation-delay: 0.15s; }
  .t5-hero-content > *:nth-child(3) { animation-delay: 0.25s; }
  .t5-hero-content > *:nth-child(4) { animation-delay: 0.35s; }
  .t5-hero-content > *:nth-child(5) { animation-delay: 0.45s; }
  @supports (animation-timeline: scroll()) {
    .t5-reveal {
      animation: t5FadeUp 0.65s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .t5-hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px,6vw,80px); align-items: center; min-height: 100vh; padding: clamp(60px,8vw,100px) clamp(24px,5vw,72px); }
  @media (max-width: 720px) { .t5-hero-inner { grid-template-columns: 1fr; min-height: auto; padding-top: 80px; } }
  .t5-stats-bar { display: flex; flex-wrap: wrap; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
  .t5-stats-bar > div + div { border-left: 1px solid #e5e7eb; }
  .t5-kenali-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 580px) { .t5-kenali-grid { grid-template-columns: 1fr; } }
  .t5-galeri-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 12px; }
  .t5-isu-table { width: 100%; border-collapse: collapse; }
  .t5-isu-table th, .t5-isu-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  .t5-isu-table th { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
  .t5-fokus-list { display: flex; flex-direction: column; gap: 0; }
`

function buildStats(c: CandidateBrief) {
  return [
    c.umur != null             ? { label: 'Umur',            value: String(c.umur) }             : null,
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

export default function T5Visionary({ candidate: c, palette }: Props) {
  const stats   = buildStats(c)
  const sosmed  = buildSosmed(c)
  const mengapa = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  const penutup = c.ai_copy?.ayat_penutup
  const accent  = palette.accent

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main style={{ fontFamily: 'var(--font-inter)', overflowX: 'hidden', background: '#fff', color: '#111' }}>

        {/* S1 HERO */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          {c.kawasan_image_url && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${c.kawasan_image_url})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.06, filter: 'grayscale(100%)',
            }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.92)' }} />

          <div className="t5-hero-inner" style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {c.photo_url ? (
                <div style={{ position: 'relative', width: 'clamp(200px,28vw,340px)', aspectRatio: '1' }}>
                  <img src={c.photo_url} alt={`Foto ${c.full_name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                  <div style={{ position: 'absolute', inset: -4, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', background: accent, zIndex: -1, opacity: 0.3 }} />
                </div>
              ) : (
                <div style={{ width: 'clamp(200px,28vw,340px)', aspectRatio: '1', background: '#f3f4f6', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
              )}
            </div>

            <div className="t5-hero-content">
              {c.parti_logo_url && (
                <img src={c.parti_logo_url} alt={c.parti_name}
                  style={{ height: 36, objectFit: 'contain', marginBottom: 20, opacity: 0.8 }} />
              )}
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: accent, background: `${accent}14`, padding: '4px 10px', display: 'inline-block', letterSpacing: '0.06em', marginBottom: 18, border: `1px solid ${accent}33` }}>
                [ {c.kawasan_jenis} {c.kawasan} · {c.parti_name} ]
              </div>
              <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16 }}>
                {c.full_name}
              </h1>
              {c.tagline && (
                <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 16, color: '#555', lineHeight: 1.7, borderLeft: `2px solid ${accent}`, paddingLeft: 14, marginBottom: 32, maxWidth: 400 }}>
                  {c.tagline}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    style={{ border: `2px solid ${palette.primary}`, color: palette.primary, fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 14, padding: '11px 24px', textDecoration: 'none', letterSpacing: '0.02em', background: 'transparent' }}>
                    Hubungi Beliau
                  </a>
                )}
                {sosmed.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#888', fontFamily: 'var(--font-inter)', fontSize: 13, padding: '11px 16px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* S2 STATS BAR */}
        {stats.length > 0 && (
          <div className="t5-stats-bar">
            {stats.map((s, i) => (
              <div key={i} style={{ padding: '20px 32px', textAlign: 'center', flex: '1 0 120px' }}>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 11, color: '#9ca3af', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* S3 MENGAPA BERTANDING */}
        {mengapa && (
          <section className="t5-reveal" style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,5vw,72px)', background: '#fafafa' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: 11, letterSpacing: '0.16em', color: accent, textTransform: 'uppercase', marginBottom: 20 }}>Mengapa Saya Bertanding</div>
              <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 'clamp(17px,2.5vw,22px)', color: '#1a1a1a', lineHeight: 1.85, borderLeft: `2px solid ${accent}`, paddingLeft: 24 }}>
                {mengapa}
              </p>
            </div>
          </section>
        )}

        {/* S4 KENALI CALON */}
        {(c.profil_ringkas || c.pencapaian?.length > 0) && (
          <section className="t5-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(24px,5vw,72px)', background: '#fff' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.01em', color: '#0a0a0a', marginBottom: 36 }}>
                Kenali {c.preferred_name || c.full_name}
              </h2>
              <div className="t5-kenali-grid">
                {c.profil_ringkas && (
                  <div style={{ border: '1px solid #e5e7eb', padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 10, letterSpacing: '0.14em', color: accent, textTransform: 'uppercase', marginBottom: 12 }}>Latar Belakang</div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 14, color: '#374151', lineHeight: 1.75 }}>{c.profil_ringkas}</p>
                  </div>
                )}
                {c.pencapaian?.length > 0 && (
                  <div style={{ border: '1px solid #e5e7eb', padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 10, letterSpacing: '0.14em', color: accent, textTransform: 'uppercase', marginBottom: 12 }}>Kelayakan</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {c.pencapaian.map((p, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 7 }} />
                          <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{p}</span>
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
          <section className="t5-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(24px,5vw,72px)', background: '#fafafa' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.01em', color: '#0a0a0a', marginBottom: 40 }}>
                Agenda Strategik
              </h2>
              <div className="t5-fokus-list">
                {c.fokus.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 13, color: accent }}>{i + 1}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 15, color: '#1f2937', flex: 1, lineHeight: 1.55 }}>{f}</p>
                    <div style={{ width: 60, height: 3, background: '#f3f4f6', borderRadius: 999, flexShrink: 0, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${100 - i * 12}%`, background: accent, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S6 GALERI */}
        {c.galeri_urls?.length > 0 && (
          <section className="t5-reveal" style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,72px)', background: '#fff' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.01em', color: '#0a0a0a', marginBottom: 28 }}>
                Gerak Kerja
              </h2>
              <div className="t5-galeri-grid">
                {c.galeri_urls.slice(0, 3).map((url, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <img src={url} alt={`Gerak kerja ${i + 1}`}
                      style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* S7 TESTIMONI */}
        {c.testimoni?.length > 0 && (
          <section className="t5-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(24px,5vw,72px)', background: '#fafafa' }}>
            <div style={{ maxWidth: 580, margin: '0 auto' }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 'clamp(16px,2.5vw,20px)', color: '#374151', lineHeight: 1.8 }}>
                {c.testimoni[0].quote}
              </p>
              <hr style={{ border: 'none', borderTop: `1px solid ${accent}`, margin: '20px 0', width: 40 }} />
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 13, color: '#111' }}>{c.testimoni[0].nama}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 12, color: '#9ca3af' }}>{c.testimoni[0].kawasan_asal}</div>
            </div>
          </section>
        )}

        {/* S8 ISU & PENYELESAIAN */}
        {c.isu_kawasan?.length > 0 && (
          <section className="t5-reveal" style={{ padding: 'clamp(60px,8vw,96px) clamp(24px,5vw,72px)', background: '#fff' }}>
            <div style={{ maxWidth: 840, margin: '0 auto', overflowX: 'auto' }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.01em', color: '#0a0a0a', marginBottom: 32 }}>
                Isu &amp; Penyelesaian
              </h2>
              <table className="t5-isu-table">
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ fontFamily: 'var(--font-syne)', color: '#6b7280', width: '50%' }}>Isu Kawasan</th>
                    <th style={{ fontFamily: 'var(--font-syne)', color: accent, borderLeft: `2px solid ${accent}`, width: '50%' }}>Penyelesaian</th>
                  </tr>
                </thead>
                <tbody>
                  {c.isu_kawasan.map((isu, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{isu.masalah}</td>
                      <td style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 14, color: '#1f2937', lineHeight: 1.6, borderLeft: `2px solid ${accent}` }}>{isu.penyelesaian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* S9 CTA FOOTER */}
        <section style={{ background: '#0a0a0a', padding: 'clamp(60px,8vw,100px) clamp(24px,5vw,72px)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 28 }}>
              {penutup || `Kepimpinan berasas data untuk ${c.kawasan}.`}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              {c.whatsapp && (
                <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  style={{ background: palette.primary, color: '#fff', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15, padding: '13px 28px', textDecoration: 'none', letterSpacing: '0.01em' }}>
                  Hubungi Beliau
                </a>
              )}
              {sosmed.map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-inter)', fontWeight: 300, fontSize: 13, padding: '13px 20px', textDecoration: 'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
              [ {c.kawasan_jenis} {c.kawasan} · {c.parti_name} · 1page.my ]
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
