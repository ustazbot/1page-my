# Client Order & Payment Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete client-facing flow — public order form → Supabase storage → Telegram notification to Bos → client preview page with approve/request-changes → ToyyibPay webhook for auto-deploy — plus Supabase orders list in operator dashboard.

**Architecture:** New pages and API routes added to the existing `1page-my` Next.js app. Public pages (`/order`, `/client-preview/[slug]`) use minimal layouts with no sidebar. Operator pages unchanged. Supabase holds all order state; Telegram Bot notifies Bos; `wa.me` links handle client communication without any WhatsApp API.

**Tech Stack:** Next.js 16 (App Router), `@supabase/supabase-js`, Telegram Bot API (plain fetch), ToyyibPay form-encoded webhook, TypeScript

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/supabase.ts` | Create | Browser anon client + server service-role client |
| `lib/telegram.ts` | Create | `sendTelegramMessage()` helper |
| `app/order/layout.tsx` | Create | Minimal public layout (no sidebar) |
| `app/order/page.tsx` | Create | Multi-section order form (Seksyen A–G) |
| `app/api/orders/route.ts` | Create | POST: save order + Telegram notif; GET: list for dashboard |
| `app/api/webhook/toyyibpay/route.ts` | Create | Handle main payment + revision payment |
| `app/api/client-preview/approve/route.ts` | Create | Update status → approved, return wa.me link |
| `app/client-preview/[slug]/page.tsx` | Create | Server component — fetch order by slug |
| `app/client-preview/[slug]/ClientPreviewUI.tsx` | Create | Client component — approve/changes UI |
| `components/dashboard/OrdersList.tsx` | Create | Supabase orders list component |
| `components/Dashboard.tsx` | Modify | Add OrdersList below quick links |
| `package.json` | Modify | Add `@supabase/supabase-js` |
| `.env.local` | Create | All env vars (never committed) |

---

## Task 1: Install Supabase + Environment Setup

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Create: `lib/supabase.ts`

- [ ] **Step 1: Install Supabase client**

```bash
cd /home/astro/claude-project/1page/1page-my
npm install @supabase/supabase-js
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Create `.env.local`**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# ToyyibPay
TOYYIBPAY_API_KEY=your_toyyibpay_api_key_here
TOYYIBPAY_CATEGORY_CODE=your_category_code_here

# Cloudflare (existing)
CF_DEPLOY_HOOK_URL=your_cloudflare_deploy_hook_url_here
CLOUDFLARE_API_TOKEN=your_existing_token
CLOUDFLARE_ACCOUNT_ID=your_existing_account_id
CF_PAGES_PROJECT_PREVIEW=your_preview_project_name
CF_PAGES_PROJECT_LIVE=your_live_project_name

# App
NEXT_PUBLIC_LIVE_DOMAIN=1page.my
NEXT_PUBLIC_PREVIEW_DOMAIN=preview.1page.my
BOS_WHATSAPP_REDIRECT=https://wa.me/60XXXXXXXXX
NEXT_PUBLIC_BOS_WA_REDIRECT=https://wa.me/60XXXXXXXXX
```

- [ ] **Step 3: Create `lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — anon key, for client components (order form submit only)
export const supabaseBrowser = createClient(url, anon)

// Server client — service role, for API routes and server components
export function supabaseServer() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
```

- [ ] **Step 4: Create Supabase orders table**

Run this SQL in your Supabase dashboard → SQL Editor:

```sql
create table public.orders (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default now(),
  nama_bisnes      text not null,
  tagline          text,
  jenis_bisnes     text,
  produk_servis    text not null,
  target_pelanggan text,
  nama_owner       text not null,
  whatsapp         text not null,
  telefon          text not null,
  email            text,
  alamat           text not null,
  waktu_operasi    text not null,
  google_maps_link text,
  instagram        text,
  facebook         text,
  tiktok           text,
  banner_atas_url  text not null,
  logo_url         text,
  gallery_urls     text,
  template_pilihan text not null,
  domain_sendiri   boolean default false,
  domain_url       text,
  domain_pref_1    text,
  domain_pref_2    text,
  domain_pref_3    text,
  catatan          text,
  status           text default 'pending',
  slug             text unique,
  preview_url      text,
  live_url         text,
  toyyibpay_bill_code text,
  payment_ref      text,
  paid_at          timestamp with time zone,
  revision_count   integer default 0
);

grant insert on public.orders to anon;
grant select, insert, update on public.orders to authenticated;
grant select, insert, update, delete on public.orders to service_role;

alter table public.orders enable row level security;

create policy "anon can submit order"
  on public.orders for insert to anon
  with check (true);

create policy "authenticated can manage orders"
  on public.orders for all to authenticated
  using (true)
  with check (true);
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase client (browser + server)"
```

Note: Do NOT commit `.env.local` — it contains secrets.

---

## Task 2: Telegram Notification Helper

**Files:**
- Create: `lib/telegram.ts`

- [ ] **Step 1: Create `lib/telegram.ts`**

```typescript
export async function sendTelegramMessage(text: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping')
    return
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[telegram] Failed:', err)
  }
}
```

- [ ] **Step 2: Setup Telegram Bot (one-time)**

```
1. Buka Telegram → cari @BotFather → /newbot
2. Ikut arahan → salin TELEGRAM_BOT_TOKEN ke .env.local
3. Hantar /start ke bot baru anda
4. Buka dalam browser (ganti TOKEN):
   https://api.telegram.org/bot{TOKEN}/getUpdates
5. Cari "chat":{"id": XXXXXXX} → itu TELEGRAM_CHAT_ID anda
6. Masukkan ke .env.local
```

- [ ] **Step 3: Test dengan curl**

Replace `{TOKEN}` dan `{CHAT_ID}` dengan nilai sebenar dari `.env.local`:

```bash
curl -s -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "{CHAT_ID}", "text": "Test dari 1page.my — webhook berfungsi!"}'
```

Expected: `{"ok":true,"result":{...}}` dan mesej muncul dalam Telegram.

- [ ] **Step 4: Commit**

```bash
git add lib/telegram.ts
git commit -m "feat: add Telegram Bot notification helper"
```

---

## Task 3: Order Form API Route

**Files:**
- Create: `app/api/orders/route.ts`

- [ ] **Step 1: Create `app/api/orders/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    nama_bisnes, tagline, jenis_bisnes, produk_servis, target_pelanggan,
    nama_owner, whatsapp, telefon, email,
    alamat, waktu_operasi, google_maps_link,
    instagram, facebook, tiktok,
    banner_atas_url, logo_url, gallery_urls,
    template_pilihan, domain_sendiri, domain_url,
    domain_pref_1, domain_pref_2, domain_pref_3,
    catatan,
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
      nama_bisnes, tagline, jenis_bisnes, produk_servis, target_pelanggan,
      nama_owner, whatsapp, telefon, email,
      alamat, waktu_operasi, google_maps_link,
      instagram, facebook, tiktok,
      banner_atas_url, logo_url, gallery_urls,
      template_pilihan, domain_sendiri: !!domain_sendiri, domain_url,
      domain_pref_1, domain_pref_2, domain_pref_3,
      catatan,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[orders] insert error:', error)
    return NextResponse.json({ error: 'Gagal simpan order. Cuba lagi.' }, { status: 500 })
  }

  await sendTelegramMessage(
    `🔔 Order baru!\n${nama_bisnes} — ${whatsapp}\nID: ${data.id}`
  )

  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET() {
  const supabase = supabaseServer()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      'id, created_at, nama_bisnes, nama_owner, whatsapp, status, slug, preview_url, live_url'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Gagal load orders' }, { status: 500 })
  }

  return NextResponse.json({ orders })
}
```

- [ ] **Step 2: Start dev server dan test POST**

```bash
npm run dev
```

In a separate terminal:

```bash
curl -s -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "nama_bisnes": "Kedai Test",
    "produk_servis": "Nasi lemak, mee goreng",
    "nama_owner": "Ahmad",
    "whatsapp": "0123456789",
    "telefon": "0312345678",
    "alamat": "No 1, Jalan Test, KL",
    "waktu_operasi": "Isnin-Sabtu 9pagi-6ptg",
    "banner_atas_url": "https://drive.google.com/file/d/test",
    "template_pilihan": "T1"
  }'
```

Expected: `{"ok":true,"id":"uuid-here"}` dan Telegram mesej diterima.

- [ ] **Step 3: Test GET**

```bash
curl -s http://localhost:3000/api/orders | python3 -m json.tool | head -20
```

Expected: `{"orders":[{"id":"...","nama_bisnes":"Kedai Test",...}]}`

- [ ] **Step 4: Commit**

```bash
git add app/api/orders/route.ts
git commit -m "feat: add POST+GET /api/orders — Supabase insert + Telegram notif"
```

---

## Task 4: Order Form Page (Public UI)

**Files:**
- Create: `app/order/layout.tsx`
- Create: `app/order/page.tsx`

- [ ] **Step 1: Create `app/order/layout.tsx`**

```tsx
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `app/order/page.tsx`**

```tsx
'use client'

import { useState } from 'react'

const TEMPLATES = ['T1', 'T2', 'T3', 'T4', 'T5']
const JENIS_BISNES = ['F&B', 'Retail', 'Servis', 'Lain-lain']

type FormState = {
  nama_bisnes: string; tagline: string; jenis_bisnes: string
  produk_servis: string; target_pelanggan: string
  nama_owner: string; whatsapp: string; telefon: string; email: string
  alamat: string; waktu_operasi: string; google_maps_link: string
  instagram: string; facebook: string; tiktok: string
  banner_atas_url: string; logo_url: string; gallery_urls: string
  template_pilihan: string; domain_sendiri: boolean; domain_url: string
  domain_pref_1: string; domain_pref_2: string; domain_pref_3: string
  catatan: string
}

const EMPTY: FormState = {
  nama_bisnes: '', tagline: '', jenis_bisnes: '',
  produk_servis: '', target_pelanggan: '',
  nama_owner: '', whatsapp: '', telefon: '', email: '',
  alamat: '', waktu_operasi: '', google_maps_link: '',
  instagram: '', facebook: '', tiktok: '',
  banner_atas_url: '', logo_url: '', gallery_urls: '',
  template_pilihan: '', domain_sendiri: false, domain_url: '',
  domain_pref_1: '', domain_pref_2: '', domain_pref_3: '',
  catatan: '',
}

const s = {
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 } as React.CSSProperties,
  hint:  { fontSize: 12, color: '#666', marginBottom: 8 } as React.CSSProperties,
  input: { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff', outline: 'none', boxSizing: 'border-box' as const, minHeight: 100, resize: 'vertical' as const },
  section: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #eee' } as React.CSSProperties,
  sectionTitle: { fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 20 } as React.CSSProperties,
  field: { marginBottom: 18 } as React.CSSProperties,
  required: { color: '#e53e3e', marginLeft: 3 } as React.CSSProperties,
}

export default function OrderPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal hantar.')
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Ralat berlaku. Cuba lagi.')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ maxWidth: 540, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Order Diterima!</h1>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Terima kasih, <strong>{form.nama_owner}</strong>. Kami akan review dan
          hantar preview dalam masa 24 jam bekerja. Semak WhatsApp anda.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
          Order Landing Page
        </h1>
        <p style={{ color: '#666', fontSize: 15 }}>
          Preview percuma sebelum bayar. RM150 sahaja. Siap dalam 24 jam bekerja.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Seksyen A — Maklumat Bisnes */}
        <div style={s.section}>
          <p style={s.sectionTitle}>A — Maklumat Bisnes</p>

          <div style={s.field}>
            <label style={s.label}>Nama Bisnes<span style={s.required}>*</span></label>
            <input style={s.input} value={form.nama_bisnes} required
              onChange={(e) => set('nama_bisnes', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Tagline / Slogan</label>
            <p style={s.hint}>Ayat pendek — contoh: "Nasi Lemak Terbaik di Puchong"</p>
            <input style={s.input} value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Jenis Bisnes</label>
            <select style={{ ...s.input }} value={form.jenis_bisnes}
              onChange={(e) => set('jenis_bisnes', e.target.value)}>
              <option value="">-- Pilih --</option>
              {JENIS_BISNES.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Produk / Servis Utama<span style={s.required}>*</span></label>
            <p style={s.hint}>Senaraikan, pisah dengan koma</p>
            <textarea style={s.textarea} value={form.produk_servis} required
              onChange={(e) => set('produk_servis', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Target Pelanggan</label>
            <p style={s.hint}>Contoh: ibu bapa, pelajar universiti, pejabat berdekatan</p>
            <textarea style={{ ...s.textarea, minHeight: 72 }} value={form.target_pelanggan}
              onChange={(e) => set('target_pelanggan', e.target.value)} />
          </div>
        </div>

        {/* Seksyen B — Maklumat Hubungan */}
        <div style={s.section}>
          <p style={s.sectionTitle}>B — Maklumat Hubungan</p>

          <div style={s.field}>
            <label style={s.label}>Nama Owner<span style={s.required}>*</span></label>
            <input style={s.input} value={form.nama_owner} required
              onChange={(e) => set('nama_owner', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={s.field}>
              <label style={s.label}>Nombor WhatsApp<span style={s.required}>*</span></label>
              <input style={s.input} type="tel" placeholder="0123456789"
                value={form.whatsapp} required
                onChange={(e) => set('whatsapp', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Nombor Telefon<span style={s.required}>*</span></label>
              <input style={s.input} type="tel" placeholder="0312345678"
                value={form.telefon} required
                onChange={(e) => set('telefon', e.target.value)} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={form.email}
              onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>

        {/* Seksyen C — Lokasi & Operasi */}
        <div style={s.section}>
          <p style={s.sectionTitle}>C — Lokasi & Operasi</p>

          <div style={s.field}>
            <label style={s.label}>Alamat Perniagaan<span style={s.required}>*</span></label>
            <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.alamat} required
              onChange={(e) => set('alamat', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Waktu Operasi<span style={s.required}>*</span></label>
            <p style={s.hint}>Contoh: Isnin–Sabtu, 9pagi–6ptg</p>
            <input style={s.input} value={form.waktu_operasi} required
              onChange={(e) => set('waktu_operasi', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Google Business / Google Maps Link</label>
            <p style={s.hint}>Tampal link Google Business Profile atau Google Maps anda</p>
            <input style={s.input} type="url" placeholder="https://maps.google.com/..."
              value={form.google_maps_link}
              onChange={(e) => set('google_maps_link', e.target.value)} />
          </div>
        </div>

        {/* Seksyen D — Media Sosial */}
        <div style={s.section}>
          <p style={s.sectionTitle}>D — Media Sosial</p>
          {(['instagram', 'facebook', 'tiktok'] as const).map((p) => (
            <div key={p} style={s.field}>
              <label style={s.label}>{p.charAt(0).toUpperCase() + p.slice(1)}</label>
              <input style={s.input} type="url"
                placeholder={`https://www.${p}.com/namaanda`}
                value={form[p]}
                onChange={(e) => set(p, e.target.value)} />
            </div>
          ))}
        </div>

        {/* Seksyen E — Imej */}
        <div style={s.section}>
          <p style={s.sectionTitle}>E — Imej</p>
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
            padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            <strong>Cara upload gambar:</strong> Upload ke Google Drive → klik kanan →
            "Dapatkan link" → tukar kepada "Sesiapa yang ada link boleh lihat" → tampal link di sini.
          </div>

          <div style={s.field}>
            <label style={s.label}>Banner Atas<span style={s.required}>*</span></label>
            <p style={s.hint}>Gambar utama halaman — landscape, kualiti tinggi</p>
            <input style={s.input} type="url" placeholder="https://drive.google.com/..."
              value={form.banner_atas_url} required
              onChange={(e) => set('banner_atas_url', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Logo</label>
            <input style={s.input} type="url" placeholder="https://drive.google.com/..."
              value={form.logo_url}
              onChange={(e) => set('logo_url', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Gallery / Gambar Tambahan</label>
            <p style={s.hint}>Satu link setiap baris — maksimum 6 gambar</p>
            <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.gallery_urls}
              onChange={(e) => set('gallery_urls', e.target.value)} />
          </div>
        </div>

        {/* Seksyen F — Domain & Template */}
        <div style={s.section}>
          <p style={s.sectionTitle}>F — Domain & Template</p>

          <div style={s.field}>
            <label style={s.label}>Template Pilihan<span style={s.required}>*</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPLATES.map((t) => (
                <button key={t} type="button" onClick={() => set('template_pilihan', t)}
                  style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    border: `2px solid ${form.template_pilihan === t ? '#1a1a1a' : '#ddd'}`,
                    background: form.template_pilihan === t ? '#1a1a1a' : '#fff',
                    color: form.template_pilihan === t ? '#fff' : '#555', cursor: 'pointer',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Ada domain sendiri?</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['Ya', 'Tidak'] as const).map((opt) => (
                <button key={opt} type="button"
                  onClick={() => set('domain_sendiri', opt === 'Ya')}
                  style={{
                    padding: '8px 24px', borderRadius: 8, fontSize: 14,
                    border: `2px solid ${form.domain_sendiri === (opt === 'Ya') ? '#1a1a1a' : '#ddd'}`,
                    background: form.domain_sendiri === (opt === 'Ya') ? '#1a1a1a' : '#fff',
                    color: form.domain_sendiri === (opt === 'Ya') ? '#fff' : '#555',
                    cursor: 'pointer',
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>

          {form.domain_sendiri && (
            <div style={s.field}>
              <label style={s.label}>Domain URL anda</label>
              <input style={s.input} type="url" placeholder="https://namabisnessaya.com"
                value={form.domain_url}
                onChange={(e) => set('domain_url', e.target.value)} />
            </div>
          )}

          {(['domain_pref_1', 'domain_pref_2', 'domain_pref_3'] as const).map((field, i) => (
            <div key={field} style={s.field}>
              <label style={s.label}>Nama domain pilihan {i + 1}</label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <input
                  style={{ ...s.input, borderRadius: '8px 0 0 8px', borderRight: 'none', flex: 1 }}
                  placeholder={i === 0 ? 'namabisnessaya' : `pilihan${i + 1}`}
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)} />
                <span style={{
                  padding: '0 14px', background: '#f5f5f5',
                  border: '1px solid #ddd', borderRadius: '0 8px 8px 0',
                  display: 'flex', alignItems: 'center',
                  fontSize: 14, color: '#888', whiteSpace: 'nowrap',
                }}>.1page.my</span>
              </div>
            </div>
          ))}
        </div>

        {/* Seksyen G — Maklumat Tambahan */}
        <div style={s.section}>
          <p style={s.sectionTitle}>G — Maklumat Tambahan</p>
          <textarea style={s.textarea}
            placeholder="Sebarang maklumat tambahan yang kami perlu tahu..."
            value={form.catatan}
            onChange={(e) => set('catatan', e.target.value)} />
        </div>

        {status === 'error' && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8,
            padding: '12px 16px', marginBottom: 20, color: '#c53030', fontSize: 14,
          }}>
            {errorMsg}
          </div>
        )}

        <button type="submit" disabled={status === 'submitting'}
          style={{
            width: '100%', padding: 16, fontSize: 18, fontWeight: 700,
            background: status === 'submitting' ? '#999' : '#1a1a1a',
            color: '#fff', border: 'none', borderRadius: 12,
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'submitting' ? 'Menghantar...' : 'Hantar Order →'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 16 }}>
          Preview percuma · Bayar RM150 hanya selepas anda setuju
        </p>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Test in browser**

Visit `http://localhost:3000/order`. Verify:
- All 7 sections render correctly
- Domain fields show `.1page.my` suffix
- "Domain URL" field hides/shows based on "Ada domain sendiri?" toggle
- Required field validation on submit
- Successful submit shows "Order Diterima!" confirmation

- [ ] **Step 4: Commit**

```bash
git add app/order/layout.tsx app/order/page.tsx
git commit -m "feat: add public order form /order with sections A-G"
```

---

## Task 5: ToyyibPay Webhook Handler

**Files:**
- Create: `app/api/webhook/toyyibpay/route.ts`

- [ ] **Step 1: Create `app/api/webhook/toyyibpay/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.formData()

  const ref    = body.get('billExternalReferenceNo') as string | null
  const status = body.get('billpaymentStatus') as string | null

  if (!ref || status !== '1') {
    return NextResponse.json({ ok: false })
  }

  const isRevision = ref.startsWith('REV-')
  const orderId    = isRevision ? ref.replace('REV-', '') : ref
  const supabase   = supabaseServer()

  if (isRevision) {
    const { data: order } = await supabase
      .from('orders')
      .select('revision_count, nama_bisnes')
      .eq('id', orderId)
      .single()

    const nextCount = (order?.revision_count ?? 0) + 1

    await supabase
      .from('orders')
      .update({ revision_count: nextCount })
      .eq('id', orderId)

    await sendTelegramMessage(
      `🔧 Revision paid! Revision #${nextCount}\n${order?.nama_bisnes ?? orderId}\nBoleh mulakan edit sekarang.`
    )

  } else {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_ref: ref,
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    await fetch(process.env.CF_DEPLOY_HOOK_URL!, { method: 'POST' })

    const { data: paid } = await supabase
      .from('orders')
      .select('slug, nama_bisnes')
      .eq('id', orderId)
      .single()

    await supabase
      .from('orders')
      .update({ status: 'live' })
      .eq('id', orderId)

    const liveUrl = `${paid?.slug}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN}`
    const waMsg   = encodeURIComponent(`🎉 Page anda dah live! https://${liveUrl}`)
    const waLink  = `${process.env.BOS_WHATSAPP_REDIRECT}?text=${waMsg}`

    await sendTelegramMessage(
      `✅ Deploy berjaya!\n${paid?.nama_bisnes} → ${liveUrl}\n\nHantar ke client:\n${waLink}`
    )
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Test main payment path**

Get a real order UUID from your Supabase dashboard first, then:

```bash
curl -s -X POST http://localhost:3000/api/webhook/toyyibpay \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "billExternalReferenceNo={ORDER_UUID}&billpaymentStatus=1&billpaymentAmount=15000&billTo=TestUser"
```

Expected: `{"ok":true}`, order `status` → `live` in Supabase, Telegram message with wa.me link received.

- [ ] **Step 3: Test revision payment path**

```bash
curl -s -X POST http://localhost:3000/api/webhook/toyyibpay \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "billExternalReferenceNo=REV-{ORDER_UUID}&billpaymentStatus=1&billpaymentAmount=5000&billTo=TestUser"
```

Expected: `{"ok":true}`, `revision_count` incremented in Supabase, Telegram message received.

- [ ] **Step 4: Commit**

```bash
git add app/api/webhook/toyyibpay/route.ts
git commit -m "feat: add ToyyibPay webhook — main payment + revision (REV- prefix)"
```

---

## Task 6: Client Preview Page

**Files:**
- Create: `app/api/client-preview/approve/route.ts`
- Create: `app/client-preview/[slug]/page.tsx`
- Create: `app/client-preview/[slug]/ClientPreviewUI.tsx`

- [ ] **Step 1: Create `app/api/client-preview/approve/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { slug } = await req.json() as { slug: string }

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const supabase = supabaseServer()

  const { error } = await supabase
    .from('orders')
    .update({ status: 'approved' })
    .eq('slug', slug)
    .eq('status', 'preview_ready')

  if (error) {
    return NextResponse.json({ error: 'Gagal update status.' }, { status: 500 })
  }

  const bosBase = process.env.BOS_WHATSAPP_REDIRECT!
  const waLink  = `${bosBase}?text=${encodeURIComponent(
    'Saya dah semak page dan setuju untuk proceed. Sila hantar link bayaran.'
  )}`

  return NextResponse.json({ ok: true, waLink })
}
```

- [ ] **Step 2: Create `app/client-preview/[slug]/page.tsx`**

```tsx
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ClientPreviewUI from './ClientPreviewUI'

export default async function ClientPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = supabaseServer()

  const { data: order, error } = await supabase
    .from('orders')
    .select('nama_bisnes, status, preview_url')
    .eq('slug', slug)
    .single()

  if (error || !order) notFound()

  return (
    <ClientPreviewUI
      slug={slug}
      namaBisnes={order.nama_bisnes}
      status={order.status}
      previewUrl={order.preview_url}
    />
  )
}
```

- [ ] **Step 3: Create `app/client-preview/[slug]/ClientPreviewUI.tsx`**

```tsx
'use client'

import { useState } from 'react'

const STATUS_LABEL: Record<string, string> = {
  pending:       'Dalam Proses',
  preview_ready: 'Preview Sedia',
  approved:      'Diluluskan',
  paid:          'Pembayaran Diterima',
  live:          'Live',
}

const STATUS_COLOR: Record<string, string> = {
  pending:       '#9ca3af',
  preview_ready: '#3b82f6',
  approved:      '#f59e0b',
  paid:          '#22c55e',
  live:          '#15803d',
}

export default function ClientPreviewUI({
  slug, namaBisnes, status, previewUrl,
}: {
  slug: string
  namaBisnes: string
  status: string
  previewUrl: string | null
}) {
  const [view, setView]           = useState<'main' | 'changes'>('main')
  const [changesText, setChanges] = useState('')
  const [approving, setApproving] = useState(false)

  async function handleApprove() {
    setApproving(true)
    const res  = await fetch('/api/client-preview/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    const data = await res.json()
    if (data.ok) window.location.href = data.waLink
    else setApproving(false)
  }

  function handleSendChanges() {
    const base = process.env.NEXT_PUBLIC_BOS_WA_REDIRECT ?? ''
    const msg  = `Saya nak minta perubahan untuk page ${namaBisnes}: ${changesText}`
    window.location.href = `${base}?text=${encodeURIComponent(msg)}`
  }

  const canApprove = status === 'preview_ready'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{namaBisnes}</p>
          <span style={{
            display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 600,
            padding: '2px 10px', borderRadius: 20,
            background: `${STATUS_COLOR[status] ?? '#999'}22`,
            color: STATUS_COLOR[status] ?? '#999',
          }}>
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>
      </div>

      {/* Preview iframe */}
      <div style={{ flex: 1 }}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            style={{ width: '100%', height: '100%', minHeight: 400, border: 'none', display: 'block' }}
            title={`Preview — ${namaBisnes}`}
          />
        ) : (
          <div style={{
            height: 300, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#999', fontSize: 14,
          }}>
            Preview belum tersedia. Sila tunggu notifikasi dari kami.
          </div>
        )}
      </div>

      {/* Action bar — sticky bottom */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff',
        borderTop: '1px solid #e5e5e5', padding: '16px 20px',
      }}>
        {view === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleApprove}
              disabled={approving || !canApprove}
              style={{
                width: '100%', padding: 16, fontSize: 16, fontWeight: 700,
                background: canApprove ? '#16a34a' : '#d1d5db',
                color: '#fff', border: 'none', borderRadius: 10,
                cursor: canApprove ? 'pointer' : 'not-allowed', minHeight: 52,
              }}
            >
              {approving ? 'Memproses...' : '✅  Saya Setuju & Nak Proceed'}
            </button>
            <button
              onClick={() => setView('changes')}
              style={{
                width: '100%', padding: 14, fontSize: 15, fontWeight: 600,
                background: '#fff', color: '#555', border: '1px solid #ddd',
                borderRadius: 10, cursor: 'pointer', minHeight: 48,
              }}
            >
              ✏️  Minta Perubahan
            </button>
          </div>
        )}

        {view === 'changes' && (
          <div>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
              Nyatakan perubahan yang dikehendaki:
            </p>
            <textarea
              value={changesText}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Contoh: Tukar warna butang kepada merah, tambah nombor telefon kedua..."
              style={{
                width: '100%', minHeight: 88, padding: 12, fontSize: 15,
                border: '1px solid #ddd', borderRadius: 8, resize: 'vertical',
                boxSizing: 'border-box', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setView('main')}
                style={{
                  flex: 1, padding: 14, fontSize: 14,
                  background: '#fff', border: '1px solid #ddd',
                  borderRadius: 8, cursor: 'pointer',
                }}>
                Batal
              </button>
              <button
                onClick={handleSendChanges}
                disabled={!changesText.trim()}
                style={{
                  flex: 2, padding: 14, fontSize: 14, fontWeight: 600,
                  background: changesText.trim() ? '#1a1a1a' : '#d1d5db',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: changesText.trim() ? 'pointer' : 'not-allowed',
                }}>
                Hantar Perubahan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test in browser**

Insert a test order in Supabase SQL Editor:
```sql
insert into public.orders (nama_bisnes, produk_servis, nama_owner, whatsapp, telefon, alamat, waktu_operasi, banner_atas_url, template_pilihan, status, slug, preview_url)
values ('Kedai Test', 'Nasi lemak', 'Ahmad', '0123456789', '0312345678', 'KL', 'Isnin-Sabtu', 'https://drive.google.com/test', 'T1', 'preview_ready', 'kedai-test', 'https://example.com');
```

Visit `http://localhost:3000/client-preview/kedai-test`. Verify:
- Header shows "Kedai Test" with "Preview Sedia" badge
- "Saya Setuju" button is green and active
- "Minta Perubahan" reveals textarea
- Clicking "Saya Setuju" calls `/api/client-preview/approve` and redirects to wa.me

- [ ] **Step 5: Commit**

```bash
git add app/api/client-preview/ app/client-preview/
git commit -m "feat: add client preview page /client-preview/[slug] with approve flow"
```

---

## Task 7: Operator Dashboard — Orders List

**Files:**
- Create: `components/dashboard/OrdersList.tsx`
- Modify: `components/Dashboard.tsx`

- [ ] **Step 1: Create `components/dashboard/OrdersList.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: string
  created_at: string
  nama_bisnes: string
  nama_owner: string
  whatsapp: string
  status: string
  slug: string | null
  preview_url: string | null
  live_url: string | null
}

const STATUS_COLOR: Record<string, string> = {
  pending:       '#9ca3af',
  preview_ready: '#3b82f6',
  approved:      '#f59e0b',
  paid:          '#22c55e',
  live:          '#15803d',
}

export default function OrdersList() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders ?? []); setLoading(false) })
      .catch(() => { setError('Gagal load orders'); setLoading(false) })
  }, [])

  if (loading) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Memuatkan...</p>
  if (error)   return <p style={{ color: 'red', fontSize: 13 }}>{error}</p>
  if (orders.length === 0) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Tiada order lagi.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {orders.map((order) => (
        <div key={order.id} style={{
          padding: '14px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 3 }}>
              {order.nama_bisnes}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {order.nama_owner} · {order.whatsapp}
            </p>
            {order.preview_url && (
              <a href={order.preview_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--color-accent)', display: 'block', marginTop: 4 }}>
                {order.preview_url}
              </a>
            )}
            {order.live_url && (
              <a href={order.live_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--color-success)', display: 'block', marginTop: 2 }}>
                {order.live_url}
              </a>
            )}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: `${STATUS_COLOR[order.status] ?? '#999'}22`,
            color: STATUS_COLOR[order.status] ?? '#999',
            flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {order.status}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Modify `components/Dashboard.tsx`**

Add import at top of file (after existing imports):
```tsx
import OrdersList from '@/components/dashboard/OrdersList'
```

Add orders section before the final closing `</div>` of the outer container div:
```tsx
{/* Supabase Orders */}
<div style={{ marginTop: 32 }}>
  <p style={{
    fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
    color: 'var(--color-text-muted)', textTransform: 'uppercase',
    marginBottom: 14,
  }}>
    Orders Terbaru
  </p>
  <OrdersList />
</div>
```

- [ ] **Step 3: Test in browser**

Visit `http://localhost:3000/operator`. Verify orders list appears with correct status badges, business names, and links.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/OrdersList.tsx components/Dashboard.tsx
git commit -m "feat: add Supabase orders list to operator dashboard"
```

---

## Post-Implementation Checklist

- [ ] `.env.local` — all vars filled in, file NOT committed to git
- [ ] Supabase — orders table created, RLS and grants applied
- [ ] Telegram — bot created, token + chat_id in `.env.local`, test message successful
- [ ] `/order` — form submits, Supabase row created, Telegram notif received
- [ ] `/api/webhook/toyyibpay` — both main (orderId) and revision (REV-orderId) paths tested
- [ ] `/client-preview/[slug]` — renders order, approve → wa.me redirect, request changes → wa.me with text
- [ ] `/operator` dashboard — shows Supabase orders with status badges
- [ ] Deploy to Vercel — add all env vars in Vercel dashboard (Settings → Environment Variables)
- [ ] Configure `preview.1page.my` custom domain in Vercel → point to `/client-preview` routes
