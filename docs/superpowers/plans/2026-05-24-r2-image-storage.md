# R2 Image Storage Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gantikan Supabase Storage dengan Cloudflare R2 sebagai permanent image storage, dan tambah delete-on-replace supaya gambar lama dipadam bila client tukar gambar.

**Architecture:** Upload API menggunakan `@aws-sdk/client-s3` (S3-compatible) untuk PUT dan DELETE ke R2. `lib/r2.ts` mengeksport dua fungsi — `uploadToR2` dan `deleteFromR2`. Upload route swap dari Supabase ke R2 dan tambah DELETE handler. Form components panggil DELETE secara fire-and-forget sebelum replace/remove gambar.

**Tech Stack:** Next.js 16 App Router, TypeScript, `@aws-sdk/client-s3`, Cloudflare R2

---

## File Map

| Fail | Tindakan |
|------|---------|
| `lib/r2.ts` | CREATE — R2 client, `uploadToR2`, `deleteFromR2` |
| `app/api/upload/route.ts` | MODIFY — swap Supabase → R2, tambah DELETE handler |
| `app/order/page.tsx` | MODIFY — `ImageUploadField` dan `GalleryUploadField` fire delete |
| `.env.local` | MODIFY — tambah 4 R2 env vars |
| `package.json` | MODIFY — tambah `@aws-sdk/client-s3` |

---

## Cloudflare R2 Setup (buat dulu sebelum mula code)

Lakukan langkah ini dalam Cloudflare dashboard sebelum mula Task 1:

1. Cloudflare dashboard → **R2 Object Storage** → **Create bucket**
   - Bucket name: `order-images`
2. Bucket yang baru dibuat → **Settings** → **Public access** → **Allow Access**
   - Salin **Public Bucket URL** (contoh: `https://pub-abc123.r2.dev`)
3. Dashboard utama → **R2** → **Manage R2 API Tokens** → **Create API Token**
   - Permissions: **Object Read & Write**
   - Scope: **Specific bucket** → `order-images`
   - Salin **Access Key ID** dan **Secret Access Key**
4. Dashboard → kanan atas → **Account ID** — salin nilai ini

---

## Task 1: Install package dan tambah env vars

**Files:**
- Modify: `package.json`
- Modify: `.env.local`

- [ ] **Step 1: Install `@aws-sdk/client-s3`**

```bash
cd /home/astro/claude-project/1page/1page-my
npm install @aws-sdk/client-s3
```

Expected: package ditambah dalam `node_modules` dan `package.json` dependencies.

- [ ] **Step 2: Tambah R2 env vars ke `.env.local`**

Buka `.env.local` dan tambah 4 baris ini di bawah vars Supabase yang sedia ada (isi nilai sebenar dari Cloudflare dashboard):

```
R2_ACCOUNT_ID=isi_account_id_anda
R2_ACCESS_KEY_ID=isi_access_key_id_anda
R2_SECRET_ACCESS_KEY=isi_secret_access_key_anda
R2_BUCKET_NAME=order-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

`NEXT_PUBLIC_R2_PUBLIC_URL` adalah Public Bucket URL dari step 2 setup di atas (tanpa trailing slash).

- [ ] **Step 3: Verify TypeScript masih clean**

```bash
npx tsc --noEmit
```

Expected: tiada output (tiada error).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @aws-sdk/client-s3 for R2 storage"
```

---

## Task 2: Buat `lib/r2.ts`

**Files:**
- Create: `lib/r2.ts`

- [ ] **Step 1: Buat fail `lib/r2.ts`**

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '')

export async function uploadToR2(
  key: string,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<string> {
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
  }))
  return `${PUBLIC_BASE}/${key}`
}

export async function deleteFromR2(url: string): Promise<void> {
  try {
    if (!PUBLIC_BASE || !url.startsWith(PUBLIC_BASE)) return
    const key = url.slice(PUBLIC_BASE.length + 1) // strip base + leading slash
    if (!key) return
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch {
    // fail silently — orphaned file acceptable, must not block UI
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: tiada output.

- [ ] **Step 3: Commit**

```bash
git add lib/r2.ts
git commit -m "feat: add R2 client with uploadToR2 and deleteFromR2"
```

---

## Task 3: Update `app/api/upload/route.ts`

**Files:**
- Modify: `app/api/upload/route.ts`

- [ ] **Step 1: Gantikan kandungan penuh `app/api/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'misc'

  if (!file) return NextResponse.json({ error: 'Tiada fail dipilih.' }, { status: 400 })
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'Saiz fail terlalu besar (maks 5MB). Kompres gambar dahulu jika perlu.' },
      { status: 400 },
    )
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json(
      { error: 'Format tidak disokong. Guna JPG, PNG, atau WEBP.' },
      { status: 400 },
    )
  }

  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = await file.arrayBuffer()

  try {
    const url = await uploadToR2(key, buffer, file.type)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[upload] R2 error:', err)
    return NextResponse.json({ error: 'Upload gagal. Cuba lagi.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  let body: { url?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }
  if (body.url) await deleteFromR2(body.url)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: tiada output.

- [ ] **Step 3: Commit**

```bash
git add app/api/upload/route.ts
git commit -m "feat: swap upload API from Supabase Storage to Cloudflare R2, add DELETE handler"
```

---

## Task 4: Update `ImageUploadField` — delete-on-replace

**Files:**
- Modify: `app/order/page.tsx`

- [ ] **Step 1: Cari butang "Tukar Gambar" dalam `ImageUploadField` dan tambah delete call**

Cari blok ini dalam `app/order/page.tsx`:

```tsx
          <button
            type="button"
            onClick={() => { onChange(''); if (inputRef.current) inputRef.current.value = '' }}
```

Gantikan dengan:

```tsx
          <button
            type="button"
            onClick={() => {
              const oldUrl = value
              onChange('')
              if (inputRef.current) inputRef.current.value = ''
              if (oldUrl) {
                fetch('/api/upload', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: oldUrl }),
                }).catch(() => {})
              }
            }}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: tiada output.

- [ ] **Step 3: Commit**

```bash
git add app/order/page.tsx
git commit -m "feat: delete old image from R2 when client replaces banner or logo"
```

---

## Task 5: Update `GalleryUploadField` — delete-on-remove

**Files:**
- Modify: `app/order/page.tsx`

- [ ] **Step 1: Cari fungsi `remove` dalam `GalleryUploadField` dan tambah delete call**

Cari blok ini dalam `app/order/page.tsx`:

```tsx
  function remove(idx: number) {
    onChange(urls.filter((_, i) => i !== idx).join('\n'))
  }
```

Gantikan dengan:

```tsx
  function remove(idx: number) {
    const urlToDelete = urls[idx]
    onChange(urls.filter((_, i) => i !== idx).join('\n'))
    if (urlToDelete) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToDelete }),
      }).catch(() => {})
    }
  }
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: tiada output.

- [ ] **Step 3: Commit**

```bash
git add app/order/page.tsx
git commit -m "feat: delete gallery image from R2 when client removes thumbnail"
```

---

## Task 6: Build verification dan manual test

**Files:** (tiada perubahan)

- [ ] **Step 1: Full build check**

```bash
npm run build
```

Expected: build berjaya, `/api/upload` route tersenarai sebagai dynamic route.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

- [ ] **Step 3: Test upload banner**

1. Buka `http://localhost:3000/order`
2. Pergi ke bahagian **E — Imej**
3. Klik kawasan banner → pilih gambar JPG dari komputer
4. Tunggu upload selesai — thumbnail gambar mesti muncul
5. Verify URL bermula dengan `NEXT_PUBLIC_R2_PUBLIC_URL` anda (bukan supabase.co)
6. Semak Cloudflare R2 dashboard → bucket `order-images` → folder `banner/` → fail mesti ada

- [ ] **Step 4: Test delete-on-replace**

1. Ambil URL gambar yang baru diupload dari network tab atau R2 dashboard
2. Klik **"Tukar Gambar"** pada banner
3. Pergi ke R2 dashboard → folder `banner/` → fail lama mesti **sudah tiada**
4. Upload gambar baru, verify thumbnail muncul semula

- [ ] **Step 5: Test gallery add dan remove**

1. Dalam bahagian gallery, klik "+" dan upload 2 gambar
2. Verify kedua-dua thumbnail muncul dan ada dalam R2 folder `gallery/`
3. Klik × pada satu thumbnail
4. Verify thumbnail hilang dari UI dan fail berkenaan dah delete dari R2

- [ ] **Step 6: Test form submit end-to-end**

1. Isi borang lengkap dengan gambar yang diupload ke R2
2. Submit form
3. Semak Supabase `orders` table — `banner_atas_url` mesti mengandungi R2 URL (bukan supabase.co URL)

- [ ] **Step 7: Commit final**

```bash
git add .
git commit -m "chore: R2 migration complete — all image uploads now use Cloudflare R2"
```

---

## Post-Migration Cleanup (selepas semua test pass)

- Boleh delete Supabase Storage bucket `order-images` dari Supabase dashboard — ia tidak lagi digunakan
- Tidak perlu remove `@supabase/supabase-js` — ia masih digunakan untuk database
