import type { BisnesOrder } from '../types'

const ADMIN_WA = '60103602175'

const ANIMS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bm-hero-text { animation: fadeUp 0.5s ease 0.1s both; }
  .bm-hero-sub  { animation: fadeUp 0.5s ease 0.2s both; }
  .bm-hero-cta  { animation: fadeUp 0.5s ease 0.3s both; }
  @supports (animation-timeline: scroll()) {
    .bm-reveal {
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

export default function BoldMinimal({ order }: { order: BisnesOrder }) {
  const items = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#0a0a0a', color: '#fff', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── Hero ── */}
        <section style={{ position: 'relative', height: '100svh', minHeight: 520 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 24px 120px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 20, borderRadius: 10, background: 'rgba(255,255,255,0.08)', padding: 8 }} />
            )}
            <h1 className="bm-hero-text" style={{ fontSize: 'clamp(36px, 9vw, 72px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p className="bm-hero-sub" style={{ fontSize: 17, color: '#ccc', margin: '0 0 32px', lineHeight: 1.5, maxWidth: 420 }}>
                {order.tagline}
              </p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              className="bm-hero-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0a0a0a', padding: '13px 26px', borderRadius: 50, fontWeight: 800, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 WhatsApp Kami
            </a>
          </div>
        </section>

        {/* ── Produk & Servis ── */}
        <section className="bm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Produk & Servis</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.map((item, i) => (
              <span key={i} style={{ padding: '8px 16px', border: '1px solid #2a2a2a', borderRadius: 4, fontSize: 14, color: '#ddd', fontWeight: 500 }}>
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── Gallery ── */}
        {galleries.length > 0 && (
          <section className="bm-reveal" style={{ padding: '0 0 64px' }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Gallery</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleries.length, 3)}, 1fr)`, gap: 3 }}>
              {galleries.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
              ))}
            </div>
          </section>
        )}

        {/* ── Cerita Bisnes ── */}
        {order.cerita_bisnes && (
          <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Tentang Kami</p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#999' }}>{order.cerita_bisnes}</p>
          </section>
        )}

        {/* ── Waktu & Lokasi ── */}
        <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Waktu & Lokasi</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0 }}>🕐</span>
              <span style={{ color: '#bbb', fontSize: 15, lineHeight: 1.6 }}>{order.waktu_operasi}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0 }}>📍</span>
              <span style={{ color: '#bbb', fontSize: 15, lineHeight: 1.6 }}>{order.alamat}</span>
            </div>
            {order.google_maps_link && (
              <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#e5e5e5', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                🗺️ Buka Google Maps →
              </a>
            )}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <footer style={{ padding: '48px 24px 80px', borderTop: '1px solid #181818', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '16px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 28 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#444', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
          <p style={{ fontSize: 11, color: '#2a2a2a', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#444' }}>1page.my</a></p>
        </footer>
      </main>

      {/* ── Sticky WA Button ── */}
      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#16a34a', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(22,163,74,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 WhatsApp
      </a>
    </>
  )
}
