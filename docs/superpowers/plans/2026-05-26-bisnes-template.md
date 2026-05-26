# Bisnes Page Template System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a data-driven bisnes page system for `*.1page.my` subdomains with 5 distinct template personalities, client revision flow, and admin order editing.

**Architecture:** Middleware queries Supabase REST to detect bisnes subdomains, rewrites to `app/bisnes/[subdomain]/`. Page reads from `orders` table and dispatches to one of five self-contained template components based on `template_pilihan`. Admin panel gains an edit form backed by a new `edit_fields` PATCH action.

**Tech Stack:** Next.js 15 App Router (server components), Supabase service role, TypeScript, inline styles (matching existing project pattern).

---

## File Map

| Action | File |
|---|---|
| Create | `app/bisnes/[subdomain]/layout.tsx` |
| Create | `app/bisnes/[subdomain]/types.ts` |
| Create | `app/bisnes/[subdomain]/page.tsx` |
| Create | `app/bisnes/[subdomain]/templates/bold-minimal.tsx` |
| Create | `app/bisnes/[subdomain]/templates/warm-heritage.tsx` |
| Create | `app/bisnes/[subdomain]/templates/cool-professional.tsx` |
| Create | `app/bisnes/[subdomain]/templates/fresh-editorial.tsx` |
| Create | `app/bisnes/[subdomain]/templates/dark-mode.tsx` |
| Modify | `middleware.ts` |
| Modify | `app/api/admin/orders/[id]/route.ts` |
| Modify | `app/admin/(dashboard)/orders/[id]/page.tsx` |

---

## Task 1: Foundation — Types, Layout, Page Skeleton

**Files:**
- Create: `app/bisnes/[subdomain]/layout.tsx`
- Create: `app/bisnes/[subdomain]/types.ts`
- Create: `app/bisnes/[subdomain]/page.tsx`

- [ ] **Step 1: Create layout**

`app/bisnes/[subdomain]/layout.tsx`:
```tsx
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
})

export default function BisnesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${jakarta.variable} ${dmSans.variable}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create types**

`app/bisnes/[subdomain]/types.ts`:
```typescript
export interface BisnesOrder {
  id: string
  nama_bisnes: string
  tagline: string | null
  jenis_bisnes: string | null
  cerita_bisnes: string | null
  produk_servis: string
  target_pelanggan: string | null
  nama_owner: string
  whatsapp: string
  telefon: string
  email: string | null
  alamat: string
  waktu_operasi: string
  google_maps_link: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  banner_atas_url: string
  logo_url: string | null
  gallery_urls: string[] | null
  template_pilihan: string
  slug: string
  status: string
}
```

- [ ] **Step 3: Create page**

`app/bisnes/[subdomain]/page.tsx`:
```tsx
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { BisnesOrder } from './types'
import BoldMinimal from './templates/bold-minimal'
import WarmHeritage from './templates/warm-heritage'
import CoolProfessional from './templates/cool-professional'
import FreshEditorial from './templates/fresh-editorial'
import DarkMode from './templates/dark-mode'

interface Props {
  params: Promise<{ subdomain: string }>
}

const TEMPLATES: Record<string, React.ComponentType<{ order: BisnesOrder }>> = {
  bold_minimal: BoldMinimal,
  warm_heritage: WarmHeritage,
  cool_professional: CoolProfessional,
  fresh_editorial: FreshEditorial,
  dark_mode: DarkMode,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params
  const { data } = await supabaseServer()
    .from('orders')
    .select('nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, banner_atas_url')
    .eq('slug', subdomain)
    .in('status', ['preview_ready', 'paid', 'live'])
    .maybeSingle()

  if (!data) return { title: '1page.my' }

  return {
    title: `${data.nama_bisnes}${data.tagline ? ` — ${data.tagline}` : ''}`,
    description: (data.cerita_bisnes as string | null)?.slice(0, 160) ?? (data.tagline as string | null) ?? (data.jenis_bisnes as string | null) ?? '',
    openGraph: {
      title: data.nama_bisnes as string,
      description: (data.tagline as string | null) ?? '',
      images: data.banner_atas_url ? [data.banner_atas_url as string] : [],
      type: 'website',
    },
  }
}

export default async function BisnesPage({ params }: Props) {
  const { subdomain } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseServer() as any)
    .from('orders')
    .select('*')
    .eq('slug', subdomain)
    .in('status', ['preview_ready', 'paid', 'live'])
    .single()

  if (!data) return notFound()

  const order = data as BisnesOrder

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: order.nama_bisnes,
    description: order.cerita_bisnes || order.tagline || '',
    telephone: order.telefon,
    address: { '@type': 'PostalAddress', streetAddress: order.alamat },
    openingHours: order.waktu_operasi,
    url: `https://${order.slug}.1page.my`,
  }

  const Template = TEMPLATES[order.template_pilihan] ?? BoldMinimal

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Template order={order} />
    </>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: errors about missing template files (not yet created) — this is okay, proceed.

- [ ] **Step 5: Commit**

```bash
git add app/bisnes/
git commit -m "feat: add bisnes page foundation — layout, types, page skeleton"
```

---

## Task 2: Middleware Update

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Read current middleware**

Open `middleware.ts`. Locate the subdomain detection block (lines ~8–21):
```typescript
if (!isMainDomain && hostname.endsWith('.1page.my')) {
  const subdomain = hostname.replace('.1page.my', '')
  const url = request.nextUrl.clone()
  if (!url.pathname.startsWith('/candidate/')) {
    url.pathname = `/candidate/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }
}
```

- [ ] **Step 2: Replace subdomain block**

Replace the entire subdomain detection block (the `if (!isMainDomain && ...)` block) with:
```typescript
if (!isMainDomain && hostname.endsWith('.1page.my')) {
  const subdomain = hostname.replace('.1page.my', '')
  const url = request.nextUrl.clone()

  // Skip if already rewritten
  if (!url.pathname.startsWith('/bisnes/') && !url.pathname.startsWith('/candidate/')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    let isBisnes = false
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/orders?slug=eq.${subdomain}&status=in.(preview_ready,paid,live)&select=id&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      const rows = await res.json()
      isBisnes = Array.isArray(rows) && rows.length > 0
    } catch {
      // On fetch error, fall through to candidate
    }

    url.pathname = isBisnes
      ? `/bisnes/${subdomain}${url.pathname}`
      : `/candidate/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to middleware.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: route bisnes subdomains to /bisnes/[slug] via middleware"
```

---

## Task 3: Bold Minimal Template

**Files:**
- Create: `app/bisnes/[subdomain]/templates/bold-minimal.tsx`

**Personality:** Dark, tegas, moden. Section order: Hero → Produk & Servis → Gallery → Cerita Bisnes → Waktu & Lokasi → Footer CTA.

- [ ] **Step 1: Create template**

`app/bisnes/[subdomain]/templates/bold-minimal.tsx`:
```tsx
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
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: errors only for the 4 remaining missing template files.

- [ ] **Step 3: Commit**

```bash
git add app/bisnes/
git commit -m "feat: add bold-minimal bisnes template"
```

---

## Task 4: Warm Heritage Template

**Files:**
- Create: `app/bisnes/[subdomain]/templates/warm-heritage.tsx`

**Personality:** Amber/brown, klasik. Section order: Hero → **Cerita Bisnes** (★) → Gallery → Produk & Servis → Waktu & Lokasi → Footer CTA.

- [ ] **Step 1: Create template**

`app/bisnes/[subdomain]/templates/warm-heritage.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/bisnes/
git commit -m "feat: add warm-heritage bisnes template"
```

---

## Task 5: Cool Professional Template

**Files:**
- Create: `app/bisnes/[subdomain]/templates/cool-professional.tsx`

**Personality:** Blue, bersih, profesional. Section order: Hero → **Produk & Servis** (★) → Cerita Bisnes → Waktu & Lokasi → Gallery → Footer CTA.

- [ ] **Step 1: Create template**

`app/bisnes/[subdomain]/templates/cool-professional.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/bisnes/
git commit -m "feat: add cool-professional bisnes template"
```

---

## Task 6: Fresh Editorial Template

**Files:**
- Create: `app/bisnes/[subdomain]/templates/fresh-editorial.tsx`

**Personality:** Hijau, segar, editorial. Section order: Hero → **Gallery** (★) → Cerita Bisnes → Produk & Servis → Waktu & Lokasi → Footer CTA.

- [ ] **Step 1: Create template**

`app/bisnes/[subdomain]/templates/fresh-editorial.tsx`:
```tsx
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
            <div style={{ display: 'grid', gridTemplateColumns: galleries.length >= 3 ? '2fr 1fr' : '1fr', gap: 4, maxWidth: 640, margin: '0 auto', padding: '0 0' }}>
              {galleries.length >= 2 ? (
                <>
                  <img src={galleries[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
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
                galleries.map((url, i) => (
                  <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                ))
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
```

- [ ] **Step 2: Commit**

```bash
git add app/bisnes/
git commit -m "feat: add fresh-editorial bisnes template"
```

---

## Task 7: Dark Mode Template

**Files:**
- Create: `app/bisnes/[subdomain]/templates/dark-mode.tsx`

**Personality:** Navy/sky, mewah, premium. Section order: Hero → **Cerita Bisnes** (★ manifesto) → Produk & Servis → Gallery → Waktu & Lokasi → Footer CTA.

- [ ] **Step 1: Create template**

`app/bisnes/[subdomain]/templates/dark-mode.tsx`:
```tsx
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
          <section className="dm-reveal" style={{ padding: '72px 24px', background: '#0ea5e9', maxWidth: '100%' }}>
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
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }} />
                </div>
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
```

- [ ] **Step 2: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/bisnes/
git commit -m "feat: add dark-mode bisnes template"
```

---

## Task 8: API — edit_fields PATCH Action

**Files:**
- Modify: `app/api/admin/orders/[id]/route.ts`

- [ ] **Step 1: Add edit_fields handler**

In `app/api/admin/orders/[id]/route.ts`, locate the PATCH function. Find this line near the bottom:

```typescript
return NextResponse.json({ error: 'Action tidak dikenali' }, { status: 400 })
```

Insert before it:

```typescript
// ── ACTION: edit_fields ──────────────────────────────────────────────────
if (body.action === 'edit_fields') {
  const EDITABLE = [
    'nama_bisnes', 'tagline', 'cerita_bisnes', 'produk_servis',
    'target_pelanggan', 'waktu_operasi', 'alamat', 'google_maps_link',
    'instagram', 'facebook', 'tiktok',
  ] as const

  const updates: Record<string, string | null> = {}
  for (const field of EDITABLE) {
    if (field in body) {
      updates[field] = (body as Record<string, string | null>)[field] ?? null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Tiada field untuk dikemaskini' }, { status: 400 })
  }

  const { error: updateErr } = await sb.from('orders').update(updates).eq('id', id)
  if (updateErr) {
    console.error('[orders/patch] edit_fields error:', updateErr)
    return NextResponse.json({ error: 'Gagal kemaskini order' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

Also update the `body` type at the top of PATCH (find the existing type declaration):

```typescript
// Find this line:
let body: { action: string; slug?: string; preview_url?: string }
// Replace with:
let body: { action: string; slug?: string; preview_url?: string } & Record<string, string | null | undefined>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/orders/
git commit -m "feat: add edit_fields action to orders PATCH endpoint"
```

---

## Task 9: Admin Panel — Edit Order Form

**Files:**
- Modify: `app/admin/(dashboard)/orders/[id]/page.tsx`

- [ ] **Step 1: Add state for edit form**

In the existing `OrderDetailPage` component, find the existing state declarations (around line 99–106) and add below them:

```typescript
const [editOpen, setEditOpen]     = useState(false)
const [editForm, setEditForm]     = useState<Record<string, string>>({})
const [editSaving, setEditSaving] = useState(false)
const [editError, setEditError]   = useState('')
const [editSaved, setEditSaved]   = useState(false)
```

- [ ] **Step 2: Add handler**

Find the `copyWaText` function and add before it:

```typescript
function initEditForm(o: Order) {
  setEditForm({
    nama_bisnes:      o.nama_bisnes      ?? '',
    tagline:          o.tagline          ?? '',
    cerita_bisnes:    o.cerita_bisnes    ?? '',
    produk_servis:    o.produk_servis    ?? '',
    target_pelanggan: o.target_pelanggan ?? '',
    waktu_operasi:    o.waktu_operasi    ?? '',
    alamat:           o.alamat           ?? '',
    google_maps_link: o.google_maps_link ?? '',
    instagram:        o.instagram        ?? '',
    facebook:         o.facebook         ?? '',
    tiktok:           o.tiktok           ?? '',
  })
}

async function handleEditSave() {
  setEditSaving(true)
  setEditError('')
  setEditSaved(false)
  try {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit_fields', ...editForm }),
    })
    const data = await res.json()
    if (!res.ok) { setEditError(data.error || 'Gagal simpan'); return }
    setEditSaved(true)
    await fetchOrder()
    setTimeout(() => setEditSaved(false), 3000)
  } finally {
    setEditSaving(false)
  }
}
```

- [ ] **Step 3: Add UI section**

Find the closing `</div>` of the `{/* ── Collapsible Order Details ── */}` section (the last `</div>` before the outer container closes, around line 543). Add after it:

```tsx
{/* ── Edit Order Data ── */}
<div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
  <button
    onClick={() => { setEditOpen(o => !o); if (!editOpen && order) initEditForm(order) }}
    style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#44403C', fontFamily: 'DM Sans, sans-serif' }}
  >
    <span>Edit Data Order</span>
    <span style={{ fontSize: 20, lineHeight: 1, color: '#78716C' }}>{editOpen ? '−' : '+'}</span>
  </button>

  {editOpen && (
    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f5f5f4' }}>

      {([ 
        ['nama_bisnes',      'Nama Bisnes',      'input'],
        ['tagline',          'Tagline',           'input'],
        ['cerita_bisnes',    'Cerita Bisnes',     'textarea'],
        ['produk_servis',    'Produk / Servis',   'textarea'],
        ['target_pelanggan', 'Target Pelanggan',  'textarea'],
        ['waktu_operasi',    'Waktu Operasi',     'input'],
        ['alamat',           'Alamat',            'textarea'],
        ['google_maps_link', 'Google Maps Link',  'input'],
        ['instagram',        'Instagram URL',     'input'],
        ['facebook',         'Facebook URL',      'input'],
        ['tiktok',           'TikTok URL',        'input'],
      ] as [string, string, 'input' | 'textarea'][]).map(([field, label, type]) => (
        <div key={field} style={{ marginBottom: 12, marginTop: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#78716C', marginBottom: 5 }}>{label}</label>
          {type === 'textarea' ? (
            <textarea
              value={editForm[field] ?? ''}
              onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, minHeight: 72, resize: 'vertical', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}
            />
          ) : (
            <input
              value={editForm[field] ?? ''}
              onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}
            />
          )}
        </div>
      ))}

      {editError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {editError}</p>}

      <button
        onClick={handleEditSave}
        disabled={editSaving}
        style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700, background: editSaved ? '#065F46' : editSaving ? '#d6d3d1' : '#1C1917', color: '#fff', border: 'none', borderRadius: 8, cursor: editSaving ? 'not-allowed' : 'pointer', marginTop: 8 }}
      >
        {editSaved ? '✓ Tersimpan!' : editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )}
</div>
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/admin/
git commit -m "feat: add edit order data form to admin order detail page"
```

---

## Task 10: End-to-End Verification

- [ ] **Step 1: Build check**

```bash
npm run build
```

Expected: Build succeeds with 0 TypeScript errors. New routes appear:
- `/bisnes/[subdomain]` — static params not pre-generated (dynamic)

- [ ] **Step 2: Test bisnes page routing**

With the dev server running (`npm run dev`), add a test entry to Supabase `orders` table with:
- `slug`: any test slug (e.g. `testbisnes`)
- `status`: `preview_ready`
- `template_pilihan`: `bold_minimal`
- fill required fields: `nama_bisnes`, `produk_servis`, `nama_owner`, `whatsapp`, `telefon`, `alamat`, `waktu_operasi`, `banner_atas_url`

Then visit `http://localhost:3000/bisnes/testbisnes` directly to confirm the page renders.

- [ ] **Step 3: Test middleware routing (subdomain)**

In `middleware.ts`, temporarily add `console.log('[middleware] subdomain hit:', subdomain, 'isBisnes:', isBisnes)`.

Visit a page that would trigger subdomain detection (or test locally by hitting `/bisnes/testbisnes` directly).

Remove the console.log after confirming.

- [ ] **Step 4: Test each template**

Update `template_pilihan` to each value and verify page loads without error:
- `bold_minimal`
- `warm_heritage`
- `cool_professional`
- `fresh_editorial`
- `dark_mode`

- [ ] **Step 5: Test admin edit form**

Go to `/admin/orders/{test-order-id}` in browser.
- Click "Edit Data Order" to expand
- Change `tagline` field
- Click "Simpan Perubahan"
- Verify "✓ Tersimpan!" appears
- Refresh page and confirm new tagline is shown in Detail Order

- [ ] **Step 6: Test "Minta Pindaan" button**

On a bisnes page, click "Minta Pindaan" at the bottom.
Expected: opens WhatsApp with pre-filled message containing bisnes name and slug.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: bisnes page template system complete — 5 templates, middleware routing, admin edit"
```
