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

  const sb = supabaseServer()

  const { data: authData, error: authError } = await sb.auth.admin.createUser({
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
  for (let attempts = 0; attempts < 10; attempts++) {
    const { data: existing } = await sb
      .from('affiliates')
      .select('ref_code')
      .eq('ref_code', refCode)
      .single()
    if (!existing) break
    refCode = generateRefCode()
  }

  const { error: insertError } = await sb
    .from('affiliates')
    .insert({
      id: authData.user.id,
      nama,
      telefon,
      bank_name,
      bank_account,
      bank_holder_name,
      ref_code: refCode,
      status: 'active',
    })

  if (insertError) {
    await sb.auth.admin.deleteUser(authData.user.id).catch(() => {})
    return NextResponse.json({ error: 'Gagal simpan maklumat affiliate' }, { status: 500 })
  }

  // Notify admin via Telegram
  const msg = `🤝 Affiliate baru mendaftar!\nNama: ${nama}\nTelefon: ${telefon}\nEmail: ${email}\n\nSila semak di /admin/affiliates`
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID
  if (telegramToken && telegramChatId) {
    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramChatId, text: msg }),
    }).catch((err: unknown) => console.error('[register] telegram error:', err))
  }

  return NextResponse.json({ ok: true, ref_code: refCode })
}
