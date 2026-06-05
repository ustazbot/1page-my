import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'
import { generateCopy, generateCTA } from '@/lib/claude'
import type { CopyBrief } from '@/lib/claude'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = supabaseServer()

  const { data: order, error: fetchErr } = await sb
    .from('orders')
    .select('nama_bisnes, jenis_bisnes, cerita_bisnes, produk_servis, target_pelanggan, tagline, alamat, slug, status')
    .eq('id', id)
    .single()

  if (fetchErr || !order) {
    return NextResponse.json({ error: 'Order tidak dijumpai' }, { status: 404 })
  }

  if (!order.slug) {
    return NextResponse.json({ error: 'Set slug dulu sebelum jana copy' }, { status: 400 })
  }

  // Set status → draft so iframe preview becomes accessible
  await sb.from('orders').update({ status: 'draft' }).eq('id', id)

  const brief: CopyBrief = {
    business_name: order.nama_bisnes ?? '',
    industry: order.jenis_bisnes ?? '',
    products: order.produk_servis ?? '',
    target_audience: order.target_pelanggan ?? '',
    location: order.alamat ?? '',
    usp: order.cerita_bisnes ?? order.tagline ?? '',
    tone: 'Profesional',
    language: 'BM',
  }

  // Run copy and CTA generation in parallel
  const [copyResult, ctaResult] = await Promise.allSettled([
    generateCopy(brief, 'claude'),
    generateCTA(brief),
  ])

  if (copyResult.status === 'rejected') {
    console.error('[generate-copy] Claude copy error:', copyResult.reason)
    return NextResponse.json({ error: 'AI gagal jana copy. Cuba lagi.' }, { status: 502 })
  }

  const copy = copyResult.value

  const { error: updateErr } = await sb.from('orders').update({
    tagline: copy.tagline,
    cerita_bisnes: copy.about_paragraph_1 + (copy.about_paragraph_2 ? '\n\n' + copy.about_paragraph_2 : ''),
    produk_servis: copy.products_title + '\n' + copy.products_subtitle,
  }).eq('id', id)

  if (updateErr) {
    console.error('[generate-copy] update error:', updateErr)
    return NextResponse.json({ error: 'Gagal simpan copy' }, { status: 500 })
  }

  const cta_variants = ctaResult.status === 'fulfilled' ? ctaResult.value : null
  const cta_error = ctaResult.status === 'rejected'
    ? 'Gagal jana CTA, cuba semula'
    : null

  return NextResponse.json({
    ok: true,
    copy: {
      tagline: copy.tagline,
      cerita_bisnes: copy.about_paragraph_1 + (copy.about_paragraph_2 ? '\n\n' + copy.about_paragraph_2 : ''),
      produk_servis: copy.products_title + '\n' + copy.products_subtitle,
    },
    cta_variants,
    cta_error,
  })
}
