// app/admin/(dashboard)/candidates/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'

type Candidate = {
  id: string
  full_name: string
  preferred_name: string | null
  kawasan: string
  parti_name: string
  whatsapp: string | null
  subdomain: string | null
  is_paid: boolean
  is_live: boolean
  revision_count: number
  notes: string | null
  photo_url: string | null
  parti_logo_url: string | null
  fokus: string[]
  isu_kawasan: { masalah: string; penyelesaian: string }[]
  pencapaian: string[]
  profil_ringkas: string | null
  tagline: string | null
  warna_utama: string | null
  payment_method: string | null
  submitted_at: string
  paid_at: string | null
  live_at: string | null
}

function Toggle({ on, disabled, onChange }: { on: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: 44,
        height: 24,
        alignItems: 'center',
        borderRadius: 12,
        background: on ? '#22c55e' : '#e5e7eb',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute',
        left: on ? 22 : 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = supabaseBrowser() as any
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('candidate_briefs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }: { data: Candidate | null }) => setCandidate(data))
  }, [id])

  const update = async (updates: Partial<Candidate>) => {
    if (!candidate) return
    setSaving(true)
    const { data } = await supabase
      .from('candidate_briefs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    setCandidate(data as Candidate)
    setSaving(false)
  }

  if (!candidate) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <a href="/admin/candidates" style={{ fontSize: 13, color: '#f97316', textDecoration: 'none' }}>
          ← Semua Calon
        </a>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>{candidate.full_name}</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>{candidate.kawasan} — {candidate.parti_name}</p>
      </div>

      {/* Status Controls */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 16, color: '#374151' }}>Status</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 500 }}>Bayaran Diterima</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Toggle selepas confirm bayaran manual</p>
          </div>
          <Toggle
            on={candidate.is_paid}
            onChange={() => update({
              is_paid: !candidate.is_paid,
              payment_method: candidate.is_paid ? null : 'manual',
              paid_at: candidate.is_paid ? null : new Date().toISOString(),
            })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 500 }}>Go Live</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Page akan accessible di subdomain</p>
          </div>
          <Toggle
            on={candidate.is_live}
            disabled={!candidate.is_paid}
            onChange={() => update({
              is_live: !candidate.is_live,
              live_at: candidate.is_live ? null : new Date().toISOString(),
            })}
          />
        </div>

        <div>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>Revision Count</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>{candidate.revision_count}</span>
            <button
              onClick={() => update({ revision_count: candidate.revision_count + 1 })}
              style={{ fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer' }}
            >
              +1
            </button>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>(max 2 dalam harga)</span>
          </div>
        </div>
      </div>

      {/* Brief Summary */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 16, color: '#374151' }}>Brief Calon</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
          {[
            ['Tagline', candidate.tagline],
            ['Warna Utama', candidate.warna_utama],
            ['WhatsApp', candidate.whatsapp],
            ['Submitted', candidate.submitted_at ? new Date(candidate.submitted_at).toLocaleDateString('ms-MY') : '—'],
          ].map(([k, v]) => (
            <div key={k as string}>
              <p style={{ color: '#9ca3af', marginBottom: 2 }}>{k}</p>
              <p style={{ fontWeight: 500 }}>{v || '—'}</p>
            </div>
          ))}
        </div>
        {candidate.fokus?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>Fokus</p>
            <ul style={{ listStyle: 'disc', paddingLeft: 20, fontSize: 13 }}>
              {candidate.fokus.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Internal Notes */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 12, color: '#374151' }}>Internal Notes</h2>
        <textarea
          rows={4}
          value={candidate.notes || ''}
          onChange={e => setCandidate(p => p ? { ...p, notes: e.target.value } : p)}
          onBlur={() => update({ notes: candidate.notes })}
          placeholder="Nota untuk Bos sendiri..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Quick Links */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 12, color: '#374151' }}>Quick Links</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          {candidate.whatsapp && (
            <a href={`https://wa.me/${candidate.whatsapp}`} target="_blank" style={{ color: '#16a34a' }}>
              💬 WhatsApp Client
            </a>
          )}
          {candidate.subdomain && (
            <a href={`https://${candidate.subdomain}.1page.my`} target="_blank" style={{ color: '#f97316' }}>
              🌐 Preview Page
            </a>
          )}
        </div>
      </div>

      {saving && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16,
          background: '#111827', color: '#fff',
          padding: '8px 16px', borderRadius: 8, fontSize: 13,
        }}>
          Saving...
        </div>
      )}
    </div>
  )
}
