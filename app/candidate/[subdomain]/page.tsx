// app/candidate/[subdomain]/page.tsx
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params
  const { data: c } = await supabaseServer()
    .from('candidate_briefs')
    .select('full_name, kawasan, parti_name, tagline, photo_url')
    .eq('subdomain', subdomain)
    .eq('is_live', true)
    .single()

  if (!c) return { title: '1page.my' }

  return {
    title: `${c.full_name} — Calon ${c.kawasan}`,
    description: `Kenali ${c.full_name}, calon ${c.parti_name} untuk ${c.kawasan}. ${c.tagline || ''}`,
    openGraph: {
      title: `${c.full_name} — ${c.kawasan}`,
      description: c.tagline || `Calon ${c.parti_name} untuk ${c.kawasan}`,
      images: c.photo_url ? [c.photo_url] : [],
    },
  }
}

export default async function CandidatePage({ params }: Props) {
  const { subdomain } = await params
  const { data: c } = await (supabaseServer() as any)
    .from('candidate_briefs')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_live', true)
    .single()

  if (!c) return notFound()

  const warna = (c.warna_utama as string) || '#1e3a5f'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.full_name,
    jobTitle: `Calon ${c.kawasan}`,
    affiliation: { '@type': 'Organization', name: c.parti_name },
    description: c.tagline,
    image: c.photo_url,
    url: `https://${c.subdomain}.1page.my`,
    sameAs: ([c.facebook_url, c.instagram_url, c.tiktok_url] as (string | null)[]).filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>

        {/* HERO */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px',
          background: `linear-gradient(135deg, ${warna} 0%, #0f172a 100%)`,
        }}>
          {c.parti_logo_url && (
            <img src={c.parti_logo_url as string} alt={`Logo ${c.parti_name}`} style={{ height: 64, marginBottom: 24, objectFit: 'contain' }} />
          )}
          {c.photo_url && (
            <img
              src={c.photo_url as string}
              alt={`Foto ${c.full_name}`}
              style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', marginBottom: 24 }}
            />
          )}
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{c.full_name as string}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 4 }}>{c.parti_name as string}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>{c.kawasan_jenis as string} {c.kawasan as string}</p>
          {c.tagline && (
            <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', maxWidth: 560, marginBottom: 0 }}>
              &ldquo;{c.tagline as string}&rdquo;
            </p>
          )}
          {c.whatsapp && (
            <a
              href={`https://wa.me/${c.whatsapp}`}
              target="_blank"
              style={{
                marginTop: 32,
                background: '#22c55e',
                color: '#fff',
                fontWeight: 600,
                padding: '16px 32px',
                borderRadius: 999,
                fontSize: 18,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              💬 Hubungi {(c.preferred_name as string) || (c.full_name as string)}
            </a>
          )}
        </section>

        {/* FOKUS */}
        {(c.fokus as string[])?.length > 0 && (
          <section style={{ padding: '80px 24px', background: '#fff' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 48, color: warna }}>
                Fokus Saya untuk {c.kawasan as string}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(c.fokus as string[]).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#e5e7eb', minWidth: 32 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{ fontWeight: 500, color: '#1f2937', marginTop: 2 }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ISU KAWASAN */}
        {(c.isu_kawasan as { masalah: string; penyelesaian: string }[])?.length > 0 && (
          <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 48, color: warna }}>
                Isu Kawasan & Penyelesaian
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {(c.isu_kawasan as { masalah: string; penyelesaian: string }[]).map((item, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f3f4f6' }}>
                    <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>⚠️ {item.masalah}</p>
                    <p style={{ color: '#374151' }}>✅ {item.penyelesaian}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PROFIL */}
        {c.profil_ringkas && (
          <section style={{ padding: '80px 24px', background: '#fff' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, color: warna }}>
                Siapa {(c.preferred_name as string) || (c.full_name as string)}?
              </h2>
              {c.quote_peribadi && (
                <blockquote style={{
                  fontSize: 20, fontStyle: 'italic', color: '#4b5563',
                  marginBottom: 32, borderLeft: `4px solid ${warna}`,
                  paddingLeft: 24, textAlign: 'left',
                }}>
                  &ldquo;{c.quote_peribadi as string}&rdquo;
                </blockquote>
              )}
              <p style={{ color: '#374151', lineHeight: 1.8, textAlign: 'left' }}>{c.profil_ringkas as string}</p>
              {(c.pencapaian as string[])?.length > 0 && (
                <div style={{ marginTop: 32, textAlign: 'left' }}>
                  <h3 style={{ fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Pencapaian & Kelayakan:</h3>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(c.pencapaian as string[]).map((p, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#374151' }}>
                        <span style={{ color: '#f97316', marginTop: 2 }}>✦</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{
          padding: '80px 24px',
          background: `linear-gradient(135deg, ${warna} 0%, #0f172a 100%)`,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Sokong {(c.preferred_name as string) || (c.full_name as string)}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>
            Bersama kita perkasakan {c.kawasan as string}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <a href={`https://wa.me/${c.whatsapp}`} target="_blank"
              style={{ background: '#22c55e', color: '#fff', fontWeight: 600, padding: '16px 32px', borderRadius: 999, textDecoration: 'none' }}>
              💬 WhatsApp
            </a>
            {c.facebook_url && (
              <a href={c.facebook_url as string} target="_blank"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, padding: '16px 32px', borderRadius: 999, textDecoration: 'none' }}>
                Facebook
              </a>
            )}
            {c.instagram_url && (
              <a href={c.instagram_url as string} target="_blank"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, padding: '16px 32px', borderRadius: 999, textDecoration: 'none' }}>
                Instagram
              </a>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#111827', color: '#6b7280', textAlign: 'center', fontSize: 12, padding: '24px' }}>
          <p>{c.full_name as string} — {c.parti_name as string} — {c.kawasan as string}</p>
          <p style={{ marginTop: 4 }}>
            Powered by <a href="https://1page.my" style={{ color: '#fb923c' }}>1page.my</a>
          </p>
        </footer>

      </main>
    </>
  )
}
