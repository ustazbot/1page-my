# Bisnes Page Template System — Design Spec
Date: 2026-05-26

## Overview

Data-driven bisnes page template system for `*.1page.my` subdomains. Replaces the manual `public/clients/{slug}/index.html` approach. Five distinct templates with different section orders and visual personalities to match different marketing strategies. Includes client revision request flow and admin order editing.

---

## Scope

| Component | Description |
|---|---|
| `middleware.ts` | Supabase REST check to route bisnes vs candidate subdomains |
| `app/bisnes/[subdomain]/` | Server-rendered page + types + 5 template files |
| Bisnes page | "Minta Pindaan" WhatsApp button on every template |
| `/admin/orders/[id]` | New "Edit Order" form section |
| `/api/admin/orders/[id]` | Extend PATCH handler to support field editing |

---

## 1. Middleware Routing (Approach A)

**File:** `middleware.ts`

Add a Supabase REST API check **before** the existing subdomain routing logic. On every `*.1page.my` request (excluding static/api paths already filtered by the matcher):

```
1. Extract subdomain from hostname
2. fetch Supabase REST: orders?slug=eq.{subdomain}&status=in.(preview_ready,paid,live)&select=id&limit=1
3. If result.length > 0 → rewrite to /bisnes/{subdomain}
4. Else → existing logic → rewrite to /candidate/{subdomain}
```

Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already available in edge runtime). Add `Authorization: Bearer {anonKey}` header.

No caching in middleware — queries are lightweight (index scan on `slug` column, limit 1). Acceptable latency for current traffic volume.

---

## 2. Data Layer

**File:** `app/bisnes/[subdomain]/types.ts`

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

**File:** `app/bisnes/[subdomain]/page.tsx`

- Server component (no `'use client'`)
- Query: `supabaseServer().from('orders').select('*').eq('slug', subdomain).in('status', ['preview_ready', 'paid', 'live']).single()`
- `notFound()` if no match
- `generateMetadata`: title = `{nama_bisnes} — {tagline}`, description = first 160 chars of `cerita_bisnes`, og:image = `banner_atas_url`
- JSON-LD `LocalBusiness` schema: name, address, telephone, openingHours, url
- Pick template component based on `order.template_pilihan`, pass `order` as prop

---

## 3. Five Templates

Each template is a **single self-contained file** in `app/bisnes/[subdomain]/templates/`. Receives `{ order: BisnesOrder }` prop. No shared section components — each template has distinct visual personality.

### Template: `bold-minimal.tsx`
**Palette:** bg `#0a0a0a`, text `#ffffff`, accent `#e5e5e5`  
**Target:** B2C, Retail, Servis  
**Strategy:** "Tunjuk dulu, cerita kemudian"

Section order:
1. **Hero** — fullscreen banner, logo overlay (if any), nama_bisnes large, tagline, WhatsApp CTA button
2. **Produk & Servis** — dark background, grid of chips/tags parsed from `produk_servis` (comma-split)
3. **Gallery** — high-contrast grid, skip if empty
4. **Cerita Bisnes** — short punchy block, skip if empty
5. **Waktu & Lokasi** — minimal dark card, Google Maps link if available
6. **Footer CTA** — full-width WhatsApp button + social icons

---

### Template: `warm-heritage.tsx`
**Palette:** bg `#fef3c7`, text `#78350f`, accent `#f59e0b`  
**Target:** F&B, Kraftangan, Tradisional  
**Strategy:** "Jual cerita, bukan produk"

Section order:
1. **Hero** — warm banner, logo, nama_bisnes, tagline
2. **Cerita Bisnes** ★ — highlighted section, larger font, decorative border, skip if empty
3. **Gallery** — warm-tinted grid, skip if empty
4. **Produk & Servis** — list style with amber accents
5. **Waktu & Lokasi** — warm card, maps link
6. **Footer CTA** — amber WhatsApp button + social icons

---

### Template: `cool-professional.tsx`
**Palette:** bg `#f0f9ff`, text `#1e3a8a`, accent `#3b82f6`  
**Target:** Perkhidmatan, Klinik, Agensi  
**Strategy:** "Tunjukkan kepakaran dulu"

Section order:
1. **Hero** — clean banner, logo, nama_bisnes, tagline
2. **Produk & Servis** ★ — highlighted, structured card layout
3. **Cerita Bisnes** — "Tentang Kami" framing, skip if empty
4. **Waktu & Lokasi** — office-hours emphasis, maps link
5. **Gallery** — portfolio framing, skip if empty
6. **Footer CTA** — blue WhatsApp button + social icons

---

### Template: `fresh-editorial.tsx`
**Palette:** bg `#ecfdf5`, text `#064e3b`, accent `#10b981`  
**Target:** Wellness, Organic, Lifestyle  
**Strategy:** "Visual dulu — scroll terus"

Section order:
1. **Hero** — full-bleed banner, editorial typography, nama_bisnes, tagline
2. **Gallery** ★ — large lifestyle grid, skip if empty
3. **Cerita Bisnes** — values/mission framing, skip if empty
4. **Produk & Servis** — card style with green accents
5. **Waktu & Lokasi** — clean minimal card, maps link
6. **Footer CTA** — emerald WhatsApp button + social icons

---

### Template: `dark-mode.tsx`
**Palette:** bg `#0f172a`, text `#f8fafc`, accent `#0ea5e9`  
**Target:** Tech, Premium, Moden  
**Strategy:** "Statement — buat orang terkesan"

Section order:
1. **Hero** — dark full-bleed banner, large bold headline, tagline
2. **Cerita Bisnes** ★ — brand manifesto framing, sky blue accent, skip if empty
3. **Produk & Servis** — premium dark cards
4. **Gallery** — dark moody grid, skip if empty
5. **Waktu & Lokasi** — sleek dark card, maps link
6. **Footer CTA** — sky blue WhatsApp button + social icons

---

## 4. Shared Behaviours (All Templates)

- **Skip empty sections** — sections with no data are not rendered (no empty whitespace)
- **Produk & Servis parsing** — `produk_servis` is free text (textarea); split by comma or newline, trim whitespace, filter empty strings, render each item as a chip/tag/card
- **WhatsApp format** — `wa.me/60{whatsapp.replace(/^0/, '')}` with pre-filled message: `"Salam, saya berminat dengan perkhidmatan {nama_bisnes}"`
- **Sticky floating WhatsApp button** — fixed bottom-right on all templates (matches candidate page pattern)
- **"Minta Pindaan" button** — secondary button in hero or footer area, opens WA with pre-filled: `"Salam, saya nak minta pindaan untuk {nama_bisnes} ({slug}.1page.my). Saya nak ubah: "`. Admin WA number: hardcoded `60103602175` (same constant as order form `SUPPORT_WA`).
- **Scroll reveal animation** — `@supports (animation-timeline: scroll())` fade-up, same as candidate page
- **Social media links** — only render icons that have data (instagram, facebook, tiktok)
- **Google Maps link** — renders as a tappable button/link, no iframe embed (faster, no API key needed)

---

## 5. Client Revision Request

**"Minta Pindaan" button placement:** Rendered in every template's footer section (before or alongside CTA). Opens WhatsApp to admin number with pre-filled message containing the slug and bisnes name so admin knows which order.

Admin receives the WA, checks `/admin/orders/[id]`, edits the fields, saves. Page auto-updates on next load (no cache).

---

## 6. Admin Order Edit

**File:** `app/admin/(dashboard)/orders/[id]/page.tsx`

Add a new collapsible section **"Edit Order Data"** below the existing action panel. Contains editable fields:
- nama_bisnes, tagline, cerita_bisnes, produk_servis
- target_pelanggan, waktu_operasi, alamat, google_maps_link
- instagram, facebook, tiktok

On save, calls `PATCH /api/admin/orders/{id}` with `action: 'edit_fields'` + changed field values.

**File:** `app/api/admin/orders/[id]/route.ts`

Add handler for `action === 'edit_fields'` in the existing PATCH function. Updates only the provided fields. Requires admin session (already enforced by existing middleware).

---

## 7. SEO

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  // title: "{nama_bisnes} — {tagline || jenis_bisnes}"
  // description: cerita_bisnes.slice(0, 160) || produk_servis
  // og:image: banner_atas_url
  // og:type: "website"
  // keywords: [nama_bisnes, jenis_bisnes, alamat city]
}
```

JSON-LD `LocalBusiness`:
```json
{
  "@type": "LocalBusiness",
  "name": "nama_bisnes",
  "description": "cerita_bisnes",
  "telephone": "whatsapp",
  "address": { "@type": "PostalAddress", "streetAddress": "alamat" },
  "openingHours": "waktu_operasi",
  "url": "https://{slug}.1page.my"
}
```

---

## 8. Out of Scope

- Multiple template variants per order (client chooses post-live)
- Client self-edit without admin (Option B rejected)
- Testimonial section (no data field in orders table)
- FAQ section (no data field in orders table)
- iframe Google Maps embed (URL link sufficient)
