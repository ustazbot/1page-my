# UX-AUDIT — 1page.my Sales Page

**Mode:** `--static` (Playwright MCP not loaded)
**Date:** 2026-05-23
**Persona:** Peniaga kecil Malaysia (warung, kedai runcit, freelancer, SME) — pertama kali dengar tentang 1page.my
**JTBD:** Faham perkhidmatan → yakin boleh percaya → klik CTA → isi Google Form

---

## Part A — Static Analysis

### A1 — Conversion Flow Score

| Step | Element | Status | Note |
|------|---------|--------|------|
| Above fold: headline clear? | Hero h1 | ✅ PASS | "Landing Page… RM150" — jelas, tidak ambiguous |
| Above fold: CTA visible? | Hero button | ✅ PASS | Orange button, contrast ok |
| CTA text communicates value? | "Mulakan Sekarang — Percuma Untuk Cuba" | ⚠ PARTIAL | "Percuma Untuk Cuba" implies SERVICE is free — sebenarnya preview yang percuma. Boleh cipta kekeliruan |
| Primary CTA wired? | CTABanner `href="#"` | ❌ FAIL | Dead link. Main conversion point tidak boleh diklik dengan berkesan |
| Social proof present? | Seluruh page | ❌ FAIL | Sifar testimonial, sifar nombor clients, sifar contoh kerja |
| Risk reversal present? | Hero + Pricing | ✅ PASS | "Tengok preview dulu. Bayar lepas setuju." — kuat, diulang 3x |
| WhatsApp contact? | Seluruh page | ❌ FAIL | Malaysian SME sangat bergantung pada WhatsApp. Spec ada `WHATSAPP_NUMBER` tapi tidak diimplementasi |
| Mobile touch targets ≥ 44px? | CTA buttons | ✅ PASS | padding 16px atas bawah + text 17px — mencukupi |
| Broken footer links? | `/affiliate`, `/terms` | ⚠ PARTIAL | Routes belum wujud → 404 |

### A2 — Copy Slop Check

| Screen | Element | Issue |
|--------|---------|-------|
| PainPoints | h2 `components/sales/PainPoints.tsx:72` | **Double negation grammatical error** — "Bukan anda bukan seorang yang" tidak bermakna. Mesti "Anda bukan seorang sahaja." |
| CTABanner | secondary text `CTABanner.tsx:121` | "Tiada credit card diperlukan" — irrelevant. Service ini bukan subscription, tidak ada credit card langsung. Mengelirukan |
| WhatYouGet | checklist item | "Tengok dulu, bayar lepas setuju" — good, tapi lebih berkesan dalam context hero/CTA |

### A3 — Missing Conversion Sections

| Gap | Impact | Effort |
|-----|--------|--------|
| Social proof / testimonials | HIGH — tanpa bukti, peniaga kecil tidak yakin | Medium |
| WhatsApp contact button | HIGH — Malaysian default communication channel | Small |
| "Siapa kami" / trust element | MEDIUM — siapa yang buat page ni? | Medium |

### A4 — Build Sanity

```
next build → 18 pages, 0 errors (run 2026-05-23 dalam session ini)
```

---

## Part B — Walkthrough (Static)

_Playwright unavailable — static walkthrough dari perspektif persona._

**Step 1 — Screen: Hero. Action: Baca headline.**
Expected: Faham apa perkhidmatan ini dalam 5 saat.
Observed: ✅ "Landing Page untuk Bisnes Anda. Professional. Cepat. RM150." — jelas.

**Step 2 — Screen: Hero. Action: Baca CTA button.**
Expected: Tahu apa yang berlaku bila klik.
Observed: ⚠ "Mulakan Sekarang — Percuma Untuk Cuba" — "Percuma" dalam bahasa Malaysia bermaksud GRATIS. Visitor mungkin sangka service ni percuma, kemudian kena bayar RM150 → betrayal of trust.

**Step 3 — Screen: PainPoints. Action: Baca heading.**
Expected: Headline yang hit emotionally.
Observed: ❌ "Bukan anda bukan seorang yang" — double negation, tidak bermakna. Visitor confused, trust drop.

**Step 4 — Screen: HowItWorks. Action: Baca 3 steps.**
Expected: Faham proses dengan jelas.
Observed: ✅ Jelas. "Step 1 → Isi Brief → 5 minit" — convincing.

**Step 5 — Screen: CTABanner. Action: Klik "Mulakan Sekarang".**
Expected: Navigate ke Google Form.
Observed: ❌ `href="#"` — page scroll ke atas. Tidak pergi ke Google Form. Hard stop bagi conversion.

**Step 6 — Edge case: Visitor dari mobile. Action: Check CTA reachability.**
Expected: CTA visible without scroll on mobile.
Observed: ⚠ Navbar CTA ada tapi kecil (14px). Hero CTA visible. Tapi antara Pricing dan CTABanner (dark section → orange section) tiada interim CTA — jarak terlalu jauh untuk visitor yang dah scroll ke bawah.

---

## Top fixes (prioritized)

1. Fix copy `PainPoints.tsx:72` — h2 double negation. Current: "Bukan anda bukan seorang yang". Target: "Anda bukan seorang sahaja."
2. Fix CTA text `Hero.tsx:245` — Current: "Mulakan Sekarang — Percuma Untuk Cuba". Target: "Cuba Percuma — Bayar Lepas Setuju" (jelas bahawa PREVIEW percuma, bukan service).
3. Fix dead CTA `CTABanner.tsx:87` — `href="#"`. Target: guna `GOOGLE_FORM_URL` env var dengan visible fallback state. Short-term: tambah WhatsApp link sebagai fallback selagi form URL belum ready.
4. Fix irrelevant copy `CTABanner.tsx:121` — Current: "Tiada credit card diperlukan". Target: "Preview percuma · Bayar lepas setuju."
5. Add WhatsApp CTA — `CTABanner.tsx` — tambah butang WhatsApp di sebelah Google Form button. Malaysian SME conversion lift.

---

## Fixes applied

### Fix 1 — PainPoints heading grammatical error
- Status: APPLIED
- File: `components/sales/PainPoints.tsx:72`
- Patch: "Bukan anda bukan seorang yang" → "Anda bukan seorang sahaja."

### Fix 2 — Hero CTA text ambiguity
- Status: APPLIED
- File: `components/sales/Hero.tsx:245`
- Patch: "Mulakan Sekarang — Percuma Untuk Cuba" → "Cuba Percuma — Bayar Lepas Setuju"
- Rationale: "Percuma Untuk Cuba" implies gratis service; sekarang jelas bahawa PREVIEW percuma.

### Fix 3 — CTABanner dead link + irrelevant copy
- Status: APPLIED
- File: `components/sales/CTABanner.tsx`
- Patch: `href="#"` → `process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ?? '#form'` (env-driven, graceful fallback)
- Patch: CTA text → "Isi Brief Sekarang — Percuma" (lebih jelas action)
- Patch: Secondary text "Tiada credit card diperlukan" → "Preview percuma · Bayar lepas setuju"

### Fix 4 — WhatsApp CTA ditambah
- Status: APPLIED
- File: `components/sales/CTABanner.tsx`
- Patch: Tambah WhatsApp button bawah Google Form CTA
- Pre-filled message: "Hai, saya berminat nak buat landing page…"
- URL driven by `NEXT_PUBLIC_WHATSAPP_NUMBER` env var

### Build check
- `next build` → 18 pages, 0 errors ✅

---

## Remaining gaps (tidak di-scope fixes ini)

| Gap | Bila nak fix | Note |
|-----|-------------|------|
| Social proof / testimonials | Lepas first 3 clients | Jangan buat fake — tunggu real reviews |
| `/affiliate` dan `/terms` routes | Bila pages siap | Atau sembunyikan footer links buat masa ni |
| `NEXT_PUBLIC_GOOGLE_FORM_URL` env var | Bila Google Form dibina | Update `.env.local` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` env var | Segera | Update `.env.local` |
