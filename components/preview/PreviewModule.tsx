'use client'

import { useState } from 'react'
import { useAppState } from '@/lib/store'

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({
  label,
  value,
  ok,
}: {
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div style={{
      flex: 1,
      padding: '12px 14px',
      background: 'var(--color-surface)',
      border: `1px solid ${ok ? 'rgba(34,197,94,0.2)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-sm)',
    }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
        color: 'var(--color-text-muted)', textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: ok ? 'var(--color-success)' : 'var(--color-text-muted)',
        }} />
        <p style={{
          fontSize: 12, fontWeight: 500,
          color: ok ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ─── PreviewModule ────────────────────────────────────────────────────────────

export default function PreviewModule() {
  const { state, dispatch } = useAppState()
  const { activeClient, moduleStatus } = state

  const [deploying, setDeploying] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const isBuild = moduleStatus.build === 'complete'
  const slug = activeClient.project.slug
  const businessName = activeClient.seo.business_name
  const template = activeClient._meta.template

  const waMessage = encodeURIComponent(
    `Salam *${businessName}*,\n\nHalaman web anda sudah siap untuk semakan:\n👉 ${previewUrl}\n\nSila semak dan beritahu kami jika ada yang perlu diubah.\n\nTerima kasih!`
  )
  const waUrl = `https://wa.me/?text=${waMessage}`

  async function handleDeploy() {
    setDeploying(true)
    setError(null)

    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deploy gagal')

      setPreviewUrl(data.url)
      dispatch({ type: 'SET_MODULE_STATUS', module: 'preview', status: 'complete' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deploy gagal')
    } finally {
      setDeploying(false)
    }
  }

  const canDeploy = isBuild && !deploying

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
          marginBottom: 20,
        }}>
          Deploy Preview
        </p>

        {/* Status chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <StatusChip label="Klien" value={businessName || '—'} ok={!!businessName} />
          <StatusChip label="Template" value={template} ok={!!template} />
          <StatusChip label="Halaman" value={isBuild ? 'siap' : 'belum dibina'} ok={isBuild} />
        </div>

        {/* Not built warning */}
        {!isBuild && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-warning)' }}>
              Bina halaman di modul Build dahulu sebelum deploy preview.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Deploy button */}
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
            marginBottom: 24,
          }}
        >
          {deploying ? 'Menghantar ke Cloudflare...' : previewUrl ? 'Deploy Semula' : 'Deploy ke Preview →'}
        </button>

        {/* Success: URL + share */}
        {previewUrl && (
          <div style={{
            padding: '16px',
            background: 'var(--color-surface)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--color-success)', textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Preview URL
              </p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13, fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: 2,
                }}
              >
                {previewUrl}
              </a>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={previewUrl}
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
                  cursor: 'pointer',
                  transition: 'border-color 0.1s',
                }}
              >
                Buka ↗
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 2, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                  fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Kongsi ke Klien
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
