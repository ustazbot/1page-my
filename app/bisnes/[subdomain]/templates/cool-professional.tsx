import type { BisnesOrder } from '../types'

const ADMIN_WA = '60103602175'

const ANIMS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cp-hero { animation: fadeUp 0.5s ease 0.15s both; }
  @supports (animation-timeline: scroll()) {
    .cp-reveal {
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

export default function CoolProfessional({ order }: { order: BisnesOrder }) {
  const items = parseItems(order.produk_servis)
  const galleries = order.gallery_urls?.filter(Boolean) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMS }} />
      <main style={{ background: '#f0f9ff', color: '#1e3a8a', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── Hero ── */}
        <section style={{ background: '#1e3a8a', position: 'relative', overflow: 'hidden' }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '64px 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 24, borderRadius: 12, background: 'rgba(255,255,255,0.15)', padding: 10 }} />
            )}
            <h1 className="cp-hero" style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 800, color: '#dbeafe', margin: '0 0 12px', lineHeight: 1.15 }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 16, color: '#93c5fd', margin: '0 0 32px', lineHeight: 1.6 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan perkhidmatan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', padding: '13px 26px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 WhatsApp Kami
            </a>
          </div>
        </section>

        {/* ── Produk & Servis ★ ── */}
        <section className="cp-reveal" style={{ padding: '56px 24px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 24 }}>Perkhidmatan Kami</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, color: '#1e40af', fontWeight: 600, lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cerita Bisnes ── */}
        {order.cerita_bisnes && (
          <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Tentang Kami</p>
            <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #dbeafe' }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#1e3a8a', margin: 0 }}>{order.cerita_bisnes}</p>
            </div>
          </section>
        )}

        {/* ── Waktu & Lokasi ── */}
        <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Waktu Operasi & Lokasi</p>
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ background: '#dbeafe', borderRadius: 8, padding: '8px', flexShrink: 0 }}>🕐</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Waktu Operasi</p>
                <p style={{ fontSize: 15, color: '#1e3a8a', margin: 0, lineHeight: 1.6 }}>{order.waktu_operasi}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ background: '#dbeafe', borderRadius: 8, padding: '8px', flexShrink: 0 }}>📍</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Alamat</p>
                <p style={{ fontSize: 15, color: '#1e3a8a', margin: 0, lineHeight: 1.6 }}>{order.alamat}</p>
              </div>
            </div>
            {order.google_maps_link && (
              <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginTop: 4 }}>
                🗺️ Buka Google Maps →
              </a>
            )}
          </div>
        </section>

        {/* ── Gallery ── */}
        {galleries.length > 0 && (
          <section className="cp-reveal" style={{ padding: '0 0 56px' }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6' }}>Portfolio / Gallery</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleries.length, 3)}, 1fr)`, gap: 4 }}>
              {galleries.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
              ))}
            </div>
          </section>
        )}

        {/* ── Footer CTA ── */}
        <footer style={{ background: '#1e3a8a', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan perkhidmatan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 28 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
          <p style={{ fontSize: 11, color: '#1e40af', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#3b82f6' }}>1page.my</a></p>
        </footer>
      </main>

      {/* ── Sticky WA Button ── */}
      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan perkhidmatan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#3b82f6', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(59,130,246,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 WhatsApp
      </a>
    </>
  )
}
