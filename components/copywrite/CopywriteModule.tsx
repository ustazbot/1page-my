'use client'

import { useState, useCallback } from 'react'
import { useAppState } from '@/lib/store'
import type { CopyBrief } from '@/lib/claude'
import type { CopyOutput } from '@/types/client'
import BriefEditor from './BriefEditor'
import CopyOutputPanel from './CopyOutput'

const DEFAULT_BRIEF: CopyBrief = {
  business_name: '',
  industry: '',
  products: '',
  target_audience: '',
  location: '',
  usp: '',
  tone: 'Profesional',
  language: 'BM',
}

function briefFromClient(client: NonNullable<ReturnType<typeof useAppState>['state']['activeClient']>): CopyBrief {
  return {
    business_name: client.seo.business_name || '',
    industry: client._meta.jenis_bisnes || '',
    products: client.products.items.map((p) => p.name).join(', ') || '',
    target_audience: client._meta.target_pelanggan || '',
    location: client.location.full_address || client.location.location_short || '',
    usp: client._meta.cerita_bisnes || client.about.about_paragraph_1 || '',
    tone: 'Profesional',
    language: 'BM',
  }
}

export default function CopywriteModule() {
  const { state, dispatch } = useAppState()
  const { activeClient } = state

  const [brief, setBrief] = useState<CopyBrief>(
    activeClient ? briefFromClient(activeClient) : DEFAULT_BRIEF
  )
  const [provider, setProvider] = useState<'claude' | 'deepseek'>('claude')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [streamBuffer, setStreamBuffer] = useState('')
  const [output, setOutput] = useState<Partial<CopyOutput> | null>(null)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setStreaming(true)
    setStreamBuffer('')
    setOutput(null)

    try {
      const res = await fetch('/api/copywrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, provider }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setStreamBuffer(full)

        if (full.includes('__ERROR__')) {
          const msg = full.split('__ERROR__')[1]
          throw new Error(msg || 'Stream error')
        }
      }

      // Parse completed JSON
      const cleaned = full.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned) as CopyOutput
      setOutput(parsed)
    } catch (err) {
      console.error('Copy generation failed:', err)
    } finally {
      setStreaming(false)
      setLoading(false)
    }
  }, [brief, provider])

  const handleAcceptAll = useCallback((accepted: CopyOutput) => {
    if (!activeClient) return

    dispatch({
      type: 'UPDATE_CLIENT',
      payload: {
        seo: {
          ...activeClient.seo,
          tagline: accepted.tagline,
          seo_description: accepted.seo_description,
          seo_keywords: accepted.seo_keywords,
        },
        hero: {
          ...activeClient.hero,
          hero_headline_part1: accepted.hero_headline_part1,
          hero_headline_part2: accepted.hero_headline_part2,
          hero_badge: accepted.hero_badge,
        },
        about: {
          ...activeClient.about,
          about_title: accepted.about_title,
          about_paragraph_1: accepted.about_paragraph_1,
          about_paragraph_2: accepted.about_paragraph_2,
        },
        products: {
          ...activeClient.products,
          products_title: accepted.products_title,
          products_subtitle: accepted.products_subtitle,
        },
        gallery: {
          ...activeClient.gallery,
          gallery_title: accepted.gallery_title,
          gallery_subtitle: accepted.gallery_subtitle,
        },
        location: {
          ...activeClient.location,
          location_title: accepted.location_title,
          location_subtitle: accepted.location_subtitle,
        },
        social: {
          ...activeClient.social,
          social_title: accepted.social_title,
          social_subtitle: accepted.social_subtitle,
        },
        cta: {
          ...activeClient.cta,
          cta_title: accepted.cta_title,
          cta_desc: accepted.cta_desc,
          cta_primary_text: accepted.cta_primary_text,
          cta_button_text: accepted.cta_button_text,
        },
      },
    })

    dispatch({ type: 'SET_MODULE_STATUS', module: 'copywrite', status: 'complete' })
  }, [activeClient, dispatch])

  if (!activeClient) {
    return (
      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Tiada klien aktif.<br />
          <span style={{ fontSize: 11 }}>Muat klien dari modul Intake terlebih dahulu.</span>
        </p>
      </div>
    )
  }

  return (
    <div className="copywrite-grid" style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      flex: 1,
      overflow: 'hidden',
      minHeight: 0,
    }}>
      {/* Left: Brief Editor */}
      <div style={{
        borderRight: '1px solid var(--color-border)',
        overflowY: 'auto',
      }}>
        <BriefEditor
          brief={brief}
          provider={provider}
          loading={loading}
          onChange={setBrief}
          onProviderChange={setProvider}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Right: Output */}
      <div style={{ overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CopyOutputPanel
          output={output}
          streamBuffer={streamBuffer}
          streaming={streaming}
          provider={provider}
          brief={brief}
          onChange={setOutput}
          onAcceptAll={handleAcceptAll}
        />
      </div>
    </div>
  )
}
