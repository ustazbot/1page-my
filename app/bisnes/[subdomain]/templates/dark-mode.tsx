// app/bisnes/[subdomain]/templates/dark-mode.tsx
import type { BisnesOrder } from '../types'

const ANIMS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dm-hero { animation: fadeUp 0.6s ease 0.1s both; }
  .dm-sub  { animation: fadeUp 0.6s ease 0.25s both; }
  .dm-cta  { animation: fadeUp 0.6s ease 0.4s both; }
  @supports (animation-timeline: scroll()) {
    .dm-reveal {
      animation: fadeUp 0.6s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .dm-faq summary { list-style: none; cursor: pointer; }
  .dm-faq summary::-webkit-details-marker { display: none; }
  .dm-faq[open] .dm-chevron { transform: rotate(180deg); }
  .dm-chevron { transition: transform 0.2s; display: inline-block; }
`

function parseItems(raw: string): string[] {
  return raw.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
}

function waHref(number: string, message: string): string {
  return `https://wa.me/${number.replace(/^0/, '60')}?text=${encodeURIComponent(message)}`
}

function ctaCopy(jenis: string | null): string {
  if (!jenis) return 'WhatsApp Kami Sekarang'
  if (jenis.includes('F&B') || jenis.includes('Retail')) return 'Tanya Harga Sekarang'
  if (jenis.includes('Servis')) return 'Dapatkan Sebut Harga'
  return 'WhatsApp Kami Sekarang'
}

export default function DarkMode({ order }: { order: BisnesOrder }) {
  const items     = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []
  const cta       = ctaCopy(order.jenis_bisnes)
  const stats     = order.stats_bar?.filter(s => s.nilai && s.label) ?? []
  const usp       = order.usp?.filter(u => u.tajuk) ?? []
  const pakej     = order.pakej?.filter(p => p.nama) ?? []
  const testimoni = order.testimoni?.filter(t => t.ulasan) ?? []
  const faq       = order.faq?.filter(f => f.soalan) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#0f172a', color: '#f8fafc', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
        <section style={{ position: 'relative', height: '100svh', minHeight: 520 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.95) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 24px 120px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 24, borderRadius: 10, background: 'rgba(14,165,233,0.15)', padding: 8 }} />
            )}
            <div className="dm-hero" style={{ display: 'inline-block', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#0ea5e9', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, width: 'fit-content' }}>
              {order.jenis_bisnes || 'Bisnes'}
            </div>
            <h1 className="dm-hero" style={{ fontSize: 'clamp(36px,9vw,72px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#f8fafc' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p className="dm-sub" style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 36px', lineHeight: 1.6, maxWidth: 460 }}>
                {order.tagline}
              </p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer" className="dm-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="dm-reveal" style={{ background: '#0f172a', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0 28px', borderLeft: i > 0 ? '1px solid #1e293b' : 'none' }}>
                  <div style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{s.nilai}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="dm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: '18px 20px', borderLeft: '3px solid #0ea5e9' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{u.tajuk}</div>
                  {u.huraian && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="dm-reveal" style={{ padding: `${usp.length > 0 ? '0' : '64px'} 24px 64px`, background: '#0ea5e9', maxWidth: '100%' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e0f2fe', marginBottom: 24, opacity: 0.7 }}>Tentang Kami</p>
              <p style={{ fontSize: 'clamp(18px,3vw,24px)', lineHeight: 1.7, color: '#fff', fontWeight: 500, margin: 0 }}>
                {order.cerita_bisnes}
              </p>
            </div>
          </section>
        )}

        {/* S5: Produk & Servis */}
        <section className="dm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Produk & Servis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#1e293b', border: '1px solid #1e3a5f', borderRadius: 10, padding: '16px', fontSize: 14, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>
                <span style={{ color: '#0ea5e9', display: 'block', fontSize: 18, marginBottom: 8 }}>◆</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* S6: Mid-page CTA */}
        <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S7: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: '24px 18px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', borderTop: p.popular ? '3px solid #0ea5e9' : '1px solid rgba(255,255,255,0.08)' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -1, right: 14, background: '#0ea5e9', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: '0 0 6px 6px', letterSpacing: '0.08em' }}>
                      POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: '#f8fafc', marginBottom: 14 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.ciri.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                          <span style={{ color: '#0ea5e9', flexShrink: 0 }}>◆</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#0ea5e9' : '#0f172a', color: p.popular ? '#fff' : '#64748b', padding: '10px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: p.popular ? 'none' : '1px solid #1e293b' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S8: Gallery */}
        {galleries.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 0 64px' }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto', marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9' }}>Gallery</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleries.length, 3)}, 1fr)`, gap: 3 }}>
              {galleries.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }} />
              ))}
            </div>
          </section>
        )}

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: '20px', borderTop: '3px solid #0ea5e9' }}>
                  <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 12px' }}>&ldquo;{t.ulasan}&rdquo;</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', margin: 0 }}>{t.nama} · {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faq.map((f, i) => (
                <details key={i} className="dm-faq" style={{ background: '#1e293b', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{f.soalan}</span>
                    <span className="dm-chevron" style={{ color: '#0ea5e9', fontSize: 14, flexShrink: 0 }}>▾</span>
                  </summary>
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: '12px 0 0' }}>{f.jawapan}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
        <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Waktu & Lokasi</p>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '24px', border: '1px solid #1e3a5f', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, opacity: 0.7 }}>🕐</span>
              <span style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6 }}>{order.waktu_operasi}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, opacity: 0.7 }}>📍</span>
              <span style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6 }}>{order.alamat}</span>
            </div>
            {order.google_maps_link && (
              <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginTop: 4 }}>
                🗺️ Buka Google Maps →
              </a>
            )}
          </div>
        </section>

        {/* S12: Footer CTA */}
        <footer style={{ padding: '48px 24px 80px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <p style={{ fontSize: 14, color: '#475569', margin: '0 0 20px' }}>📞 {order.telefon}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <p style={{ fontSize: 11, color: '#1e293b', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#334155' }}>1page.my</a></p>
        </footer>
      </main>

      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#0ea5e9', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(14,165,233,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
