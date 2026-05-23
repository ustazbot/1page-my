import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    nama_bisnes, tagline, jenis_bisnes, produk_servis, target_pelanggan,
    nama_owner, whatsapp, telefon, email,
    alamat, waktu_operasi, google_maps_link,
    instagram, facebook, tiktok,
    banner_atas_url, logo_url, gallery_urls,
    template_pilihan, domain_sendiri, domain_url,
    domain_pref_1, domain_pref_2, domain_pref_3,
    catatan,
  } = body

  if (
    !nama_bisnes || !produk_servis || !nama_owner ||
    !whatsapp || !telefon || !alamat ||
    !waktu_operasi || !banner_atas_url || !template_pilihan
  ) {
    return NextResponse.json(
      { error: 'Sila lengkapkan semua maklumat wajib.' },
      { status: 400 }
    )
  }

  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      nama_bisnes, tagline, jenis_bisnes, produk_servis, target_pelanggan,
      nama_owner, whatsapp, telefon, email,
      alamat, waktu_operasi, google_maps_link,
      instagram, facebook, tiktok,
      banner_atas_url, logo_url, gallery_urls,
      template_pilihan, domain_sendiri: !!domain_sendiri, domain_url,
      domain_pref_1, domain_pref_2, domain_pref_3,
      catatan,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[orders] insert error:', error)
    return NextResponse.json({ error: 'Gagal simpan order. Cuba lagi.' }, { status: 500 })
  }

  await sendTelegramMessage(
    `🔔 Order baru!\n${nama_bisnes} — ${whatsapp}\nID: ${data.id}`
  )

  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET() {
  const supabase = supabaseServer()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      'id, created_at, nama_bisnes, nama_owner, whatsapp, status, slug, preview_url, live_url'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Gagal load orders' }, { status: 500 })
  }

  return NextResponse.json({ orders })
}
