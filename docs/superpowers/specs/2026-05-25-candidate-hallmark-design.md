# Candidate Page — Hallmark Design + Borang Update

**Date:** 2026-05-25
**Scope:** `app/candidate/[subdomain]/`, `app/daftar-calon/page.tsx`, new DB columns
**Out of scope:** AI copy generation API (deferred)

---

## Goal

Upgrade candidate page template dari basic inline-style layout kepada **Hallmark Design System** — bold, premium, political authority aesthetic. Serentak tambah fields baru dalam borang untuk support galeri, testimoni, mengapa bertanding, dan gambar kawasan.

Objektif page: rakyat buka, terus rasa calon ini serius, berkaliber, layak dipercayai.

---

## Design Decisions

| Perkara | Keputusan |
|---------|-----------|
| Stats Bar | **Replaced** dengan Quote Block — `quote_peribadi` prominent, lebih emotional |
| Mengapa Bertanding | **Textarea baru** dalam borang — calon tulis sendiri, authentic |
| Hero background | `kawasan_image_url` blurred → fallback gradient `warna_utama` |
| Typography | Playfair Display (headings) + DM Sans (body) via Google Fonts |
| Animations | CSS-only `fadeUp` keyframe — stagger pada hero, scroll reveal pada sections |
| Component structure | Subcomponents dalam `app/candidate/[subdomain]/components/` |
| AI copy API | Deferred — buat bila ada calon pertama live |

---

## SQL Changes

Run dalam Supabase SQL Editor sebelum deploy:

```sql
ALTER TABLE public.candidate_briefs
  ADD COLUMN IF NOT EXISTS kawasan_image_url  text,
  ADD COLUMN IF NOT EXISTS galeri_urls        jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS testimoni          jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS mengapa_bertanding text,
  ADD COLUMN IF NOT EXISTS ai_copy            jsonb DEFAULT '{}';
```

---

## Borang — `app/daftar-calon/page.tsx`

### Fields Baru

**Section B — Gambar & Logo** (tambah selepas Logo Parti):

| Field | Type | Note |
|-------|------|------|
| `kawasan_image_url` | File upload (JPG/PNG) | Gambar kawasan/landmark — optional. Upload ke R2 type `kawasan-image`. |
| `galeri_urls` | File upload multiple, max 3 | Gambar gerak kerja — optional. Upload ke R2 type `galeri-0`, `galeri-1`, `galeri-2`. |

**Section E — Profil Ringkas** (tambah selepas Latar Belakang):

| Field | Type | Note |
|-------|------|------|
| `mengapa_bertanding` | Textarea, ~4 rows | "Mengapa Saya Bertanding?" — 2-3 ayat, suara calon, optional. |

**Section H — Testimoni** (section baru, sebelum Submit):

| Field | Type | Note |
|-------|------|------|
| `testimoni` | Array of `{ quote, nama, kawasan_asal }`, max 3 | Optional. Mula dengan 0, user tambah sendiri. |

### Upload Flow

Semua uploads guna `/api/r2-upload` yang sedia ada. Key format:
- `candidates/{subdomain}/kawasan-image.{ext}`
- `candidates/{subdomain}/galeri-0.{ext}` (dll)

Galeri: loop setiap file, upload satu-satu, collect array of URLs, store sebagai `galeri_urls` JSONB.

### Submission

Payload tambah fields baru ke `handleSubmit`, dihantar ke `/api/submit-brief` yang sedia ada.

---

## Candidate Page — `app/candidate/[subdomain]/page.tsx`

### Architecture

`page.tsx` adalah Server Component — fetch data, pass ke subcomponents sebagai props. Semua subcomponents boleh jadi Client Components jika ada interactivity (galeri lightbox, dll) atau Server Components kalau static.

```
app/candidate/[subdomain]/
  page.tsx                     ← SSR, fetch, compose
  components/
    HeroSection.tsx
    QuoteBlock.tsx
    MengapaBertanding.tsx
    KenaliCandidate.tsx
    FokusUtama.tsx
    GaleriGerakKerja.tsx
    TestimoniRakyat.tsx
    IsuKawasan.tsx
    CtaFooter.tsx
```

### Fonts

Guna `next/font/google` dalam `app/candidate/[subdomain]/layout.tsx` — supaya fonts diload hanya untuk route candidate, tidak affect app lain. Pass font CSS variable ke `<body>` className, kemudian subcomponents reference via `fontFamily: 'var(--font-playfair)'` dll.

```typescript
// app/candidate/[subdomain]/layout.tsx
import { Playfair_Display, DM_Sans } from 'next/font/google'
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-playfair' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-dm' })

export default function CandidateLayout({ children }) {
  return <div className={`${playfair.variable} ${dmSans.variable}`}>{children}</div>
}
```

Tailwind tidak dipakai dalam candidate page subcomponents (pure inline styles supaya no dependency on app CSS).

### Animations

CSS keyframe dalam `<style>` tag di dalam `page.tsx`:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-parti   { animation: fadeUp 0.5s ease 0.1s both; }
.hero-photo   { animation: fadeUp 0.6s ease 0.2s both; }
.hero-nama    { animation: fadeUp 0.6s ease 0.3s both; }
.hero-tagline { animation: fadeUp 0.6s ease 0.4s both; }
.hero-cta     { animation: fadeUp 0.6s ease 0.5s both; }
```

Sections bawah guna `animation-timeline: view()` (CSS Scroll-Driven Animations — supported modern browsers). Graceful degrade kalau tidak supported.

---

## Page Sections — Detail

### 1. HeroSection

- **Background:** Jika ada `kawasan_image_url` → absolute div dengan `backgroundImage`, `filter: blur(12px)`, `transform: scale(1.1)` (scale tutup blur edges) + dark overlay `rgba(0,0,0,0.55)`. Jika tiada → `background: linear-gradient(160deg, {warna_utama} 0%, #0f172a 100%)`.
- **Content (z-index: 2, relative):**
  - Logo parti kecil + nama parti (top)
  - Foto calon: 200×200px circle, `border: 4px solid rgba(255,255,255,0.25)`, subtle glow
  - Nama: Playfair Display 900, 42px mobile → 56px desktop, white
  - Kawasan badge: pill `warna_utama` dengan border amber
  - Tagline: italic, `color: rgba(255,255,255,0.85)`, left amber border
  - CTA row: WhatsApp (green pill) + FB/IG/TikTok (ghost pills)

### 2. QuoteBlock

Conditional — skip jika `quote_peribadi` kosong.

- Background: `warna_utama` solid
- Large amber `"` (Playfair Display, 80px)
- Quote text: italic, DM Sans 300, `rgba(255,255,255,0.9)`
- Nama calon: small, `rgba(255,255,255,0.5)`

### 3. MengapaBertanding

Conditional — skip jika `mengapa_bertanding` kosong.

- Background: `#0f172a` (near-black)
- Label kecil: `MENGAPA SAYA BERTANDING`, letter-spacing 3px, amber
- Left border: 3px solid amber
- Paragraph: DM Sans 300, `rgba(255,255,255,0.85)`, line-height 1.9

### 4. KenaliCandidate

- Background: white
- Heading: Playfair Display, `Siapa {preferred_name || full_name}?`
- Profil paragraph: DM Sans 400, `#374151`, line-height 1.8
- Pencapaian list: `✦` amber bullet, setiap item satu baris

### 5. FokusUtama

Conditional — skip jika `fokus` array kosong.

- Background: `#f8fafc`
- Heading: Playfair Display, centered
- Setiap item: flex row — nombor besar `01`, `02`... (Playfair Display 900, `#e2e8f0`, 64px) + left amber border line + teks fokus

### 6. GaleriGerakKerja

Conditional — skip jika `galeri_urls` kosong atau array length 0.

- Layout:
  - 1 gambar: full-width 16:9
  - 2 gambar: dua column equal
  - 3+ gambar: gambar pertama full-width 16:9, gambar 2+3 dua column square bawah. Jika ada lebih 3 → overlay "+X lagi" pada gambar ke-3.
- Semua gambar: `objectFit: cover`, `borderRadius: 12px`

### 7. TestimoniRakyat

Conditional — skip jika `testimoni` array kosong.

- Background: `#0f172a`
- Setiap testimoni: dark card (`rgba(255,255,255,0.05)` bg), amber `"`, italic quote, nama + kawasan asal
- Max 3 cards, horizontal scroll pada mobile

### 8. IsuKawasan

Conditional — skip jika `isu_kawasan` array kosong.

- Background: white
- Setiap isu: card dengan dua bahagian — masalah (merah muted `#fef2f2`, icon ⚠) dan penyelesaian (hijau muted `#f0fdf4`, icon ✓)

### 9. CtaFooter

- Background: `linear-gradient(160deg, {warna_utama} 0%, #0f172a 100%)`
- Heading: Playfair Display, `Sokong {preferred_name}`
- Subtext: DM Sans, `rgba(255,255,255,0.7)`
- WhatsApp button: large green pill, full-width mobile
- Socmed row: ghost pills — FB, IG, TikTok (conditional)
- `Powered by 1page.my` — small, subtle amber link

---

## SEO

`generateMetadata` update:

```typescript
{
  title: `${full_name} — Calon ${kawasan_jenis} ${kawasan}`,
  description: `Kenali ${preferred_name || full_name}, calon ${parti_name} untuk ${kawasan_jenis} ${kawasan}. ${tagline || ''}`,
  keywords: [full_name, kawasan, parti_name, `calon ${kawasan}`, `PRU ${kawasan}`],
  openGraph: {
    title: `${full_name} — ${kawasan}`,
    description: tagline || `Calon ${parti_name} untuk ${kawasan}`,
    images: photo_url ? [photo_url] : [],
    type: 'profile',
  },
}
```

JSON-LD `Person` schema — sudah ada, tambah `sameAs` untuk TikTok.

---

## Anti-Slop Checklist

- Tiada font Inter, Roboto, atau Arial
- Tiada purple gradient
- Tiada generic Bootstrap-style card layout
- Hero ada blurred background atau strong gradient — bukan flat color
- Foto calon prominent 200px, bukan thumbnail kecil
- Playfair Display pada semua headings utama
- Animations subtle — fadeUp 0.5–0.6s, bukan bouncy atau gimmicky
- Dark overlay pada hero pastikan teks terbaca di atas gambar mana-mana
- Mobile-first: semua layout readable pada 375px

---

## Files

| File | Action |
|------|--------|
| Supabase SQL Editor | Run ALTER TABLE |
| `app/daftar-calon/page.tsx` | Modify — tambah 4 field groups baru |
| `app/candidate/[subdomain]/layout.tsx` | Create — load Playfair Display + DM Sans via next/font |
| `app/candidate/[subdomain]/page.tsx` | Rewrite — compose subcomponents, fonts, animations |
| `app/candidate/[subdomain]/components/HeroSection.tsx` | Create |
| `app/candidate/[subdomain]/components/QuoteBlock.tsx` | Create |
| `app/candidate/[subdomain]/components/MengapaBertanding.tsx` | Create |
| `app/candidate/[subdomain]/components/KenaliCandidate.tsx` | Create |
| `app/candidate/[subdomain]/components/FokusUtama.tsx` | Create |
| `app/candidate/[subdomain]/components/GaleriGerakKerja.tsx` | Create |
| `app/candidate/[subdomain]/components/TestimoniRakyat.tsx` | Create |
| `app/candidate/[subdomain]/components/IsuKawasan.tsx` | Create |
| `app/candidate/[subdomain]/components/CtaFooter.tsx` | Create |
