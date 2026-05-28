# Admin Generate & Preview — One-Click Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin boleh jana copy AI, edit semua fields, dan preview live dalam satu panel admin dashboard — tanpa buka web builder.

**Architecture:** `slug.1page.my` adalah page dinamik Next.js yang baca terus dari Supabase `orders` table. Bila admin kemaskini data dalam DB, iframe preview berubah serta-merta. Status baru `draft` membolehkan admin preview page sebelum client nampak — dengan Coming Soon guard yang semak admin session cookie server-side.

**Tech Stack:** Next.js App Router (server components + client), Supabase (service_role), Anthropic SDK via `lib/claude.ts`, Cloudflare R2 via `lib/r2.ts`, admin session cookie (`lib/admin-session.ts`)

---

## File Map

| Fail | Jenis | Task |
|------|-------|------|
| `lib/admin-session.ts` | UBAH | 1 |
| `middleware.ts` | UBAH | 2 |
| `components/admin/ComingSoonPage.tsx` | BARU | 3 |
| `app/bisnes/[subdomain]/page.tsx` | UBAH | 4 |
| `app/api/admin/orders/[id]/generate-copy/route.ts` | BARU | 5 |
| `app/api/admin/orders/[id]/route.ts` | UBAH | 6 |
| `app/admin/(dashboard)/orders/[id]/page.tsx` | UBAH (rewrite) | 7 |

---

## Task 1: Fix admin session cookie — tambah subdomain scope

**Masalah:** Cookie `__admin_session` di-set pada `1page.my` sahaja. Bila iframe load `slug.1page.my`, browser tidak hantar cookie (domain mismatch). Tanpa fix ini, Coming Soon guard tidak boleh detect admin dalam iframe.

**Fix:** Tambah `domain: '.1page.my'` dalam production supaya cookie valid untuk semua subdomain.

**Files:**
- Modify: `lib/admin-session.ts`

- [ ] **Step 1: Update createAdminSessionCookie**

Ganti fungsi `createAdminSessionCookie` dalam `lib/admin-session.ts`:

```typescript
export async function createAdminSessionCookie(res: NextResponse): Promise<void> {
  const payload = JSON.stringify({ loggedIn: true, exp: Date.now() + MAX_AGE * 1000 })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = await sign(encoded)
  const value = `${encoded}.${sig}`
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.1page.my' : undefined,
  })
}
```

Juga update `clearAdminSessionCookie`:

```typescript
export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.1page.my' : undefined,
  })
}
```

- [ ] **Step 2: Test manual**

Login ke `/admin`. Buka DevTools → Application → Cookies. Sahkan:
- Cookie `__admin_session` ada pada domain `.1page.my` (bukan `1page.my`)
- Cookie masih berfungsi — `/admin/orders` masih accessible

- [ ] **Step 3: Commit**

```bash
git add lib/admin-session.ts
git commit -m "fix: scope admin session cookie to .1page.my for subdomain iframe support"
```

---

## Task 2: Middleware — tambah `draft` dalam bisnes routing

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Update Supabase fetch dalam middleware**

Dalam `middleware.ts`, cari baris yang ada `status=in.(preview_ready,paid,live)` dan tukar:

```typescript
// SEBELUM:
const res = await fetch(
  `${supabaseUrl}/rest/v1/orders?slug=eq.${subdomain}&status=in.(preview_ready,paid,live)&select=id&limit=1`,

// SELEPAS:
const res = await fetch(
  `${supabaseUrl}/rest/v1/orders?slug=eq.${subdomain}&status=in.(draft,preview_ready,paid,live)&select=id&limit=1`,
```

- [ ] **Step 2: Test manual**

Dalam Supabase dashboard, set satu order status ke `draft` dengan slug yang ada. Buka `slug.1page.my` dalam browser. Sahkan ia route ke `/bisnes/[slug]` (bukan `/candidate/[slug]`).

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "fix: include draft status in bisnes subdomain routing"
```

---

## Task 3: ComingSoonPage component

**Files:**
- Create: `components/admin/ComingSoonPage.tsx`

- [ ] **Step 1: Buat direktori dan fail**

```bash
mkdir -p /home/astro/claude-project/1page/1page-my/components/admin
```

- [ ] **Step 2: Tulis component**

Buat `components/admin/ComingSoonPage.tsx`:

```typescript
export default function ComingSoonPage({ bisnesName }: { bisnesName: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8F6F1',
      fontFamily: 'DM Sans, sans-serif',
      padding: '24px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F97316', marginBottom: 16 }}>
        1page.my
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C1917', marginBottom: 12, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.2 }}>
        {bisnesName}
      </h1>
      <p style={{ fontSize: 16, color: '#78716C', maxWidth: 340 }}>
        Halaman ini akan datang tidak lama lagi.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/ComingSoonPage.tsx
git commit -m "feat: add ComingSoonPage component for draft/preview_ready guard"
```

---

## Task 4: Coming Soon guard dalam bisnes page

**Files:**
- Modify: `app/bisnes/[subdomain]/page.tsx`

- [ ] **Step 1: Update status filter dan tambah guard**

Ganti keseluruhan `app/bisnes/[subdomain]/page.tsx`:

```typescript
import { supabaseServer } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-session'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { BisnesOrder } from './types'
import BoldMinimal from './templates/bold-minimal'
import WarmHeritage from './templates/warm-heritage'
import CoolProfessional from './templates/cool-professional'
import FreshEditorial from './templates/fresh-editorial'
import DarkMode from './templates/dark-mode'
import ComingSoonPage from '@/components/admin/ComingSoonPage'

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

const NON_PUBLIC_STATUSES = ['draft', 'preview_ready', 'paid']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params
  const { data } = await supabaseServer()
    .from('orders')
    .select('nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, banner_atas_url, status')
    .eq('slug', subdomain)
    .in('status', ['draft', 'preview_ready', 'paid', 'live'])
    .maybeSingle()

  if (!data) return { title: '1page.my' }

  if (NON_PUBLIC_STATUSES.includes(data.status as string)) {
    return { title: `${data.nama_bisnes} — Akan Datang` }
  }

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
    .in('status', ['draft', 'preview_ready', 'paid', 'live'])
    .single()

  if (!data) return notFound()

  const order = data as BisnesOrder

  if (NON_PUBLIC_STATUSES.includes(order.status)) {
    const session = await getAdminSession()
    if (!session) return <ComingSoonPage bisnesName={order.nama_bisnes} />
  }

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

- [ ] **Step 2: Test manual — Coming Soon guard**

1. Set satu order status ke `draft` dalam Supabase (pastikan slug set)
2. Buka `slug.1page.my` dalam tab incognito (bukan admin) → mesti nampak "Halaman ini akan datang tidak lama lagi"
3. Login ke `/admin`, kemudian buka `slug.1page.my` → mesti nampak template bisnes sebenar

- [ ] **Step 3: Commit**

```bash
git add "app/bisnes/[subdomain]/page.tsx"
git commit -m "feat: add Coming Soon guard for draft/preview_ready bisnes pages"
```

---

## Task 5: API — generate-copy endpoint

**Files:**
- Create: `app/api/admin/orders/[id]/generate-copy/route.ts`

- [ ] **Step 1: Buat direktori**

```bash
mkdir -p "/home/astro/claude-project/1page/1page-my/app/api/admin/orders/[id]/generate-copy"
```

- [ ] **Step 2: Tulis route**

Buat `app/api/admin/orders/[id]/generate-copy/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'
import { generateCopy } from '@/lib/claude'
import type { CopyBrief } from '@/lib/claude'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = supabaseServer()

  const { data: order, error: fetchErr } = await sb
    .from('orders')
    .select('nama_bisnes, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan, tagline, alamat, slug, status')
    .eq('id', id)
    .single()

  if (fetchErr || !order) {
    return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })
  }

  if (!order.slug) {
    return NextResponse.json({ error: 'Set slug dulu sebelum jana copy' }, { status: 400 })
  }

  // Set status → draft so iframe preview becomes accessible
  await sb.from('orders').update({ status: 'draft' }).eq('id', id)

  const brief: CopyBrief = {
    business_name: order.nama_bisnes ?? '',
    industry: order.jenis_bisnes ?? '',
    products: order.produk_servis ?? '',
    target_audience: order.target_pelanggan ?? '',
    location: order.alamat ?? '',
    usp: order.cerita_bisnes ?? order.tagline ?? '',
    tone: 'Profesional',
    language: 'BM',
  }

  let copy
  try {
    copy = await generateCopy(brief, 'claude')
  } catch (err) {
    console.error('[generate-copy] Claude error:', err)
    return NextResponse.json({ error: 'AI gagal jana copy. Cuba lagi.' }, { status: 502 })
  }

  const { error: updateErr } = await sb.from('orders').update({
    tagline: copy.tagline,
    cerita_bisnes: copy.about_paragraph_1 + (copy.about_paragraph_2 ? '\n\n' + copy.about_paragraph_2 : ''),
    produk_servis: copy.products_title + '\n' + copy.products_subtitle,
  }).eq('id', id)

  if (updateErr) {
    console.error('[generate-copy] update error:', updateErr)
    return NextResponse.json({ error: 'Gagal simpan copy' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    copy: {
      tagline: copy.tagline,
      cerita_bisnes: copy.about_paragraph_1 + (copy.about_paragraph_2 ? '\n\n' + copy.about_paragraph_2 : ''),
      produk_servis: copy.products_title + '\n' + copy.products_subtitle,
    },
  })
}
```

- [ ] **Step 3: Test manual via curl**

```bash
# Login dulu, ambil cookie value dari DevTools
curl -X POST https://1page.my/api/admin/orders/ORDER_ID_SINI/generate-copy \
  -H "Cookie: __admin_session=VALUE_DARI_DEVTOOLS" \
  -v
```

Jangkaan: `{"ok":true,"copy":{"tagline":"...","cerita_bisnes":"...","produk_servis":"..."}}`

- [ ] **Step 4: Commit**

```bash
git add "app/api/admin/orders/[id]/generate-copy/route.ts"
git commit -m "feat: add POST /api/admin/orders/[id]/generate-copy — AI copy generation"
```

---

## Task 6: Update PATCH route — draft status transitions

**Files:**
- Modify: `app/api/admin/orders/[id]/route.ts`

- [ ] **Step 1: Tambah `template_pilihan` dalam EDITABLE fields**

Dalam `app/api/admin/orders/[id]/route.ts`, cari baris `const EDITABLE = [` dan kemaskini:

```typescript
// SEBELUM:
const EDITABLE = ['nama_bisnes', 'tagline', 'cerita_bisnes', 'produk_servis',
  'target_pelanggan', 'waktu_operasi', 'alamat', 'google_maps_link',
  'instagram', 'facebook', 'tiktok'] as const

// SELEPAS:
const EDITABLE = ['nama_bisnes', 'tagline', 'cerita_bisnes', 'produk_servis',
  'target_pelanggan', 'waktu_operasi', 'alamat', 'google_maps_link',
  'instagram', 'facebook', 'tiktok', 'template_pilihan',
  'banner_atas_url', 'logo_url'] as const
```

- [ ] **Step 2: Tambah set-draft-on-save logic dalam `edit_fields`**

Dalam action `edit_fields`, selepas `const updates: Record<string, string | null> = {}`, tambah:

```typescript
// Auto-promote pending → draft bila admin mula edit
const { data: currentOrder } = await sb
  .from('orders')
  .select('status')
  .eq('id', id)
  .single()

if (currentOrder?.status === 'pending') {
  updates.status = 'draft'
}
```

- [ ] **Step 3: Update `set_preview` — accept dari `draft` sahaja**

Dalam action `set_preview`, selepas validasi slug, tambah status check:

```typescript
// Validate status — mesti draft sebelum boleh set preview
const { data: statusCheck } = await sb
  .from('orders')
  .select('status')
  .eq('id', id)
  .single()

if (!statusCheck || !['draft', 'preview_ready'].includes(statusCheck.status)) {
  return NextResponse.json(
    { error: 'Jana copy dulu (status mesti draft) sebelum set preview.' },
    { status: 400 }
  )
}
```

- [ ] **Step 4: Update STATUS_LABEL dan STATUS_COLOR dalam admin page**

Ini akan dilakukan dalam Task 7. Note untuk Task 7: tambah `draft` dalam kedua-dua maps.

- [ ] **Step 5: Test manual**

1. Order dengan status `pending` → PATCH `edit_fields` dengan `nama_bisnes` → semak DB, status mesti tukar ke `draft`
2. Order dengan status `pending` → PATCH `set_preview` → mesti return 400 dengan mesej "Jana copy dulu"
3. Order dengan status `draft` → PATCH `set_preview` → mesti berjaya

- [ ] **Step 6: Commit**

```bash
git add "app/api/admin/orders/[id]/route.ts"
git commit -m "feat: add draft status transitions — edit promotes pending→draft, set_preview requires draft"
```

---

## Task 7: Admin order detail page — rewrite jadi 2-panel layout

Ini adalah rewrite penuh `app/admin/(dashboard)/orders/[id]/page.tsx`. Fail asal (~678 baris) diganti dengan komponen baru yang ada 2-panel layout.

**Files:**
- Modify: `app/admin/(dashboard)/orders/[id]/page.tsx`

- [ ] **Step 1: Tulis Order type baru dengan semua fields**

Ganti bahagian `type Order` di bahagian atas fail dengan:

```typescript
type Order = {
  id: string
  created_at: string
  nama_bisnes: string
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
  tagline: string | null
  jenis_bisnes: string | null
  cerita_bisnes: string | null
  produk_servis: string
  target_pelanggan: string | null
  banner_atas_url: string
  logo_url: string | null
  gallery_urls: string[] | null
  template_pilihan: string
  domain_sendiri: boolean
  domain_url: string | null
  domain_pref_1: string | null
  domain_pref_2: string | null
  domain_pref_3: string | null
  catatan: string | null
  status: string
  slug: string | null
  preview_url: string | null
  live_url: string | null
  toyyibpay_bill_code: string | null
  toyyibpay_amount: number | null
}
```

- [ ] **Step 2: Tambah STATUS maps dengan `draft`**

```typescript
const STATUS_LABEL: Record<string, string> = {
  pending:       'Pending',
  draft:         'Draft',
  preview_ready: 'Preview Sedia',
  approved:      'Diluluskan',
  paid:          'Paid',
  live:          'Live',
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:       { bg: '#F5F5F4', color: '#44403C' },
  draft:         { bg: '#FEF3C7', color: '#92400E' },
  preview_ready: { bg: '#DBEAFE', color: '#1E40AF' },
  approved:      { bg: '#D1FAE5', color: '#065F46' },
  paid:          { bg: '#EDE9FE', color: '#5B21B6' },
  live:          { bg: '#D1FAE5', color: '#065F46' },
}

const TEMPLATES = [
  { id: 'bold_minimal',      name: 'Bold Minimal',      accent: '#C8A96E', bg: '#0a0a0a' },
  { id: 'warm_heritage',     name: 'Warm Heritage',      accent: '#8B5E3C', bg: '#fdf6ee' },
  { id: 'cool_professional', name: 'Cool Professional',  accent: '#3B82F6', bg: '#0f172a' },
  { id: 'fresh_editorial',   name: 'Fresh Editorial',    accent: '#16A34A', bg: '#f9fafb' },
  { id: 'dark_mode',         name: 'Dark Mode',          accent: '#E8A020', bg: '#0d0d0d' },
] as const
```

- [ ] **Step 3: Tulis state declarations**

```typescript
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder]           = useState<Order | null>(null)
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [slug, setSlug]             = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  // Generate copy
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  // Edit fields
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const [saveSubmitting, setSaveSubmitting] = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Image upload
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [uploadError, setUploadError]     = useState('')

  // WA copy
  const [copied, setCopied] = useState(false)

  // Preview iframe
  const [iframeKey, setIframeKey] = useState(0)

  // Confirm cancel
  const [confirmCancel, setConfirmCancel] = useState(false)
```

- [ ] **Step 4: Tulis fetchOrder, handleGenerate, handleSaveFields, handleUploadImage, handleSetPreview, handleMarkLive, handleCancel**

```typescript
  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      const d = await res.json()
      if (d.order) {
        const o = d.order as Order
        setOrder(o)
        setSlug(o.slug ?? (o.domain_pref_1 ?? '').toLowerCase().replace(/[^a-z0-9-]/g, ''))
        setEditFields({
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
          template_pilihan: o.template_pilihan ?? 'bold_minimal',
        })
      } else {
        setFetchError('Order tidak dijumpai')
      }
    } catch {
      setFetchError('Gagal memuatkan order. Cuba refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    if (!slug) { setGenerateError('Set slug dulu sebelum jana copy.'); return }
    setGenerating(true)
    setGenerateError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}/generate-copy`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setGenerateError(data.error || 'Gagal jana copy'); return }
      setEditFields(prev => ({ ...prev, ...data.copy }))
      setIframeKey(k => k + 1)
      await fetchOrder()
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveFields() {
    setSaveSubmitting(true)
    setSaveError('')
    setSaveSuccess(false)
    const payload: Record<string, string | null> = { action: 'edit_fields' }
    for (const [k, v] of Object.entries(editFields)) {
      payload[k] = v.trim() === '' ? null : v.trim()
    }
    // Sync slug jika berubah
    payload.slug = slug || null
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error || 'Gagal simpan'); return }
      setSaveSuccess(true)
      setIframeKey(k => k + 1)
      await fetchOrder()
    } finally {
      setSaveSubmitting(false)
    }
  }

  async function handleUploadImage(slot: 'banner_atas_url' | 'logo_url', file: File) {
    setUploadingSlot(slot)
    setUploadError('')
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'orders')
    try {
      // Delete old image from R2 if exists
      const oldUrl = slot === 'banner_atas_url' ? order?.banner_atas_url : order?.logo_url
      if (oldUrl) {
        await fetch('/api/upload', { method: 'DELETE', body: JSON.stringify({ url: oldUrl }), headers: { 'Content-Type': 'application/json' } })
      }
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error || 'Upload gagal'); return }
      // Save new URL to DB
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_fields', [slot]: data.url }),
      })
      setIframeKey(k => k + 1)
      await fetchOrder()
    } finally {
      setUploadingSlot(null)
    }
  }

  async function handleSetPreview() {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_preview', slug }),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error || 'Gagal'); return }
      await fetchOrder()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkLive() {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_live' }),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error || 'Gagal'); return }
      await fetchOrder()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); setActionError(d.error || 'Gagal padam'); return }
      router.push('/admin/orders')
    } finally {
      setSubmitting(false)
      setConfirmCancel(false)
    }
  }

  function copyWaText() {
    if (!order?.preview_url || !order?.toyyibpay_bill_code) return
    const text = `Salam dari 1page.my\nPreview page anda dah siap!\nBoleh tengok preview di sini:\n${order.preview_url}\n\nJika setuju, sila buat bayaran RM150 di pautan ini untuk aktifkan page anda:\nhttps://toyyibpay.com/${order.toyyibpay_bill_code}\n\nAda soalan? Balas WhatsApp ini ya 😊`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
```

- [ ] **Step 5: Tulis JSX — render guards + 2-panel layout**

```typescript
  if (loading) return <div style={{ padding: 32, color: '#78716C', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Memuatkan...</div>
  if (fetchError || !order) return <div style={{ padding: 32, color: '#dc2626', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{fetchError || 'Order tidak dijumpai'}</div>

  const statusStyle = STATUS_COLOR[order.status] ?? { bg: '#F5F5F4', color: '#78716C' }
  const isEditable = !['live'].includes(order.status)
  const showIframe = !!order.slug && ['draft', 'preview_ready', 'paid', 'live'].includes(order.status)
  const showGenerateButton = ['pending', 'draft'].includes(order.status)

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '0 4px' }}>
        <button onClick={() => router.push('/admin/orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', fontSize: 22, padding: '4px 8px', lineHeight: 1, borderRadius: 6 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.nama_bisnes}
          </h1>
          <p style={{ fontSize: 12, color: '#78716C', margin: '2px 0 0' }}>{order.nama_owner} · {order.whatsapp}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* 2-panel grid */}
      <div style={{ display: 'grid', gridTemplateColumns: showIframe ? '1fr 1fr' : '640px', gap: 20, alignItems: 'start' }}>

        {/* ── Panel Kiri ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Slug & Template */}
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Slug & Template</p>

            {/* Slug */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Subdomain</label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  disabled={!isEditable}
                  placeholder="namakedai"
                  style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: '1px solid #d6d3d1', borderRadius: '8px 0 0 8px', borderRight: 'none', outline: 'none', fontFamily: 'monospace', background: isEditable ? '#fff' : '#f5f5f4' }}
                />
                <span style={{ padding: '0 12px', background: '#f5f5f4', border: '1px solid #d6d3d1', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', fontSize: 13, color: '#78716C' }}>.1page.my</span>
              </div>
            </div>

            {/* Template picker */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 8 }}>Template</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => isEditable && setEditFields(prev => ({ ...prev, template_pilihan: t.id }))}
                    disabled={!isEditable}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, textAlign: 'left', cursor: isEditable ? 'pointer' : 'default',
                      border: `2px solid ${editFields.template_pilihan === t.id ? t.accent : '#e7e5e4'}`,
                      background: editFields.template_pilihan === t.id ? t.bg + '14' : '#fff',
                      transition: 'border-color 0.1s',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: t.bg, border: `2px solid ${t.accent}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: editFields.template_pilihan === t.id ? 700 : 500, color: '#1C1917' }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jana dengan AI */}
          {showGenerateButton && (
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 10 }}>Jana Copy AI</p>
              {generateError && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>⚠ {generateError}</p>}
              <button
                onClick={handleGenerate}
                disabled={generating || !slug}
                style={{
                  width: '100%', padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: generating || !slug ? 'not-allowed' : 'pointer',
                  background: generating || !slug ? '#d6d3d1' : '#1C1917', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {generating ? (
                  <>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Menjana copy...
                  </>
                ) : order.status === 'draft' ? '↺ Jana Semula dengan AI' : '✦ Jana dengan AI'}
              </button>
              {!slug && <p style={{ fontSize: 11, color: '#78716C', marginTop: 8, textAlign: 'center' }}>Set slug dulu sebelum jana copy.</p>}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Edit Copy & Fields */}
          {isEditable && (
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Edit Copy & Maklumat</p>

              {[
                { key: 'tagline',          label: 'Tagline',           type: 'input' },
                { key: 'cerita_bisnes',    label: 'Cerita Bisnes',     type: 'textarea' },
                { key: 'produk_servis',    label: 'Produk & Servis',   type: 'textarea' },
                { key: 'target_pelanggan', label: 'Target Pelanggan',  type: 'input' },
                { key: 'waktu_operasi',    label: 'Waktu Operasi',     type: 'input' },
                { key: 'alamat',           label: 'Alamat',            type: 'textarea' },
                { key: 'google_maps_link', label: 'Google Maps Link',  type: 'input' },
                { key: 'instagram',        label: 'Instagram',         type: 'input' },
                { key: 'facebook',         label: 'Facebook',          type: 'input' },
                { key: 'tiktok',           label: 'TikTok',            type: 'input' },
              ].map(({ key, label, type }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={editFields[key] ?? ''}
                      onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box' as const }}
                    />
                  ) : (
                    <input
                      value={editFields[key] ?? ''}
                      onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}
                    />
                  )}
                </div>
              ))}

              {saveError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {saveError}</p>}
              {saveSuccess && <p style={{ color: '#065F46', fontSize: 12, marginBottom: 10 }}>✓ Disimpan. Iframe akan refresh.</p>}

              <button
                onClick={handleSaveFields}
                disabled={saveSubmitting}
                style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 600, background: saveSubmitting ? '#d6d3d1' : '#1C1917', color: '#fff', border: 'none', borderRadius: 8, cursor: saveSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {saveSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          )}

          {/* Gambar */}
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Gambar</p>
            {uploadError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {uploadError}</p>}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* Banner */}
              <div>
                <p style={{ fontSize: 11, color: '#78716C', marginBottom: 6 }}>Banner</p>
                {order.banner_atas_url && <img src={order.banner_atas_url} alt="Banner" style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4', display: 'block', marginBottom: 6 }} />}
                {isEditable && (
                  <label style={{ fontSize: 12, color: '#2563EB', cursor: 'pointer', display: 'block' }}>
                    {uploadingSlot === 'banner_atas_url' ? 'Uploading...' : '↑ Ganti'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUploadImage('banner_atas_url', e.target.files[0])} />
                  </label>
                )}
              </div>

              {/* Logo */}
              <div>
                <p style={{ fontSize: 11, color: '#78716C', marginBottom: 6 }}>Logo</p>
                {order.logo_url && <img src={order.logo_url} alt="Logo" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4', display: 'block', marginBottom: 6 }} />}
                {isEditable && (
                  <label style={{ fontSize: 12, color: '#2563EB', cursor: 'pointer', display: 'block' }}>
                    {uploadingSlot === 'logo_url' ? 'Uploading...' : '↑ Ganti'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUploadImage('logo_url', e.target.files[0])} />
                  </label>
                )}
              </div>

              {/* Gallery */}
              {order.gallery_urls?.map((url, i) => (
                <div key={i}>
                  <p style={{ fontSize: 11, color: '#78716C', marginBottom: 6 }}>Gallery {i + 1}</p>
                  <img src={url} alt={`Gallery ${i + 1}`} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Tindakan</p>
            {actionError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {actionError}</p>}

            {/* draft: Set Preview & Jana Bill */}
            {order.status === 'draft' && (
              <button onClick={handleSetPreview} disabled={submitting || !slug} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, background: submitting || !slug ? '#d6d3d1' : '#1C1917', color: '#fff', border: 'none', borderRadius: 10, cursor: submitting || !slug ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
                {submitting ? 'Memproses...' : '📋 Set Preview & Jana Bill'}
              </button>
            )}

            {/* preview_ready: WA text + Mark Live */}
            {order.status === 'preview_ready' && order.preview_url && order.toyyibpay_bill_code && (
              <>
                <a href={order.preview_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#2563EB', marginBottom: 12, wordBreak: 'break-all' }}>
                  🔗 {order.preview_url}
                </a>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button onClick={copyWaText} style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 600, background: copied ? '#065F46' : '#1C1917', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    {copied ? '✓ Disalin!' : '📋 Copy Teks WA'}
                  </button>
                  <a href={`https://wa.me/${order.whatsapp.replace(/^0/, '60')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 600, background: '#16a34a', color: '#fff', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    💬 Buka WA
                  </a>
                </div>
                <button onClick={handleMarkLive} disabled={submitting} style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 600, background: submitting ? '#d6d3d1' : '#F97316', color: '#fff', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Memproses...' : '🚀 Mark as Live (Manual)'}
                </button>
              </>
            )}

            {/* paid: Mark Live */}
            {order.status === 'paid' && (
              <button onClick={handleMarkLive} disabled={submitting || !order.slug} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, background: submitting || !order.slug ? '#d6d3d1' : '#F97316', color: '#fff', border: 'none', borderRadius: 10, cursor: submitting || !order.slug ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Memproses...' : '🚀 Mark as Live'}
              </button>
            )}

            {/* live */}
            {order.status === 'live' && order.live_url && (
              <p style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>
                ✅ Live: <a href={order.live_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 400 }}>{order.live_url}</a>
              </p>
            )}

            {/* Cancel */}
            {['pending', 'draft', 'preview_ready', 'paid'].includes(order.status) && (
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                {!confirmCancel ? (
                  <button onClick={() => setConfirmCancel(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', textDecoration: 'underline' }}>
                    Batalkan & Padam Order
                  </button>
                ) : (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 13, color: '#991B1B', marginBottom: 12, fontWeight: 600 }}>Padam order ini? Tidak boleh dipulihkan.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmCancel(false)} style={{ flex: 1, padding: 10, fontSize: 13, background: '#fff', color: '#44403C', border: '1px solid #d6d3d1', borderRadius: 8, cursor: 'pointer' }}>Batal</button>
                      <button onClick={handleCancel} disabled={submitting} style={{ flex: 1, padding: 10, fontSize: 13, fontWeight: 600, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Ya, Padam</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail Order (collapsible) */}
          <DetailSection order={order} />
        </div>

        {/* ── Panel Kanan: Live Preview ── */}
        {showIframe && (
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', margin: 0 }}>
                  Live Preview — {order.slug}.1page.my
                </p>
                <button onClick={() => setIframeKey(k => k + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#78716C', padding: '4px 8px' }} title="Refresh">↺</button>
              </div>
              <iframe
                key={iframeKey}
                src={`https://${order.slug}.1page.my`}
                style={{ width: '100%', height: 'calc(100vh - 160px)', border: 'none', minHeight: 500 }}
                title="Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Tambah `DetailSection` component (collapsible order details)**

Tambah di bawah `OrderDetailPage`, sebelum `export default`:

```typescript
function DetailSection({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  const rows: [string, string | null | undefined][] = [
    ['Nama Owner', order.nama_owner], ['WhatsApp', order.whatsapp], ['Telefon', order.telefon], ['Email', order.email],
    ['Jenis Bisnes', order.jenis_bisnes], ['Catatan', order.catatan],
    ['Domain Pilihan 1', order.domain_pref_1], ['Domain Pilihan 2', order.domain_pref_2], ['Domain Pilihan 3', order.domain_pref_3],
    ['Domain Sendiri', order.domain_sendiri ? 'Ya' : null], ['Domain URL', order.domain_url],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#44403C', fontFamily: 'DM Sans, sans-serif' }}>
        <span>Detail Order</span>
        <span style={{ fontSize: 20, lineHeight: 1, color: '#78716C' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f5f5f4' }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#a8a29e', display: 'block' }}>{label}</span>
              <span style={{ fontSize: 13, color: '#1C1917', wordBreak: 'break-word' }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

Pastikan `import { useState, useEffect } from 'react'` ada di bahagian atas fail.

- [ ] **Step 7: Test manual — full flow**

1. Buka order baru (status `pending`) di `/admin/orders/[id]`
2. Set slug → nampak template picker dan "Jana dengan AI" button
3. Klik "Jana dengan AI" → loading spinner → copy fields auto-populate → iframe muncul
4. Edit field tagline → Simpan Perubahan → iframe refresh → nampak perubahan
5. Tukar template → Simpan Perubahan → iframe refresh → template berubah
6. Upload banner baru → iframe refresh → gambar berubah
7. Klik "Set Preview & Jana Bill" → status jadi `preview_ready` → WA text muncul
8. Buka tab incognito → `slug.1page.my` → nampak Coming Soon
9. Klik "Mark as Live" → status `live` → tab incognito reload → nampak page sebenar

- [ ] **Step 8: Commit**

```bash
git add "app/admin/(dashboard)/orders/[id]/page.tsx"
git commit -m "feat: rewrite admin order detail — 2-panel layout with AI generate, live preview, inline edit"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Task 1 (cookie fix), Task 2 (middleware draft), Task 3 (ComingSoon component), Task 4 (guard bisnes page), Task 5 (generate-copy API), Task 6 (draft transitions), Task 7 (2-panel UI) — semua requirement dalam spec ada task
- [x] **Placeholder scan:** Tiada TBD/TODO. Semua code blocks lengkap
- [x] **Type consistency:** `Order` type dalam Task 7 Step 1 konsisten dengan fields yang diakses. `CopyBrief` dan `generateCopy` dalam Task 5 match `lib/claude.ts` signature. `EDITABLE` dalam Task 6 match `handleSaveFields` dalam Task 7
- [x] **Upload route:** `/api/upload` (Task 7 `handleUploadImage`) — fail wujud di `app/api/(platform)/upload/route.ts`. Route dalam production accessible sebagai `/api/upload` ✓
- [x] **Cookie domain:** `createAdminSessionCookie` dalam Task 1 — dependency Task 4 (guard) berfungsi betul ✓
