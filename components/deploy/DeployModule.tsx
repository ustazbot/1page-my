'use client'

import { useState, useMemo } from 'react'
import { useAppState } from '@/lib/store'
import { generateSlugVariants } from '@/lib/slug'

// ─── Checklist item ───────────────────────────────────────────────────────────

function CheckItem({
  label,
  ok,
  required = false,
}: {
  label: string
  ok: boolean
  required?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: ok
          ? 'rgba(34,197,94,0.12)'
          : required ? 'rgba(239,68,68,0.10)' : 'var(--color-surface)',
        border: `1px solid ${ok
          ? 'rgba(34,197,94,0.3)'
          : required ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: ok
            ? 'var(--color-success)'
            : required ? 'var(--color-danger)' : 'var(--color-text-muted)',
          lineHeight: 1,
        }}>
          {ok ? '✓' : '✗'}
        </span>
      </div>
      <p style={{
        fontSize: 12,
        color: ok ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        flex: 1,
      }}>
        {label}
      </p>
      {required && !ok && (
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          color: 'var(--color-danger)', textTransform: 'uppercase',
        }}>
          wajib
        </span>
      )}
    </div>
  )
}

// ─── DeployModule ─────────────────────────────────────────────────────────────

export default function DeployModule() {
  const { state, dispatch } = useAppState()
  const { activeClient, moduleStatus } = state

  const [customSlug, setCustomSlug] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [liveUrl, setLiveUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const slugVariants = useMemo(
    () => (activeClient ? generateSlugVariants(activeClient.seo.business_name) : []),
    [activeClient?.seo.business_name]
  )

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

  const currentSlug = selectedSlug ?? activeClient.project.slug
  const slugChanged = currentSlug !== activeClient.project.slug

  const checklist = {
    intake:    moduleStatus.intake === 'complete',
    assets:    moduleStatus.assets === 'complete',
    copywrite: moduleStatus.copywrite === 'complete',
    build:     moduleStatus.build === 'complete',
    preview:   moduleStatus.preview === 'complete',
  }

  const canDeploy = checklist.build && !deploying

  function applySlug(slug: string) {
    const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    setSelectedSlug(cleaned)
    setCustomSlug('')
  }

  async function handleDeploy() {
    setDeploying(true)
    setError(null)

    let deploySlug = currentSlug

    // If slug changed, update client
    if (slugChanged && activeClient) {
      dispatch({
        type: 'UPDATE_CLIENT',
        payload: {
          project: {
            ...activeClient.project,
            slug: currentSlug,
            page_url: `https://${currentSlug}.1page.my`,
          },
        },
      })
      deploySlug = currentSlug
    }

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: deploySlug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deploy gagal')

      setLiveUrl(data.url)
      dispatch({ type: 'SET_MODULE_STATUS', module: 'deploy', status: 'complete' })
      if (activeClient) {
        dispatch({
          type: 'UPDATE_CLIENT',
          payload: {
            project: { ...activeClient.project, status: 'live', slug: deploySlug },
          },
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deploy gagal')
    } finally {
      setDeploying(false)
    }
  }

  const liveDomain = `${currentSlug}.1page.my`

  return (
    <div className="module-centered" style={{
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Deploy Live
        </p>

        {/* Slug picker */}
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
            color: 'var(--color-text-muted)', textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Pilih Slug
          </p>

          {/* Variant chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {slugVariants.map((variant) => (
              <button
                key={variant}
                onClick={() => applySlug(variant)}
                style={{
                  height: 28, padding: '0 12px',
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  background: currentSlug === variant ? 'rgba(232,160,32,0.1)' : 'var(--color-surface)',
                  color: currentSlug === variant ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  border: `1px solid ${currentSlug === variant ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {variant}
              </button>
            ))}
          </div>

          {/* Custom slug input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="slug-custom"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              onKeyDown={(e) => { if (e.key === 'Enter' && customSlug) applySlug(customSlug) }}
              style={{
                flex: 1, height: 32, padding: '0 10px',
                fontSize: 12, fontFamily: 'var(--font-mono)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <button
              onClick={() => customSlug && applySlug(customSlug)}
              disabled={!customSlug}
              style={{
                height: 32, padding: '0 14px',
                fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                background: customSlug ? 'var(--color-surface-2)' : 'transparent',
                color: customSlug ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: customSlug ? 'pointer' : 'not-allowed',
              }}
            >
              Guna
            </button>
          </div>

          {/* Live URL preview */}
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
              URL →
            </span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              https://{liveDomain}
            </span>
          </div>

          {slugChanged && (
            <p style={{
              fontSize: 10, color: 'var(--color-warning)',
              marginTop: 6, fontFamily: 'var(--font-mono)',
            }}>
              ⚠ Slug berubah — pastikan halaman telah dibina semula di modul Build.
            </p>
          )}
        </div>

        {/* Pre-deploy checklist */}
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
            color: 'var(--color-text-muted)', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Senarai Semak
          </p>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0 14px',
          }}>
            <CheckItem label="Data klien dimuat (Intake)"     ok={checklist.intake}    />
            <CheckItem label="Imej diproses (Assets)"         ok={checklist.assets}    />
            <CheckItem label="Copy dijana (Copywrite)"        ok={checklist.copywrite} />
            <CheckItem label="Halaman dibina (Build)"         ok={checklist.build}     required />
            <CheckItem label="Preview dihantar ke klien"      ok={checklist.preview}   />
            <CheckItem
              label="Google Business Profile — masukkan URL web ke GBP"
              ok={activeClient?.project.status === 'live'}
            />
          </div>
        </div>

        {/* GBP reminder (shown after live deploy) */}
        {liveUrl && (
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Masukkan URL web ke Google Business Profile klien
            </p>
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, fontWeight: 600,
                color: '#8ab4f8',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              Buka GBP →
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 16,
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Deploy button */}
        {!liveUrl ? (
          <button
            onClick={handleDeploy}
            disabled={!canDeploy}
            style={{
              width: '100%', height: 44,
              fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: canDeploy ? 'var(--color-accent)' : 'var(--color-surface)',
              color: canDeploy ? '#000' : 'var(--color-text-muted)',
              border: canDeploy ? 'none' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: canDeploy ? 'pointer' : 'not-allowed',
              transition: 'background 0.1s',
            }}
          >
            {deploying ? 'Menghantar ke Cloudflare...' : 'Deploy ke Live →'}
          </button>
        ) : (
          /* Success state */
          <div style={{
            padding: '16px',
            background: 'var(--color-surface)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              color: 'var(--color-success)', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Live
            </p>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontSize: 14, fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                marginBottom: 14,
                wordBreak: 'break-all',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: 10,
              }}
            >
              {liveUrl} ↗
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                }}
              >
                Buka ↗
              </a>
              <button
                onClick={handleDeploy}
                disabled={deploying}
                style={{
                  flex: 1, height: 36,
                  fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                Deploy Semula
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
