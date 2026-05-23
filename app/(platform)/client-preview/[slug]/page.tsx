import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ClientPreviewUI from './ClientPreviewUI'

export default async function ClientPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = supabaseServer()

  const { data: order, error } = await supabase
    .from('orders')
    .select('nama_bisnes, status, preview_url')
    .eq('slug', slug)
    .single()

  if (error || !order) notFound()

  return (
    <ClientPreviewUI
      slug={slug}
      namaBisnes={order.nama_bisnes}
      status={order.status}
      previewUrl={order.preview_url}
    />
  )
}
