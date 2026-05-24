'use client'

import { useEffect, useState } from 'react'

type Affiliate = {
  id: string
  nama: string
  email: string
  telefon: string
  ref_code: string
  status: string
  total_earned: number
  total_paid: number
  created_at: string
  bank_name: string
  bank_account: string
  bank_holder_name: string
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#F5F5F4', color: '#78716C', label: 'Pending' },
  active:    { bg: '#FFF7ED', color: '#EA580C', label: 'Aktif' },
  suspended: { bg: '#FEF2F2', color: '#DC2626', label: 'Digantung' },
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/affiliates')
      .then(r => r.json())
      .then((d: { affiliates?: Affiliate[] }) => { setAffiliates(d.affiliates ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function deleteAffiliate(id: string, nama: string) {
    if (!window.confirm(`Padam affiliate "${nama}"? Tindakan ini tidak boleh dibatalkan.`)) return
    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAffiliates(prev => prev.filter(a => a.id !== id))
      } else {
        alert('Gagal padam affiliate.')
      }
    } catch (err) {
      console.error('[admin affiliates delete]', err)
      alert('Gagal padam affiliate.')
    } finally {
      setDeleteId(null)
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionId(id)
    try {
      await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (err) {
      console.error('[admin affiliates]', err)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 20 }}>
        Affiliates
      </h1>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1160 }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Nama', 'Email', 'Telefon', 'Ref Code', 'Daftar', 'Status', 'Dijana', 'Bank', 'No. Akaun', 'Pemilik Akaun', 'Tindakan'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: 24, textAlign: 'center', color: '#78716C', fontSize: 13 }}>Tiada affiliate</td>
                </tr>
              ) : affiliates.map((a, i) => {
                const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.pending
                const isActing = actionId === a.id
                const isDeleting = deleteId === a.id
                return (
                  <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{a.nama}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C' }}>{a.email}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>{a.telefon}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#F97316', fontFamily: 'monospace', fontWeight: 700 }}>{a.ref_code}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>
                      {new Date(a.created_at).toLocaleDateString('ms-MY')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1C1917', whiteSpace: 'nowrap' }}>
                      RM {Number(a.total_earned).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>
                      {a.bank_name || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {a.bank_account || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>
                      {a.bank_holder_name || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {a.status !== 'active' && (
                          <button
                            onClick={() => updateStatus(a.id, 'active')}
                            disabled={isActing}
                            style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: '#FFF7ED', color: '#EA580C', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, cursor: isActing ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                          >
                            Approve
                          </button>
                        )}
                        {a.status !== 'suspended' && (
                          <button
                            onClick={() => updateStatus(a.id, 'suspended')}
                            disabled={isActing}
                            style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, cursor: isActing ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => deleteAffiliate(a.id, a.nama)}
                          disabled={isDeleting || isActing}
                          style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: '#1C1917', color: '#fff', border: 'none', borderRadius: 6, cursor: (isDeleting || isActing) ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {isDeleting ? '...' : 'Padam'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
