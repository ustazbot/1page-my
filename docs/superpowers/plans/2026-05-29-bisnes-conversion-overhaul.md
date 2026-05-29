# Bisnes Conversion Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new conversion segments (stats bar, USP, pakej, testimoni, FAQ) to all 5 bisnes templates, fix segment order, improve CTA copy, and show phone number — each template visually differentiated.

**Architecture:** New jsonb columns in `orders` table. Client inputs via 5 new form sections (H–L). API route updated to persist them. All 5 templates rewritten with standardised segment order + per-template styles for new segments. `ctaCopy()` helper drives dynamic button text.

**Tech Stack:** Next.js App Router (server components for templates, client component for order form), Supabase (jsonb columns), TypeScript inline styles.

---

## File Map

| Action | File |
|--------|------|
| CREATE | `supabase/migrations/005_bisnes_conversion_segments.sql` |
| MODIFY | `app/bisnes/[subdomain]/types.ts` |
| MODIFY | `app/api/(platform)/orders/route.ts` |
| MODIFY | `app/(platform)/order/page.tsx` |
| REWRITE | `app/bisnes/[subdomain]/templates/bold-minimal.tsx` |
| REWRITE | `app/bisnes/[subdomain]/templates/warm-heritage.tsx` |
| REWRITE | `app/bisnes/[subdomain]/templates/cool-professional.tsx` |
| REWRITE | `app/bisnes/[subdomain]/templates/fresh-editorial.tsx` |
| REWRITE | `app/bisnes/[subdomain]/templates/dark-mode.tsx` |

---

## Task 1: SQL Migration

**Files:**
- Create: `supabase/migrations/005_bisnes_conversion_segments.sql`

- [ ] **Step 1: Write migration file**

```sql
-- supabase/migrations/005_bisnes_conversion_segments.sql
alter table public.orders
  add column if not exists stats_bar  jsonb not null default '[]',
  add column if not exists usp        jsonb not null default '[]',
  add column if not exists pakej      jsonb not null default '[]',
  add column if not exists testimoni  jsonb not null default '[]',
  add column if not exists faq        jsonb not null default '[]';
```

- [ ] **Step 2: Apply in Supabase Dashboard**

Pergi Supabase Dashboard → SQL Editor → paste dan run. Verify: Table Editor → `orders` → confirm 5 kolum baru ada dengan default `[]`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/005_bisnes_conversion_segments.sql
git commit -m "feat: add stats_bar, usp, pakej, testimoni, faq columns to orders"
```

---

## Task 2: Update BisnesOrder types.ts

**Files:**
- Modify: `app/bisnes/[subdomain]/types.ts`

- [ ] **Step 1: Overwrite file**

```typescript
// app/bisnes/[subdomain]/types.ts

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
  stats_bar: { nilai: string; label: string }[] | null
  usp:       { tajuk: string; huraian: string }[] | null
  pakej:     { nama: string; harga: string; ciri: string[]; popular?: boolean }[] | null
  testimoni: { nama: string; dari: string; ulasan: string }[] | null
  faq:       { soalan: string; jawapan: string }[] | null
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors from `types.ts`.

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/types.ts"
git commit -m "feat: add 5 conversion segment fields to BisnesOrder type"
```

---

## Task 3: Update /api/orders POST route

**Files:**
- Modify: `app/api/(platform)/orders/route.ts`

- [ ] **Step 1: Update destructuring and insert**

Ganti keseluruhan fail:

```typescript
// app/api/(platform)/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah.' }, { status: 400 })
  }

  const {
    nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan,
    nama_owner, whatsapp, telefon, email,
    alamat, waktu_operasi, google_maps_link,
    instagram, facebook, tiktok,
    banner_atas_url, logo_url, gallery_urls,
    template_pilihan, domain_sendiri, domain_url,
    domain_pref_1, domain_pref_2, domain_pref_3,
    catatan,
    stats_bar, usp, pakej, testimoni, faq,
  } = body

  if (
    !nama_bisnes || !produk_servis || !nama_owner ||
    !whatsapp || !telefon || !alamat ||
    !waktu_operasi || !banner_atas_url || !template_pilihan
  ) {
    return NextResponse.json(
      { error: 'Sila lengkapkan semua maklumat wajib.' },
      { status: 400 }
    )
  }

  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan,
      nama_owner, whatsapp, telefon, email,
      alamat, waktu_operasi, google_maps_link,
      instagram, facebook, tiktok,
      banner_atas_url, logo_url,
      gallery_urls: typeof gallery_urls === 'string'
        ? gallery_urls.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      template_pilihan, domain_sendiri: !!domain_sendiri, domain_url,
      domain_pref_1, domain_pref_2, domain_pref_3,
      catatan,
      stats_bar:  Array.isArray(stats_bar)  ? stats_bar  : [],
      usp:        Array.isArray(usp)        ? usp        : [],
      pakej:      Array.isArray(pakej)      ? pakej      : [],
      testimoni:  Array.isArray(testimoni)  ? testimoni  : [],
      faq:        Array.isArray(faq)        ? faq        : [],
    })
    .select('id')
    .single()

  if (error) {
    console.error('[orders] insert error:', error)
    return NextResponse.json({ error: 'Gagal simpan order. Cuba lagi.' }, { status: 500 })
  }

  await sendTelegramMessage(
    `🔔 Order baru!\n${nama_bisnes} — ${whatsapp}\nID: ${data.id}`
  ).catch((err: unknown) => console.error('[orders] telegram error:', err))

  return NextResponse.json({ ok: true, id: data.id })
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/api/(platform)/orders/route.ts"
git commit -m "feat: persist stats_bar, usp, pakej, testimoni, faq in orders POST"
```

---

## Task 4: Update /order form — Sections H–L

**Files:**
- Modify: `app/(platform)/order/page.tsx`

- [ ] **Step 1: Add 5 new array state declarations**

Cari baris `const [helpOpen, setHelpOpen] = useState(false)` (baris ~587) dan tambah selepasnya:

```typescript
  const [statsBar, setStatsBar] = useState<{ nilai: string; label: string }[]>([])
  const [uspList, setUspList]   = useState<{ tajuk: string; huraian: string }[]>([])
  const [pakejList, setPakejList] = useState<{ nama: string; harga: string; ciri: string; popular: boolean }[]>([])
  const [testimoniList, setTestimoniList] = useState<{ nama: string; dari: string; ulasan: string }[]>([])
  const [faqList, setFaqList]   = useState<{ soalan: string; jawapan: string }[]>([])
```

- [ ] **Step 2: Update handleSubmit payload**

Cari `body: JSON.stringify({` dalam `handleSubmit` dan tambah 5 field baru:

```typescript
        body: JSON.stringify({
          ...form,
          affiliate_ref_code: refCode ?? null,
          stats_bar: statsBar.filter(s => s.nilai.trim() && s.label.trim()),
          usp: uspList.filter(u => u.tajuk.trim()),
          pakej: pakejList
            .filter(p => p.nama.trim())
            .map(p => ({ ...p, ciri: p.ciri.split('\n').map(c => c.trim()).filter(Boolean) })),
          testimoni: testimoniList.filter(t => t.ulasan.trim()),
          faq: faqList.filter(f => f.soalan.trim()),
        }),
```

- [ ] **Step 3: Add Section H — Pencapaian Bisnes**

Cari `{/* ── G — Maklumat Tambahan ── */}` dan tambah Section H **sebelumnya**:

```tsx
          {/* ── H — Pencapaian Bisnes (Stats Bar) ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>H — Pencapaian Bisnes</p>
            <p style={s.hint}>Nombor yang tunjukkan kredibiliti anda — contoh: "200+" / "Pelanggan Berpuas Hati". Sehingga 4 statistik. (Optional)</p>
            {statsBar.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <input style={s.input} placeholder="200+" value={row.nilai}
                  onChange={e => setStatsBar(prev => prev.map((r, j) => j === i ? { ...r, nilai: e.target.value } : r))} />
                <input style={s.input} placeholder="Pelanggan Berpuas Hati" value={row.label}
                  onChange={e => setStatsBar(prev => prev.map((r, j) => j === i ? { ...r, label: e.target.value } : r))} />
                <button type="button" onClick={() => setStatsBar(prev => prev.filter((_, j) => j !== i))}
                  style={{ padding: '8px 12px', background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>✕</button>
              </div>
            ))}
            {statsBar.length < 4 && (
              <button type="button" onClick={() => setStatsBar(prev => [...prev, { nilai: '', label: '' }])}
                style={{ fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ddd', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', marginTop: 4 }}>
                + Tambah Statistik
              </button>
            )}
          </div>

          {/* ── I — Kenapa Pilih Kami ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>I — Kenapa Pilih Kami</p>
            <p style={s.hint}>3–4 sebab ringkas kenapa pelanggan patut pilih anda. (Optional)</p>
            {uspList.map((row, i) => (
              <div key={i} style={{ marginBottom: 12, border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Point {i + 1}</label>
                  <button type="button" onClick={() => setUspList(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>Padam</button>
                </div>
                <input style={{ ...s.input, marginBottom: 8 }} placeholder="Tajuk ringkas, cth: Servis Cepat" value={row.tajuk}
                  onChange={e => setUspList(prev => prev.map((r, j) => j === i ? { ...r, tajuk: e.target.value } : r))} />
                <input style={s.input} placeholder="Huraian 1 ayat, cth: Siap dalam 24 jam bekerja" value={row.huraian}
                  onChange={e => setUspList(prev => prev.map((r, j) => j === i ? { ...r, huraian: e.target.value } : r))} />
              </div>
            ))}
            {uspList.length < 4 && (
              <button type="button" onClick={() => setUspList(prev => [...prev, { tajuk: '', huraian: '' }])}
                style={{ fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ddd', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                + Tambah Point
              </button>
            )}
          </div>

          {/* ── J — Pakej & Harga ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>J — Pakej & Harga</p>
            <p style={s.hint}>Sehingga 3 pakej. Boleh letak harga tepat (RM150) atau terbuka ("Hubungi Kami"). (Optional)</p>
            {pakejList.map((row, i) => (
              <div key={i} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Pakej {i + 1}</label>
                  <button type="button" onClick={() => setPakejList(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>Padam</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={s.label}>Nama Pakej</label>
                    <input style={s.input} placeholder="Pakej Basic" value={row.nama}
                      onChange={e => setPakejList(prev => prev.map((r, j) => j === i ? { ...r, nama: e.target.value } : r))} />
                  </div>
                  <div>
                    <label style={s.label}>Harga</label>
                    <input style={s.input} placeholder="RM150" value={row.harga}
                      onChange={e => setPakejList(prev => prev.map((r, j) => j === i ? { ...r, harga: e.target.value } : r))} />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Ciri-ciri (satu per baris)</label>
                  <textarea style={{ ...s.textarea, minHeight: 80 }}
                    placeholder={"Termasuk konsultasi percuma\nDeliveri dalam 3 hari\nGaransi 30 hari"}
                    value={row.ciri}
                    onChange={e => setPakejList(prev => prev.map((r, j) => j === i ? { ...r, ciri: e.target.value } : r))} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={row.popular}
                    onChange={e => setPakejList(prev => prev.map((r, j) => j === i ? { ...r, popular: e.target.checked } : r))} />
                  Tandai sebagai "Pilihan Ramai"
                </label>
              </div>
            ))}
            {pakejList.length < 3 && (
              <button type="button" onClick={() => setPakejList(prev => [...prev, { nama: '', harga: '', ciri: '', popular: false }])}
                style={{ fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ddd', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                + Tambah Pakej
              </button>
            )}
          </div>

          {/* ── K — Testimoni Pelanggan ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>K — Testimoni Pelanggan</p>
            <p style={s.hint}>Sehingga 3 testimoni dari pelanggan anda. (Optional)</p>
            {testimoniList.map((row, i) => (
              <div key={i} style={{ marginBottom: 14, border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Testimoni {i + 1}</label>
                  <button type="button" onClick={() => setTestimoniList(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>Padam</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={s.label}>Nama</label>
                    <input style={s.input} placeholder="Siti Rahimah" value={row.nama}
                      onChange={e => setTestimoniList(prev => prev.map((r, j) => j === i ? { ...r, nama: e.target.value } : r))} />
                  </div>
                  <div>
                    <label style={s.label}>Dari Mana</label>
                    <input style={s.input} placeholder="Kuala Lumpur" value={row.dari}
                      onChange={e => setTestimoniList(prev => prev.map((r, j) => j === i ? { ...r, dari: e.target.value } : r))} />
                  </div>
                </div>
                <div>
                  <label style={s.label}>Ulasan</label>
                  <textarea style={{ ...s.textarea, minHeight: 72 }}
                    placeholder="Servis terbaik, cepat dan mesra pelanggan!"
                    value={row.ulasan}
                    onChange={e => setTestimoniList(prev => prev.map((r, j) => j === i ? { ...r, ulasan: e.target.value } : r))} />
                </div>
              </div>
            ))}
            {testimoniList.length < 3 && (
              <button type="button" onClick={() => setTestimoniList(prev => [...prev, { nama: '', dari: '', ulasan: '' }])}
                style={{ fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ddd', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                + Tambah Testimoni
              </button>
            )}
          </div>

          {/* ── L — Soalan Lazim (FAQ) ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>L — Soalan Lazim</p>
            <p style={s.hint}>Soalan yang selalu ditanya pelanggan dan jawapannya. Sehingga 5 soalan. (Optional)</p>
            {faqList.map((row, i) => (
              <div key={i} style={{ marginBottom: 14, border: '1px solid #eee', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>Soalan {i + 1}</label>
                  <button type="button" onClick={() => setFaqList(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>Padam</button>
                </div>
                <input style={{ ...s.input, marginBottom: 10 }}
                  placeholder="Berapa lama masa siapkan order?" value={row.soalan}
                  onChange={e => setFaqList(prev => prev.map((r, j) => j === i ? { ...r, soalan: e.target.value } : r))} />
                <textarea style={{ ...s.textarea, minHeight: 72 }}
                  placeholder="Biasanya dalam 3–5 hari bekerja bergantung pada jenis order."
                  value={row.jawapan}
                  onChange={e => setFaqList(prev => prev.map((r, j) => j === i ? { ...r, jawapan: e.target.value } : r))} />
              </div>
            ))}
            {faqList.length < 5 && (
              <button type="button" onClick={() => setFaqList(prev => [...prev, { soalan: '', jawapan: '' }])}
                style={{ fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ddd', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
                + Tambah Soalan
              </button>
            )}
          </div>
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(platform)/order/page.tsx"
git commit -m "feat: add form sections H-L for stats, usp, pakej, testimoni, faq"
```

---

## Task 5: Rewrite bold-minimal.tsx

**Files:**
- Rewrite: `app/bisnes/[subdomain]/templates/bold-minimal.tsx`

**Style rules for new segments:**
- Stats Bar: large white numbers, thin `#222` dividers, all-caps grey labels
- USP: 2-col grid, `#1a1a1a` border, `◆` prefix
- Mid-CTA: transparent button, white border, pill shape
- Pakej: dark `#111` cards, popular = `2px solid #fff` border + white "PILIHAN RAMAI" badge
- Testimoni: italic, em-dash attribution, `#999` text
- FAQ: native `<details>` accordion, `1px solid #1a1a1a` divider

- [ ] **Step 1: Overwrite file**

```tsx
// app/bisnes/[subdomain]/templates/bold-minimal.tsx
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
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#444', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -i 'bold-minimal' | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/templates/bold-minimal.tsx"
git commit -m "feat: rewrite bold-minimal — new segments, fixed order, dynamic CTA"
```

---

## Task 6: Rewrite warm-heritage.tsx

**Files:**
- Rewrite: `app/bisnes/[subdomain]/templates/warm-heritage.tsx`

**Style rules:**
- Stats Bar: gold `#f59e0b` numbers, cream `#fef3c7` bg, `|` dividers
- USP: cream cards `#fef9ec`, `✦` prefix, `#fde68a` border
- Mid-CTA: amber `#f59e0b` bg, `#78350f` text, rounded-8
- Pakej: warm cards, amber ribbon "Pilihan Ramai" on popular
- Testimoni: parchment bg `#fef9ec`, large amber `"`, italic
- FAQ: soft accordion, amber `▾` chevron, `#fde68a` border

- [ ] **Step 1: Overwrite file**

```tsx
// app/bisnes/[subdomain]/templates/warm-heritage.tsx
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
  .wh-faq summary { list-style: none; cursor: pointer; }
  .wh-faq summary::-webkit-details-marker { display: none; }
  .wh-faq[open] .wh-chevron { transform: rotate(180deg); }
  .wh-chevron { transition: transform 0.2s; display: inline-block; }
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

export default function WarmHeritage({ order }: { order: BisnesOrder }) {
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
      <main style={{ background: '#fef3c7', color: '#78350f', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
        <section style={{ position: 'relative', height: '80svh', minHeight: 440 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(120,53,15,0.3) 0%, rgba(120,53,15,0.85) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 24px 48px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 16, borderRadius: 8, background: 'rgba(254,243,199,0.15)', padding: 6 }} />
            )}
            <h1 className="wh-hero" style={{ fontSize: 'clamp(30px,7vw,56px)', fontWeight: 800, lineHeight: 1.1, color: '#fef3c7', margin: '0 0 10px' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 16, color: '#fde68a', margin: '0 0 24px', lineHeight: 1.55 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '12px 24px', borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="wh-reveal" style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderLeft: i > 0 ? '1px solid #fcd34d' : 'none' }}>
                  <div style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{s.nilai}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#b45309', marginTop: 6, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="wh-reveal" style={{ padding: '56px 24px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#78350f', marginBottom: 6, display: 'flex', gap: 8 }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}>✦</span>{u.tajuk}
                  </div>
                  {u.huraian && <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5, margin: 0 }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Produk & Servis */}
        <section className="wh-reveal" style={{ padding: `${usp.length > 0 ? '0' : '56px'} 24px 56px`, maxWidth: 640, margin: '0 auto' }}>
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

        {/* S5: Mid-page CTA */}
        <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S6: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#fef9ec', borderRadius: 10, padding: '24px 18px', border: p.popular ? '2px solid #f59e0b' : '1px solid #fde68a', position: 'relative' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#78350f', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 50, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      ✦ Pilihan Ramai
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900, color: '#78350f', marginBottom: 14 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.ciri.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#92400e', lineHeight: 1.4 }}>
                          <span style={{ color: '#f59e0b', flexShrink: 0 }}>✦</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#f59e0b' : '#fde68a', color: '#78350f', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S7: Gallery */}
        {galleries.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 0 56px' }}>
            <div style={{ padding: '0 24px', maxWidth: 640, margin: '0 auto', marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309' }}>Gallery</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(galleries.length, 3)}, 1fr)`, gap: 4 }}>
              {galleries.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(120,53,15,0.06)' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S8: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 16 }}>Kisah Kami</p>
              <p style={{ fontSize: 17, lineHeight: 1.85, color: '#92400e', fontWeight: 500 }}>{order.cerita_bisnes}</p>
            </div>
          </section>
        )}

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 24 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ background: '#fef9ec', borderRadius: 10, padding: '24px', border: '1px solid #fde68a', position: 'relative' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 48, color: '#f59e0b', lineHeight: 0.6, marginBottom: 16 }}>&ldquo;</div>
                  <p style={{ fontSize: 15, fontStyle: 'italic', color: '#92400e', lineHeight: 1.75, margin: '0 0 14px' }}>{t.ulasan}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#b45309', margin: 0, letterSpacing: '0.04em' }}>{t.nama} · {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b45309', marginBottom: 20 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faq.map((f, i) => (
                <details key={i} className="wh-faq" style={{ background: '#fef9ec', borderRadius: 8, border: '1px solid #fde68a', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>{f.soalan}</span>
                    <span className="wh-chevron" style={{ color: '#f59e0b', fontSize: 16, flexShrink: 0 }}>▾</span>
                  </summary>
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #fde68a' }}>
                    <p style={{ fontSize: 14, color: '#92400e', lineHeight: 1.65, margin: '12px 0 0' }}>{f.jawapan}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
        <section className="wh-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
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

        {/* S12: Footer CTA */}
        <footer style={{ background: '#78350f', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '16px 36px', borderRadius: 10, fontWeight: 800, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <p style={{ fontSize: 14, color: '#fcd34d', margin: '0 0 20px' }}>📞 {order.telefon}</p>
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

      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#f59e0b', color: '#78350f', borderRadius: 50, padding: '12px 20px', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -i 'warm-heritage' | head -10
```

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/templates/warm-heritage.tsx"
git commit -m "feat: rewrite warm-heritage — new segments, fixed order, dynamic CTA"
```

---

## Task 7: Rewrite cool-professional.tsx

**Files:**
- Rewrite: `app/bisnes/[subdomain]/templates/cool-professional.tsx`

**Style rules:**
- Stats Bar: `#dbeafe` pill bg, `#1e3a8a` numbers
- USP: white cards, `✓` blue prefix, `#dbeafe` border
- Mid-CTA: `#3b82f6` outlined button (border only, white bg)
- Pakej: 3-col table feel, popular column `bg:#1e3a8a color:#fff`
- Testimoni: white card, avatar initials circle `bg:#dbeafe`
- FAQ: white cards with `#dbeafe` border, numbered

- [ ] **Step 1: Overwrite file**

```tsx
// app/bisnes/[subdomain]/templates/cool-professional.tsx
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
  .cp-faq summary { list-style: none; cursor: pointer; }
  .cp-faq summary::-webkit-details-marker { display: none; }
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
              <a href={order.google_maps_link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                🗺️ Buka Google Maps →
              </a>
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
          <a href={waHref(ADMIN_WA, `Salam, saya nak minta pindaan untuk ${order.nama_bisnes} (${order.slug}.1page.my). Saya nak ubah: `)}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'underline', display: 'block', marginBottom: 32 }}>
            Minta Pindaan
          </a>
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -i 'cool-professional' | head -10
```

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/templates/cool-professional.tsx"
git commit -m "feat: rewrite cool-professional — new segments, fixed order, dynamic CTA"
```

---

## Task 8: Rewrite fresh-editorial.tsx

**Files:**
- Rewrite: `app/bisnes/[subdomain]/templates/fresh-editorial.tsx`

**Style rules:**
- Stats Bar: green badge tags `bg:#d1fae5`, compact horizontal
- USP: `✅` prefix, `#d1fae5` bg, `3px solid #10b981` top-border
- Mid-CTA: solid `#10b981` button
- Pakej: green-tinted `#d1fae5` cards, feature chips `bg:#ecfdf5`
- Testimoni: magazine pull-quote, large `"` in `#10b981`
- FAQ: `2px solid #10b981` left-border list

- [ ] **Step 1: Overwrite file**

```tsx
// app/bisnes/[subdomain]/templates/fresh-editorial.tsx
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

function ctaCopy(jenis: string | null): string {
  if (!jenis) return 'WhatsApp Kami Sekarang'
  if (jenis.includes('F&B') || jenis.includes('Retail')) return 'Tanya Harga Sekarang'
  if (jenis.includes('Servis')) return 'Dapatkan Sebut Harga'
  return 'WhatsApp Kami Sekarang'
}

export default function FreshEditorial({ order }: { order: BisnesOrder }) {
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
      <main style={{ background: '#ecfdf5', color: '#064e3b', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
        <section style={{ position: 'relative', height: '75svh', minHeight: 400 }}>
          <img src={order.banner_atas_url} alt={order.nama_bisnes}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,78,59,0.7) 0%, rgba(6,78,59,0.2) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px', maxWidth: 640, margin: '0 auto' }}>
            {order.logo_url && (
              <img src={order.logo_url} alt="Logo"
                style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 20, borderRadius: 10, background: 'rgba(255,255,255,0.15)', padding: 6 }} />
            )}
            <h1 className="fe-hero" style={{ fontSize: 'clamp(32px,7vw,60px)', fontWeight: 800, color: '#ecfdf5', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p style={{ fontSize: 17, color: '#a7f3d0', margin: '0 0 28px', lineHeight: 1.55, maxWidth: 420 }}>{order.tagline}</p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="fe-reveal" style={{ padding: '20px 24px', maxWidth: 640, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: '#d1fae5', borderRadius: 50, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#065f46' }}>{s.nilai}</span>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="fe-reveal" style={{ padding: `${stats.length > 0 ? '12px' : '56px'} 24px 56px`, maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '14px 16px', borderTop: '3px solid #10b981' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#064e3b', marginBottom: 4, display: 'flex', gap: 8 }}>
                    <span style={{ flexShrink: 0 }}>✅</span>{u.tajuk}
                  </div>
                  {u.huraian && <p style={{ fontSize: 12, color: '#065f46', lineHeight: 1.5, margin: '0 0 0 24px' }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Gallery */}
        {galleries.length > 0 && (
          <section className="fe-reveal" style={{ padding: `${usp.length > 0 ? '0' : '56px'} 0 56px` }}>
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
                </>
              ) : (
                <img src={galleries[0]} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
          </section>
        )}

        {/* S5: Produk & Servis */}
        <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Produk & Servis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#064e3b', fontWeight: 600, lineHeight: 1.4 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* S6: Mid-page CTA */}
        <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S7: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#d1fae5', borderRadius: 10, padding: '22px 18px', border: p.popular ? '2px solid #10b981' : '1px solid #a7f3d0', position: 'relative' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                      Pilihan Ramai
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: '#064e3b', marginBottom: 12 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {p.ciri.map((c, j) => (
                        <span key={j} style={{ background: '#ecfdf5', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#065f46', fontWeight: 500 }}>{c}</span>
                      ))}
                    </div>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#10b981' : '#a7f3d0', color: p.popular ? '#fff' : '#064e3b', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S8: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Kisah & Nilai Kami</p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: '#065f46', fontWeight: 400 }}>{order.cerita_bisnes}</p>
          </section>
        )}

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 24 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ borderLeft: '4px solid #10b981', paddingLeft: 20 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: '#10b981', lineHeight: 0.7, marginBottom: 12 }}>&ldquo;</div>
                  <p style={{ fontSize: 16, fontStyle: 'italic', color: '#065f46', lineHeight: 1.75, margin: '0 0 10px' }}>{t.ulasan}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', margin: 0 }}>{t.nama} · {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="fe-reveal" style={{ padding: '0 24px 56px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {faq.map((f, i) => (
                <div key={i} style={{ borderLeft: '2px solid #10b981', paddingLeft: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', margin: '0 0 6px' }}>{f.soalan}</p>
                  <p style={{ fontSize: 14, color: '#065f46', lineHeight: 1.65, margin: 0 }}>{f.jawapan}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
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

        {/* S12: Footer CTA */}
        <footer style={{ background: '#064e3b', padding: '48px 24px 80px', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10b981', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <p style={{ fontSize: 14, color: '#6ee7b7', margin: '0 0 20px' }}>📞 {order.telefon}</p>
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

      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#10b981', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -i 'fresh-editorial' | head -10
```

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/templates/fresh-editorial.tsx"
git commit -m "feat: rewrite fresh-editorial — new segments, fixed order, dynamic CTA"
```

---

## Task 9: Rewrite dark-mode.tsx

**Files:**
- Rewrite: `app/bisnes/[subdomain]/templates/dark-mode.tsx`

**Style rules:**
- Stats Bar: `#0ea5e9` numbers, dark strip `#0f172a`
- USP: dark cards `#1e293b`, `3px solid #0ea5e9` left-border
- Mid-CTA: `#0ea5e9` solid button
- Pakej: dark `#1e293b` cards, `1px solid rgba(255,255,255,0.08)` border, popular = sky-blue top badge
- Testimoni: dark card `#1e293b`, `3px solid #0ea5e9` top-border
- FAQ: dark `<details>` accordion, sky-blue `▾` icon

- [ ] **Step 1: Overwrite file**

```tsx
// app/bisnes/[subdomain]/templates/dark-mode.tsx
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
  .dm-faq summary { list-style: none; cursor: pointer; }
  .dm-faq summary::-webkit-details-marker { display: none; }
  .dm-faq[open] .dm-chevron { transform: rotate(180deg); }
  .dm-chevron { transition: transform 0.2s; display: inline-block; }
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

export default function DarkMode({ order }: { order: BisnesOrder }) {
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
      <main style={{ background: '#0f172a', color: '#f8fafc', fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* S1: Hero */}
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
            <h1 className="dm-hero" style={{ fontSize: 'clamp(36px,9vw,72px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#f8fafc' }}>
              {order.nama_bisnes}
            </h1>
            {order.tagline && (
              <p className="dm-sub" style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 36px', lineHeight: 1.6, maxWidth: 460 }}>
                {order.tagline}
              </p>
            )}
            <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
              target="_blank" rel="noopener noreferrer" className="dm-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '14px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' }}>
              💬 {cta}
            </a>
          </div>
        </section>

        {/* S2: Stats Bar */}
        {stats.length > 0 && (
          <section className="dm-reveal" style={{ background: '#0f172a', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0 28px', borderLeft: i > 0 ? '1px solid #1e293b' : 'none' }}>
                  <div style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{s.nilai}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S3: Kenapa Pilih Kami */}
        {usp.length > 0 && (
          <section className="dm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Kenapa Pilih Kami</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
              {usp.map((u, i) => (
                <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: '18px 20px', borderLeft: '3px solid #0ea5e9' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{u.tajuk}</div>
                  {u.huraian && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{u.huraian}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S4: Cerita Bisnes */}
        {order.cerita_bisnes && (
          <section className="dm-reveal" style={{ padding: `${usp.length > 0 ? '0' : '64px'} 24px 64px`, background: '#0ea5e9', maxWidth: '100%' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e0f2fe', marginBottom: 24, opacity: 0.7 }}>Tentang Kami</p>
              <p style={{ fontSize: 'clamp(18px,3vw,24px)', lineHeight: 1.7, color: '#fff', fontWeight: 500, margin: 0 }}>
                {order.cerita_bisnes}
              </p>
            </div>
          </section>
        )}

        {/* S5: Produk & Servis */}
        <section className="dm-reveal" style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Produk & Servis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#1e293b', border: '1px solid #1e3a5f', borderRadius: 10, padding: '16px', fontSize: 14, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>
                <span style={{ color: '#0ea5e9', display: 'block', fontSize: 18, marginBottom: 8 }}>◆</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* S6: Mid-page CTA */}
        <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
          <a href={waHref(order.whatsapp, `Salam, ada soalan tentang ${order.nama_bisnes}?`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ada soalan? WhatsApp kami →
          </a>
        </section>

        {/* S7: Pakej & Harga */}
        {pakej.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Pakej & Harga</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
              {pakej.map((p, i) => (
                <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: '24px 18px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', borderTop: p.popular ? '3px solid #0ea5e9' : '1px solid rgba(255,255,255,0.08)' }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -1, right: 14, background: '#0ea5e9', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: '0 0 6px 6px', letterSpacing: '0.08em' }}>
                      POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.nama}</div>
                  <div style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: '#f8fafc', marginBottom: 14 }}>{p.harga}</div>
                  {p.ciri.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {p.ciri.map((c, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                          <span style={{ color: '#0ea5e9', flexShrink: 0 }}>◆</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${p.nama} (${order.nama_bisnes})`)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: p.popular ? '#0ea5e9' : '#0f172a', color: p.popular ? '#fff' : '#64748b', padding: '10px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: p.popular ? 'none' : '1px solid #1e293b' }}>
                    Pilih Pakej
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S8: Gallery */}
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

        {/* S9: Testimoni */}
        {testimoni.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Kata Pelanggan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {testimoni.map((t, i) => (
                <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: '20px', borderTop: '3px solid #0ea5e9' }}>
                  <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 12px' }}>&ldquo;{t.ulasan}&rdquo;</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', margin: 0 }}>{t.nama} · {t.dari}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* S10: FAQ */}
        {faq.length > 0 && (
          <section className="dm-reveal" style={{ padding: '0 24px 64px', maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24 }}>Soalan Lazim</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faq.map((f, i) => (
                <details key={i} className="dm-faq" style={{ background: '#1e293b', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{f.soalan}</span>
                    <span className="dm-chevron" style={{ color: '#0ea5e9', fontSize: 14, flexShrink: 0 }}>▾</span>
                  </summary>
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: '12px 0 0' }}>{f.jawapan}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* S11: Waktu & Lokasi */}
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

        {/* S12: Footer CTA */}
        <footer style={{ padding: '48px 24px 80px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
          <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0ea5e9', color: '#fff', padding: '16px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 12 }}>
            💬 Hubungi Kami di WhatsApp
          </a>
          <p style={{ fontSize: 14, color: '#475569', margin: '0 0 20px' }}>📞 {order.telefon}</p>
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

      <a href={waHref(order.whatsapp, `Salam, saya berminat dengan ${order.nama_bisnes}`)}
        target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 900, background: '#0ea5e9', color: '#fff', borderRadius: 50, padding: '12px 20px', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(14,165,233,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 {cta}
      </a>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -i 'dark-mode' | head -10
```

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/templates/dark-mode.tsx"
git commit -m "feat: rewrite dark-mode — new segments, fixed order, dynamic CTA"
```

---

## Task 10: Final Build Verify

- [ ] **Step 1: Full type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 2: Production build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes successfully, `bisnes/[subdomain]` listed as `ƒ Dynamic`.

- [ ] **Step 3: Apply SQL migration in Supabase (if not done in Task 1)**

Pergi Supabase Dashboard → SQL Editor → run migration dari Task 1.

- [ ] **Step 4: Push to deploy**

```bash
git push origin main
```

GitHub Actions akan build dan restart pm2 pada VPS.

---

## Self-Review

**Spec coverage:**
- ✅ 5 new DB columns → Task 1
- ✅ types.ts update → Task 2
- ✅ API route fix (explicit destructuring) → Task 3
- ✅ Form sections H–L → Task 4
- ✅ ctaCopy() dynamic CTA → Tasks 5–9 (each template)
- ✅ Phone number visible in footer → Tasks 5–9 (each template)
- ✅ Mid-page CTA → Tasks 5–9 (each template)
- ✅ Stats Bar — all 5 templates with differentiated styles → Tasks 5–9
- ✅ USP — all 5 templates with differentiated styles → Tasks 5–9
- ✅ Pakej — all 5 templates with differentiated styles → Tasks 5–9
- ✅ Testimoni — all 5 templates with differentiated styles → Tasks 5–9
- ✅ FAQ — all 5 templates with differentiated styles → Tasks 5–9
- ✅ Segment reorder (Hero→Stats→USP→Produk→MidCTA→Pakej→Gallery→Cerita→Testimoni→FAQ→Waktu→Footer) → Tasks 5–9
- ✅ Build verify → Task 10

**Type consistency:**
- `BisnesOrder.pakej[].ciri` is `string[]` in types.ts — templates access `p.ciri.map(...)` ✓
- `form` in Task 4 uses `ciri: string` (textarea raw) → converted to `string[]` in payload via `.split('\n')` ✓
- `ctaCopy()` signature identical in all 5 templates ✓
- `statsBar`, `uspList`, `pakejList`, `testimoniList`, `faqList` — all separate from FormState ✓
