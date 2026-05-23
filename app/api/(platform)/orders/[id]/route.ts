import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = supabaseServer()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })
  }

  return NextResponse.json({ order })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = supabaseServer()

  // Safety: only allow deleting pending orders
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })
  }

  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: `Hanya pending orders boleh didelete. Status semasa: ${order.status}` },
      { status: 403 }
    )
  }

  const { error } = await supabase.from('orders').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Gagal delete order' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
