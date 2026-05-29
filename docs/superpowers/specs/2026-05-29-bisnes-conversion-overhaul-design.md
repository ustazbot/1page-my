# Design: Bisnes Templates — Conversion Overhaul
**Date:** 2026-05-29
**Status:** Approved

---

## Goal

Increase lead conversion on all 5 bisnes page templates (`bold_minimal`, `warm_heritage`, `cool_professional`, `fresh_editorial`, `dark_mode`) by adding 5 new content segments, fixing segment order for conversion flow, and differentiating each segment's visual treatment per template.

---

## Scope

### New DB columns (`orders` table)

| Column | Type | Default | Structure |
|--------|------|---------|-----------|
| `stats_bar` | `jsonb` | `'[]'` | `[{nilai: string, label: string}]` max 4 |
| `usp` | `jsonb` | `'[]'` | `[{tajuk: string, huraian: string}]` max 4 |
| `pakej` | `jsonb` | `'[]'` | `[{nama: string, harga: string, ciri: string[], popular?: boolean}]` max 3 |
| `testimoni` | `jsonb` | `'[]'` | `[{nama: string, dari: string, ulasan: string}]` max 3 |
| `faq` | `jsonb` | `'[]'` | `[{soalan: string, jawapan: string}]` max 5 |

All columns nullable/default empty — templates render segment only when array length > 0.

### `types.ts` update

Add 5 new optional fields to `BisnesOrder`:

```typescript
stats_bar: { nilai: string; label: string }[] | null
usp: { tajuk: string; huraian: string }[] | null
pakej: { nama: string; harga: string; ciri: string[]; popular?: boolean }[] | null
testimoni: { nama: string; dari: string; ulasan: string }[] | null
faq: { soalan: string; jawapan: string }[] | null
```

### Form `/order` — New Sections H–L

All sections optional. New array state managed separately from `FormState` (same pattern as gallery_urls). Serialized into submit payload alongside `...form`.

**H — Pencapaian Bisnes (Stats Bar)**
- Up to 4 rows, each: `nilai` (text input) + `label` (text input)
- Dynamic add/remove rows
- Example: nilai="200+", label="Pelanggan"

**I — Kenapa Pilih Kami**
- Up to 4 rows, each: `tajuk` (short, ≤5 words) + `huraian` (1 sentence)
- Dynamic add/remove rows

**J — Pakej & Harga**
- Up to 3 packages, each: `nama` + `harga` + `ciri` (textarea, split by newline) + `popular` checkbox
- Dynamic add/remove rows

**K — Testimoni Pelanggan**
- Up to 3 testimonials, each: `nama` + `dari` + `ulasan`
- Dynamic add/remove rows

**L — Soalan Lazim (FAQ)**
- Up to 5 pairs, each: `soalan` + `jawapan`
- Dynamic add/remove rows

---

## Segment Order (all 5 templates, standardised)

```
1.  Hero                    (existing)
2.  Stats Bar               (new — conditional)
3.  Kenapa Pilih Kami       (new — conditional)
4.  Produk & Servis         (existing — fixed position)
5.  Mid-page CTA            (new — always shown)
6.  Pakej & Harga           (new — conditional)
7.  Gallery                 (existing — fixed position)
8.  Cerita Bisnes           (existing — fixed position)
9.  Testimoni               (new — conditional)
10. FAQ                     (new — conditional)
11. Waktu & Lokasi          (existing)
12. Footer CTA              (existing)
```

---

## Conversion Fixes (all templates)

### Fix 1 — CTA copy dynamic by jenis_bisnes

```typescript
function ctaCopy(jenis: string | null): string {
  if (!jenis) return 'WhatsApp Kami Sekarang'
  if (jenis.includes('F&B') || jenis.includes('Retail')) return 'Tanya Harga Sekarang'
  if (jenis.includes('Servis')) return 'Dapatkan Sebut Harga'
  return 'WhatsApp Kami Sekarang'
}
```

Applied to: hero CTA button, mid-page CTA, sticky WA button.

### Fix 2 — Phone number visible in footer

`order.telefon` displayed next to WA button in footer. Format: `📞 {order.telefon}` as plain text (not a link — Malaysian numbers not reliably dialable from all devices).

### Fix 3 — Mid-page CTA

After Produk & Servis section. Copy: `"Ada soalan? WhatsApp kami →"`. Style varies per template (see per-template section).

---

## Per-Template Differentiation

### Bold Minimal (`bold_minimal`)

| Segment | Treatment |
|---------|-----------|
| Stats Bar | Large white numbers, all-caps grey labels, thin `#222` vertical dividers |
| USP | 2-col grid, `#1a1a1a` border boxes, `◆` prefix icon |
| Mid-CTA | Pill button `bg:#fff color:#0a0a0a` |
| Pakej | Dark cards `#111`, large price, popular = white `2px` border glow |
| Testimoni | Italic quote, em-dash attribution, zero decoration, `#999` text |
| FAQ | CSS `<details>/<summary>` accordion, `1px solid #222` divider |

### Warm Heritage (`warm_heritage`)

| Segment | Treatment |
|---------|-----------|
| Stats Bar | Gold `#f59e0b` numbers, cream `#fef3c7` background, ornate `|` dividers |
| USP | Cream cards with `✦` icon, `#fde68a` border |
| Mid-CTA | Amber button `#f59e0b`, `#78350f` text, rounded 8px |
| Pakej | Vintage-feel cards, `"Pilihan Ramai"` amber ribbon badge on popular |
| Testimoni | Parchment bg `#fef9ec`, large amber `"` decoration, italic Lora-style |
| FAQ | Soft accordion, amber `▾` chevron, `#fde68a` border |

### Cool Professional (`cool_professional`)

| Segment | Treatment |
|---------|-----------|
| Stats Bar | Blue gradient pills `#dbeafe bg`, `#1e3a8a` numbers |
| USP | White cards, `✓` blue checkmark prefix, `1px solid #dbeafe` border |
| Mid-CTA | `#3b82f6` outlined button with border, white bg |
| Pakej | 3-col pricing table, popular column `bg:#1e3a8a color:#fff` highlighted |
| Testimoni | White card, avatar initials circle `bg:#dbeafe color:#1e3a8a`, professional layout |
| FAQ | Numbered list style, white cards with `#dbeafe` border |

### Fresh Editorial (`fresh_editorial`)

| Segment | Treatment |
|---------|-----------|
| Stats Bar | Green badge tags `bg:#d1fae5`, compact horizontal row |
| USP | Cards with `✅` prefix icon (hardcoded), `#d1fae5` bg, `3px solid #10b981` top border |
| Mid-CTA | Solid `#10b981` button, white text |
| Pakej | Clean green-tinted `#d1fae5` cards, feature chips `bg:#ecfdf5` |
| Testimoni | Magazine pull-quote, large `"` decoration `#10b981`, editorial feel |
| FAQ | Open list, `2px solid #10b981` left border per item, no heavy decoration |

### Dark Mode (`dark_mode`)

| Segment | Treatment |
|---------|-----------|
| Stats Bar | Numbers `#0ea5e9` with subtle glow `text-shadow`, dark `#0f172a` strip |
| USP | Dark cards `#1e293b`, `3px solid #0ea5e9` left-border, sky text |
| Mid-CTA | `#0ea5e9` solid button |
| Pakej | Dark cards `#1e293b`, `1px solid rgba(255,255,255,0.1)` border, popular = `#0ea5e9` badge top |
| Testimoni | Dark card `#1e293b`, `3px solid #0ea5e9` top-border |
| FAQ | Dark `<details>` accordion `bg:#1e293b`, sky-blue `▾` icon |

---

## API & DB Changes

### Migration file
`supabase/migrations/005_bisnes_conversion_segments.sql`

```sql
alter table public.orders
  add column if not exists stats_bar  jsonb not null default '[]',
  add column if not exists usp        jsonb not null default '[]',
  add column if not exists pakej      jsonb not null default '[]',
  add column if not exists testimoni  jsonb not null default '[]',
  add column if not exists faq        jsonb not null default '[]';
```

### `/api/orders` route (POST)
Route uses **explicit destructuring** — does NOT spread body. Requires changes:

1. Destructure 5 new fields from `body`:
```typescript
const { ..., stats_bar, usp, pakej, testimoni, faq } = body
```

2. Add to `.insert()` call:
```typescript
stats_bar: Array.isArray(stats_bar) ? stats_bar : [],
usp:       Array.isArray(usp)       ? usp       : [],
pakej:     Array.isArray(pakej)     ? pakej      : [],
testimoni: Array.isArray(testimoni) ? testimoni  : [],
faq:       Array.isArray(faq)       ? faq        : [],
```

File: `app/api/(platform)/orders/route.ts`

### Admin dashboard (`app/admin/(dashboard)/orders/[id]/page.tsx`)
No changes required. New fields are set by client via order form. Admin can see them as read-only in the "Detail Order" collapsible section (already renders all order fields).

---

## Files to Change

| File | Action |
|------|--------|
| `supabase/migrations/005_bisnes_conversion_segments.sql` | CREATE |
| `app/bisnes/[subdomain]/types.ts` | MODIFY — add 5 fields |
| `app/api/(platform)/orders/route.ts` | MODIFY — destructure + insert 5 new fields |
| `app/(platform)/order/page.tsx` | MODIFY — add sections H–L, submit payload |
| `app/bisnes/[subdomain]/templates/bold-minimal.tsx` | MODIFY — new segments + reorder + fixes |
| `app/bisnes/[subdomain]/templates/warm-heritage.tsx` | MODIFY — new segments + reorder + fixes |
| `app/bisnes/[subdomain]/templates/cool-professional.tsx` | MODIFY — new segments + reorder + fixes |
| `app/bisnes/[subdomain]/templates/fresh-editorial.tsx` | MODIFY — new segments + reorder + fixes |
| `app/bisnes/[subdomain]/templates/dark-mode.tsx` | MODIFY — new segments + reorder + fixes |

---

## Anti-Slop Constraints

- CTA copy must use dynamic `ctaCopy()` function — no hardcoded "WhatsApp Kami" except as fallback
- Pakej harga: `harga` is free-text — no assumption of numeric format (support "RM150", "dari RM50", "Hubungi Kami")
- FAQ uses native CSS `<details>/<summary>` — no JavaScript toggle required
- Stats bar: empty `nilai` or `label` → skip that stat entry (don't render empty)
- All new segments: guard with `?.length > 0` before rendering
- Per-template styles must be visually distinct — not just colour swaps of the same layout
