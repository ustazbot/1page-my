# Design: Migrate Image Storage ke Cloudflare R2

**Tarikh:** 2026-05-24
**Status:** Approved

## Konteks

Supabase Storage free plan had limit 50MB total storage. Pada kadar 5–15 orders sebulan dengan anggaran 8–10MB per order (banner + logo + gallery), limit ini akan tercapai dalam masa ~5 orders sahaja. Image URLs dari Supabase diinject terus ke dalam HTML template yang di-deploy — ertinya delete dari Supabase = gambar hilang dari live site.

## Keputusan

Gantikan Supabase Storage dengan **Cloudflare R2** sebagai permanent image storage. R2 free tier (10GB) memadai untuk lebih 5 tahun operasi pada skala semasa. Supabase tetap digunakan untuk database (`orders` table) sahaja.

Tambah **delete-on-replace**: bila client klik "Tukar Gambar" atau buang gambar dari gallery, file lama dipadam dari R2 serta-merta supaya tiada orphaned files.

## Arkitektur

```
Client upload → POST /api/upload → Cloudflare R2 → public URL
Client tukar  → DELETE /api/upload { url } → R2 delete lama → buka file picker → upload baru
Client × gallery → DELETE /api/upload { url } → R2 delete → keluarkan dari array
```

## Komponen

### Fail baru

**`lib/r2.ts`**
R2 client menggunakan `@aws-sdk/client-s3` (S3-compatible). Export dua fungsi:
- `uploadToR2(key, buffer, contentType)` → returns public URL
- `deleteFromR2(url)` → extract key dari URL, delete object. Returns void, fails silently.

### Fail diubah

**`app/api/upload/route.ts`**
- `POST` — terima multipart/form-data, compress check, upload via `uploadToR2()`, return `{ url }`
- `DELETE` — terima JSON `{ url: string }`, panggil `deleteFromR2(url)`, return `{ ok: true }`. Error diabaikan (fail silently).

**`app/order/page.tsx` — `ImageUploadField`**
- Bila "Tukar Gambar" diklik: fire-and-forget `fetch('DELETE /api/upload', { url: currentUrl })`, kemudian clear state dan buka file picker seperti biasa.

**`app/order/page.tsx` — `GalleryUploadField`**
- Bila × diklik pada thumbnail: fire-and-forget delete untuk URL berkenaan, kemudian keluarkan dari array.

**`.env.local`**
Tambah 4 vars baru:
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=order-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Fail dibuang / tidak berubah

- Supabase Storage tidak lagi digunakan — boleh delete bucket `order-images` dari Supabase dashboard selepas migration selesai.
- Semua modul operator (intake, assets, copywrite, build, preview, deploy) tidak berubah.
- Compression logic (`compressImage`) kekal sama.
- Supabase database (`orders` table) kekal sama.

## Dependencies

Package baru: `@aws-sdk/client-s3`

## Setup R2 (langkah operator)

1. Cloudflare dashboard → R2 → Create bucket `order-images`
2. Settings → Public access → Enable
3. Manage R2 API tokens → Create token (Object Read & Write)
4. Salin Account ID, Access Key ID, Secret Access Key ke `.env.local`
5. Salin public bucket URL ke `NEXT_PUBLIC_R2_PUBLIC_URL`

## Error Handling

| Senario | Tindakan |
|---------|----------|
| Upload gagal (network/quota) | Return error ke client, tunjuk mesej |
| Delete gagal (network) | Fail silently — gambar jadi orphan tapi tidak block user |
| File terlalu besar (>5MB selepas compress) | Return 400 dengan mesej |
| Format tidak disokong | Return 400 dengan mesej |

Delete yang gagal dianggap acceptable — worst case satu orphaned file yang kecil, tidak material pada 10GB free tier.

## Skop TIDAK termasuk

- Migration gambar sedia ada dari Supabase ke R2 (tiada orders live lagi)
- Scheduled cleanup job untuk orphaned files
- Image CDN caching headers (boleh tambah kemudian via R2 transform rules)
