// app/bisnes/[subdomain]/templates/warm-heritage.tsx
import type { BisnesOrder } from '../types'

const ANIMS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wh-hero { animation: fadeUp 0.6s ease 0.1s both; }
  @supports (animation-timeline: scroll()) {
    .wh-reveal {
      animation: fadeUp 0.6s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
  .wh-faq summary { list-style: none; cursor: pointer; }
  .wh-faq summary::-webkit-details-marker { display: none; }
  .wh-faq[open] .wh-chevron { transform: rotate(180deg); }
  .wh-chevron { transition: transform 0.2s; display: inline-block; }
`

function parseItems(raw: string): string[] {
  return raw.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
}

function waHref(number: string, message: string): string {
  return `https://wa.me/${number.replace(/^0/, '60')}?text=${encodeURIComponent(message)}`
}

function googleMapsEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    if (url.includes('output=embed') || url.includes('/maps/embed')) return url
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) return `https://maps.google.com/maps?output=embed&q=${coordMatch[1]},${coordMatch[2]}`
    const qMatch = url.match(/[?&]q=([^&]+)/)
    if (qMatch && url.includes('google.com')) return `https://maps.google.com/maps?output=embed&q=${qMatch[1]}`
    const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/)
    if (placeMatch) return `https://maps.google.com/maps?output=embed&q=${placeMatch[1]}`
    return null
  } catch { return null }
}

function ctaCopy(jenis: string | null): string {
  if (!jenis) return 'WhatsApp Kami Sekarang'
  if (jenis.includes('F&B') || jenis.includes('Retail')) return 'Tanya Harga Sekarang'
  if (jenis.includes('Servis')) return 'Dapatkan Sebut Harga'
  return 'WhatsApp Kami Sekarang'
}

export default function WarmHeritage({ order }: { order: BisnesOrder }) {
  const items     = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []
  const cta   = order.cta_button_text ?? ctaCopy(order.jenis_bisnes)
  const waMsg = order.cta_wa_message ?? `Salam, saya berminat dengan ${order.nama_bisnes}`
  const stats     = order.stats_bar?.filter(s => s.nilai && s.label) ?? []
  const usp       = order.usp?.filter(u => u.tajuk) ?? []
  const pakej     = order.pakej?.filter(p => p.nama) ?? []
  const testimoni = order.testimoni?.filter(t => t.ulasan) ?? []
  const faq       = order.faq?.filter(f => f.soalan) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#fef3c7', color: '#78350f', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
        <section style={{ position: 'relative', height: '80svh', minHeight: 440 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(120,53,15,0.3) 0%, rgba(120,53,15,0.85) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 24px 48px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 16, borderRadius: 8, background: 'rgba(254,243,199,0.15)', padding: 6 }} />
            )}
            <h1 className="wh-hero" style={{ fontSize: 'clamp(30px,7vw,56px)', fontWeight: 800, lineHeight: 1.1, color: '#fef3c7', margin: '0 0 10px' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 16, color: '#fde68a', margin: '0 0 24px', lineHeight: 1.55 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, waMsg)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '12px 24px', borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
            {order.cta_subtext && (
              <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8, fontFamily: '"DM Sans", sans-serif' }}>
                {order.cta_subtext}
              </p>
            )}
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="wh-reveal" style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderLeft: i > 0 ? '1px solid #fcd34d' : 'none' }}>
                  <div style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{s.nilai}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#b45309', marginTop: 6, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="wh-reveal" style={{ padding: '56px 24px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#78350f', marginBottom: 6, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}>✦</span>{u.tajuk}
                  </div>
                  {u.huraian && <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5, margin: 0 }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Produk & Servis */}
        <section className="wh-reveal" style={{ padding: `${usp.length > 0 ? '0' : '56px'} 24px 56px`, maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Produk & Servis</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #fde68a' }}>
                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 16 }}>✦</span>
                <span style={{ fontSize: 15, color: '#78350f', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* S5: Mid-page CTA */}
        <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S6: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#fef9ec', borderRadius: 10, padding: '24px 18px', border: p.popular ? '2px solid #f59e0b' : '1px solid #fde68a', position: 'relative' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#78350f', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 50, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      ✦ Pilihan Ramai
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900, color: '#78350f', marginBottom: 14 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.ciri.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#92400e', lineHeight: 1.4 }}>
                          <span style={{ color: '#f59e0b', flexShrink: 0 }}>✦</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#f59e0b' : '#fde68a', color: '#78350f', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S7: Gallery */}
        {galleries.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 0 56px' }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309' }}>Gallery</p>
            </div>
            <div style={{ columns: 2, columnGap: 4 }}>
              {galleries.map((url, i) => (
                <div key={i} style={{ breakInside: 'avoid', marginBottom: 4, position: 'relative' }}>
                  <img src={url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(120,53,15,0.06)', pointerEvents: 'none' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S8: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 16 }}>Kisah Kami</p>
              <p style={{ fontSize: 17, lineHeight: 1.85, color: '#92400e', fontWeight: 500 }}>{order.cerita_bisnes}</p>
            </div>
          </section>
        )}

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 24 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ background: '#fef9ec', borderRadius: 10, padding: '24px', border: '1px solid #fde68a', position: 'relative' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 48, color: '#f59e0b', lineHeight: 0.6, marginBottom: 16 }}>&ldquo;</div>
                  <p style={{ fontSize: 15, fontStyle: 'italic', color: '#92400e', lineHeight: 1.75, margin: '0 0 14px' }}>{t.ulasan}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#b45309', margin: 0, letterSpacing: '0.04em' }}>{t.nama} · {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faq.map((f, i) => (
                <details key={i} className="wh-faq" style={{ background: '#fef9ec', borderRadius: 8, border: '1px solid #fde68a', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{f.soalan}</span>
                    <span className="wh-chevron" style={{ color: '#f59e0b', fontSize: 16, flexShrink: 0 }}>▾</span>
                  </summary>
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #fde68a' }}>
                    <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.65, margin: '12px 0 0' }}>{f.jawapan}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
        <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Waktu & Lokasi</p>
          <div style={{ background: '#fde68a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0 }}>🕐</span>
              <span style={{ color: '#78350f', fontSize: 15, lineHeight: 1.6 }}>{order.waktu_operasi}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0 }}>📍</span>
              <span style={{ color: '#78350f', fontSize: 15, lineHeight: 1.6 }}>{order.alamat}</span>
            </div>
            {order.google_maps_link && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {googleMapsEmbedUrl(order.google_maps_link) && (
                  <div style={{ borderRadius: 10, overflow: 'hidden' }}>
                    <iframe src={googleMapsEmbedUrl(order.google_maps_link)!} width="100%" height="220"
                      style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
                <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#78350f', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  🗺️ Buka Google Maps →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* S12: Footer CTA */}
        <footer style={{ background: '#78350f', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, waMsg)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '16px 36px', borderRadius: 10, fontWeight: 800, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          {order.cta_subtext && (
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8, fontFamily: '"DM Sans", sans-serif' }}>
              {order.cta_subtext}
            </p>
          )}
          <p style={{ fontSize: 14, color: '#fcd34d', margin: '0 0 20px' }}>📞 {order.telefon}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#fde68a', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#fde68a', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#fde68a', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#b45309' }}>1page.my</a></p>
        </footer>
      </main>

      <a href={waHref(order.whatsapp, waMsg)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#f59e0b', color: '#78350f', borderRadius: 50, padding: '12px 20px', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
