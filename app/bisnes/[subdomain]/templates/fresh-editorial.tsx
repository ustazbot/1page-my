// app/bisnes/[subdomain]/templates/fresh-editorial.tsx
import type { BisnesOrder } from '../types'

const ANIMS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fe-hero { animation: fadeUp 0.6s ease 0.1s both; }
  @supports (animation-timeline: scroll()) {
    .fe-reveal {
      animation: fadeUp 0.6s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
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

export default function FreshEditorial({ order }: { order: BisnesOrder }) {
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
      <main style={{ background: '#ecfdf5', color: '#064e3b', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
        <section style={{ position: 'relative', height: '75svh', minHeight: 400 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(6,78,59,0.2) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 20, borderRadius: 10, background: 'rgba(255,255,255,0.15)', padding: 6 }} />
            )}
            <h1 className="fe-hero" style={{ fontSize: 'clamp(32px,7vw,60px)', fontWeight: 800, color: '#ecfdf5', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 17, color: '#a7f3d0', margin: '0 0 28px', lineHeight: 1.55, maxWidth: 420 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, waMsg)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
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
          <section className="fe-reveal" style={{ padding: '20px 24px', maxWidth: 640, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: '#d1fae5', borderRadius: 50, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#065f46' }}>{s.nilai}</span>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="fe-reveal" style={{ padding: `${stats.length > 0 ? '12px' : '56px'} 24px 56px`, maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '14px 16px', borderTop: '3px solid #10b981' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#064e3b', marginBottom: 4, display: 'flex', gap: 8 }}>
                    <span style={{ flexShrink: 0 }}>✅</span>{u.tajuk}
                  </div>
                  {u.huraian && <p style={{ fontSize: 12, color: '#065f46', lineHeight: 1.5, margin: '0 0 0 24px' }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Gallery */}
        {galleries.length > 0 && (
          <section className="fe-reveal" style={{ padding: `${usp.length > 0 ? '0' : '56px'} 0 56px` }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto', marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981' }}>Gallery</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: galleries.length >= 2 ? '2fr 1fr' : '1fr', gap: 4, maxWidth: 640, margin: '0 auto' }}>
              {galleries.length >= 2 ? (
                <>
                  <img src={galleries[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  <div style={{ display: 'grid', gridTemplateRows: galleries.length >= 3 ? '1fr 1fr' : '1fr', gap: 4 }}>
                    {galleries.slice(1, 3).map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ))}
                  </div>
                </>
              ) : (
                <img src={galleries[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
          </section>
        )}

        {/* S5: Produk & Servis */}
        <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Produk & Servis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#064e3b', fontWeight: 600, lineHeight: 1.4 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* S6: Mid-page CTA */}
        <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S7: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '22px 18px', border: p.popular ? '2px solid #10b981' : '1px solid #a7f3d0', position: 'relative' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                      Pilihan Ramai
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: '#064e3b', marginBottom: 12 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {p.ciri.map((c, j) => (
                        <span key={j} style={{ background: '#ecfdf5', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#065f46', fontWeight: 500 }}>{c}</span>
                      ))}
                    </div>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#10b981' : '#a7f3d0', color: p.popular ? '#fff' : '#064e3b', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S8: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Kisah & Nilai Kami</p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: '#065f46', fontWeight: 400 }}>{order.cerita_bisnes}</p>
          </section>
        )}

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 24 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ borderLeft: '4px solid #10b981', paddingLeft: 20 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: '#10b981', lineHeight: 0.7, marginBottom: 12 }}>&ldquo;</div>
                  <p style={{ fontSize: 16, fontStyle: 'italic', color: '#065f46', lineHeight: 1.75, margin: '0 0 10px' }}>{t.ulasan}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', margin: 0 }}>{t.nama} · {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {faq.map((f, i) => (
                <div key={i} style={{ borderLeft: '2px solid #10b981', paddingLeft: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', margin: '0 0 6px' }}>{f.soalan}</p>
                  <p style={{ fontSize: 14, color: '#065f46', lineHeight: 1.65, margin: 0 }}>{f.jawapan}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
        <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Waktu & Lokasi</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ flexShrink: 0 }}>🕐</span>
              <span style={{ color: '#065f46', fontSize: 15, lineHeight: 1.6 }}>{order.waktu_operasi}</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ flexShrink: 0 }}>📍</span>
              <span style={{ color: '#065f46', fontSize: 15, lineHeight: 1.6 }}>{order.alamat}</span>
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  🗺️ Buka Google Maps →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* S12: Footer CTA */}
        <footer style={{ background: '#064e3b', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, waMsg)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          {order.cta_subtext && (
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8, fontFamily: '"DM Sans", sans-serif' }}>
              {order.cta_subtext}
            </p>
          )}
          <p style={{ fontSize: 14, color: '#6ee7b7', margin: '0 0 20px' }}>📞 {order.telefon}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <p style={{ fontSize: 11, color: '#065f46', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#10b981' }}>1page.my</a></p>
        </footer>
      </main>

      <a href={waHref(order.whatsapp, waMsg)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#10b981', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
