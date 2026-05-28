# Design Spec: Admin Generate & Preview — One-Click Flow

**Date:** 2026-05-29
**Status:** Approved
**Goal:** Admin boleh jana copy AI, review, edit, dan hantar preview ke client — semua dalam satu panel admin dashboard — tanpa perlu buka web builder.

---

## Masalah

Flow semasa memerlukan admin switch antara dua interface:
1. Web builder (`/operator`) — 6 modul manual untuk bina dan deploy page
2. Admin dashboard — untuk manage status, billing, dan notifikasi

Bila order masuk banyak, admin tidak mampu handle secara manual di web builder.

---

## Penyelesaian

Integrate kemampuan jana + preview terus dalam admin order detail page. Leverage satu penemuan kritikal: **`slug.1page.my` bukan static HTML** — ia page dinamik Next.js yang baca terus dari Supabase `orders` table. Tiada deploy diperlukan — bila data dalam DB dikemaskini, page terus berubah.

---

## Status Flow Baru

```
pending → draft → preview_ready → paid → live
```

| Status | Siapa boleh akses `slug.1page.my` | Keterangan |
|--------|----------------------------------|------------|
| `pending` | — (tiada page lagi) | Order baru masuk, slug belum set |
| `draft` | Admin sahaja (cookie session) | Admin sedang bina/review |
| `preview_ready` | Admin sahaja (cookie session) | Admin dah hantar ke client, menunggu bayaran |
| `paid` | Admin sahaja | Bayaran diterima |
| `live` | Semua (public) | Page live untuk umum |

**Coming Soon guard:** Bila status `draft` atau `preview_ready`, `/bisnes/[subdomain]/page.tsx` semak admin session cookie. Kalau bukan admin → render `<ComingSoonPage />`. Kalau admin → render template biasa.

---

## Architecture

### Perubahan Database

**Tambah status `draft`** ke `orders` table:

```sql
-- Tiada perubahan schema diperlukan — status adalah text column
-- Cuma perlu update semua status checks untuk include 'draft'
```

**Supabase migration diperlukan** untuk update RLS policies dan middleware check yang filter `status IN (preview_ready, paid, live)` → tambah `draft` untuk admin access.

### API Baru

#### `POST /api/admin/orders/[id]/generate-copy`

Jana copy marketing dengan Claude berdasarkan data order.

**Input:** Order data dari DB (nama_bisnes, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan, tagline, alamat, waktu_operasi)

**Proses:**
1. Validate admin session
2. Fetch order dari DB
3. Set status → `draft` (supaya admin boleh preview dalam iframe)
4. Hantar brief ke Claude (`lib/claude.ts` existing `generateCopy`)
5. Simpan copy yang dihasilkan balik ke `orders` table (overwrite `tagline`, `cerita_bisnes`, `produk_servis`)
6. Return updated fields

**Output:**
```json
{
  "ok": true,
  "copy": {
    "tagline": "...",
    "cerita_bisnes": "...",
    "produk_servis": "..."
  }
}
```

**Error handling:** Kalau Claude gagal → return 502, status sudah jadi `draft` (set sebelum call Claude), admin boleh cuba jana semula atau edit fields manual.

#### Update `PATCH /api/admin/orders/[id]` — action: `set_preview`

Tambah: Set status `draft` → `preview_ready` (dari `pending` tidak lagi valid — admin mesti jana dulu).

---

## Admin Order Detail Page — Restructure

### Layout Baru (Desktop: 2 kolumn, Mobile: 1 kolumn)

```
┌──────────────────────────┬──────────────────────────┐
│  Panel Kiri              │  Panel Kanan             │
│  (Edit & Jana)           │  (Live Preview)          │
│                          │                          │
│  [Status badge]          │  iframe → slug.1page.my  │
│                          │  (hanya nampak bila      │
│  ── Slug & Template ──   │   status = draft/above)  │
│  [slug input].1page.my   │                          │
│  [Template picker: 5]    │  [🔄 Refresh]            │
│                          │                          │
│  ── Jana dengan AI ──    │                          │
│  [Jana dengan AI ▶]      │                          │
│  (loading state: spinner │                          │
│   + button disabled)     │                          │
│                          │                          │
│  ── Edit Copy ──         │                          │
│  Tagline [input]         │                          │
│  Cerita Bisnes [textarea]│                          │
│  Produk & Servis [textarea]                         │
│  ...semua fields lain    │                          │
│                          │                          │
│  ── Gambar ──            │                          │
│  [Banner] [Logo]         │                          │
│  [Gallery thumbnails]    │                          │
│  [Upload ganti gambar]   │                          │
│                          │                          │
│  ── Actions ──           │                          │
│  [Simpan Perubahan]      │                          │
│  [Set Preview & Jana Bill]                          │
│  [Mark as Live]          │                          │
│  [Padam Order]           │                          │
└──────────────────────────┴──────────────────────────┘
```

### Panel Kiri — Komponen dan Behaviour

**Slug & Template (visible semua status):**
- Slug input (editable bila status `pending` atau `draft`)
- Template picker: 5 card visual (bold_minimal, warm_heritage, cool_professional, fresh_editorial, dark_mode) — admin boleh override pilihan client
- Bila template ditukar → save ke DB → iframe auto-refresh

**Jana dengan AI (visible bila status `pending` atau `draft`):**
- Button "Jana dengan AI"
- Loading state: button disabled + spinner + teks "Menjana copy..."
- Masa jangkaan: 10–15 saat
- Bila selesai: fields edit auto-populate dengan copy baru + iframe refresh
- Boleh jana semula bila-bila masa (overwrite copy)

**Edit Copy (visible semua status, editable bila bukan `live`):**
- Semua fields dari `edit_fields` yang sedia ada + tambah semua field order
- Explicit "Simpan Perubahan" button (bukan auto-save — admin confirm dulu sebelum DB dikemaskini)
- Bila status `pending` dan admin klik "Simpan Perubahan" → status auto-set ke `draft` juga
- Selepas save → iframe refresh automatik

**Gambar (visible semua status):**
- Tunjuk thumbnail: Banner, Logo, Gallery (dari R2 URLs)
- Butang upload ganti untuk setiap slot (guna `/api/upload` yang sedia ada)
- Upload baru → padam lama dari R2 → simpan URL baru → iframe refresh

**Actions (context-aware):**

| Status | Buttons yang nampak |
|--------|---------------------|
| `pending` | Jana dengan AI |
| `draft` | Jana Semula, Simpan Perubahan, Set Preview & Jana Bill |
| `preview_ready` | Copy WA Text, Buka WA, Mark as Live (manual) |
| `paid` | Mark as Live |
| `live` | (view only) |

**"Set Preview & Jana Bill" flow:**
1. Validate slug set
2. Create ToyyibPay bill (existing logic)
3. Set status → `preview_ready`
4. Tunjuk WA text siap copy (preview URL + payment link)
5. Telegram notif ke Bos

### Panel Kanan — Live Preview Iframe

- Hanya render bila status ≥ `draft`
- `src="https://[slug].1page.my"` — admin dashboard sudah logged in, cookie admin session akan dibawa oleh browser dalam iframe request (same-origin cookie atau credentials)
- Refresh button manual
- Auto-refresh selepas: save copy, tukar template, upload gambar

**Note:** Coming Soon guard check admin session cookie server-side — bukan query param. Query param mudah dimanipulasi oleh orang luar.

---

## Coming Soon Guard — `/bisnes/[subdomain]/page.tsx`

```typescript
// Pseudocode
const order = await fetchOrder(subdomain)  // status IN (draft, preview_ready, paid, live)

if (['draft', 'preview_ready', 'paid'].includes(order.status)) {
  const isAdmin = await getAdminSession()  // check cookie
  if (!isAdmin) return <ComingSoonPage bisnesName={order.nama_bisnes} />
}

return <Template order={order} />
```

**`<ComingSoonPage />`** — simple page dengan:
- Logo 1page.my
- "Halaman ini akan datang tidak lama lagi"
- Nama bisnes
- Tiada info lain (jangan dedah data client)

---

## Perubahan pada Bisnes Page Middleware

Middleware semasa check: `status IN (preview_ready, paid, live)`.

Perlu update untuk:
- Tambah `draft` dalam check — supaya middleware rewrite ke `/bisnes/[subdomain]` untuk draft juga
- Tanpa ini, `draft.1page.my` akan route ke `/candidate/[subdomain]` — salah

---

## Fail-Fail Yang Diubah / Dibina Baru

| Fail | Jenis | Keterangan |
|------|-------|-----------|
| `app/api/admin/orders/[id]/generate-copy/route.ts` | BARU | Claude copy generation endpoint |
| `app/api/admin/orders/[id]/route.ts` | UBAH | Tambah `draft` dalam `set_preview` logic |
| `app/admin/(dashboard)/orders/[id]/page.tsx` | UBAH | Restructure jadi 2-panel layout |
| `app/bisnes/[subdomain]/page.tsx` | UBAH | Tambah Coming Soon guard |
| `middleware.ts` | UBAH | Tambah `draft` dalam status check |
| `components/admin/ComingSoonPage.tsx` | BARU | Coming Soon component |

---

## Perkara Yang TIDAK Diubah

- Web builder (`/operator`, 6 modul) — kekal untuk advanced use, tidak disentuh
- `lib/cloudflare.ts` — kekal, tidak dibuang
- `lib/claude.ts` — digunakan semula, tidak diubah
- Affiliate system, candidate pages — tidak disentuh
- ToyyibPay webhook — tidak diubah

---

## Out of Scope (Fasa Ini)

- Auto-generate bila order submit (Pilihan 1) — boleh buat kemudian
- Queue system (Pilihan 3) — bila volume tinggi
- Image crop/edit dalam dashboard — upload ganti sahaja untuk sekarang
- Whatsapp auto-send — admin masih copy-paste manual
