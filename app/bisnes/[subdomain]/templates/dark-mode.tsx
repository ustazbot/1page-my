import type { BisnesOrder } from '../types'

const ADMIN_WA = '60103602175'

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
`

function parseItems(raw: string): string[] {
  return raw.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
}

function waHref(number: string, message: string): string {
  return `https://wa.me/${number.replace(/^0/, '60')}?text=${encodeURIComponent(message)}`
}

export default function DarkMode({ order }: { order: BisnesOrder }) {
  const items = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#0f172a', color: '#f8fafc', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── Hero ── */}
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
            <h1 className="dm-hero" style={{ fontSize: 'clamp(36px, 9vw, 72px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#f8fafc' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p className="dm-sub" style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 36px', lineHeight: 1.6, maxWidth: 460 }}>
                {order.tagline}
              </p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              className="dm-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 WhatsApp Kami
            </a>
          </div>
        </section>

        {/* ── Cerita Bisnes ★ manifesto ── */}
        {order.cerita_bisnes && (
          <section className="dm-reveal" style={{ padding: '72px 24px', background: '#0ea5e9' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e0f2fe', marginBottom: 24, opacity: 0.7 }}>Tentang Kami</p>
              <p style={{ fontSize: 'clamp(18px, 3vw, 24px)', lineHeight: 1.7, color: '#fff', fontWeight: 500, margin: 0 }}>
                {order.cerita_bisnes}
              </p>
            </div>
          </section>
        )}

        {/* ── Produk & Servis ── */}
        <section className="dm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Produk & Servis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#1e293b', border: '1px solid #1e3a5f', borderRadius: 10, padding: '16px', fontSize: 14, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>
                <span style={{ color: '#0ea5e9', display: 'block', fontSize: 18, marginBottom: 8 }}>◆</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* ── Gallery ── */}
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

        {/* ── Waktu & Lokasi ── */}
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

        {/* ── Footer CTA ── */}
        <footer style={{ padding: '48px 24px 80px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 28 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#475569', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
          <p style={{ fontSize: 11, color: '#1e293b', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#334155' }}>1page.my</a></p>
        </footer>
      </main>

      {/* ── Sticky WA Button ── */}
      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#0ea5e9', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(14,165,233,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 WhatsApp
      </a>
    </>
  )
}
