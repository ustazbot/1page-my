import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  let body: FormData
  try {
    body = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 })
  }

  const ref    = body.get('billExternalReferenceNo') as string | null
  const status = body.get('billpaymentStatus') as string | null

  if (!ref || status !== '1') {
    return NextResponse.json({ ok: false })
  }

  const isRevision = ref.startsWith('REV-')
  const orderId    = isRevision ? ref.replace('REV-', '') : ref
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
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_ref: ref,
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    await fetch(process.env.CF_DEPLOY_HOOK_URL!, { method: 'POST' })
      .catch((err: unknown) => console.error('[webhook] deploy hook error:', err))

    const { data: paid } = await supabase
      .from('orders')
      .select('slug, nama_bisnes')
      .eq('id', orderId)
      .single()

    await supabase
      .from('orders')
      .update({ status: 'live' })
      .eq('id', orderId)

    const liveUrl = `${paid?.slug}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN}`
    const waMsg   = encodeURIComponent(`🎉 Page anda dah live! https://${liveUrl}`)
    const waLink  = `${process.env.BOS_WHATSAPP_REDIRECT}?text=${waMsg}`

    await sendTelegramMessage(
      `✅ Deploy berjaya!\n${paid?.nama_bisnes} → ${liveUrl}\n\nHantar ke client:\n${waLink}`
    ).catch((err: unknown) => console.error('[webhook] telegram error:', err))
  }

  return NextResponse.json({ ok: true })
}
