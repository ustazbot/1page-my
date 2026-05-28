import { supabaseServer } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-session'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { BisnesOrder } from './types'
import BoldMinimal from './templates/bold-minimal'
import WarmHeritage from './templates/warm-heritage'
import CoolProfessional from './templates/cool-professional'
import FreshEditorial from './templates/fresh-editorial'
import DarkMode from './templates/dark-mode'
import ComingSoonPage from '@/components/admin/ComingSoonPage'

interface Props {
  params: Promise<{ subdomain: string }>
}

const TEMPLATES: Record<string, React.ComponentType<{ order: BisnesOrder }>> = {
  bold_minimal: BoldMinimal,
  warm_heritage: WarmHeritage,
  cool_professional: CoolProfessional,
  fresh_editorial: FreshEditorial,
  dark_mode: DarkMode,
}

const NON_PUBLIC_STATUSES = ['draft', 'preview_ready', 'paid']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params
  const { data } = await supabaseServer()
    .from('orders')
    .select('nama_bisnes, tagline, jenis_bisnes, cerita_bisnes, banner_atas_url, status')
    .eq('slug', subdomain)
    .in('status', ['draft', 'preview_ready', 'paid', 'live'])
    .maybeSingle()

  if (!data) return { title: '1page.my' }

  if (NON_PUBLIC_STATUSES.includes(data.status as string)) {
    return { title: `${data.nama_bisnes} — Akan Datang` }
  }

  return {
    title: `${data.nama_bisnes}${data.tagline ? ` — ${data.tagline}` : ''}`,
    description: (data.cerita_bisnes as string | null)?.slice(0, 160) ?? (data.tagline as string | null) ?? (data.jenis_bisnes as string | null) ?? '',
    openGraph: {
      title: data.nama_bisnes as string,
      description: (data.tagline as string | null) ?? '',
      images: data.banner_atas_url ? [data.banner_atas_url as string] : [],
      type: 'website',
    },
  }
}

export default async function BisnesPage({ params }: Props) {
  const { subdomain } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseServer() as any)
    .from('orders')
    .select('*')
    .eq('slug', subdomain)
    .in('status', ['draft', 'preview_ready', 'paid', 'live'])
    .single()

  if (!data) return notFound()

  const order = data as BisnesOrder

  if (NON_PUBLIC_STATUSES.includes(order.status)) {
    try {
      const session = await getAdminSession()
      if (!session) return <ComingSoonPage bisnesName={order.nama_bisnes} />
    } catch {
      return <ComingSoonPage bisnesName={order.nama_bisnes} />
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: order.nama_bisnes,
    description: order.cerita_bisnes || order.tagline || '',
    telephone: order.telefon,
    address: { '@type': 'PostalAddress', streetAddress: order.alamat },
    openingHours: order.waktu_operasi,
    url: `https://${order.slug}.1page.my`,
  }

  const Template = TEMPLATES[order.template_pilihan] ?? BoldMinimal

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Template order={order} />
    </>
  )
}
