// app/api/(platform)/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah.' }, { status: 400 })
  }

  const {
    nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan,
    nama_owner, whatsapp, telefon, email,
    alamat, waktu_operasi, google_maps_link,
    instagram, facebook, tiktok,
    banner_atas_url, logo_url, gallery_urls,
    template_pilihan, domain_sendiri, domain_url,
    domain_pref_1, domain_pref_2, domain_pref_3,
    catatan, affiliate_ref_code,
    stats_bar, usp, pakej, testimoni, faq,
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
      nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan,
      nama_owner, whatsapp, telefon, email,
      alamat, waktu_operasi, google_maps_link,
      instagram, facebook, tiktok,
      banner_atas_url, logo_url,
      gallery_urls: typeof gallery_urls === 'string'
        ? gallery_urls.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      template_pilihan, domain_sendiri: !!domain_sendiri, domain_url,
      domain_pref_1, domain_pref_2, domain_pref_3,
      catatan,
      affiliate_ref_code: typeof affiliate_ref_code === 'string' ? affiliate_ref_code : null,
      stats_bar:  Array.isArray(stats_bar)  ? stats_bar  : [],
      usp:        Array.isArray(usp)        ? usp        : [],
      pakej:      Array.isArray(pakej)      ? pakej      : [],
      testimoni:  Array.isArray(testimoni)  ? testimoni  : [],
      faq:        Array.isArray(faq)        ? faq        : [],
    })
    .select('id')
    .single()

  if (error) {
    console.error('[orders] insert error:', error)
    return NextResponse.json({ error: 'Gagal simpan order. Cuba lagi.' }, { status: 500 })
  }

  await sendTelegramMessage(
    `🔔 Order baru!\n${nama_bisnes} — ${whatsapp}\nID: ${data.id}`
  ).catch((err: unknown) => console.error('[orders] telegram error:', err))

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
