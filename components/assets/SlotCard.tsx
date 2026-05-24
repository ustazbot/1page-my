'use client'

import { useRef, useState } from 'react'
import { formatFileSize, reductionPercent } from '@/lib/format'

export interface SlotResult {
  publicPath: string
  originalSize: number
  processedSize: number
}

interface SlotCardProps {
  slot: string
  label: string
  hint: string
  slug: string
  currentImage?: string
  reuseMenu?: React.ReactNode
  onProcessed: (slot: string, result: SlotResult) => void
}

export default function SlotCard({
  slot, label, hint, slug, currentImage, reuseMenu, onProcessed,
}: SlotCardProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SlotResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const imageSrc = result?.publicPath ?? currentImage ?? null

  const aspectRatio =
    slot === 'og' ? '1200 / 630' :
    slot === 'logo' ? '1 / 1' :
    '4 / 3'

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Fail bukan imej')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slot', slot)
      form.append('slug', slug)

      const res = await fetch('/api/assets', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data)
      onProcessed(slot, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase',
        }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {result && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-success)' }}>
              −{reductionPercent(result.originalSize, result.processedSize)}%
            </span>
          )}
          {/* Reuse menu injected by parent */}
          {reuseMenu}
        </div>
      </div>

      {/* Drop / click zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          position: 'relative',
          aspectRatio,
          background: dragOver ? 'rgba(232,160,32,0.06)' : 'var(--color-surface)',
          border: `1px ${dragOver ? 'solid' : 'dashed'} ${
            dragOver ? 'var(--color-accent)' :
            imageSrc ? 'var(--color-border)' :
            'var(--color-border-strong)'
          }`,
          borderRadius: 'var(--radius-sm)',
          cursor: loading ? 'wait' : 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.1s, background 0.1s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = '' }}
        />

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 18, color: 'var(--color-border-strong)', lineHeight: 1 }}>+</span>
            <span style={{
              fontSize: 10, color: 'var(--color-text-muted)',
              textAlign: 'center', padding: '0 8px',
            }}>
              {loading ? 'Processing...' : hint}
            </span>
          </div>
        )}

        {loading && imageSrc && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, color: '#fff' }}>Processing...</span>
          </div>
        )}
      </div>

      {/* Size info */}
      {result ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
          {formatFileSize(result.originalSize)}
          <span style={{ color: 'var(--color-border-strong)' }}> → </span>
          <span style={{ color: 'var(--color-success)' }}>{formatFileSize(result.processedSize)}</span>
        </p>
      ) : (
        <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{hint}</p>
      )}

      {error && (
        <p style={{ fontSize: 10, color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>{error}</p>
      )}
    </div>
  )
}
