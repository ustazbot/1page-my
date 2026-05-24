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
  const { status } = await req.json() as { status?: string }

  if (!status || !['active', 'suspended', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak sah' }, { status: 400 })
  }

  const sb = supabaseServer()
  const { error } = await sb.from('affiliates').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send Telegram notification when approved
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
      }).catch((err: unknown) => console.error('[admin] telegram error:', err))
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = supabaseServer()

  // Delete referrals first (FK constraint)
  await sb.from('referrals').delete().eq('affiliate_id', id)

  // Delete affiliate record
  const { error } = await sb.from('affiliates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Delete auth user
  await sb.auth.admin.deleteUser(id).catch((err: unknown) => console.error('[admin] delete user error:', err))

  return NextResponse.json({ ok: true })
}
