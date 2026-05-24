import { NextRequest, NextResponse } from 'next/server'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = supabaseServer()
  const { data: affiliate } = await sb
    .from('affiliates')
    .select('nama, telefon, bank_name, bank_account, bank_holder_name')
    .eq('id', session.user.id)
    .single()

  return NextResponse.json({ affiliate, email: session.user.email })
}

export async function PATCH(req: NextRequest) {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    action: 'bank' | 'password'
    nama?: string
    telefon?: string
    bank_name?: string
    bank_account?: string
    bank_holder_name?: string
    current_password?: string
    new_password?: string
  }

  if (body.action === 'bank') {
    const { nama, telefon, bank_name, bank_account, bank_holder_name } = body
    if (!nama || !telefon || !bank_name || !bank_account || !bank_holder_name) {
      return NextResponse.json({ error: 'Semua medan wajib diisi' }, { status: 400 })
    }
    const sb = supabaseServer()
    const { error } = await sb
      .from('affiliates')
      .update({ nama, telefon, bank_name, bank_account, bank_holder_name })
      .eq('id', session.user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'password') {
    const { current_password, new_password } = body
    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Semua medan wajib diisi' }, { status: 400 })
    }
    if (new_password.length < 8) {
      return NextResponse.json({ error: 'Password baru minimum 8 aksara' }, { status: 400 })
    }
    // Verify current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: current_password,
    })
    if (signInError) {
      return NextResponse.json({ error: 'Password semasa tidak betul' }, { status: 400 })
    }
    const { error } = await supabase.auth.updateUser({ password: new_password })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Tindakan tidak sah' }, { status: 400 })
}
