import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const { slug } = body

  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const supabase = supabaseServer()

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ status: 'approved' })
    .eq('slug', slug)
    .eq('status', 'preview_ready')
    .select('id')

  if (error) {
    console.error('[client-preview/approve] update error:', error)
    return NextResponse.json({ error: 'Gagal update status.' }, { status: 500 })
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: 'Order tidak dalam status preview_ready atau slug tidak dijumpai.' },
      { status: 409 }
    )
  }

  const bosBase = process.env.BOS_WHATSAPP_REDIRECT ?? ''
  const waLink  = `${bosBase}?text=${encodeURIComponent(
    'Saya dah semak page dan setuju untuk proceed. Sila hantar link bayaran.'
  )}`

  return NextResponse.json({ ok: true, waLink })
}
