import type { BisnesOrder } from '../types'

const ADMIN_WA = '60103602175'

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
`

function parseItems(raw: string): string[] {
  return raw.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
}

function waHref(number: string, message: string): string {
  return `https://wa.me/${number.replace(/^0/, '60')}?text=${encodeURIComponent(message)}`
}

export default function WarmHeritage({ order }: { order: BisnesOrder }) {
  const items = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#fef3c7', color: '#78350f', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── Hero ── */}
        <section style={{ position: 'relative', height: '80svh', minHeight: 440 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(120,53,15,0.3) 0%, rgba(120,53,15,0.85) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 24px 48px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 16, borderRadius: 8, background: 'rgba(254,243,199,0.15)', padding: 6 }} />
            )}
            <h1 className="wh-hero" style={{ fontSize: 'clamp(30px, 7vw, 56px)', fontWeight: 800, lineHeight: 1.1, color: '#fef3c7', margin: '0 0 10px' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 16, color: '#fde68a', margin: '0 0 24px', lineHeight: 1.55 }}>
                {order.tagline}
              </p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '12px 24px', borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 WhatsApp Kami
            </a>
          </div>
        </section>

        {/* ── Cerita Bisnes ★ ── */}
        {order.cerita_bisnes && (
          <section className="wh-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 16 }}>Kisah Kami</p>
              <p style={{ fontSize: 17, lineHeight: 1.85, color: '#92400e', fontWeight: 500 }}>{order.cerita_bisnes}</p>
            </div>
          </section>
        )}

        {/* ── Gallery ── */}
        {galleries.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 0 64px' }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309' }}>Gallery</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleries.length, 3)}, 1fr)`, gap: 4 }}>
              {galleries.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(120,53,15,0.08)' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Produk & Servis ── */}
        <section className="wh-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
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

        {/* ── Waktu & Lokasi ── */}
        <section className="wh-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
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
              <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#78350f', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                🗺️ Buka Google Maps →
              </a>
            )}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <footer style={{ background: '#78350f', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '16px 36px', borderRadius: 10, fontWeight: 800, fontSize: 16, textDecoration: 'none', marginBottom: 28 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#fde68a', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#fde68a', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#fde68a', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#fcd34d', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
          <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#b45309' }}>1page.my</a></p>
        </footer>
      </main>

      {/* ── Sticky WA Button ── */}
      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#f59e0b', color: '#78350f', borderRadius: 50, padding: '12px 20px', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 WhatsApp
      </a>
    </>
  )
}
