'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

type Candidate = {
  id: string
  full_name: string
  kawasan: string
  parti_name: string
  whatsapp: string | null
  subdomain: string | null
  is_paid: boolean
  is_live: boolean
  revision_count: number
  submitted_at: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Tunggu Bayaran', color: 'bg-orange-100 text-orange-800' },
  paid:            { label: 'Bayar ✓',         color: 'bg-blue-100 text-blue-800' },
  preview_sent:    { label: 'Preview Dihantar', color: 'bg-indigo-100 text-indigo-800' },
  live:            { label: 'LIVE ✓',           color: 'bg-green-100 text-green-800' },
}

function getStatus(c: Candidate): string {
  if (c.is_live) return 'live'
  if (c.is_paid && c.revision_count > 0) return 'preview_sent'
  if (c.is_paid) return 'paid'
  return 'pending_payment'
}

export default function CandidatePipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (supabaseBrowser() as any)
      .from('candidate_briefs')
      .select('id, full_name, kawasan, parti_name, whatsapp, subdomain, is_paid, is_live, revision_count, submitted_at')
      .order('submitted_at', { ascending: false })
      .then(({ data }: { data: Candidate[] | null }) => {
        setCandidates(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Candidate Pipeline</h1>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{candidates.length} calon</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#6b7280' }}>
              {['Calon', 'Kawasan', 'Parti', 'WhatsApp', 'Status', 'Subdomain', 'Tindakan'].map(h => (
                <th key={h} style={{ paddingBottom: 12, paddingRight: 16, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => {
              const { label, color } = STATUS_LABELS[getStatus(c)]
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px 12px 0', fontWeight: 600 }}>{c.full_name}</td>
                  <td style={{ paddingRight: 16, color: '#4b5563' }}>{c.kawasan}</td>
                  <td style={{ paddingRight: 16, color: '#4b5563' }}>{c.parti_name}</td>
                  <td style={{ paddingRight: 16 }}>
                    {c.whatsapp ? (
                      <a href={`https://wa.me/${c.whatsapp}`} target="_blank" style={{ color: '#16a34a' }}>
                        {c.whatsapp}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
                  </td>
                  <td style={{ paddingRight: 16, fontSize: 11, color: '#9ca3af' }}>
                    {c.subdomain ? `${c.subdomain}.1page.my` : '—'}
                  </td>
                  <td>
                    <a href={`/admin/candidates/${c.id}`} style={{ color: '#f97316', fontWeight: 600, fontSize: 12 }}>
                      Urus →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
