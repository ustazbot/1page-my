# Admin Order Actions — Design Spec

**Date:** 2026-05-26
**Scope:** Admin order detail page dengan status-driven actions, ToyyibPay bill generation, WhatsApp template, dan Telegram notifications.

---

## Problem

Admin dashboard `/admin/orders` hanya boleh tengok data sahaja. Tiada cara untuk update status, set slug, generate payment bill, atau communicate dengan client dari dalam sistem.

---

## Solution Overview

Tambah halaman detail `/admin/orders/[id]` yang tunjukkan tindakan berbeza ikut status order semasa. Mobile-first design dengan large touch targets.

---

## User Flow

```
Order baru masuk (status: pending)
  ↓
Admin buka order detail
  ↓
Admin isi slug + preview URL
  ↓
Klik "Jana Bill & Preview Ready"
  → ToyyibPay bill dicipta (RM150, order ID sebagai reference)
  → slug, preview_url, bill_code disimpan
  → status → preview_ready
  → Telegram notifikasi ke Bos
  ↓
Admin copy WhatsApp template → hantar ke client manual
  ↓
Client bayar via ToyyibPay → webhook mark paid/live (existing flow)
  ATAU
Admin klik "Mark as Live" (bayaran manual) → status → live
```

---

## Status-Driven Actions

| Status | Actions |
|--------|---------|
| `pending` | Form: slug + preview URL. Button: "Jana Bill & Preview Ready" |
| `preview_ready` | WhatsApp template (copy button). Button: "Buka WA Client". Button: "Mark as Live (Manual)" |
| `paid` | Button: "Mark as Live (Manual)" sebagai fallback |
| `live` | Read-only. Papar live URL |

**Guard:** Button "Mark as Live" hanya aktif jika `slug` sudah diisi.

---

## WhatsApp Message Template

```
Preview page anda dah siap! 🎉

Boleh tengok preview di sini:
{preview_url}

Jika setuju, sila buat bayaran RM150 di pautan ini untuk aktifkan page anda:
https://toyyibpay.com/{bill_code}

Ada soalan? Balas WhatsApp ini ya 😊
```

---

## Telegram Notifications (auto)

**Bila `set_preview` berjaya:**
```
📋 Preview siap!
{nama_bisnes} — {whatsapp}
Slug: {slug}.1page.my
Preview: {preview_url}
Bill: https://toyyibpay.com/{bill_code}
```

**Bila `mark_live` berjaya:**
```
✅ Live (manual)!
{nama_bisnes} → https://{slug}.1page.my
```

---

## ToyyibPay Bill Creation

- Endpoint: `POST https://toyyibpay.com/index.php/api/createBill`
- Amount: RM150 (15000 sen)
- `billExternalReferenceNo`: order `id` (untuk webhook matching)
- `billTo`: `nama_owner`
- `billPhone`: `whatsapp`
- `categoryCode`: `process.env.TOYYIBPAY_CATEGORY_CODE` (existing env var — kategori `1page-my`)
- `billCallbackUrl`: `https://1page.my/api/webhook/toyyibpay`
- Response: `[{ "BillCode": "xxx" }]` — simpan ke `orders.toyyibpay_bill_code`
- Jika bill creation gagal: return error, jangan update status

---

## Order Detail Section (collapsible)

Maklumat untuk rujukan semasa bina site:
- **Client:** nama_owner, whatsapp, telefon, email
- **Bisnes:** nama_bisnes, tagline, jenis_bisnes, produk_servis, cerita_bisnes, target_pelanggan
- **Lokasi:** alamat, waktu_operasi, google_maps_link
- **Sosial:** instagram, facebook, tiktok
- **Imej:** banner (thumbnail), logo (thumbnail), gallery (thumbnails)
- **Domain:** template_pilihan, domain_pref_1/2/3, domain_sendiri, domain_url
- **Catatan:** catatan

---

## Files

### New Files

| File | Tujuan |
|------|--------|
| `app/admin/(dashboard)/orders/[id]/page.tsx` | Order detail + actions page |
| `app/api/admin/orders/[id]/route.ts` | GET (full order) + PATCH (actions) |

### Modified Files

| File | Perubahan |
|------|-----------|
| `app/admin/(dashboard)/orders/page.tsx` | Row jadi clickable → navigate ke `/admin/orders/{id}` |

---

## API Design

### GET `/api/admin/orders/[id]`

Returns full order row. Requires admin session.

```json
{ "order": { ...all columns... } }
```

### PATCH `/api/admin/orders/[id]`

Requires admin session. Body: `{ action, ...fields }`

**`action: "set_preview"`**
```json
{ "action": "set_preview", "slug": "namakedai", "preview_url": "https://..." }
```
Steps:
1. Validate slug (alphanumeric + hyphens, no spaces) + preview_url (valid URL)
2. Check slug unique dalam orders table
3. Call ToyyibPay API → dapat bill_code
4. Update order: slug, preview_url, toyyibpay_bill_code, toyyibpay_amount=150, status='preview_ready'
5. Send Telegram
6. Return `{ ok: true, bill_code, whatsapp_text }`

**`action: "mark_live"`**
```json
{ "action": "mark_live" }
```
Steps:
1. Verify order ada slug
2. Update order: status='live', live_url='https://{slug}.1page.my'
3. Send Telegram
4. Return `{ ok: true, live_url }`

---

## Error Handling

- ToyyibPay API gagal → return 502, jangan update status, tunjuk error message kepada admin
- Slug dah dipakai → return 409, tunjuk inline error
- Invalid slug format → client-side validation sebelum submit
- Admin session tamat → redirect ke `/admin`

---

## Mobile UX Notes

- Large buttons (min 48px height)
- Full-width buttons untuk primary actions
- Slug input dengan `.1page.my` suffix label
- WhatsApp template dalam `<textarea>` dengan "Copy" button
- Back button ke orders list di atas

---

## Out of Scope

- Edit balik maklumat order yang client dah submit
- Hantar WhatsApp automatik (manual copy intentionally)
- Candidate orders (handled di `/admin/candidates`)
