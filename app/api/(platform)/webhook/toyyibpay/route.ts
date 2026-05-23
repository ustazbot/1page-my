import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

async function calculateCommission(orderId: string, supabase: ReturnType<typeof supabaseServer>) {
  const { data: order } = await supabase
    .from('orders')
    .select('affiliate_ref_code, commission_calculated')
    .eq('id', orderId)
    .single()

  if (!order?.affiliate_ref_code || order.commission_calculated) return

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, total_earned, status')
    .eq('ref_code', order.affiliate_ref_code)
    .single()

  if (!affiliate || affiliate.status !== 'active') return

  const baseAmount = 150
  const commissionRate = 0.40
  const commissionAmount = baseAmount * commissionRate

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

export async function POST(req: NextRequest) {
  let body: FormData
  try {
    body = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 })
  }

  const ref    = body.get('billExternalReferenceNo')
  const status = body.get('billpaymentStatus')

  if (typeof ref !== 'string' || typeof status !== 'string' || status !== '1') {
    return NextResponse.json({ ok: false })
  }

  const isRevision = ref.startsWith('REV-')
  const orderId    = isRevision ? ref.slice(4) : ref
  const supabase   = supabaseServer()

  if (isRevision) {
    const { data: order } = await supabase
      .from('orders')
      .select('revision_count, nama_bisnes')
      .eq('id', orderId)
      .single()

    const nextCount = (order?.revision_count ?? 0) + 1

    await supabase
      .from('orders')
      .update({ revision_count: nextCount })
      .eq('id', orderId)

    await sendTelegramMessage(
      `🔧 Revision paid! Revision #${nextCount}\n${order?.nama_bisnes ?? orderId}\nBoleh mulakan edit sekarang.`
    ).catch((err: unknown) => console.error('[webhook] telegram error:', err))

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

    // Commission calculation — fire and forget
    calculateCommission(orderId, supabase).catch(err =>
      console.error('[webhook] commission error:', err)
    )

    if (process.env.CF_DEPLOY_HOOK_URL) {
      await fetch(process.env.CF_DEPLOY_HOOK_URL, { method: 'POST' })
        .catch((err: unknown) => console.error('[webhook] deploy hook error:', err))
    }

    const { data: paid } = await supabase
      .from('orders')
      .select('slug, nama_bisnes')
      .eq('id', orderId)
      .single()

    if (!paid?.slug) {
      await sendTelegramMessage(
        `⚠️ Order ${orderId} paid tapi slug kosong — deploy URL tak boleh dibina.`
      ).catch((err: unknown) => console.error('[webhook] telegram error:', err))
      return NextResponse.json({ ok: true })
    }

    const liveUrl = `${paid.slug}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN}`

    await supabase
      .from('orders')
      .update({ status: 'live', live_url: `https://${liveUrl}` })
      .eq('id', orderId)
    const waMsg   = encodeURIComponent(`🎉 Page anda dah live! https://${liveUrl}`)
    const waLink  = `${process.env.BOS_WHATSAPP_REDIRECT}?text=${waMsg}`

    await sendTelegramMessage(
      `✅ Deploy berjaya!\n${paid.nama_bisnes} → ${liveUrl}\n\nHantar ke client:\n${waLink}`
    ).catch((err: unknown) => console.error('[webhook] telegram error:', err))
  }

  return NextResponse.json({ ok: true })
}
