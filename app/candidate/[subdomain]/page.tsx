// app/candidate/[subdomain]/page.tsx
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { CandidateBrief } from './types'
import { generatePalette } from '@/lib/candidate-colors'
import T1Statesman from './templates/T1Statesman'
import T2Reformer from './templates/T2Reformer'
import T3Guardian from './templates/T3Guardian'
import T4Champion from './templates/T4Champion'
import T5Visionary from './templates/T5Visionary'

const TEMPLATES = {
  T1: T1Statesman,
  T2: T2Reformer,
  T3: T3Guardian,
  T4: T4Champion,
  T5: T5Visionary,
} as const

interface Props {
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params
  const { data: c } = await supabaseServer()
    .from('candidate_briefs')
    .select('full_name, preferred_name, kawasan, kawasan_jenis, parti_name, tagline, photo_url')
    .eq('subdomain', subdomain)
    .eq('is_live', true)
    .single()

  if (!c) return { title: '1page.my' }

  const displayName = (c.preferred_name as string | null) || (c.full_name as string)
  const tagline = (c.tagline as string | null) || `Calon ${c.parti_name} untuk ${c.kawasan_jenis} ${c.kawasan}`

  return {
    title: `${c.full_name} — Calon ${c.kawasan_jenis} ${c.kawasan}`,
    description: `Kenali ${displayName}, calon ${c.parti_name} untuk ${c.kawasan_jenis} ${c.kawasan}. ${tagline}`,
    keywords: [
      c.full_name as string, c.kawasan as string, c.parti_name as string,
      `calon ${c.kawasan}`, `PRU ${c.kawasan}`, `PRN ${c.kawasan}`,
    ],
    openGraph: {
      title: `${c.full_name} — ${c.kawasan}`,
      description: tagline,
      images: c.photo_url ? [c.photo_url as string] : [],
      type: 'profile',
    },
  }
}

export default async function CandidatePage({ params }: Props) {
  const { subdomain } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: c } = await (supabaseServer() as any)
    .from('candidate_briefs')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_live', true)
    .single()

  if (!c) return notFound()

  const candidate = c as CandidateBrief
  const palette = generatePalette(candidate.warna_utama, candidate.parti_name)
  const templateId = (candidate.template_id || 'T1') as keyof typeof TEMPLATES
  const Template = TEMPLATES[templateId] ?? T1Statesman

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: candidate.full_name,
    jobTitle: `Calon ${candidate.kawasan_jenis} ${candidate.kawasan}`,
    affiliation: { '@type': 'Organization', name: candidate.parti_name },
    description: candidate.tagline,
    image: candidate.photo_url,
    url: `https://${candidate.subdomain}.1page.my`,
    sameAs: (
      [candidate.facebook_url, candidate.instagram_url, candidate.tiktok_url] as (string | null)[]
    ).filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Template candidate={candidate} palette={palette} />
    </>
  )
}
