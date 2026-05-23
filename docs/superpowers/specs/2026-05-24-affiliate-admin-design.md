# Claude Code Prompt — Affiliate System + Admin Dashboard
# 1page.my

Baca dan faham keseluruhan spec ini sebelum menulis sebarang code.
Rujuk WORKFLOW.md untuk konteks sistem penuh.

---

## OVERVIEW

Bina dua dashboard berasingan:
1. **Affiliate System** — register, login, dashboard, tracking, payout history
2. **Admin Dashboard** — manage orders, approve affiliates, process payouts

---

## TECH STACK

```
Framework   : Next.js 14 (App Router) — dalam repo yang sama
Database    : Supabase (Auth + Database)
Styling     : Tailwind CSS (Hallmark design system)
Auth        : Supabase Auth (affiliate) + .env credentials (admin)
```

---

## ROUTE STRUCTURE

```
/affiliate/register        → Borang daftar affiliate baru
/affiliate/login           → Login affiliate
/affiliate/dashboard       → Overview stats
/affiliate/referrals       → Senarai referral + status
/affiliate/payout          → Payout history + status
/affiliate/kit             → Marketing kit (caption, link)

/admin                     → Login admin (Bos)
/admin/orders              → Semua orders + status
/admin/affiliates          → Senarai affiliate, approve/suspend
/admin/payouts             → Proses payout bulanan
/admin/settings            → Tetapan sistem
```

---

## SUPABASE SCHEMA

### Table: affiliates

```sql
create table affiliates (
  id uuid references auth.users primary key,
  created_at timestamp with time zone default now(),
  nama text not null,
  telefon text not null,
  bank_name text not null,
  bank_account text not null,
  bank_holder_name text not null,
  ref_code text unique not null,
  status text default 'pending',
  -- pending → active → suspended
  total_earned numeric default 0,
  total_paid numeric default 0
);

alter table affiliates enable row level security;
grant all on affiliates to service_role;
grant select, update on affiliates to authenticated;

-- Affiliate hanya boleh baca/update record sendiri
create policy "affiliate_own_record" on affiliates
  for all using (auth.uid() = id);
```

### Table: referrals

```sql
create table referrals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  affiliate_id uuid references affiliates(id) not null,
  order_id uuid references orders(id) not null,
  order_amount numeric not null,
  commission_rate numeric default 0.40,
  commission_amount numeric not null,
  -- commission_amount = order_amount * commission_rate
  -- EXCLUDE: domain fees dan revision fees
  earned_month text not null,
  -- format: 'YYYY-MM' contoh: '2026-05'
  status text default 'pending',
  -- pending → approved → paid
  paid_at timestamp with time zone,
  payout_id uuid references payouts(id)
);

alter table referrals enable row level security;
grant all on referrals to service_role;
grant select on referrals to authenticated;

create policy "affiliate_own_referrals" on referrals
  for select using (
    affiliate_id = auth.uid()
  );
```

### Table: payouts

```sql
create table payouts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  affiliate_id uuid references affiliates(id) not null,
  payout_month text not null,
  -- format: 'YYYY-MM' — bulan commission yang dibayar
  total_amount numeric not null,
  status text default 'pending',
  -- pending → paid
  paid_at timestamp with time zone,
  payment_reference text,
  -- rujukan pindahan bank
  note text
);

alter table payouts enable row level security;
grant all on payouts to service_role;
grant select on payouts to authenticated;

create policy "affiliate_own_payouts" on payouts
  for select using (
    affiliate_id = auth.uid()
  );
```

### Update: orders table — tambah kolum ref

```sql
alter table orders add column if not exists
  affiliate_ref_code text;

alter table orders add column if not exists
  commission_calculated boolean default false;
```

---

## AFFILIATE REGISTRATION FLOW

### /affiliate/register

Form fields:
```
Nama penuh          (text, required)
Email               (text, required)
Nombor telefon      (text, required)
Password            (password, required, min 8 chars)
Nama bank           (dropdown: Maybank, CIMB, RHB, dll)
Nombor akaun bank   (text, required)
Nama pemilik akaun  (text, required)
```

Checkbox wajib tick sebelum submit:
```
□ Saya faham dan bersetuju dengan terma komisyen:
  Komisyen yang diperoleh dalam sesuatu bulan akan dibayar
  pada 7hb bulan berikutnya. Sekiranya 7hb jatuh pada hari
  cuti umum atau hujung minggu, pembayaran akan dibuat pada
  hari bekerja yang berikutnya. Pembayaran dibuat melalui
  pindahan bank ke akaun yang didaftarkan.
```

Selepas submit:
1. Create Supabase Auth user
2. Insert ke `affiliates` table dengan status `pending`
3. Auto-generate `ref_code` (6 char alphanumeric unique)
4. Trigger WhatsApp notif ke Bos: "Affiliate baru mendaftar: [nama] — [telefon]. Sila semak di /admin/affiliates"
5. Tunjuk mesej: "Permohonan anda sedang disemak. Kami akan maklumkan melalui email apabila akaun anda diaktifkan."

---

## AFFILIATE DASHBOARD

### /affiliate/dashboard — Stats Overview

```
Ref link: 1page.my/?ref=[ref_code]  [Copy button]

┌─────────────┬─────────────┬─────────────┐
│ Total Earned│ Total Paid  │ Pending     │
│ RM 480.00   │ RM 360.00   │ RM 120.00   │
└─────────────┴─────────────┴─────────────┘

Bulan ini: X referral · RM XX.00 earned
```

### /affiliate/referrals — Senarai Referral

Table dengan columns:
```
Tarikh | Nama Bisnes (order) | Jumlah Order | Komisyen | Status
```

Status badges:
```
pending   → grey   → "Menunggu"
approved  → yellow → "Disahkan"
paid      → green  → "Dibayar"
```

### /affiliate/payout — Payout History

Table dengan columns:
```
Bulan        | Jumlah      | Status      | Tarikh Bayar      | Rujukan
─────────────────────────────────────────────────────────────────────
Mei 2026     | RM 180.00   | ✅ Dibayar  | 7 Jun 2026        | TRF-001
Apr 2026     | RM 120.00   | ✅ Dibayar  | 7 Mei 2026        | TRF-002
Jun 2026     | RM 60.00    | ⏳ Belum    | Dijangka 7 Jul 2026| —
```

Note di bawah table:
> "Komisyen bulan semasa akan dibayar pada 7hb bulan berikutnya."

### /affiliate/kit — Marketing Kit

```
Ref link anda:
[1page.my/?ref=ABCD12]  [Copy]

Caption siap pakai:
┌─────────────────────────────────────────┐
│ Nak landing page untuk bisnes anda?     │
│ Professional. Siap dalam 24 jam. RM150. │
│ Tengok preview dulu, bayar lepas setuju.│
│ → 1page.my/?ref=ABCD12                  │
└─────────────────────────────────────────┘
[Copy Caption]
```

---

## ADMIN DASHBOARD

### Admin Auth

Guna `.env` credentials — bukan Supabase Auth.
Middleware protect semua `/admin/*` routes.

```
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Simple session cookie — expire 24 jam. Bila Bos tutup browser kena login semula.

### /admin/affiliates — Manage Affiliates

Table:
```
Nama | Email | Telefon | Ref Code | Daftar | Status | Tindakan
```

Tindakan:
- **Approve** → update status `pending` → `active` + send email notif ke affiliate
- **Suspend** → update status → `suspended`
- **View** → detail affiliate + referral history

### /admin/payouts — Proses Payout Bulanan

**Paparan utama:**

Dropdown pilih bulan → tunjuk semua affiliate yang ada commission bulan tersebut.

```
Payout Bulan: [Mei 2026 ▼]
Tarikh bayar: 7 Jun 2026 (Ahad → anjak ke 9 Jun 2026 Isnin)

┌──────────────────────────────────────────────────────┐
│ Nama Affiliate  │ Bank         │ Akaun   │ Jumlah    │
│─────────────────┼──────────────┼─────────┼───────────│
│ Ahmad           │ Maybank      │ 1234xx  │ RM 180.00 │
│ Siti            │ CIMB         │ 5678xx  │ RM 120.00 │
│─────────────────┴──────────────┴─────────┴───────────│
│ JUMLAH KESELURUHAN                        RM 300.00  │
└──────────────────────────────────────────────────────┘

[Export CSV]  [Mark All As Paid]
```

**Flow Mark As Paid:**
1. Bos buat bank transfer sendiri (manual)
2. Klik "Mark As Paid" untuk setiap affiliate ATAU "Mark All As Paid"
3. Input: payment reference (rujukan pindahan bank)
4. Confirm → update `payouts` table status → `paid`
5. Update `referrals` status → `paid`
6. Update `affiliates.total_paid`
7. Affiliate nampak status updated dalam dashboard mereka

**Auto-detect tarikh anjak:**
```typescript
// Jika 7hb adalah Sabtu → anjak ke Isnin (9hb)
// Jika 7hb adalah Ahad → anjak ke Isnin (8hb)
// Cuti umum Malaysia — gunakan senarai statik atau library
// Pakai library: @holiday-my/public-holidays
```

### /admin/orders — Manage Orders

Table:
```
Tarikh | Nama Bisnes | Status | Ref Affiliate | Jumlah | Tindakan
```

Filter by status: All / Pending / Preview Ready / Approved / Paid / Live

---

## TRACKING LINK + COOKIE LOGIC

### Middleware (middleware.ts)

```typescript
// Bila ada ?ref= dalam URL mana-mana page
// Set cookie: ref_code, expire 30 hari
// Cookie name: 'ref'

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  const response = NextResponse.next()

  if (ref) {
    response.cookies.set('ref', ref, {
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      httpOnly: true,
      sameSite: 'lax'
    })
  }

  return response
}
```

### Order Form Submit — Attach Ref Code

```typescript
// Bila client submit order form
// Baca cookie 'ref'
// Validate ref_code wujud dalam affiliates table (status: active)
// Save ke orders.affiliate_ref_code
```

### Commission Calculate — Triggered by Payment Webhook

```typescript
// Dalam /api/webhook/toyyibpay
// Selepas payment confirmed:

async function calculateCommission(orderId: string) {
  const order = await getOrder(orderId)

  if (!order.affiliate_ref_code) return
  if (order.commission_calculated) return

  // Hanya kira dari base price RM150
  // EXCLUDE revision fees dan domain fees
  const baseAmount = 150
  const commissionRate = 0.40
  const commissionAmount = baseAmount * commissionRate // RM60

  const affiliate = await getAffiliateByRefCode(order.affiliate_ref_code)
  const earnedMonth = format(new Date(), 'yyyy-MM') // e.g. '2026-05'

  // Insert referral record
  await supabase.from('referrals').insert({
    affiliate_id: affiliate.id,
    order_id: orderId,
    order_amount: baseAmount,
    commission_rate: commissionRate,
    commission_amount: commissionAmount,
    earned_month: earnedMonth,
    status: 'approved'
  })

  // Update affiliate total_earned
  await supabase
    .from('affiliates')
    .update({ total_earned: affiliate.total_earned + commissionAmount })
    .eq('id', affiliate.id)

  // Mark order as commission calculated
  await supabase
    .from('orders')
    .update({ commission_calculated: true })
    .eq('id', orderId)
}
```

---

## COMMISSION RULES

```
Base price        : RM150 sahaja
Commission rate   : 40%
Commission amount : RM60 per order

EXCLUDED dari commission:
- Revision fee (RM50)
- Domain setup fee (RM30)
- Domain tahunan (RM120)

Payout schedule:
- Earned: bulan semasa
- Dibayar: 7hb bulan berikutnya
- Jika 7hb cuti/weekend: anjak ke hari bekerja berikutnya
```

---

## ENVIRONMENT VARIABLES (Tambahan)

```
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_AFFILIATE_COMMISSION_RATE=0.40
NEXT_PUBLIC_BASE_PRICE=150
```

---

## DESIGN (Hallmark System)

```
Font heading : Plus Jakarta Sans
Font body    : DM Sans
Accent       : #F97316
Surface      : #F8F6F1
Text primary : #1C1917
Text muted   : #78716C
```

Status badge colors:
```
pending    → bg: #F5F5F4  text: #78716C  → "Menunggu"
active     → bg: #FFF7ED  text: #EA580C  → "Aktif"
approved   → bg: #FEF9C3  text: #CA8A04  → "Disahkan"
paid       → bg: #F0FDF4  text: #16A34A  → "Dibayar"
suspended  → bg: #FEF2F2  text: #DC2626  → "Digantung"
```

---

## IMPORTANT NOTES

1. **Admin auth** guna `.env` credentials + session cookie — bukan Supabase Auth
2. **Affiliate auth** guna Supabase Auth sepenuhnya
3. **Commission hanya kira RM150** — exclude semua fees lain
4. **Cookie ref** expire 30 hari — client boleh order kemudian, affiliate still dapat commission
5. **Payout tarikh anjak** — implement auto-detect weekend + cuti umum Malaysia
6. **Mark as paid** adalah manual oleh Bos — sistem hanya track dan display
7. **RLS wajib** untuk semua tables — affiliate hanya nampak data sendiri
8. Semua routes `/affiliate/*` redirect ke `/affiliate/login` jika tidak authenticated
9. Semua routes `/admin/*` redirect ke `/admin` jika tidak authenticated
10. Selepas build, run `next build` pastikan tiada error

---

## BUILD ORDER

1. Supabase schema (affiliates, referrals, payouts tables)
2. Middleware — tracking cookie
3. /affiliate/register + login
4. /affiliate/dashboard + referrals + payout + kit
5. Admin auth (session middleware)
6. /admin/affiliates (approve flow)
7. /admin/payouts (mark as paid flow)
8. /admin/orders (dengan kolum ref affiliate)
9. Commission calculate dalam webhook toyyibpay
10. Test end-to-end: register → approve → referral → payment → commission → payout
