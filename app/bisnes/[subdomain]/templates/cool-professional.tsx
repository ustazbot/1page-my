// app/bisnes/[subdomain]/templates/cool-professional.tsx
import type { BisnesOrder } from '../types'

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
  .cp-faq summary { list-style: none; cursor: pointer; }
  .cp-faq summary::-webkit-details-marker { display: none; }
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

function initials(nama: string): string {
  const parts = nama.trim().split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)
}

export default function CoolProfessional({ order }: { order: BisnesOrder }) {
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
      <main style={{ background: '#f0f9ff', color: '#1e3a8a', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
        <section style={{ background: '#1e3a8a', position: 'relative', overflow: 'hidden' }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '64px 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 24, borderRadius: 12, background: 'rgba(255,255,255,0.15)', padding: 10 }} />
            )}
            <h1 className="cp-hero" style={{ fontSize: 'clamp(28px,6vw,52px)', fontWeight: 800, color: '#dbeafe', margin: '0 0 12px', lineHeight: 1.15 }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 16, color: '#93c5fd', margin: '0 0 32px', lineHeight: 1.6 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan perkhidmatan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', padding: '13px 26px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="cp-reveal" style={{ background: '#fff', borderBottom: '1px solid #dbeafe' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: '#dbeafe', borderRadius: 50, padding: '8px 20px', textAlign: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#1e3a8a' }}>{s.nilai}</span>
                  <span style={{ fontSize: 12, color: '#3b82f6', marginLeft: 6 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="cp-reveal" style={{ padding: '56px 24px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 6, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#3b82f6', flexShrink: 0, fontWeight: 900 }}>✓</span>{u.tajuk}
                  </div>
                  {u.huraian && <p style={{ fontSize: 13, color: '#3b82f6', lineHeight: 1.5, margin: 0 }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Produk & Servis */}
        <section className="cp-reveal" style={{ padding: `${usp.length > 0 ? '0' : '56px'} 24px 56px`, maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 24 }}>Perkhidmatan Kami</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, color: '#1e40af', fontWeight: 600, lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* S5: Mid-page CTA */}
        <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#3b82f6', padding: '12px 24px', borderRadius: 8, border: '2px solid #3b82f6', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S6: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 0, border: '1px solid #dbeafe', borderRadius: 12, overflow: 'hidden' }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: p.popular ? '#1e3a8a' : '#fff', padding: '24px 18px', borderLeft: i > 0 ? '1px solid #dbeafe' : 'none', position: 'relative' }}>
                  {p.popular && (
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>✦ Disyorkan</div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: p.popular ? '#93c5fd' : '#3b82f6', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(20px,3.5vw,26px)', fontWeight: 900, color: p.popular ? '#fff' : '#1e3a8a', marginBottom: 14 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.ciri.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, fontSize: 12, color: p.popular ? '#bfdbfe' : '#3b82f6', lineHeight: 1.4 }}>
                          <span style={{ flexShrink: 0 }}>✓</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#3b82f6' : '#dbeafe', color: p.popular ? '#fff' : '#1e40af', padding: '10px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S7: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Tentang Kami</p>
            <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #dbeafe' }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#1e3a8a', margin: 0 }}>{order.cerita_bisnes}</p>
            </div>
          </section>
        )}

        {/* S8: Gallery */}
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

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 12, padding: '20px' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#1e3a8a', flexShrink: 0 }}>
                      {initials(t.nama).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.65, margin: '0 0 8px' }}>&ldquo;{t.ulasan}&rdquo;</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', margin: 0 }}>{t.nama} · {t.dari}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="cp-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faq.map((f, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ background: '#dbeafe', color: '#1e3a8a', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>S{i + 1}</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', margin: 0 }}>{f.soalan}</p>
                  </div>
                  <p style={{ fontSize: 14, color: '#3b82f6', lineHeight: 1.65, margin: '0 0 0 30px' }}>{f.jawapan}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {googleMapsEmbedUrl(order.google_maps_link) && (
                  <div style={{ borderRadius: 10, overflow: 'hidden' }}>
                    <iframe src={googleMapsEmbedUrl(order.google_maps_link)!} width="100%" height="220"
                      style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
                <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  🗺️ Buka Google Maps →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* S12: Footer CTA */}
        <footer style={{ background: '#1e3a8a', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan perkhidmatan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <p style={{ fontSize: 14, color: '#93c5fd', margin: '0 0 20px' }}>📞 {order.telefon}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
            {order.instagram && <a href={order.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none' }}>Instagram</a>}
            {order.facebook && <a href={order.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none' }}>Facebook</a>}
            {order.tiktok && <a href={order.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'none' }}>TikTok</a>}
          </div>
          <p style={{ fontSize: 11, color: '#1e40af', margin: 0 }}>Dibina dengan <a href="https://1page.my" style={{ color: '#3b82f6' }}>1page.my</a></p>
        </footer>
      </main>

      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan perkhidmatan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#3b82f6', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(59,130,246,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
