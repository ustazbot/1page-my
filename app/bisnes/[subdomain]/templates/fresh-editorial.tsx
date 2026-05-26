import type { BisnesOrder } from '../types'

const ADMIN_WA = '60103602175'

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

export default function FreshEditorial({ order }: { order: BisnesOrder }) {
  const items = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#ecfdf5', color: '#064e3b', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── Hero ── */}
        <section style={{ position: 'relative', height: '75svh', minHeight: 400 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(6,78,59,0.2) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 20, borderRadius: 10, background: 'rgba(255,255,255,0.15)', padding: 6 }} />
            )}
            <h1 className="fe-hero" style={{ fontSize: 'clamp(32px, 7vw, 60px)', fontWeight: 800, color: '#ecfdf5', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 17, color: '#a7f3d0', margin: '0 0 28px', lineHeight: 1.55, maxWidth: 420 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 WhatsApp Kami
            </a>
          </div>
        </section>

        {/* ── Gallery ★ ── */}
        {galleries.length > 0 && (
          <section className="fe-reveal" style={{ padding: '56px 0' }}>
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
                  {galleries.length > 3 && (
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleries.length - 3, 3)}, 1fr)`, gap: 4 }}>
                      {galleries.slice(3).map((url, i) => (
                        <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <img src={galleries[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
          </section>
        )}

        {/* ── Cerita Bisnes ── */}
        {order.cerita_bisnes && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Kisah & Nilai Kami</p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: '#065f46', fontWeight: 400 }}>{order.cerita_bisnes}</p>
          </section>
        )}

        {/* ── Produk & Servis ── */}
        <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Produk & Servis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#064e3b', fontWeight: 600, lineHeight: 1.4 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* ── Waktu & Lokasi ── */}
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
              <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                🗺️ Buka Google Maps →
              </a>
            )}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <footer style={{ background: '#064e3b', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 28 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#6ee7b7', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#6ee7b7', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
          <p style={{ fontSize: 11, color: '#065f46', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#10b981' }}>1page.my</a></p>
        </footer>
      </main>

      {/* ── Sticky WA Button ── */}
      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#10b981', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 WhatsApp
      </a>
    </>
  )
}
