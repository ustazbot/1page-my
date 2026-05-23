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

  const { data: payout, error: fetchErr } = await sb
    .from('payouts')
    .select('affiliate_id, payout_month, total_amount')
    .eq('id', id)
    .single()

  if (fetchErr || !payout) return NextResponse.json({ error: 'Payout tidak dijumpai' }, { status: 404 })

  const paidAt = new Date().toISOString()

  // Update payout record
  await sb.from('payouts').update({ status: 'paid', paid_at: paidAt, payment_reference, note }).eq('id', id)

  // Mark referrals as paid
  await sb
    .from('referrals')
    .update({ status: 'paid', paid_at: paidAt, payout_id: id })
    .eq('affiliate_id', payout.affiliate_id)
    .eq('earned_month', payout.payout_month)
    .neq('status', 'paid')

  // Update affiliate.total_paid
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
