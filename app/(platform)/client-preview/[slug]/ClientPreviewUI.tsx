'use client'

import { useState } from 'react'

const STATUS_LABEL: Record<string, string> = {
  pending:       'Dalam Proses',
  preview_ready: 'Preview Sedia',
  approved:      'Diluluskan',
  paid:          'Pembayaran Diterima',
  live:          'Live',
}

const STATUS_COLOR: Record<string, string> = {
  pending:       '#9ca3af',
  preview_ready: '#3b82f6',
  approved:      '#f59e0b',
  paid:          '#22c55e',
  live:          '#15803d',
}

export default function ClientPreviewUI({
  slug, namaBisnes, status, previewUrl,
}: {
  slug: string
  namaBisnes: string
  status: string
  previewUrl: string | null
}) {
  const [view, setView]           = useState<'main' | 'changes'>('main')
  const [changesText, setChanges] = useState('')
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState('')

  async function handleApprove() {
    setApproving(true)
    setApproveError('')
    try {
      const res  = await fetch('/api/client-preview/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (data.ok) {
        window.location.href = data.waLink
      } else {
        setApproveError(data.error ?? 'Ralat berlaku. Cuba lagi.')
        setApproving(false)
      }
    } catch {
      setApproveError('Ralat rangkaian. Cuba lagi.')
      setApproving(false)
    }
  }

  function handleSendChanges() {
    const base = process.env.NEXT_PUBLIC_BOS_WA_REDIRECT ?? ''
    const msg  = `Saya nak minta perubahan untuk page ${namaBisnes}: ${changesText}`
    window.location.href = `${base}?text=${encodeURIComponent(msg)}`
  }

  const canApprove = status === 'preview_ready'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{namaBisnes}</p>
          <span style={{
            display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 600,
            padding: '2px 10px', borderRadius: 20,
            background: `${STATUS_COLOR[status] ?? '#999'}22`,
            color: STATUS_COLOR[status] ?? '#999',
          }}>
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>
      </div>

      {/* Preview iframe */}
      <div style={{ flex: 1 }}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            style={{ width: '100%', height: '100%', minHeight: 400, border: 'none', display: 'block' }}
            title={`Preview — ${namaBisnes}`}
          />
        ) : (
          <div style={{
            height: 300, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#999', fontSize: 14,
          }}>
            Preview belum tersedia. Sila tunggu notifikasi dari kami.
          </div>
        )}
      </div>

      {/* Action bar — sticky bottom */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff',
        borderTop: '1px solid #e5e5e5', padding: '16px 20px',
      }}>
        {view === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleApprove}
              disabled={approving || !canApprove}
              style={{
                width: '100%', padding: 16, fontSize: 16, fontWeight: 700,
                background: canApprove ? '#16a34a' : '#d1d5db',
                color: '#fff', border: 'none', borderRadius: 10,
                cursor: canApprove ? 'pointer' : 'not-allowed', minHeight: 52,
              }}
            >
              {approving ? 'Memproses...' : '✅  Saya Setuju & Nak Proceed'}
            </button>
            {approveError && (
              <p style={{ fontSize: 13, color: '#c53030', margin: 0, textAlign: 'center' }}>
                {approveError}
              </p>
            )}
            <button
              onClick={() => setView('changes')}
              style={{
                width: '100%', padding: 14, fontSize: 15, fontWeight: 600,
                background: '#fff', color: '#555', border: '1px solid #ddd',
                borderRadius: 10, cursor: 'pointer', minHeight: 48,
              }}
            >
              ✏️  Minta Perubahan
            </button>
          </div>
        )}

        {view === 'changes' && (
          <div>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
              Nyatakan perubahan yang dikehendaki:
            </p>
            <textarea
              value={changesText}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Contoh: Tukar warna butang kepada merah, tambah nombor telefon kedua..."
              style={{
                width: '100%', minHeight: 88, padding: 12, fontSize: 15,
                border: '1px solid #ddd', borderRadius: 8, resize: 'vertical',
                boxSizing: 'border-box', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setView('main')}
                style={{
                  flex: 1, padding: 14, fontSize: 14,
                  background: '#fff', border: '1px solid #ddd',
                  borderRadius: 8, cursor: 'pointer',
                }}>
                Batal
              </button>
              <button
                onClick={handleSendChanges}
                disabled={!changesText.trim()}
                style={{
                  flex: 2, padding: 14, fontSize: 14, fontWeight: 600,
                  background: changesText.trim() ? '#1a1a1a' : '#d1d5db',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: changesText.trim() ? 'pointer' : 'not-allowed',
                }}>
                Hantar Perubahan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
