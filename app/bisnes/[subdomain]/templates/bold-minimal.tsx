// app/bisnes/[subdomain]/templates/bold-minimal.tsx
import type { BisnesOrder } from '../types'

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
  .bm-faq summary { list-style: none; cursor: pointer; }
  .bm-faq summary::-webkit-details-marker { display: none; }
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

export default function BoldMinimal({ order }: { order: BisnesOrder }) {
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
      <main style={{ background: '#0a0a0a', color: '#fff', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
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
              target="_blank" rel="noopener noreferrer" className="bm-hero-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0a0a0a', padding: '13px 26px', borderRadius: 50, fontWeight: 800, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="bm-reveal" style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0 28px', borderLeft: i > 0 ? '1px solid #222' : 'none' }}>
                  <div style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.nilai}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="bm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ border: '1px solid #1a1a1a', borderRadius: 4, padding: '18px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 6, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#444', flexShrink: 0 }}>◆</span>{u.tajuk}
                  </div>
                  {u.huraian && <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: 0 }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Produk & Servis */}
        <section className="bm-reveal" style={{ padding: `${usp.length > 0 ? '0' : '64px'} 24px 64px`, maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Produk & Servis</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.map((item, i) => (
              <span key={i} style={{ padding: '8px 16px', border: '1px solid #2a2a2a', borderRadius: 4, fontSize: 14, color: '#ddd', fontWeight: 500 }}>
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* S5: Mid-page CTA */}
        <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 50, border: '1px solid #333', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S6: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#111', borderRadius: 8, padding: '24px 20px', border: p.popular ? '2px solid #fff' : '1px solid #1a1a1a', position: 'relative' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#0a0a0a', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 50, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      PILIHAN RAMAI
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.ciri.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#888', lineHeight: 1.4 }}>
                          <span style={{ color: '#444', flexShrink: 0 }}>—</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#fff' : '#1a1a1a', color: p.popular ? '#0a0a0a' : '#888', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S7: Gallery */}
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

        {/* S8: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Tentang Kami</p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#999' }}>{order.cerita_bisnes}</p>
          </section>
        )}

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 32 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {testimoni.map((t, i) => (
                <div key={i}>
                  <p style={{ fontSize: 16, fontStyle: 'italic', color: '#ccc', lineHeight: 1.75, margin: '0 0 10px' }}>&ldquo;{t.ulasan}&rdquo;</p>
                  <p style={{ fontSize: 13, color: '#555', margin: 0 }}>— {t.nama}, {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="bm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 24 }}>Soalan Lazim</p>
            <div>
              {faq.map((f, i) => (
                <details key={i} className="bm-faq" style={{ borderTop: '1px solid #1a1a1a' }}>
                  <summary style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{f.soalan}</span>
                    <span style={{ color: '#444', fontSize: 20, flexShrink: 0, lineHeight: 1 }}>+</span>
                  </summary>
                  <div style={{ padding: '0 0 16px' }}>
                    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, margin: 0 }}>{f.jawapan}</p>
                  </div>
                </details>
              ))}
              <div style={{ borderTop: '1px solid #1a1a1a' }} />
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
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

        {/* S12: Footer CTA */}
        <footer style={{ padding: '48px 24px 80px', borderTop: '1px solid #181818', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '16px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <p style={{ fontSize: 14, color: '#444', margin: '0 0 20px' }}>📞 {order.telefon}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <p style={{ fontSize: 11, color: '#2a2a2a', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#444' }}>1page.my</a></p>
        </footer>
      </main>

      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#16a34a', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(22,163,74,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
