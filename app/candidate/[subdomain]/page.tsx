// app/candidate/[subdomain]/page.tsx
import { supabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { CandidateBrief } from './types'
import HeroSection from './components/HeroSection'
import QuoteBlock from './components/QuoteBlock'
import MengapaBertanding from './components/MengapaBertanding'
import KenaliCandidate from './components/KenaliCandidate'
import FokusUtama from './components/FokusUtama'
import GaleriGerakKerja from './components/GaleriGerakKerja'
import TestimoniRakyat from './components/TestimoniRakyat'
import IsuKawasan from './components/IsuKawasan'
import CtaFooter from './components/CtaFooter'

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
    keywords: [c.full_name as string, c.kawasan as string, c.parti_name as string, `calon ${c.kawasan}`, `PRU ${c.kawasan}`],
    openGraph: {
      title: `${c.full_name} — ${c.kawasan}`,
      description: tagline,
      images: c.photo_url ? [c.photo_url as string] : [],
      type: 'profile',
    },
  }
}

const ANIMATIONS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-parti   { animation: fadeUp 0.5s ease 0.1s both; }
  .hero-photo   { animation: fadeUp 0.6s ease 0.2s both; }
  .hero-nama    { animation: fadeUp 0.6s ease 0.3s both; }
  .hero-tagline { animation: fadeUp 0.6s ease 0.4s both; }
  .hero-cta     { animation: fadeUp 0.6s ease 0.5s both; }

  @supports (animation-timeline: scroll()) {
    .section-reveal {
      animation: fadeUp 0.7s ease both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
`

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
  const warna = candidate.warna_utama || '#1e3a5f'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: candidate.full_name,
    jobTitle: `Calon ${candidate.kawasan_jenis} ${candidate.kawasan}`,
    affiliation: { '@type': 'Organization', name: candidate.parti_name },
    description: candidate.tagline,
    image: candidate.photo_url,
    url: `https://${candidate.subdomain}.1page.my`,
    sameAs: ([candidate.facebook_url, candidate.instagram_url, candidate.tiktok_url] as (string | null)[]).filter(Boolean),
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMATIONS }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ fontFamily: 'var(--font-dm)', overflowX: 'hidden' }}>
        <HeroSection c={candidate} warna={warna} />
        <QuoteBlock c={candidate} warna={warna} />
        <MengapaBertanding c={candidate} />
        <KenaliCandidate c={candidate} warna={warna} />
        <FokusUtama c={candidate} warna={warna} />
        <GaleriGerakKerja c={candidate} warna={warna} />
        <TestimoniRakyat c={candidate} warna={warna} />
        <IsuKawasan c={candidate} warna={warna} />
        <CtaFooter c={candidate} warna={warna} />
      </main>
    </>
  )
}
