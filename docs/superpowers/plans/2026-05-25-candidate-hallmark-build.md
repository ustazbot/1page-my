# Candidate Page Hallmark Build — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade candidate page to Hallmark aesthetic (Playfair Display + DM Sans, blurred hero bg, full sections) and extend intake form with gallery, testimonials, kawasan image, and "mengapa bertanding" fields.

**Architecture:** `page.tsx` is a Server Component that fetches all data and passes typed props to 9 subcomponents in `components/`. A shared `types.ts` defines `CandidateBrief`. Inline styles only — no Tailwind in candidate components. Fonts loaded via `next/font/google` in a route `layout.tsx`.

**Tech Stack:** Next.js 16 App Router, Supabase (`supabaseServer()`), Cloudflare R2 (existing `/api/r2-upload`), `next/font/google`, CSS animations (keyframe + CSS Scroll-Driven)

---

## Codebase Notes

- Upload API: `POST /api/r2-upload` — accepts `file`, `subdomain`, `type` (free-form string). Max 10MB. Returns `{ publicUrl }`.
- Submit API: `POST /api/submit-brief` — accepts full JSON payload, inserts via `supabaseServer()`. Returns `{ id }`.
- Both APIs already handle the new field types without changes.
- Supabase client: use `supabaseServer()` from `@/lib/supabase` in Server Components.
- `warna_utama` default: `'#1e3a5f'` when null.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| Supabase SQL Editor | Manual | Add 5 new columns to `candidate_briefs` |
| `app/daftar-calon/page.tsx` | Modify | Add kawasan image, galeri, mengapa_bertanding, testimoni |
| `app/candidate/[subdomain]/layout.tsx` | Create | Load Playfair Display + DM Sans via next/font |
| `app/candidate/[subdomain]/types.ts` | Create | `CandidateBrief` interface |
| `app/candidate/[subdomain]/page.tsx` | Rewrite | Fetch data, compose components, global CSS animations, SEO metadata |
| `app/candidate/[subdomain]/components/HeroSection.tsx` | Create | Full-screen hero, blurred bg, stagger animation classes |
| `app/candidate/[subdomain]/components/QuoteBlock.tsx` | Create | Dark bg, prominent quote, amber accent |
| `app/candidate/[subdomain]/components/MengapaBertanding.tsx` | Create | Dark bg, naratif personal |
| `app/candidate/[subdomain]/components/KenaliCandidate.tsx` | Create | Profile bio + pencapaian list |
| `app/candidate/[subdomain]/components/FokusUtama.tsx` | Create | Numbered focus items with amber accent |
| `app/candidate/[subdomain]/components/GaleriGerakKerja.tsx` | Create | 1/2/3-image responsive gallery layout |
| `app/candidate/[subdomain]/components/TestimoniRakyat.tsx` | Create | Dark testimonial cards |
| `app/candidate/[subdomain]/components/IsuKawasan.tsx` | Create | Problem/solution card pairs |
| `app/candidate/[subdomain]/components/CtaFooter.tsx` | Create | Dark CTA with WhatsApp + socmed |

---

## Task 1: SQL Migration

**Files:**
- Manual: Supabase SQL Editor

- [ ] **Step 1: Run migration in Supabase SQL Editor**

Open Supabase Dashboard → SQL Editor → paste and run:

```sql
ALTER TABLE public.candidate_briefs
  ADD COLUMN IF NOT EXISTS kawasan_image_url  text,
  ADD COLUMN IF NOT EXISTS galeri_urls        jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS testimoni          jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS mengapa_bertanding text,
  ADD COLUMN IF NOT EXISTS ai_copy            jsonb DEFAULT '{}';
```

- [ ] **Step 2: Verify**

In Supabase Table Editor, open `candidate_briefs`. Confirm 5 new columns appear: `kawasan_image_url`, `galeri_urls`, `testimoni`, `mengapa_bertanding`, `ai_copy`.

---

## Task 2: Borang — New Fields

**Files:**
- Modify: `app/daftar-calon/page.tsx`

This task adds 4 new field groups to the existing form. The `uploadFile` function already accepts any `type` string — no changes needed to it. The submit payload already forwards all fields — just add new ones.

- [ ] **Step 1: Add new state variables**

After the existing `const [partiLogoFile, setPartiLogoFile] = useState<File | null>(null)` line, add:

```typescript
const [kawasanImageFile, setKawasanImageFile] = useState<File | null>(null)
const [galeriFiles, setGaleriFiles] = useState<File[]>([])
const [testimoni, setTestimoni] = useState<{ quote: string; nama: string; kawasan_asal: string }[]>([])
```

- [ ] **Step 2: Add `mengapa_bertanding` to form state**

In the `useState` block for `form`, add `mengapa_bertanding: ''` after `tiktok_url`:

```typescript
const [form, setForm] = useState({
  full_name: '',
  preferred_name: '',
  kawasan_jenis: 'DUN',
  kawasan: '',
  parti_name: '',
  tagline: '',
  profil_ringkas: '',
  quote_peribadi: '',
  mengapa_bertanding: '',
  whatsapp: '',
  facebook_url: '',
  instagram_url: '',
  tiktok_url: '',
  bahasa: 'BM',
  warna_utama: '#1e3a5f',
  subdomain: '',
})
```

- [ ] **Step 3: Add upload logic for kawasan image and galeri in `handleSubmit`**

After the existing `if (partiLogoFile) parti_logo_url = await uploadFile(partiLogoFile, 'parti-logo')` line, add:

```typescript
let kawasan_image_url: string | null = null
const galeri_urls: string[] = []

if (kawasanImageFile) kawasan_image_url = await uploadFile(kawasanImageFile, 'kawasan-image')
for (let i = 0; i < galeriFiles.length; i++) {
  galeri_urls.push(await uploadFile(galeriFiles[i], `galeri-${i}`))
}
```

- [ ] **Step 4: Add new fields to submit payload**

In the `payload` object inside `handleSubmit`, add the new fields:

```typescript
const payload = {
  ...form,
  photo_url,
  parti_logo_url,
  kawasan_image_url,
  galeri_urls,
  testimoni: testimoni.filter(t => t.quote.trim()),
  fokus: fokus_clean,
  isu_kawasan: isu_clean,
  pencapaian: pencapaian_clean,
}
```

- [ ] **Step 5: Add kawasan image upload in Section B (after Logo Parti div)**

Find the Logo Parti `<div>` in Section B and add this after it:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Gambar Kawasan / Latar Belakang
    <span className="text-gray-400 text-xs ml-2">(optional — masjid, padang, pekan, landmark kawasan)</span>
  </label>
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={e => setKawasanImageFile(e.target.files?.[0] || null)}
    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
  />
  <p className="text-xs text-gray-400 mt-1">Akan jadi latar belakang kabur di hero page calon.</p>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Gambar Gerak Kerja di Lapangan
    <span className="text-gray-400 text-xs ml-2">(1–3 gambar — program, bersama rakyat, aktiviti kempen)</span>
  </label>
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={e => setGaleriFiles(Array.from(e.target.files || []).slice(0, 3))}
    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
  />
  <p className="text-xs text-gray-400 mt-1">Maksimum 3 gambar.</p>
  {galeriFiles.length > 0 && (
    <p className="text-xs text-orange-600 mt-1">{galeriFiles.length} gambar dipilih</p>
  )}
</div>
```

- [ ] **Step 6: Add `mengapa_bertanding` textarea in Section E (after Latar Belakang textarea)**

Find the Latar Belakang textarea in Section E and add this after its `</div>`:

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Mengapa Saya Bertanding
    <span className="text-gray-400 text-xs ml-2">(optional — 2-3 ayat, suara sendiri)</span>
  </label>
  <textarea
    rows={4}
    value={form.mengapa_bertanding}
    onChange={e => setForm(p => ({ ...p, mengapa_bertanding: e.target.value }))}
    placeholder="Cth: Saya membesar di kawasan ini. Saya nampak jalan yang sama rosak 10 tahun, sekolah yang sama tiada padang. Saya bertanding kerana saya faham masalah ini dari dalam."
    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
  />
</div>
```

- [ ] **Step 7: Add Testimoni section (new Section H, before the Submit div)**

Find `{/* Submit */}` and add this new section before it:

```tsx
{/* H: Testimoni */}
<section>
  <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">H. Testimoni dari Masyarakat</h2>
  <p className="text-xs text-gray-500 mb-3">(Optional) Kata-kata sokongan dari penduduk atau penyokong</p>
  <div className="space-y-4">
    {testimoni.map((t, i) => (
      <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Testimoni {i + 1}</p>
        <textarea
          rows={2}
          value={t.quote}
          onChange={e => {
            const updated = [...testimoni]
            updated[i] = { ...updated[i], quote: e.target.value }
            setTestimoni(updated)
          }}
          placeholder='"Dia memang kerja keras untuk kawasan kita..."'
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={t.nama}
            onChange={e => {
              const updated = [...testimoni]
              updated[i] = { ...updated[i], nama: e.target.value }
              setTestimoni(updated)
            }}
            placeholder="Nama"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          <input
            type="text"
            value={t.kawasan_asal}
            onChange={e => {
              const updated = [...testimoni]
              updated[i] = { ...updated[i], kawasan_asal: e.target.value }
              setTestimoni(updated)
            }}
            placeholder="Kawasan asal (cth: Taman Maju)"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
        </div>
      </div>
    ))}
    {testimoni.length < 3 && (
      <button
        type="button"
        onClick={() => setTestimoni([...testimoni, { quote: '', nama: '', kawasan_asal: '' }])}
        className="text-sm text-orange-500 hover:text-orange-700"
      >
        + Tambah testimoni
      </button>
    )}
  </div>
</section>
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `daftar-calon/page.tsx`.

- [ ] **Step 9: Commit**

```bash
git add app/daftar-calon/page.tsx
git commit -m "feat: add kawasan image, galeri, mengapa bertanding, testimoni fields to borang"
```

---

## Task 3: Candidate Route Layout + Shared Types

**Files:**
- Create: `app/candidate/[subdomain]/layout.tsx`
- Create: `app/candidate/[subdomain]/types.ts`

- [ ] **Step 1: Create `types.ts`**

```typescript
// app/candidate/[subdomain]/types.ts

export interface CandidateBrief {
  id: string
  full_name: string
  preferred_name: string | null
  kawasan: string
  kawasan_jenis: string
  parti_name: string
  tagline: string | null
  photo_url: string | null
  parti_logo_url: string | null
  kawasan_image_url: string | null
  galeri_urls: string[]
  fokus: string[]
  isu_kawasan: { masalah: string; penyelesaian: string }[]
  profil_ringkas: string | null
  pencapaian: string[]
  quote_peribadi: string | null
  mengapa_bertanding: string | null
  testimoni: { quote: string; nama: string; kawasan_asal: string }[]
  whatsapp: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  subdomain: string
  warna_utama: string | null
  bahasa: string
  is_live: boolean
  ai_copy: { tagline?: string; mengapa_bertanding?: string; ayat_penutup?: string } | null
}
```

- [ ] **Step 2: Create `layout.tsx`**

```typescript
// app/candidate/[subdomain]/layout.tsx
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
})

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in new files.

- [ ] **Step 4: Commit**

```bash
git add app/candidate/[subdomain]/layout.tsx app/candidate/[subdomain]/types.ts
git commit -m "feat: add candidate route layout (fonts) and shared CandidateBrief type"
```

---

## Task 4: HeroSection Component

**Files:**
- Create: `app/candidate/[subdomain]/components/HeroSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/candidate/[subdomain]/components/HeroSection.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: CandidateBrief
  warna: string
}

export default function HeroSection({ c, warna }: Props) {
  const hasKawasanImage = Boolean(c.kawasan_image_url)

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 24px',
      overflow: 'hidden',
      background: hasKawasanImage ? 'transparent' : `linear-gradient(160deg, ${warna} 0%, #0f172a 100%)`,
    }}>
      {/* Blurred background layer */}
      {hasKawasanImage && (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${c.kawasan_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(14px)',
            transform: 'scale(1.12)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'rgba(0,0,0,0.62)',
          }} />
        </>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, width: '100%' }}>
        {/* Logo parti */}
        {c.parti_logo_url && (
          <div className="hero-parti" style={{ marginBottom: 20 }}>
            <img
              src={c.parti_logo_url}
              alt={`Logo ${c.parti_name}`}
              style={{ height: 52, objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Foto calon */}
        {c.photo_url && (
          <div className="hero-photo" style={{ marginBottom: 24 }}>
            <img
              src={c.photo_url}
              alt={`Foto ${c.full_name}`}
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'top',
                border: '4px solid rgba(255,255,255,0.25)',
                boxShadow: '0 0 48px rgba(255,255,255,0.12)',
              }}
            />
          </div>
        )}

        {/* Nama */}
        <h1 className="hero-nama" style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(30px, 6vw, 54px)',
          fontWeight: 900,
          color: '#fff',
          marginBottom: 12,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}>
          {c.full_name}
        </h1>

        {/* Kawasan badge */}
        <div className="hero-nama" style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 18px',
            borderRadius: 999,
            border: '1px solid #d4a853',
            color: '#d4a853',
            fontSize: 12,
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-dm)',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}>
            {c.kawasan_jenis} {c.kawasan} &nbsp;·&nbsp; {c.parti_name}
          </span>
        </div>

        {/* Tagline */}
        {c.tagline && (
          <p className="hero-tagline" style={{
            fontSize: 18,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.88)',
            maxWidth: 480,
            margin: '0 auto 32px',
            lineHeight: 1.65,
            borderLeft: '3px solid #d4a853',
            paddingLeft: 18,
            textAlign: 'left',
            fontFamily: 'var(--font-dm)',
            fontWeight: 300,
          }}>
            &ldquo;{c.tagline}&rdquo;
          </p>
        )}

        {/* CTA row */}
        <div className="hero-cta" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
        }}>
          {c.whatsapp && (
            <a
              href={`https://wa.me/${c.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#22c55e',
                color: '#fff',
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 16,
                fontFamily: 'var(--font-dm)',
              }}
            >
              💬 Hubungi {c.preferred_name || c.full_name}
            </a>
          )}
          {c.facebook_url && (
            <a href={c.facebook_url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-dm)',
            }}>Facebook</a>
          )}
          {c.instagram_url && (
            <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-dm)',
            }}>Instagram</a>
          )}
          {c.tiktok_url && (
            <a href={c.tiktok_url} target="_blank" rel="noopener noreferrer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              fontFamily: 'var(--font-dm)',
            }}>TikTok</a>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/candidate/[subdomain]/components/HeroSection.tsx
git commit -m "feat: add HeroSection with blurred kawasan image background"
```

---

## Task 5: QuoteBlock + MengapaBertanding

**Files:**
- Create: `app/candidate/[subdomain]/components/QuoteBlock.tsx`
- Create: `app/candidate/[subdomain]/components/MengapaBertanding.tsx`

- [ ] **Step 1: Create `QuoteBlock.tsx`**

```tsx
// app/candidate/[subdomain]/components/QuoteBlock.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'quote_peribadi' | 'full_name'>
  warna: string
}

export default function QuoteBlock({ c, warna }: Props) {
  if (!c.quote_peribadi) return null

  return (
    <section className="section-reveal" style={{
      padding: '80px 24px',
      background: warna,
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 80,
          color: '#d4a853',
          lineHeight: 0.8,
          marginBottom: 16,
        }}>
          &ldquo;
        </div>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 22,
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.7,
          marginBottom: 24,
        }}>
          {c.quote_peribadi}
        </p>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          — {c.full_name}
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `MengapaBertanding.tsx`**

```tsx
// app/candidate/[subdomain]/components/MengapaBertanding.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'mengapa_bertanding' | 'ai_copy'>
}

export default function MengapaBertanding({ c }: Props) {
  const content = c.ai_copy?.mengapa_bertanding || c.mengapa_bertanding
  if (!content) return null

  return (
    <section className="section-reveal" style={{
      padding: '80px 24px',
      background: '#0f172a',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 11,
          fontWeight: 500,
          color: '#d4a853',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Mengapa Saya Bertanding
        </p>
        <div style={{
          borderLeft: '3px solid #d4a853',
          paddingLeft: 28,
        }}>
          <p style={{
            fontFamily: 'var(--font-dm)',
            fontSize: 18,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.85,
          }}>
            {content}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/candidate/[subdomain]/components/QuoteBlock.tsx app/candidate/[subdomain]/components/MengapaBertanding.tsx
git commit -m "feat: add QuoteBlock and MengapaBertanding sections"
```

---

## Task 6: KenaliCandidate + FokusUtama

**Files:**
- Create: `app/candidate/[subdomain]/components/KenaliCandidate.tsx`
- Create: `app/candidate/[subdomain]/components/FokusUtama.tsx`

- [ ] **Step 1: Create `KenaliCandidate.tsx`**

```tsx
// app/candidate/[subdomain]/components/KenaliCandidate.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'profil_ringkas' | 'pencapaian' | 'preferred_name' | 'full_name'>
  warna: string
}

export default function KenaliCandidate({ c, warna }: Props) {
  if (!c.profil_ringkas) return null
  const displayName = c.preferred_name || c.full_name

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 32,
          textAlign: 'center',
        }}>
          Siapa {displayName}?
        </h2>
        <p style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 16,
          fontWeight: 400,
          color: '#374151',
          lineHeight: 1.85,
          marginBottom: c.pencapaian?.length ? 36 : 0,
        }}>
          {c.profil_ringkas}
        </p>
        {c.pencapaian?.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-dm)',
              fontWeight: 600,
              fontSize: 14,
              color: '#1f2937',
              marginBottom: 16,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Pencapaian &amp; Kelayakan
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.pencapaian.map((p, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontFamily: 'var(--font-dm)',
                  fontSize: 15,
                  color: '#374151',
                }}>
                  <span style={{ color: '#d4a853', marginTop: 3, flexShrink: 0 }}>✦</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `FokusUtama.tsx`**

```tsx
// app/candidate/[subdomain]/components/FokusUtama.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'fokus' | 'kawasan'>
  warna: string
}

export default function FokusUtama({ c, warna }: Props) {
  if (!c.fokus?.length) return null

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 48,
          textAlign: 'center',
        }}>
          Fokus Saya untuk {c.kawasan}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {c.fokus.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 24,
              padding: '24px 28px',
              background: '#fff',
              borderRadius: 12,
              borderLeft: `4px solid #d4a853`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <span style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 52,
                fontWeight: 900,
                color: '#f1f5f9',
                lineHeight: 1,
                minWidth: 52,
                userSelect: 'none',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{
                fontFamily: 'var(--font-dm)',
                fontWeight: 500,
                fontSize: 16,
                color: '#1f2937',
                lineHeight: 1.5,
                paddingTop: 12,
              }}>
                {f}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/candidate/[subdomain]/components/KenaliCandidate.tsx app/candidate/[subdomain]/components/FokusUtama.tsx
git commit -m "feat: add KenaliCandidate and FokusUtama sections"
```

---

## Task 7: GaleriGerakKerja

**Files:**
- Create: `app/candidate/[subdomain]/components/GaleriGerakKerja.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/candidate/[subdomain]/components/GaleriGerakKerja.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'galeri_urls' | 'full_name'>
  warna: string
}

export default function GaleriGerakKerja({ c, warna }: Props) {
  const urls = c.galeri_urls || []
  if (!urls.length) return null

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: 12,
    display: 'block',
  }

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 36,
          textAlign: 'center',
        }}>
          Gerak Kerja di Lapangan
        </h2>

        {/* 1 gambar — full width 16:9 */}
        {urls.length === 1 && (
          <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}>
            <img src={urls[0]} alt={`Gerak kerja ${c.full_name} 1`} style={imgStyle} />
          </div>
        )}

        {/* 2 gambar — dua column equal */}
        {urls.length === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {urls.map((url, i) => (
              <div key={i} style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                <img src={url} alt={`Gerak kerja ${c.full_name} ${i + 1}`} style={imgStyle} />
              </div>
            ))}
          </div>
        )}

        {/* 3+ gambar — 1 besar atas, 2 kecil bawah */}
        {urls.length >= 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}>
              <img src={urls[0]} alt={`Gerak kerja ${c.full_name} 1`} style={imgStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                <img src={urls[1]} alt={`Gerak kerja ${c.full_name} 2`} style={imgStyle} />
              </div>
              <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
                <img src={urls[2]} alt={`Gerak kerja ${c.full_name} 3`} style={imgStyle} />
                {urls.length > 3 && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-dm)',
                      color: '#fff',
                      fontSize: 24,
                      fontWeight: 600,
                    }}>
                      +{urls.length - 3} lagi
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/candidate/[subdomain]/components/GaleriGerakKerja.tsx
git commit -m "feat: add GaleriGerakKerja with 1/2/3-image responsive layout"
```

---

## Task 8: TestimoniRakyat + IsuKawasan

**Files:**
- Create: `app/candidate/[subdomain]/components/TestimoniRakyat.tsx`
- Create: `app/candidate/[subdomain]/components/IsuKawasan.tsx`

- [ ] **Step 1: Create `TestimoniRakyat.tsx`**

```tsx
// app/candidate/[subdomain]/components/TestimoniRakyat.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'testimoni'>
  warna: string
}

export default function TestimoniRakyat({ c, warna }: Props) {
  const list = c.testimoni || []
  if (!list.length) return null

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#0f172a' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: '#fff',
          marginBottom: 48,
          textAlign: 'center',
        }}>
          Suara Rakyat
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(list.length, 2)}, 1fr)`,
          gap: 20,
        }}>
          {list.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 28,
            }}>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 40,
                color: '#d4a853',
                lineHeight: 0.8,
                marginBottom: 12,
              }}>
                &ldquo;
              </div>
              <p style={{
                fontFamily: 'var(--font-dm)',
                fontSize: 15,
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.7,
                marginBottom: 20,
              }}>
                {t.quote}
              </p>
              <div>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  fontWeight: 500,
                  color: '#fff',
                  fontSize: 13,
                }}>
                  {t.nama}
                </p>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 12,
                  marginTop: 2,
                }}>
                  {t.kawasan_asal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `IsuKawasan.tsx`**

```tsx
// app/candidate/[subdomain]/components/IsuKawasan.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'isu_kawasan'>
  warna: string
}

export default function IsuKawasan({ c, warna }: Props) {
  const list = c.isu_kawasan || []
  if (!list.length) return null

  return (
    <section className="section-reveal" style={{ padding: '80px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(26px, 4vw, 38px)',
          fontWeight: 700,
          color: warna,
          marginBottom: 48,
          textAlign: 'center',
        }}>
          Isu Kawasan &amp; Penyelesaian
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {list.map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                padding: '20px 24px',
                background: '#fef2f2',
                borderBottom: '1px solid #fee2e2',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#991b1b',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {item.masalah}
                </p>
              </div>
              <div style={{
                padding: '20px 24px',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>✅</span>
                <p style={{
                  fontFamily: 'var(--font-dm)',
                  fontWeight: 400,
                  fontSize: 15,
                  color: '#166534',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {item.penyelesaian}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/candidate/[subdomain]/components/TestimoniRakyat.tsx app/candidate/[subdomain]/components/IsuKawasan.tsx
git commit -m "feat: add TestimoniRakyat and IsuKawasan sections"
```

---

## Task 9: CtaFooter

**Files:**
- Create: `app/candidate/[subdomain]/components/CtaFooter.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/candidate/[subdomain]/components/CtaFooter.tsx
import type { CandidateBrief } from '../types'

interface Props {
  c: Pick<CandidateBrief, 'preferred_name' | 'full_name' | 'kawasan' | 'parti_name' | 'whatsapp' | 'facebook_url' | 'instagram_url' | 'tiktok_url' | 'subdomain' | 'ai_copy'>
  warna: string
}

export default function CtaFooter({ c, warna }: Props) {
  const displayName = c.preferred_name || c.full_name
  const ayatPenutup = c.ai_copy?.ayat_penutup || `Bersama kita perkasakan ${c.kawasan}`

  return (
    <>
      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        background: `linear-gradient(160deg, ${warna} 0%, #0f172a 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 12,
          }}>
            Sokong {displayName}
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 17,
            marginBottom: 36,
            fontWeight: 300,
          }}>
            {ayatPenutup}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            {c.whatsapp && (
              <a
                href={`https://wa.me/${c.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  fontWeight: 600,
                  padding: '16px 32px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  fontSize: 17,
                  fontFamily: 'var(--font-dm)',
                }}
              >
                💬 WhatsApp
              </a>
            )}
            {c.facebook_url && (
              <a href={c.facebook_url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 500,
                padding: '16px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 15,
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm)',
              }}>Facebook</a>
            )}
            {c.instagram_url && (
              <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 500,
                padding: '16px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 15,
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm)',
              }}>Instagram</a>
            )}
            {c.tiktok_url && (
              <a href={c.tiktok_url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 500,
                padding: '16px 28px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 15,
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-dm)',
              }}>TikTok</a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a0f1a',
        color: '#4b5563',
        textAlign: 'center',
        padding: '24px',
      }}>
        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12 }}>
          {c.full_name} — {c.parti_name} — {c.kawasan}
        </p>
        <p style={{ marginTop: 6, fontFamily: 'var(--font-dm)', fontSize: 11 }}>
          Powered by{' '}
          <a href="https://1page.my" style={{ color: '#d4a853', textDecoration: 'none' }}>
            1page.my
          </a>
        </p>
      </footer>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/candidate/[subdomain]/components/CtaFooter.tsx
git commit -m "feat: add CtaFooter with socmed links and powered-by footer"
```

---

## Task 10: page.tsx — Rewrite & Compose

**Files:**
- Modify: `app/candidate/[subdomain]/page.tsx`

This is the final assembly. Rewrites the entire file to import all components, add CSS animations, and update SEO metadata.

- [ ] **Step 1: Rewrite `page.tsx`**

```tsx
// app/candidate/[subdomain]/page.tsx
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { CandidateBrief } from './types'
import HeroSection from './components/HeroSection'
import QuoteBlock from './components/QuoteBlock'
import MengapaBertanding from './components/MengapaBertanding'
import KenaliCandidate from './components/KenaliCandidate'
import FokusUtama from './components/FokusUtama'
import GaleriGerakKerja from './components/GaleriGerakKerja'
import TestimoniRakyat from './components/TestimoniRakyat'
import IsuKawasan from './components/IsuKawasan'
import CtaFooter from './components/CtaFooter'

interface Props {
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params
  const { data: c } = await supabaseServer()
    .from('candidate_briefs')
    .select('full_name, preferred_name, kawasan, kawasan_jenis, parti_name, tagline, photo_url')
    .eq('subdomain', subdomain)
    .eq('is_live', true)
    .single()

  if (!c) return { title: '1page.my' }

  const displayName = c.preferred_name || c.full_name
  const tagline = c.tagline || `Calon ${c.parti_name} untuk ${c.kawasan_jenis} ${c.kawasan}`

  return {
    title: `${c.full_name} — Calon ${c.kawasan_jenis} ${c.kawasan}`,
    description: `Kenali ${displayName}, calon ${c.parti_name} untuk ${c.kawasan_jenis} ${c.kawasan}. ${tagline}`,
    keywords: [c.full_name, c.kawasan, c.parti_name, `calon ${c.kawasan}`, `PRU ${c.kawasan}`],
    openGraph: {
      title: `${c.full_name} — ${c.kawasan}`,
      description: tagline,
      images: c.photo_url ? [c.photo_url] : [],
      type: 'profile',
    },
  }
}

const ANIMATIONS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-parti   { animation: fadeUp 0.5s ease 0.1s both; }
  .hero-photo   { animation: fadeUp 0.6s ease 0.2s both; }
  .hero-nama    { animation: fadeUp 0.6s ease 0.3s both; }
  .hero-tagline { animation: fadeUp 0.6s ease 0.4s both; }
  .hero-cta     { animation: fadeUp 0.6s ease 0.5s both; }

  @supports (animation-timeline: scroll()) {
    .section-reveal {
      animation: fadeUp 0.7s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
`

export default async function CandidatePage({ params }: Props) {
  const { subdomain } = await params

  const { data: c } = await (supabaseServer() as any)
    .from('candidate_briefs')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_live', true)
    .single()

  if (!c) return notFound()

  const candidate = c as CandidateBrief
  const warna = candidate.warna_utama || '#1e3a5f'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: candidate.full_name,
    jobTitle: `Calon ${candidate.kawasan_jenis} ${candidate.kawasan}`,
    affiliation: { '@type': 'Organization', name: candidate.parti_name },
    description: candidate.tagline,
    image: candidate.photo_url,
    url: `https://${candidate.subdomain}.1page.my`,
    sameAs: ([candidate.facebook_url, candidate.instagram_url, candidate.tiktok_url] as (string | null)[]).filter(Boolean),
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMATIONS }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ fontFamily: 'var(--font-dm)', overflowX: 'hidden' }}>
        <HeroSection c={candidate} warna={warna} />
        <QuoteBlock c={candidate} warna={warna} />
        <MengapaBertanding c={candidate} />
        <KenaliCandidate c={candidate} warna={warna} />
        <FokusUtama c={candidate} warna={warna} />
        <GaleriGerakKerja c={candidate} warna={warna} />
        <TestimoniRakyat c={candidate} warna={warna} />
        <IsuKawasan c={candidate} warna={warna} />
        <CtaFooter c={candidate} warna={warna} />
      </main>
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors. If `supabaseServer()` type errors appear, the `as any` cast on `.from('candidate_briefs')` handles it (existing pattern in codebase).

- [ ] **Step 3: Commit**

```bash
git add app/candidate/[subdomain]/page.tsx
git commit -m "feat: rewrite candidate page with Hallmark components, CSS animations, updated SEO"
```

---

## Task 11: Build Verification

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: no errors (or only pre-existing errors unrelated to candidate changes).

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` with no errors in candidate-related routes.

- [ ] **Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Then open a candidate page (or add a test row to Supabase with `is_live: true`). Verify:
- Hero has blurred background when `kawasan_image_url` is set
- Hero falls back to gradient when no `kawasan_image_url`
- Quote block appears only when `quote_peribadi` is set
- Mengapa section appears only when `mengapa_bertanding` is set
- Galeri shows correct layout for 1, 2, or 3 images
- Testimoni hidden when array is empty
- Fonts: Playfair Display on headings, DM Sans on body
- `fadeUp` animations play on hero load
- Anti-slop check: no purple gradients, no generic cards, no Inter font

- [ ] **Step 4: Verify borang at `/daftar-calon`**

Open `http://localhost:3000/daftar-calon`. Confirm:
- Section B has kawasan image upload + galeri upload
- Section E has "Mengapa Saya Bertanding" textarea
- Section H has testimoni with "+ Tambah testimoni" button
- Form submits without errors (check browser console + network tab)

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -p
git commit -m "fix: address visual review findings"
```
