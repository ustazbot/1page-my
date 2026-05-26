import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabaseServer()
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })
  return NextResponse.json({ order: data })
}

function buildWhatsAppText(preview_url: string, bill_code: string): string {
  return `Salam dari 1page.my\nPreview page anda dah siap!\nBoleh tengok preview di sini:\n${preview_url}\n\nJika setuju, sila buat bayaran RM150 di pautan ini untuk aktifkan page anda:\nhttps://toyyibpay.com/${bill_code}\n\nAda soalan? Balas WhatsApp ini ya 😊`
}

async function createToyyibPayBill(order: {
  id: string
  nama_bisnes: string
  nama_owner: string
  whatsapp: string
  email: string | null
}): Promise<string> {
  const body = new URLSearchParams({
    userSecretKey: process.env.TOYYIBPAY_API_KEY!,
    categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE!,
    billName: order.nama_bisnes.slice(0, 30),
    billDescription: 'Landing page 1page.my',
    billPriceSetting: '0',
    billPayorInfo: '1',
    billAmount: '15000',
    billReturnUrl: 'https://1page.my/',
    billCallbackUrl: 'https://1page.my/api/webhook/toyyibpay',
    billExternalReferenceNo: order.id,
    billTo: order.nama_owner,
    billPhone: order.whatsapp,
  })
  if (order.email) body.set('billEmail', order.email)

  const res = await fetch('https://toyyibpay.com/index.php/api/createBill', {
    method: 'POST',
    body,
  })
  const json = await res.json()
  if (!Array.isArray(json) || !json[0]?.BillCode) {
    throw new Error(`ToyyibPay gagal jana bill: ${JSON.stringify(json)}`)
  }
  return json[0].BillCode as string
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: { action: string; slug?: string; preview_url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah.' }, { status: 400 })
  }
  const sb = supabaseServer()

  // ── ACTION: set_preview ──────────────────────────────────────────────────
  if (body.action === 'set_preview') {
    const { slug } = body
    const preview_url = `https://${slug}.1page.my`

    if (!slug) {
      return NextResponse.json({ error: 'Slug diperlukan' }, { status: 400 })
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug hanya boleh mengandungi huruf kecil, nombor, dan tanda -' },
        { status: 400 }
      )
    }

    // Check slug uniqueness — ignore current order
    const { data: existing } = await sb
      .from('orders')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Slug sudah digunakan oleh order lain' }, { status: 409 })
    }

    // Get order for ToyyibPay
    const { data: order, error: fetchErr } = await sb
      .from('orders')
      .select('nama_bisnes, nama_owner, whatsapp, email')
      .eq('id', id)
      .single()
    if (fetchErr) {
      console.error('[orders/patch] fetch error:', fetchErr)
      return NextResponse.json({ error: 'Ralat dalaman' }, { status: 500 })
    }
    if (!order) return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })

    // Create ToyyibPay bill
    let bill_code: string
    try {
      bill_code = await createToyyibPayBill({ id, ...order })
    } catch (err) {
      console.error('[orders/patch] toyyibpay error:', err)
      return NextResponse.json({ error: 'Gagal jana bill ToyyibPay. Cuba lagi.' }, { status: 502 })
    }

    // Update order
    const { error: updateErr } = await sb.from('orders').update({
      slug,
      preview_url,
      toyyibpay_bill_code: bill_code,
      toyyibpay_amount: 150,
      status: 'preview_ready',
    }).eq('id', id)

    if (updateErr) {
      console.error('[orders/patch] update error:', updateErr)
      return NextResponse.json({ error: 'Gagal kemaskini order' }, { status: 500 })
    }

    await sendTelegramMessage(
      `📋 Preview siap!\n${order.nama_bisnes} — ${order.whatsapp}\nSlug: ${slug}.1page.my\nPreview: ${preview_url}\nBill: https://toyyibpay.com/${bill_code}`
    ).catch((err: unknown) => console.error('[orders/patch] telegram error:', err))

    return NextResponse.json({
      ok: true,
      bill_code,
      whatsapp_text: buildWhatsAppText(preview_url, bill_code),
    })
  }

  // ── ACTION: mark_live ────────────────────────────────────────────────────
  if (body.action === 'mark_live') {
    const { data: order, error: fetchErr } = await sb
      .from('orders')
      .select('slug, nama_bisnes')
      .eq('id', id)
      .single()
    if (fetchErr) {
      console.error('[orders/patch] fetch error:', fetchErr)
      return NextResponse.json({ error: 'Ralat dalaman' }, { status: 500 })
    }
    if (!order) return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })
    if (!order.slug) return NextResponse.json({ error: 'Slug belum ditetapkan' }, { status: 400 })

    const live_url = `https://${order.slug}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN ?? '1page.my'}`

    const { error: updateErr } = await sb.from('orders').update({
      status: 'live',
      live_url,
    }).eq('id', id)

    if (updateErr) return NextResponse.json({ error: 'Gagal kemaskini order' }, { status: 500 })

    await sendTelegramMessage(
      `✅ Live (manual)!\n${order.nama_bisnes} → ${live_url}`
    ).catch((err: unknown) => console.error('[orders/patch] telegram error:', err))

    return NextResponse.json({ ok: true, live_url })
  }

  return NextResponse.json({ error: 'Action tidak dikenali' }, { status: 400 })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseServer()
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[orders/delete] error:', error)
    return NextResponse.json({ error: 'Gagal padam order' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
