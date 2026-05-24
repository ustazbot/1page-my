'use client'

import { useState, useRef } from 'react'
import { useAppState } from '@/lib/store'
import type { TemplateId } from '@/types/client'

// ─── Template metadata ─────────────────────────────────────────────────────

const TEMPLATES: Array<{
  id: TemplateId
  name: string
  fonts: string
  accent: string
  bg: string
}> = [
  { id: 'bold_minimal',       name: 'Bold Minimal',       fonts: 'Instrument Serif · Jakarta Sans', accent: '#C8A96E', bg: '#0a0a0a' },
  { id: 'warm_heritage',      name: 'Warm Heritage',       fonts: 'Crimson Text · Source Sans',     accent: '#8B5E3C', bg: '#fdf6ee' },
  { id: 'cool_professional',  name: 'Cool Professional',   fonts: 'IBM Plex Sans',                  accent: '#3B82F6', bg: '#0f172a' },
  { id: 'fresh_editorial',    name: 'Fresh Editorial',     fonts: 'Space Grotesk · DM Sans',        accent: '#16A34A', bg: '#f9fafb' },
  { id: 'dark_mode',          name: 'Dark Mode',           fonts: 'Bebas Neue · Space Grotesk',     accent: '#E8A020', bg: '#0d0d0d' },
]

// ─── Device widths ──────────────────────────────────────────────────────────

const DEVICES = [
  { key: 'mobile',  label: '375', width: '390px' },
  { key: 'tablet',  label: '768', width: '768px' },
  { key: 'desktop', label: '100%', width: '100%' },
] as const

type Device = typeof DEVICES[number]['key']

// ─── TemplateCard ───────────────────────────────────────────────────────────

function TemplateCard({
  tmpl,
  selected,
  onSelect,
}: {
  tmpl: typeof TEMPLATES[number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 0,
        background: 'transparent',
        border: `1px solid ${selected ? tmpl.accent : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.1s',
      }}
    >
      {/* Mini visual strip */}
      <div style={{
        background: tmpl.bg,
        padding: '10px 12px 8px',
        borderBottom: `1px solid ${selected ? tmpl.accent : 'var(--color-border)'}`,
      }}>
        {/* Simulated headline blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          <div style={{ height: 6, width: '70%', background: tmpl.accent, borderRadius: 2, opacity: 0.9 }} />
          <div style={{ height: 4, width: '50%', background: tmpl.accent, borderRadius: 2, opacity: 0.5 }} />
        </div>
        {/* Simulated section dots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[0.7, 0.4, 0.25].map((op, i) => (
            <div key={i} style={{
              height: 3, flex: i === 0 ? 2 : 1,
              background: tmpl.accent,
              borderRadius: 2, opacity: op,
            }} />
          ))}
        </div>
      </div>

      {/* Card footer */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: selected ? `${tmpl.accent}12` : 'transparent',
      }}>
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600,
            color: selected ? tmpl.accent : 'var(--color-text-primary)',
            marginBottom: 2,
          }}>
            {tmpl.name}
          </p>
          <p style={{ fontSize: 9, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {tmpl.fonts}
          </p>
        </div>
        {selected && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
            color: tmpl.accent, textTransform: 'uppercase',
          }}>
            Aktif
          </span>
        )}
      </div>
    </button>
  )
}

// ─── BuildModule ─────────────────────────────────────────────────────────────

export default function BuildModule() {
  const { state, dispatch } = useAppState()
  const { activeClient } = state

  const [device, setDevice] = useState<Device>('desktop')
  const [building, setBuilding] = useState(false)
  const [built, setBuilt] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  if (!activeClient) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Tiada klien aktif.<br />
          <span style={{ fontSize: 11 }}>Muat klien dari modul Intake terlebih dahulu.</span>
        </p>
      </div>
    )
  }

  const currentTemplate = activeClient._meta.template
  const previewUrl = `/clients/${activeClient.project.slug}/index.html`

  function selectTemplate(id: TemplateId) {
    if (!activeClient) return
    dispatch({
      type: 'UPDATE_CLIENT',
      payload: { _meta: { ...activeClient._meta, template: id } },
    })
    setBuilt(false)
    setWarnings([])
    setError(null)
  }

  async function handleBuild() {
    setBuilding(true)
    setError(null)
    setWarnings([])

    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeClient),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Build failed')

      setWarnings(data.warnings ?? [])
      setBuilt(true)
      dispatch({ type: 'SET_MODULE_STATUS', module: 'build', status: 'complete' })

      // Reload iframe
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = previewUrl + '?t=' + Date.now()
        }
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Build gagal')
    } finally {
      setBuilding(false)
    }
  }

  const currentDevice = DEVICES.find((d) => d.key === device)!

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden', minHeight: 0 }}>

      {/* ── Left panel ── */}
      <div style={{
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
            color: 'var(--color-text-muted)', textTransform: 'uppercase',
          }}>
            Template
          </p>
        </div>

        {/* Template cards */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '12px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {TEMPLATES.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              tmpl={tmpl}
              selected={currentTemplate === tmpl.id}
              onSelect={() => selectTemplate(tmpl.id)}
            />
          ))}
        </div>

        {/* Google snippet preview */}
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            color: 'var(--color-text-muted)', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Google Snippet
          </p>
          <div style={{
            padding: '10px 12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {/* URL */}
            <p style={{
              fontSize: 10, color: '#8ab4f8',
              fontFamily: 'var(--font-mono)',
              marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {activeClient.project.slug}.1page.my
            </p>
            {/* Title */}
            <p style={{
              fontSize: 12, fontWeight: 500,
              color: '#8ab4f8',
              marginBottom: 3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {activeClient.seo.business_name || 'Nama Bisnes'}
              {activeClient.seo.tagline ? ` | ${activeClient.seo.tagline}` : ''}
            </p>
            {/* Description */}
            <p style={{
              fontSize: 10,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {activeClient.seo.seo_description || 'Tiada meta description — jana melalui Copywrite dahulu.'}
            </p>
          </div>
          {/* SEO indicator dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            {[
              { label: 'Desc', ok: !!activeClient.seo.seo_description },
              { label: 'GPS', ok: !!activeClient.location.geo_lat },
              { label: 'Harga', ok: !!activeClient.seo.price_range },
              { label: 'Jam', ok: !!activeClient.seo.opening_hours_schema },
            ].map(({ label, ok }) => (
              <span key={label} style={{
                fontSize: 9, fontFamily: 'var(--font-mono)',
                color: ok ? 'var(--color-success)' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                  background: ok ? 'var(--color-success)' : 'var(--color-border-strong)',
                  display: 'inline-block',
                }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Build action */}
        <div style={{
          padding: '12px 12px 16px',
          borderTop: '1px solid var(--color-border)',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Warnings */}
          {warnings.length > 0 && (
            <div style={{
              padding: '8px 10px',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{
                fontSize: 10, fontWeight: 600, color: 'var(--color-warning)',
                marginBottom: 4, letterSpacing: '0.08em',
              }}>
                {warnings.length} VARIABLE KOSONG
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 80, overflowY: 'auto' }}>
                {warnings.map((w, i) => (
                  <p key={i} style={{
                    fontSize: 10, color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {w}
                  </p>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p style={{
              fontSize: 10, color: 'var(--color-danger)',
              fontFamily: 'var(--font-mono)', padding: '6px 10px',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-sm)',
            }}>
              {error}
            </p>
          )}

          <button
            onClick={handleBuild}
            disabled={building}
            style={{
              height: 36, width: '100%',
              fontSize: 12, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.06em',
              background: building ? 'var(--color-surface-2)' : 'var(--color-accent)',
              color: building ? 'var(--color-text-muted)' : '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: building ? 'wait' : 'pointer',
              transition: 'background 0.1s',
              textTransform: 'uppercase',
            }}
          >
            {building ? 'Membina...' : built ? 'Bina Semula' : 'Bina Halaman'}
          </button>
        </div>
      </div>

      {/* ── Right panel: Preview ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Preview bar */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          {/* Device toggle */}
          <div style={{ display: 'flex', gap: 2 }}>
            {DEVICES.map((d) => (
              <button
                key={d.key}
                onClick={() => setDevice(d.key)}
                style={{
                  height: 22, padding: '0 10px',
                  fontSize: 10, fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  background: device === d.key ? 'var(--color-surface-2)' : 'transparent',
                  color: device === d.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  border: `1px solid ${device === d.key ? 'var(--color-accent)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* URL chip */}
          {built && (
            <p style={{
              fontSize: 10, fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)', marginLeft: 'auto',
            }}>
              {previewUrl}
            </p>
          )}

          {/* Status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: built ? 0 : 'auto' }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: built
                ? warnings.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'
                : 'var(--color-text-muted)',
            }} />
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {built
                ? warnings.length > 0 ? `built · ${warnings.length} warn` : 'built'
                : 'idle'}
            </span>
          </div>
        </div>

        {/* Iframe container */}
        <div style={{
          flex: 1,
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: device === 'desktop' ? 'stretch' : 'flex-start',
          justifyContent: 'center',
          overflow: 'auto',
          padding: device === 'desktop' ? 0 : '16px',
        }}>
          {built ? (
            <div style={{
              width: currentDevice.width,
              height: device === 'desktop' ? '100%' : 'auto',
              minHeight: device !== 'desktop' ? 600 : undefined,
              flexShrink: 0,
              background: '#fff',
              border: device !== 'desktop' ? '1px solid var(--color-border)' : 'none',
              borderRadius: device !== 'desktop' ? 'var(--radius)' : 0,
              overflow: 'hidden',
            }}>
              <iframe
                ref={iframeRef}
                src={previewUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', minHeight: 600 }}
                title="Page preview"
              />
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 8,
            }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Pilih template dan tekan "Bina Halaman"
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {activeClient.project.slug}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
