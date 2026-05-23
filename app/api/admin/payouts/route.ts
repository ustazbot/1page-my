import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month')
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 })

  const sb = supabaseServer()

  const { data: referrals } = await sb
    .from('referrals')
    .select('affiliate_id, commission_amount')
    .eq('earned_month', month)
    .neq('status', 'paid')

  if (!referrals || referrals.length === 0) {
    return NextResponse.json({ payouts: [] })
  }

  // Aggregate commission totals by affiliate
  const totals: Record<string, number> = {}
  for (const r of referrals) {
    totals[r.affiliate_id] = (totals[r.affiliate_id] ?? 0) + Number(r.commission_amount)
  }

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
    affiliate_id?: string
    payout_month?: string
    total_amount?: number
  }

  if (!affiliate_id || !payout_month || total_amount == null) {
    return NextResponse.json({ error: 'affiliate_id, payout_month, total_amount required' }, { status: 400 })
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
