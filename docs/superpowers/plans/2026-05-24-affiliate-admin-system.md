# Affiliate System + Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete affiliate tracking system + admin dashboard on 1page.my — affiliates register, get a ref link, earn RM60/order commission, and get paid monthly; admin manages approvals and payouts.

**Architecture:** Two separate dashboards under `/affiliate/*` and `/admin/*` sharing the same Next.js app. Affiliate auth uses Supabase Auth; admin auth uses `.env` credentials + a signed cookie session. Commission is triggered by the existing ToyyibPay webhook after payment confirmation. Tracking uses a 30-day `ref` cookie set by Next.js middleware.

**Tech Stack:** Next.js 16 App Router, Supabase JS v2, `@supabase/ssr` (for server-side affiliate auth), inline CSS with Hallmark CSS variables (no Tailwind classes — matches existing codebase pattern)

---

## File Map

**New files:**
- `supabase/migrations/003_affiliate_system.sql` — schema for affiliates, referrals, payouts; orders migration
- `middleware.ts` — ref cookie tracking + /admin/* session guard
- `lib/admin-session.ts` — HMAC-signed admin session cookie helpers
- `lib/affiliate-auth.ts` — server-side Supabase auth helpers + ref code generator
- `lib/payout-date.ts` — calculates payout date adjusting for weekends + MY public holidays
- `app/affiliate/layout.tsx` — Supabase session guard, redirects to `/affiliate/login` if unauthenticated
- `app/affiliate/login/page.tsx` — Supabase sign-in form
- `app/affiliate/register/page.tsx` — registration form (nama, email, telefon, bank details)
- `app/affiliate/dashboard/page.tsx` — stats + ref link
- `app/affiliate/referrals/page.tsx` — table of referral orders + commission status
- `app/affiliate/payout/page.tsx` — payout history table
- `app/affiliate/kit/page.tsx` — ref link + ready-made caption
- `app/admin/layout.tsx` — admin session guard, redirects to `/admin` if unauthenticated
- `app/admin/page.tsx` — admin login form
- `app/admin/orders/page.tsx` — orders table with affiliate ref column
- `app/admin/affiliates/page.tsx` — affiliates table with approve/suspend
- `app/admin/payouts/page.tsx` — monthly payout processor
- `app/admin/settings/page.tsx` — system settings display
- `app/api/affiliate/register/route.ts` — creates auth user + affiliate record + notif
- `app/api/admin/login/route.ts` — validates env creds, sets session cookie
- `app/api/admin/logout/route.ts` — clears session cookie
- `app/api/admin/affiliates/route.ts` — GET list
- `app/api/admin/affiliates/[id]/route.ts` — GET detail, PATCH status
- `app/api/admin/payouts/route.ts` — GET by month, POST create payout
- `app/api/admin/payouts/[id]/route.ts` — PATCH mark as paid
- `app/api/admin/orders/route.ts` — GET orders with affiliate_ref_code

**Modified files:**
- `app/api/(platform)/webhook/toyyibpay/route.ts` — add commission calculation after payment confirmed
- `app/(platform)/order/page.tsx` — read `ref` cookie from document.cookie on form submit

---

## Task 1: Supabase Schema Migration

**Files:**
- Create: `supabase/migrations/003_affiliate_system.sql`

- [ ] **Step 1: Write migration file**

```sql
-- supabase/migrations/003_affiliate_system.sql

-- ── affiliates ──────────────────────────────────────────────────────────────
create table public.affiliates (
  id uuid references auth.users primary key,
  created_at timestamp with time zone default now(),
  nama text not null,
  telefon text not null,
  bank_name text not null,
  bank_account text not null,
  bank_holder_name text not null,
  ref_code text unique not null,
  status text default 'pending',
  total_earned numeric default 0,
  total_paid numeric default 0
);

grant select on public.affiliates to anon;
grant select, insert, update, delete on public.affiliates to authenticated;
grant select, insert, update, delete on public.affiliates to service_role;

alter table public.affiliates enable row level security;

create policy "affiliate_own_record"
  on public.affiliates for all
  using (auth.uid() = id);

-- ── referrals ────────────────────────────────────────────────────────────────
create table public.referrals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  affiliate_id uuid references public.affiliates(id) not null,
  order_id uuid references public.orders(id) not null,
  order_amount numeric not null,
  commission_rate numeric default 0.40,
  commission_amount numeric not null,
  earned_month text not null,
  status text default 'pending',
  paid_at timestamp with time zone,
  payout_id uuid references public.payouts(id)
);

grant select on public.referrals to anon;
grant select, insert, update, delete on public.referrals to authenticated;
grant select, insert, update, delete on public.referrals to service_role;

alter table public.referrals enable row level security;

create policy "affiliate_own_referrals"
  on public.referrals for select
  using (affiliate_id = auth.uid());

-- ── payouts ──────────────────────────────────────────────────────────────────
create table public.payouts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  affiliate_id uuid references public.affiliates(id) not null,
  payout_month text not null,
  total_amount numeric not null,
  status text default 'pending',
  paid_at timestamp with time zone,
  payment_reference text,
  note text
);

grant select on public.payouts to anon;
grant select, insert, update, delete on public.payouts to authenticated;
grant select, insert, update, delete on public.payouts to service_role;

alter table public.payouts enable row level security;

create policy "affiliate_own_payouts"
  on public.payouts for select
  using (affiliate_id = auth.uid());

-- ── orders: add affiliate tracking columns ───────────────────────────────────
alter table public.orders add column if not exists affiliate_ref_code text;
alter table public.orders add column if not exists commission_calculated boolean default false;
```

- [ ] **Step 2: Run migration in Supabase SQL editor**

Copy the SQL above and run it in the Supabase dashboard → SQL Editor. Confirm no errors.

Note: `referrals.payout_id` references `payouts` but `payouts` is defined after. If Supabase rejects forward reference, move the `payout_id` line to an `alter table` after `payouts` is created.

---

## Task 2: Install Dependencies

**Files:**
- No new files — only `package.json`

- [ ] **Step 1: Install packages**

```bash
cd /home/astro/claude-project/1page/1page-my
npm install @supabase/ssr
```

`@supabase/ssr` is needed for server-side Supabase session reading (affiliate layout auth guard + middleware cookie forwarding).

No other packages needed — admin sessions use Web Crypto API (built into Node), holiday detection uses a hardcoded static list.

- [ ] **Step 2: Verify install**

```bash
node -e "require('@supabase/ssr'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @supabase/ssr for server-side affiliate auth"
```

---

## Task 3: Payout Date Calculator

**Files:**
- Create: `lib/payout-date.ts`

- [ ] **Step 1: Write payout date utility**

```typescript
// lib/payout-date.ts
// Malaysian public holidays (statutory) — update annually
// Source: https://www.timeanddate.com/holidays/malaysia/
const MY_HOLIDAYS_2025 = [
  '2025-01-01', '2025-01-29', '2025-01-30',
  '2025-02-01', '2025-03-31', '2025-04-18',
  '2025-05-01', '2025-05-12', '2025-06-02',
  '2025-07-31', '2025-08-31', '2025-09-16',
  '2025-10-20', '2025-10-21', '2025-11-03',
  '2025-12-25',
]

const MY_HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-28', '2026-01-29',
  '2026-03-20', '2026-04-03', '2026-05-01',
  '2026-05-20', '2026-06-01', '2026-07-20',
  '2026-08-31', '2026-09-16', '2026-10-09',
  '2026-10-10', '2026-11-23', '2026-12-25',
]

const ALL_HOLIDAYS = new Set([...MY_HOLIDAYS_2025, ...MY_HOLIDAYS_2026])

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isWeekend(d: Date) {
  const day = d.getDay()
  return day === 0 || day === 6 // Sun=0, Sat=6
}

function isHoliday(d: Date) {
  return ALL_HOLIDAYS.has(toDateStr(d))
}

function isWorkday(d: Date) {
  return !isWeekend(d) && !isHoliday(d)
}

function nextWorkday(d: Date): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + 1)
  while (!isWorkday(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

/**
 * Returns the payout date for a given earned month.
 * Default: 7th of the following month.
 * If 7th is weekend or public holiday, advances to next workday.
 *
 * @param earnedMonth - format 'YYYY-MM', e.g. '2026-05'
 * @returns Date object for the payout date
 */
export function getPayoutDate(earnedMonth: string): Date {
  const [year, month] = earnedMonth.split('-').map(Number)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const seventeenth = new Date(nextYear, nextMonth - 1, 7)

  if (isWorkday(seventeenth)) return seventeenth
  return nextWorkday(seventeenth)
}

/**
 * Formats a Date as Malaysian locale string, e.g. "7 Jun 2026"
 */
export function formatMYDate(d: Date): string {
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Returns current month as 'YYYY-MM'
 */
export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/payout-date.ts
git commit -m "feat: add Malaysian payout date calculator with holiday adjustment"
```

---

## Task 4: Admin Session Utilities

**Files:**
- Create: `lib/admin-session.ts`

- [ ] **Step 1: Write admin session utility**

Admin sessions use HMAC-SHA256 signed cookies. No external packages needed.

```typescript
// lib/admin-session.ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = '__admin_session'
const MAX_AGE = 60 * 60 * 24 // 24 hours in seconds

async function getSecret(): Promise<CryptoKey> {
  const raw = process.env.ADMIN_SESSION_SECRET
  if (!raw) throw new Error('ADMIN_SESSION_SECRET not set')
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw', enc.encode(raw), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

async function sign(payload: string): Promise<string> {
  const key = await getSecret()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Buffer.from(sig).toString('hex')
}

async function verify(payload: string, sig: string): Promise<boolean> {
  const expected = await sign(payload)
  return expected === sig
}

interface AdminSession {
  loggedIn: boolean
  exp: number
}

export async function createAdminSessionCookie(res: NextResponse): Promise<void> {
  const payload = JSON.stringify({ loggedIn: true, exp: Date.now() + MAX_AGE * 1000 })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = await sign(encoded)
  const value = `${encoded}.${sig}`
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true, sameSite: 'lax', maxAge: MAX_AGE, path: '/',
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null

  const [encoded, sig] = raw.split('.')
  if (!encoded || !sig) return null

  const valid = await verify(encoded, sig)
  if (!valid) return null

  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AdminSession
    if (Date.now() > session.exp) return null
    return session
  } catch {
    return null
  }
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const raw = req.cookies.get(COOKIE_NAME)?.value
  if (!raw) return null

  const [encoded, sig] = raw.split('.')
  if (!encoded || !sig) return null

  const valid = await verify(encoded, sig)
  if (!valid) return null

  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AdminSession
    if (Date.now() > session.exp) return null
    return session
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Add env vars to `.env.local`**

```
ADMIN_EMAIL=<your admin email>
ADMIN_PASSWORD=<your admin password>
ADMIN_SESSION_SECRET=<random 32+ char string, e.g. openssl rand -hex 32>
```

- [ ] **Step 3: Commit**

```bash
git add lib/admin-session.ts
git commit -m "feat: add admin HMAC session utilities"
```

---

## Task 5: Affiliate Auth Utilities

**Files:**
- Create: `lib/affiliate-auth.ts`

- [ ] **Step 1: Write affiliate auth utility**

```typescript
// lib/affiliate-auth.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createAffiliateServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          const store = await cookieStore
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options)
          }
        },
      },
    }
  )
}

/**
 * Generates a unique 6-character alphanumeric ref code.
 * Caller must verify uniqueness against the affiliates table.
 */
export function generateRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0,O,1,I)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export type AffiliateRow = {
  id: string
  nama: string
  telefon: string
  bank_name: string
  bank_account: string
  bank_holder_name: string
  ref_code: string
  status: string
  total_earned: number
  total_paid: number
  created_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/affiliate-auth.ts
git commit -m "feat: add affiliate auth server client and ref code generator"
```

---

## Task 6: Next.js Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()

  // 1. Tracking cookie — set ref on any page visit with ?ref=
  const ref = searchParams.get('ref')
  if (ref && /^[A-Z0-9]{6}$/i.test(ref)) {
    response.cookies.set('ref', ref, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  // 2. Admin route protection — all /admin/* except /admin (login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = await getAdminSessionFromRequest(request)
    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // 3. Affiliate route protection — middleware cannot check Supabase session here
  //    (would require @supabase/ssr createServerClient in middleware which needs
  //     special config). Protection is handled in app/affiliate/layout.tsx instead.

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Next.js middleware for ref cookie tracking and admin route guard"
```

---

## Task 7: Affiliate API Routes

**Files:**
- Create: `app/api/affiliate/register/route.ts`

- [ ] **Step 1: Write registration API route**

```typescript
// app/api/affiliate/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { generateRefCode } from '@/lib/affiliate-auth'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    email: string
    password: string
    nama: string
    telefon: string
    bank_name: string
    bank_account: string
    bank_holder_name: string
  }

  const { email, password, nama, telefon, bank_name, bank_account, bank_holder_name } = body

  if (!email || !password || !nama || !telefon || !bank_name || !bank_account || !bank_holder_name) {
    return NextResponse.json({ error: 'Semua medan wajib diisi' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimum 8 aksara' }, { status: 400 })
  }

  const supabase = supabaseServer()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    if (authError?.message?.includes('already registered')) {
      return NextResponse.json({ error: 'Email ini sudah didaftarkan' }, { status: 409 })
    }
    return NextResponse.json({ error: authError?.message ?? 'Gagal mendaftar' }, { status: 500 })
  }

  // Generate unique ref code
  let refCode = generateRefCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('affiliates')
      .select('ref_code')
      .eq('ref_code', refCode)
      .single()
    if (!existing) break
    refCode = generateRefCode()
    attempts++
  }

  // Insert affiliate record
  const { error: insertError } = await supabase
    .from('affiliates')
    .insert({
      id: authData.user.id,
      nama,
      telefon,
      bank_name,
      bank_account,
      bank_holder_name,
      ref_code: refCode,
      status: 'pending',
    })

  if (insertError) {
    // Rollback auth user
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {})
    return NextResponse.json({ error: 'Gagal simpan maklumat affiliate' }, { status: 500 })
  }

  // Notify admin via Telegram (reuse existing pattern)
  const msg = `🤝 Affiliate baru mendaftar!\nNama: ${nama}\nTelefon: ${telefon}\nEmail: ${email}\n\nSila semak di /admin/affiliates`
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID
  if (telegramToken && telegramChatId) {
    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramChatId, text: msg }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, ref_code: refCode })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/affiliate/register/route.ts
git commit -m "feat: add affiliate registration API route"
```

---

## Task 8: Affiliate Layout (Auth Guard)

**Files:**
- Create: `app/affiliate/layout.tsx`

- [ ] **Step 1: Write affiliate layout**

```typescript
// app/affiliate/layout.tsx
import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/affiliate/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F6F1',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Top nav */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e7e5e4',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#1C1917' }}>
          1page.my
        </span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {[
            { href: '/affiliate/dashboard', label: 'Dashboard' },
            { href: '/affiliate/referrals', label: 'Referral' },
            { href: '/affiliate/payout', label: 'Payout' },
            { href: '/affiliate/kit', label: 'Kit' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              fontSize: 13, color: '#78716C', textDecoration: 'none', fontWeight: 500,
            }}>
              {link.label}
            </a>
          ))}
          <a href="/api/affiliate/logout" style={{ fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
            Log Keluar
          </a>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Write affiliate logout API**

Create `app/api/affiliate/logout/route.ts`:

```typescript
// app/api/affiliate/logout/route.ts
import { NextResponse } from 'next/server'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'

export async function GET() {
  const supabase = createAffiliateServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/affiliate/login', process.env.NEXT_PUBLIC_BASE_URL!))
}
```

- [ ] **Step 3: Commit**

```bash
git add app/affiliate/layout.tsx app/api/affiliate/logout/route.ts
git commit -m "feat: add affiliate layout with Supabase auth guard and nav"
```

---

## Task 9: Affiliate Register + Login Pages

**Files:**
- Create: `app/affiliate/register/page.tsx`
- Create: `app/affiliate/login/page.tsx`

- [ ] **Step 1: Write register page**

```typescript
// app/affiliate/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BANKS = ['Maybank', 'CIMB', 'RHB', 'Public Bank', 'Hong Leong Bank', 'AmBank', 'Bank Islam', 'Bank Rakyat', 'BSN', 'OCBC', 'Standard Chartered', 'HSBC']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nama: '', email: '', telefon: '', password: '',
    bank_name: 'Maybank', bank_account: '', bank_holder_name: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Sila tandakan kotak persetujuan'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Ralat berlaku'); return }
      setDone(true)
    } catch {
      setError('Ralat sambungan. Cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1px solid #e7e5e4', borderRadius: 8,
    background: '#fff', color: '#1C1917', outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6,
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#1C1917' }}>
          Permohonan Diterima
        </h2>
        <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.6 }}>
          Permohonan anda sedang disemak. Kami akan maklumkan melalui email apabila akaun anda diaktifkan.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 520, width: '100%' }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1C1917' }}>
          Daftar Affiliate
        </h1>
        <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>
          Daftar dan mula jana komisyen RM60 setiap referral.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={labelStyle}>Nama Penuh</label><input style={inputStyle} value={form.nama} onChange={e => set('nama', e.target.value)} required /></div>
          <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label style={labelStyle}>Nombor Telefon</label><input style={inputStyle} value={form.telefon} onChange={e => set('telefon', e.target.value)} required /></div>
          <div><label style={labelStyle}>Password (min. 8 aksara)</label><input type="password" style={inputStyle} value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} /></div>

          <hr style={{ border: 'none', borderTop: '1px solid #e7e5e4' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Maklumat Bank</p>

          <div>
            <label style={labelStyle}>Nama Bank</label>
            <select style={inputStyle} value={form.bank_name} onChange={e => set('bank_name', e.target.value)}>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Nombor Akaun Bank</label><input style={inputStyle} value={form.bank_account} onChange={e => set('bank_account', e.target.value)} required /></div>
          <div><label style={labelStyle}>Nama Pemilik Akaun</label><input style={inputStyle} value={form.bank_holder_name} onChange={e => set('bank_holder_name', e.target.value)} required /></div>

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#78716C', lineHeight: 1.6 }}>
              Saya faham dan bersetuju dengan terma komisyen: Komisyen yang diperoleh dalam sesuatu bulan akan dibayar pada 7hb bulan berikutnya. Sekiranya 7hb jatuh pada hari cuti umum atau hujung minggu, pembayaran akan dibuat pada hari bekerja yang berikutnya. Pembayaran dibuat melalui pindahan bank ke akaun yang didaftarkan.
            </span>
          </label>

          {error && <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px', background: '#F97316', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {loading ? 'Mendaftar...' : 'Hantar Permohonan'}
          </button>

          <p style={{ fontSize: 13, color: '#78716C', textAlign: 'center' }}>
            Sudah ada akaun?{' '}
            <a href="/affiliate/login" style={{ color: '#F97316', fontWeight: 600 }}>Log Masuk</a>
          </p>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write login page**

```typescript
// app/affiliate/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Email atau password salah')
        return
      }
      router.push('/affiliate/dashboard')
      router.refresh()
    } catch {
      setError('Ralat sambungan. Cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1px solid #e7e5e4', borderRadius: 8,
    background: '#fff', color: '#1C1917', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1C1917' }}>
          Log Masuk Affiliate
        </h1>
        <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>1page.my Affiliate Portal</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px', background: '#F97316', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif', marginTop: 4,
            }}
          >
            {loading ? 'Sedang masuk...' : 'Log Masuk'}
          </button>

          <p style={{ fontSize: 13, color: '#78716C', textAlign: 'center' }}>
            Belum ada akaun?{' '}
            <a href="/affiliate/register" style={{ color: '#F97316', fontWeight: 600 }}>Daftar sekarang</a>
          </p>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/affiliate/register/page.tsx app/affiliate/login/page.tsx
git commit -m "feat: add affiliate register and login pages"
```

---

## Task 10: Affiliate Dashboard Pages

**Files:**
- Create: `app/affiliate/dashboard/page.tsx`
- Create: `app/affiliate/referrals/page.tsx`
- Create: `app/affiliate/payout/page.tsx`
- Create: `app/affiliate/kit/page.tsx`

- [ ] **Step 1: Write dashboard page**

```typescript
// app/affiliate/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'
import type { AffiliateRow } from '@/lib/affiliate-auth'
import { currentMonth } from '@/lib/payout-date'

export default async function DashboardPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: affiliate } = await sb
    .from('affiliates')
    .select('*')
    .eq('id', session.user.id)
    .single() as { data: AffiliateRow | null }

  if (!affiliate) redirect('/affiliate/login')

  const pending = affiliate.total_earned - affiliate.total_paid

  // Referrals this month
  const month = currentMonth()
  const { data: thisMonthRefs } = await sb
    .from('referrals')
    .select('commission_amount')
    .eq('affiliate_id', session.user.id)
    .eq('earned_month', month)

  const thisMonthEarned = (thisMonthRefs ?? []).reduce((s, r) => s + Number(r.commission_amount), 0)
  const thisMonthCount = (thisMonthRefs ?? []).length
  const refLink = `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${affiliate.ref_code}`

  const statusColor: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#F5F5F4', color: '#78716C', label: 'Menunggu Kelulusan' },
    active: { bg: '#FFF7ED', color: '#EA580C', label: 'Aktif' },
    suspended: { bg: '#FEF2F2', color: '#DC2626', label: 'Digantung' },
  }
  const badge = statusColor[affiliate.status] ?? statusColor.pending

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>
            Selamat datang, {affiliate.nama.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: '#78716C' }}>Dashboard Affiliate 1page.my</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>

      {/* Ref link */}
      <RefLinkCard refLink={refLink} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, marginBottom: 28 }}>
        {[
          { label: 'Total Dijana', value: `RM ${affiliate.total_earned.toFixed(2)}` },
          { label: 'Total Dibayar', value: `RM ${affiliate.total_paid.toFixed(2)}` },
          { label: 'Belum Dibayar', value: `RM ${pending.toFixed(2)}`, highlight: pending > 0 },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: `1px solid ${stat.highlight ? 'rgba(249,115,22,0.3)' : '#e7e5e4'}`,
            borderRadius: 10, padding: '20px 18px',
          }}>
            <p style={{ fontSize: 12, color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{stat.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: stat.highlight ? '#F97316' : '#1C1917', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#92400E' }}>
        Bulan ini ({month}): <strong>{thisMonthCount} referral</strong> · <strong>RM {thisMonthEarned.toFixed(2)}</strong> dijana
      </div>
    </div>
  )
}

function RefLinkCard({ refLink }: { refLink: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '18px 20px' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Pautan Referral Anda</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <code style={{ flex: 1, fontSize: 13, color: '#1C1917', background: '#F8F6F1', padding: '8px 12px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {refLink}
        </code>
        {/* Copy button — client component needed */}
        <CopyButton text={refLink} />
      </div>
    </div>
  )
}

// Inline client component for copy button
'use client'
function CopyButton({ text }: { text: string }) {
  // Note: cannot mix 'use client' inline — implement as separate file
  // For now, render a static copy hint
  return (
    <a
      href={`javascript:navigator.clipboard.writeText('${text}')`}
      style={{
        padding: '8px 16px', background: '#F97316', color: '#fff',
        border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
        cursor: 'pointer', textDecoration: 'none', flexShrink: 0,
      }}
      onClick={e => { e.preventDefault(); navigator.clipboard.writeText(text) }}
    >
      Copy
    </a>
  )
}
```

**Note:** The `CopyButton` inline mixing won't work — extract it to `components/affiliate/CopyButton.tsx` as a `'use client'` component, then import into the server page.

```typescript
// components/affiliate/CopyButton.tsx
'use client'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return (
    <button
      onClick={copy}
      style={{
        padding: '8px 16px', background: '#F97316', color: '#fff',
        border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
        cursor: 'pointer', flexShrink: 0, fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {label}
    </button>
  )
}
```

Then in `dashboard/page.tsx`, remove the inline `CopyButton` and import from `@/components/affiliate/CopyButton`.

- [ ] **Step 2: Write referrals page**

```typescript
// app/affiliate/referrals/page.tsx
import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'

type ReferralRow = {
  id: string
  created_at: string
  order_amount: number
  commission_amount: number
  earned_month: string
  status: string
  orders: { nama_bisnes: string } | null
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#F5F5F4', color: '#78716C', label: 'Menunggu' },
  approved: { bg: '#FEF9C3', color: '#CA8A04', label: 'Disahkan' },
  paid:     { bg: '#F0FDF4', color: '#16A34A', label: 'Dibayar' },
}

export default async function ReferralsPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: referrals } = await sb
    .from('referrals')
    .select('*, orders(nama_bisnes)')
    .eq('affiliate_id', session.user.id)
    .order('created_at', { ascending: false }) as { data: ReferralRow[] | null }

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>Referral Saya</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 24 }}>Senarai semua order yang dirujuk oleh anda</p>

      {!referrals || referrals.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e7e5e4', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#78716C' }}>Belum ada referral. Kongsi pautan anda untuk mula menjana komisyen!</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Tarikh', 'Nama Bisnes', 'Jumlah Order', 'Komisyen', 'Bulan', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, i) => {
                const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending
                return (
                  <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>
                      {new Date(r.created_at).toLocaleDateString('ms-MY')}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>
                      {r.orders?.nama_bisnes ?? '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1C1917' }}>
                      RM {Number(r.order_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#F97316' }}>
                      RM {Number(r.commission_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>{r.earned_month}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write payout page**

```typescript
// app/affiliate/payout/page.tsx
import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'
import { getPayoutDate, formatMYDate, currentMonth } from '@/lib/payout-date'

type PayoutRow = {
  id: string
  payout_month: string
  total_amount: number
  status: string
  paid_at: string | null
  payment_reference: string | null
}

export default async function PayoutPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: payouts } = await sb
    .from('payouts')
    .select('*')
    .eq('affiliate_id', session.user.id)
    .order('payout_month', { ascending: false }) as { data: PayoutRow[] | null }

  // Current month pending (not yet in payouts table)
  const month = currentMonth()
  const payoutDate = getPayoutDate(month)
  const { data: pendingRefs } = await sb
    .from('referrals')
    .select('commission_amount')
    .eq('affiliate_id', session.user.id)
    .eq('earned_month', month)
    .neq('status', 'paid')

  const pendingAmount = (pendingRefs ?? []).reduce((s, r) => s + Number(r.commission_amount), 0)

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>Sejarah Payout</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 24 }}>Komisyen bulan semasa akan dibayar pada 7hb bulan berikutnya.</p>

      {pendingAmount > 0 && (
        <div style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#92400E', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>Bulan ini ({month}): <strong>RM {pendingAmount.toFixed(2)}</strong> belum dibayar</span>
          <span>Dijangka dibayar: <strong>{formatMYDate(payoutDate)}</strong></span>
        </div>
      )}

      {!payouts || payouts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e7e5e4', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#78716C' }}>Belum ada rekod payout.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Bulan', 'Jumlah', 'Status', 'Tarikh Bayar', 'Rujukan'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{p.payout_month}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1C1917' }}>RM {Number(p.total_amount).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {p.status === 'paid'
                      ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A' }}>✅ Dibayar</span>
                      : <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FEF9C3', color: '#CA8A04' }}>⏳ Belum</span>
                    }
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('ms-MY') : `Dijangka ${formatMYDate(getPayoutDate(p.payout_month))}`}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C', fontFamily: 'monospace' }}>
                    {p.payment_reference ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write kit page**

```typescript
// app/affiliate/kit/page.tsx
import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'
import { CopyButton } from '@/components/affiliate/CopyButton'

export default async function KitPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: affiliate } = await sb
    .from('affiliates')
    .select('ref_code, nama')
    .eq('id', session.user.id)
    .single()

  const refCode = affiliate?.ref_code ?? ''
  const refLink = `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${refCode}`
  const caption = `Nak landing page untuk bisnes anda?\nProfessional. Siap dalam 24 jam. RM150.\nTengok preview dulu, bayar lepas setuju.\n→ ${refLink}`

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>Kit Pemasaran</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>Gunakan bahan-bahan ini untuk promosi</p>

      {/* Ref link */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Pautan Referral Anda</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <code style={{ flex: 1, fontSize: 13, color: '#F97316', background: '#FFF7ED', padding: '10px 14px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {refLink}
          </code>
          <CopyButton text={refLink} />
        </div>
      </div>

      {/* Caption */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caption Siap Pakai</p>
          <CopyButton text={caption} label="Copy Caption" />
        </div>
        <div style={{ background: '#F8F6F1', borderRadius: 8, padding: '16px 18px' }}>
          <pre style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif' }}>
            {caption}
          </pre>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/affiliate/dashboard/page.tsx app/affiliate/referrals/page.tsx app/affiliate/payout/page.tsx app/affiliate/kit/page.tsx components/affiliate/CopyButton.tsx
git commit -m "feat: add affiliate dashboard, referrals, payout and kit pages"
```

---

## Task 11: Admin Login + Layout

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`

- [ ] **Step 1: Write admin login API**

```typescript
// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email?: string; password?: string }

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Kredensial tidak sah' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  await createAdminSessionCookie(res)
  return res
}
```

- [ ] **Step 2: Write admin logout API**

```typescript
// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server'
import { clearAdminSessionCookie } from '@/lib/admin-session'

export async function GET() {
  const res = NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_BASE_URL!))
  clearAdminSessionCookie(res)
  return res
}
```

- [ ] **Step 3: Write admin login page**

```typescript
// app/admin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Log masuk gagal'); return }
      router.push('/admin/orders')
      router.refresh()
    } catch {
      setError('Ralat sambungan')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1px solid #e7e5e4', borderRadius: 8,
    background: '#fff', color: '#1C1917', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1' }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 400, width: '100%', margin: 24 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>
          Admin 1page.my
        </h1>
        <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>Log masuk untuk mengurus sistem</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '11px 24px', background: '#1C1917', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}
          >
            {loading ? 'Masuk...' : 'Log Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write admin layout**

```typescript
// app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-session'
import { headers } from 'next/headers'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Don't guard the login page itself (app/admin/page.tsx is the login)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isLoginPage = pathname === '/admin' || pathname === ''

  if (!isLoginPage) {
    const session = await getAdminSession()
    if (!session) redirect('/admin')
  }

  const NAV = [
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/affiliates', label: 'Affiliates' },
    { href: '/admin/payouts', label: 'Payouts' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', fontFamily: 'DM Sans, sans-serif' }}>
      <nav style={{ background: '#1C1917', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>
          1page.my Admin
        </span>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>
              {n.label}
            </a>
          ))}
          <a href="/api/admin/logout" style={{ fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
            Log Keluar
          </a>
        </div>
      </nav>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
```

**Note on layout guard:** The `x-pathname` approach requires middleware to forward the header. Simpler alternative: move auth check to each admin page individually, or use the middleware (already handles this for all routes except `/admin`). The layout only needs to render the nav shell — auth is already enforced by middleware. Remove the `if (!isLoginPage)` guard from the layout and rely solely on middleware.

Revised cleaner layout:

```typescript
// app/admin/layout.tsx (simplified — auth via middleware only)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const NAV = [
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/affiliates', label: 'Affiliates' },
    { href: '/admin/payouts', label: 'Payouts' },
    { href: '/admin/settings', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', fontFamily: 'DM Sans, sans-serif' }}>
      <nav style={{ background: '#1C1917', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>
          1page.my Admin
        </span>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>
              {n.label}
            </a>
          ))}
          <a href="/api/admin/logout" style={{ fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
            Log Keluar
          </a>
        </div>
      </nav>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
```

The login page (`app/admin/page.tsx`) renders its own full-page layout (no shared nav needed) — but with a shared layout, the nav will show on the login page too. Fix: exclude the nav for the login page using a client slot wrapper, OR move the login page outside the admin route group. Simplest fix: wrap nav in a conditional using a `LoginCheck` client component that hides nav on `/admin` exactly.

Simplest approach: login page is at `/admin` which uses the layout. Middleware skips `/admin` route (it's the login page). So the layout shows the nav even on the login page. To fix: make the admin login route outside the layout by using a route group:

```
app/
  admin/
    (auth)/           ← no layout
      page.tsx        ← this is /admin (login)
    (dashboard)/      ← uses AdminLayout
      layout.tsx
      orders/page.tsx
      affiliates/page.tsx
      payouts/page.tsx
      settings/page.tsx
```

This is cleaner. Use this structure in implementation.

- [ ] **Step 5: Commit**

```bash
git add app/admin/ app/api/admin/
git commit -m "feat: add admin login page, layout, login/logout API routes"
```

---

## Task 12: Admin API Routes

**Files:**
- Create: `app/api/admin/affiliates/route.ts`
- Create: `app/api/admin/affiliates/[id]/route.ts`
- Create: `app/api/admin/payouts/route.ts`
- Create: `app/api/admin/payouts/[id]/route.ts`
- Create: `app/api/admin/orders/route.ts`

All admin API routes check admin session first.

- [ ] **Step 1: Write affiliates list API**

```typescript
// app/api/admin/affiliates/route.ts
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = supabaseServer()
  // Join with auth.users to get email — use service role to access auth schema
  const { data, error } = await sb
    .from('affiliates')
    .select('*, auth_users:id(email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ affiliates: data ?? [] })
}
```

**Note:** `auth.users` is not directly joinable via PostgREST. Use a Postgres function or fetch emails separately using `supabase.auth.admin.listUsers()`.

Revised:

```typescript
// app/api/admin/affiliates/route.ts
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = supabaseServer()
  const { data: affiliates, error } = await sb
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get emails from auth.users
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of usersData?.users ?? []) {
    emailMap[u.id] = u.email ?? ''
  }

  const result = (affiliates ?? []).map(a => ({
    ...a,
    email: emailMap[a.id] ?? '',
  }))

  return NextResponse.json({ affiliates: result })
}
```

- [ ] **Step 2: Write affiliate detail + status update API**

```typescript
// app/api/admin/affiliates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = supabaseServer()

  const { data: affiliate, error } = await sb
    .from('affiliates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: referrals } = await sb
    .from('referrals')
    .select('*')
    .eq('affiliate_id', id)
    .order('created_at', { ascending: false })

  const { data: userData } = await sb.auth.admin.getUserById(id)

  return NextResponse.json({
    affiliate: { ...affiliate, email: userData?.user?.email ?? '' },
    referrals: referrals ?? [],
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json() as { status: string }

  if (!['active', 'suspended', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak sah' }, { status: 400 })
  }

  const sb = supabaseServer()
  const { error } = await sb.from('affiliates').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email notification when approved (status → active)
  // Supabase does not have built-in transactional email for custom events.
  // Use Resend/SendGrid or Telegram notification as fallback.
  if (status === 'active') {
    const { data: userData } = await sb.auth.admin.getUserById(id)
    const { data: affiliate } = await sb.from('affiliates').select('nama').eq('id', id).single()
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (telegramToken && chatId) {
      fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ Affiliate diluluskan: ${affiliate?.nama ?? id} (${userData?.user?.email ?? ''})`,
        }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Write payouts API**

```typescript
// app/api/admin/payouts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month')
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 })

  const sb = supabaseServer()

  // Affiliates with unpaid referrals in this month
  const { data: referrals } = await sb
    .from('referrals')
    .select('affiliate_id, commission_amount')
    .eq('earned_month', month)
    .neq('status', 'paid')

  if (!referrals || referrals.length === 0) {
    return NextResponse.json({ payouts: [] })
  }

  // Aggregate by affiliate
  const totals: Record<string, number> = {}
  for (const r of referrals) {
    totals[r.affiliate_id] = (totals[r.affiliate_id] ?? 0) + Number(r.commission_amount)
  }

  // Get affiliate details
  const affiliateIds = Object.keys(totals)
  const { data: affiliates } = await sb
    .from('affiliates')
    .select('id, nama, bank_name, bank_account, bank_holder_name')
    .in('id', affiliateIds)

  const result = (affiliates ?? []).map(a => ({
    affiliate_id: a.id,
    nama: a.nama,
    bank_name: a.bank_name,
    bank_account: a.bank_account,
    bank_holder_name: a.bank_holder_name,
    total_amount: totals[a.id] ?? 0,
  }))

  return NextResponse.json({ payouts: result })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { affiliate_id, payout_month, total_amount } = await req.json() as {
    affiliate_id: string
    payout_month: string
    total_amount: number
  }

  const sb = supabaseServer()
  const { data: payout, error } = await sb
    .from('payouts')
    .insert({ affiliate_id, payout_month, total_amount, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payout })
}
```

- [ ] **Step 4: Write payout mark-as-paid API**

```typescript
// app/api/admin/payouts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { payment_reference, note } = await req.json() as { payment_reference?: string; note?: string }

  if (!payment_reference) {
    return NextResponse.json({ error: 'payment_reference wajib diisi' }, { status: 400 })
  }

  const sb = supabaseServer()

  // Get payout record
  const { data: payout, error: fetchErr } = await sb
    .from('payouts')
    .select('affiliate_id, payout_month, total_amount')
    .eq('id', id)
    .single()

  if (fetchErr || !payout) return NextResponse.json({ error: 'Payout tidak dijumpai' }, { status: 404 })

  const paidAt = new Date().toISOString()

  // 1. Update payout status
  await sb.from('payouts').update({ status: 'paid', paid_at: paidAt, payment_reference, note }).eq('id', id)

  // 2. Update referrals for this affiliate + month → paid
  await sb
    .from('referrals')
    .update({ status: 'paid', paid_at: paidAt, payout_id: id })
    .eq('affiliate_id', payout.affiliate_id)
    .eq('earned_month', payout.payout_month)
    .neq('status', 'paid')

  // 3. Update affiliate.total_paid
  const { data: affiliate } = await sb
    .from('affiliates')
    .select('total_paid')
    .eq('id', payout.affiliate_id)
    .single()

  if (affiliate) {
    await sb
      .from('affiliates')
      .update({ total_paid: Number(affiliate.total_paid) + Number(payout.total_amount) })
      .eq('id', payout.affiliate_id)
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Write admin orders API**

```typescript
// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status')
  const sb = supabaseServer()

  let query = sb
    .from('orders')
    .select('id, created_at, nama_bisnes, status, affiliate_ref_code, toyyibpay_amount, slug')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data ?? [] })
}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/
git commit -m "feat: add all admin API routes (affiliates, payouts, orders)"
```

---

## Task 13: Admin Dashboard Pages

**Files:**
- Create: `app/admin/orders/page.tsx`
- Create: `app/admin/affiliates/page.tsx`
- Create: `app/admin/payouts/page.tsx`
- Create: `app/admin/settings/page.tsx`

- [ ] **Step 1: Write admin orders page**

```typescript
// app/admin/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: string
  created_at: string
  nama_bisnes: string
  status: string
  affiliate_ref_code: string | null
  toyyibpay_amount: number | null
  slug: string | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', preview_ready: 'Preview Sedia', approved: 'Diluluskan',
  paid: 'Paid', live: 'Live',
}

const FILTERS = ['all', 'pending', 'preview_ready', 'approved', 'paid', 'live']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/orders?status=${filter}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 20 }}>
        Orders
      </h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `1px solid ${filter === f ? '#F97316' : '#e7e5e4'}`,
              background: filter === f ? '#FFF7ED' : '#fff',
              color: filter === f ? '#F97316' : '#78716C',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {STATUS_LABELS[f] ?? f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Tarikh', 'Nama Bisnes', 'Status', 'Ref Affiliate', 'Jumlah', 'Slug'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#78716C', fontSize: 13 }}>Tiada order</td></tr>
              ) : orders.map((o, i) => (
                <tr key={o.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C' }}>{new Date(o.created_at).toLocaleDateString('ms-MY')}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{o.nama_bisnes}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#F5F5F4', color: '#78716C' }}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: o.affiliate_ref_code ? '#F97316' : '#78716C', fontFamily: 'monospace', fontWeight: o.affiliate_ref_code ? 700 : 400 }}>
                    {o.affiliate_ref_code ?? '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#1C1917' }}>
                    {o.toyyibpay_amount ? `RM ${Number(o.toyyibpay_amount).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', fontFamily: 'monospace' }}>{o.slug ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write admin affiliates page**

```typescript
// app/admin/affiliates/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Affiliate = {
  id: string
  nama: string
  email: string
  telefon: string
  ref_code: string
  status: string
  total_earned: number
  total_paid: number
  created_at: string
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#F5F5F4', color: '#78716C', label: 'Pending' },
  active:    { bg: '#FFF7ED', color: '#EA580C', label: 'Aktif' },
  suspended: { bg: '#FEF2F2', color: '#DC2626', label: 'Digantung' },
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/affiliates')
      .then(r => r.json())
      .then(d => { setAffiliates(d.affiliates ?? []); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: string) {
    setActionId(id)
    try {
      await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 20 }}>
        Affiliates
      </h1>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Nama', 'Email', 'Telefon', 'Ref Code', 'Daftar', 'Status', 'Dijana', 'Tindakan'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#78716C', fontSize: 13 }}>Tiada affiliate</td></tr>
              ) : affiliates.map((a, i) => {
                const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.pending
                const isActing = actionId === a.id
                return (
                  <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{a.nama}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C' }}>{a.email}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C' }}>{a.telefon}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#F97316', fontFamily: 'monospace', fontWeight: 700 }}>{a.ref_code}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C' }}>{new Date(a.created_at).toLocaleDateString('ms-MY')}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>{badge.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1C1917' }}>RM {Number(a.total_earned).toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {a.status !== 'active' && (
                        <button
                          onClick={() => updateStatus(a.id, 'active')}
                          disabled={isActing}
                          style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: '#FFF7ED', color: '#EA580C', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                        >
                          Approve
                        </button>
                      )}
                      {a.status !== 'suspended' && (
                        <button
                          onClick={() => updateStatus(a.id, 'suspended')}
                          disabled={isActing}
                          style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write admin payouts page**

```typescript
// app/admin/payouts/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPayoutDate, formatMYDate } from '@/lib/payout-date'

type PayoutLine = {
  affiliate_id: string
  nama: string
  bank_name: string
  bank_account: string
  bank_holder_name: string
  total_amount: number
  payout_id?: string
}

// Generate last 6 months as options
function getMonthOptions() {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export default function AdminPayoutsPage() {
  const months = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(months[1]) // previous month
  const [payouts, setPayouts] = useState<PayoutLine[]>([])
  const [loading, setLoading] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [paymentRef, setPaymentRef] = useState<Record<string, string>>({})

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/payouts?month=${selectedMonth}`)
      .then(r => r.json())
      .then(d => { setPayouts(d.payouts ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedMonth])

  useEffect(() => { load() }, [load])

  async function createAndMarkPaid(line: PayoutLine) {
    const ref = paymentRef[line.affiliate_id]
    if (!ref) { alert('Masukkan rujukan pindahan bank terlebih dahulu'); return }

    setMarkingId(line.affiliate_id)
    try {
      // Create payout record first
      const createRes = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: line.affiliate_id,
          payout_month: selectedMonth,
          total_amount: line.total_amount,
        }),
      })
      const { payout } = await createRes.json() as { payout?: { id: string } }
      if (!payout?.id) throw new Error('Gagal buat rekod payout')

      // Mark as paid
      await fetch(`/api/admin/payouts/${payout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_reference: ref }),
      })

      alert(`Payout untuk ${line.nama} ditanda sebagai dibayar.`)
      load()
    } catch (err) {
      alert('Gagal proses payout')
    } finally {
      setMarkingId(null)
    }
  }

  const payoutDate = formatMYDate(getPayoutDate(selectedMonth))
  const total = payouts.reduce((s, p) => s + Number(p.total_amount), 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917' }}>
          Proses Payout
        </h1>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #e7e5e4', borderRadius: 8, background: '#fff', color: '#1C1917', cursor: 'pointer' }}
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#92400E' }}>
        Tarikh bayar untuk komisyen <strong>{selectedMonth}</strong>: <strong>{payoutDate}</strong>
      </div>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
      ) : payouts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e7e5e4', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#78716C' }}>Tiada komisyen tertunggak untuk bulan ini.</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F6F1' }}>
                  {['Nama Affiliate', 'Bank', 'Akaun', 'Pemilik Akaun', 'Jumlah', 'Rujukan Bank', 'Tindakan'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={p.affiliate_id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{p.nama}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>{p.bank_name}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C', fontFamily: 'monospace' }}>{p.bank_account}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>{p.bank_holder_name}</td>
                    <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: '#1C1917' }}>RM {Number(p.total_amount).toFixed(2)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        placeholder="TRF-001"
                        value={paymentRef[p.affiliate_id] ?? ''}
                        onChange={e => setPaymentRef(prev => ({ ...prev, [p.affiliate_id]: e.target.value }))}
                        style={{ padding: '6px 10px', fontSize: 12, border: '1px solid #e7e5e4', borderRadius: 6, width: 100, fontFamily: 'monospace' }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => createAndMarkPaid(p)}
                        disabled={markingId === p.affiliate_id}
                        style={{ padding: '6px 14px', fontSize: 11, fontWeight: 600, background: '#F0FDF4', color: '#16A34A', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {markingId === p.affiliate_id ? '...' : '✓ Mark Paid'}
                      </button>
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #e7e5e4', background: '#F8F6F1' }}>
                  <td colSpan={4} style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1C1917' }}>JUMLAH KESELURUHAN</td>
                  <td style={{ padding: '12px 14px', fontSize: 16, fontWeight: 700, color: '#F97316' }}>RM {total.toFixed(2)}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write admin settings page**

```typescript
// app/admin/settings/page.tsx
export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 20 }}>
        Tetapan Sistem
      </h1>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: 24 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {[
              ['Kadar Komisyen', '40% (RM60 per order)'],
              ['Harga Asas', 'RM150'],
              ['Jadual Payout', '7hb bulan berikutnya (anjak jika cuti/weekend)'],
              ['Pengecualian Komisyen', 'Revision fee (RM50), Domain fee (RM30), Domain tahunan (RM120)'],
              ['Cookie Tracking', '30 hari (httpOnly, sameSite: lax)'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f5f5f4' }}>
                <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 600, color: '#44403C', width: 200 }}>{label}</td>
                <td style={{ padding: '12px 0', fontSize: 13, color: '#78716C' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin orders, affiliates, payouts, and settings pages"
```

---

## Task 14: Commission Calculation in ToyyibPay Webhook

**Files:**
- Modify: `app/api/(platform)/webhook/toyyibpay/route.ts`

- [ ] **Step 1: Add commission calculation function**

Add this function to the webhook file, and call it after the order is marked `paid`:

```typescript
// Add after the imports at the top of route.ts:
import { format } from 'date-fns' // no import needed — use native Date

// Add this function before the POST handler:
async function calculateCommission(orderId: string, supabase: ReturnType<typeof supabaseServer>) {
  const { data: order } = await supabase
    .from('orders')
    .select('affiliate_ref_code, commission_calculated')
    .eq('id', orderId)
    .single()

  if (!order?.affiliate_ref_code || order.commission_calculated) return

  // Validate affiliate is active
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, total_earned, status')
    .eq('ref_code', order.affiliate_ref_code)
    .single()

  if (!affiliate || affiliate.status !== 'active') return

  const baseAmount = 150
  const commissionRate = 0.40
  const commissionAmount = baseAmount * commissionRate // RM60

  const now = new Date()
  const earnedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  await supabase.from('referrals').insert({
    affiliate_id: affiliate.id,
    order_id: orderId,
    order_amount: baseAmount,
    commission_rate: commissionRate,
    commission_amount: commissionAmount,
    earned_month: earnedMonth,
    status: 'approved',
  })

  await supabase
    .from('affiliates')
    .update({ total_earned: Number(affiliate.total_earned) + commissionAmount })
    .eq('id', affiliate.id)

  await supabase
    .from('orders')
    .update({ commission_calculated: true })
    .eq('id', orderId)
}
```

- [ ] **Step 2: Call `calculateCommission` in the payment success branch**

In the existing `POST` handler, inside the `else` block (non-revision payment), after marking the order as `paid` and before or after the Telegram notification:

```typescript
// After: await supabase.from('orders').update({ status: 'paid', ... })
// Add:
await calculateCommission(orderId, supabase)
```

Full modified `else` block (showing only the relevant insertion point):

```typescript
} else {
  const { error: payErr } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_ref: ref,
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (payErr) {
    console.error('[webhook] mark paid failed:', payErr)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  // Commission calculation — fire and forget, do not block response
  calculateCommission(orderId, supabase).catch(err =>
    console.error('[webhook] commission error:', err)
  )

  // ... rest of existing code unchanged
```

- [ ] **Step 3: Commit**

```bash
git add app/api/\(platform\)/webhook/toyyibpay/route.ts
git commit -m "feat: add affiliate commission calculation to payment webhook"
```

---

## Task 15: Order Form — Attach Ref Code

**Files:**
- Modify: `app/(platform)/order/page.tsx`

- [ ] **Step 1: Read ref cookie and include in order submission**

Find the form submission handler in `order/page.tsx`. The form submits to Supabase directly or via an API route. Find where the order is inserted and add the `affiliate_ref_code`.

The order form likely uses `supabaseBrowser()` to insert directly. Read the cookie from `document.cookie`:

```typescript
// Add this utility near the top of the component (or as a standalone function):
function getRefCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)ref=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}
```

Then in the form submit handler, include `affiliate_ref_code`:

```typescript
// Before the supabase insert:
const refCode = getRefCookie()

// In the insert payload, add:
affiliate_ref_code: refCode ?? null,
```

**Note:** The `ref` cookie is `httpOnly: true`, meaning it CANNOT be read by JavaScript (`document.cookie`). This is a conflict in the spec — httpOnly cookies prevent JS access.

**Fix:** Change the cookie to NOT be httpOnly so the order form (client-side) can read it:

```typescript
// In middleware.ts, change:
response.cookies.set('ref', ref, {
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: false,  // ← must be false for JS to read it
  sameSite: 'lax',
  path: '/',
})
```

Alternatively, create a server API route to read the cookie server-side and return the ref code. This is more secure but requires an extra round-trip.

The simpler approach: set `httpOnly: false` in middleware. The ref code is not sensitive (it's a public identifier used in URLs already).

- [ ] **Step 2: Locate the submit handler in order/page.tsx and apply the change**

Read the file, find the submit handler, add `getRefCookie()` and include in the insert payload.

- [ ] **Step 3: Commit**

```bash
git add app/\(platform\)/order/page.tsx middleware.ts
git commit -m "feat: attach affiliate ref_code to new orders from cookie"
```

---

## Task 16: Build Verification

- [ ] **Step 1: Run TypeScript check**

```bash
cd /home/astro/claude-project/1page/1page-my
npx tsc --noEmit
```

Expected: no errors. Fix any type errors before proceeding.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: successful build with all routes listed. Fix any build errors.

- [ ] **Step 3: Common issues to check**

- `app/affiliate/layout.tsx` — `createAffiliateServerClient()` uses `cookies()` from `next/headers`. In Next.js 16, `cookies()` returns a `Promise` (async API). Ensure all `cookieStore` accesses are `await`ed.
- Admin layout wraps the login page — the nav will show on the login page. Restructure into `(auth)` and `(dashboard)` route groups to separate them.
- `app/api/admin/payouts/route.ts` imports `getPayoutDate` from `@/lib/payout-date` — only needed for display, not for the API. Remove unused imports.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: affiliate system + admin dashboard complete — build verified"
```

---

## Spec Coverage Check

| Spec Requirement | Covered By |
|---|---|
| affiliates table + RLS | Task 1 |
| referrals table + RLS | Task 1 |
| payouts table + RLS | Task 1 |
| orders: add affiliate_ref_code, commission_calculated | Task 1 |
| ref cookie tracking (30 days) | Task 6 |
| /affiliate/register | Task 9 |
| /affiliate/login | Task 9 |
| /affiliate/dashboard (stats, ref link) | Task 10 |
| /affiliate/referrals (table + badges) | Task 10 |
| /affiliate/payout (history + expected date) | Task 10 |
| /affiliate/kit (link + caption + copy) | Task 10 |
| /admin login (.env credentials) | Task 11 |
| /admin/orders (with affiliate_ref column) | Task 13 |
| /admin/affiliates (approve/suspend) | Task 13 |
| /admin/payouts (mark as paid flow) | Task 13 |
| /admin/settings | Task 13 |
| Admin auth session cookie 24h | Task 4 |
| Affiliate auth Supabase | Tasks 5, 8, 9 |
| Commission 40% × RM150 = RM60 | Task 14 |
| Commission calculated in webhook | Task 14 |
| Payout date: 7th, adjust weekend/holiday | Task 3 |
| Hallmark design (fonts, colors, badges) | All pages |
| WhatsApp/Telegram notif on register | Task 7 |
| RLS: affiliate sees own data only | Task 1 |
| Route protection /affiliate/* | Task 8 (layout) |
| Route protection /admin/* | Task 6 (middleware) |
| Order form attach ref_code | Task 15 |
