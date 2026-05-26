// app/admin/(dashboard)/candidates/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Candidate = {
  id: string
  full_name: string
  preferred_name: string | null
  kawasan: string
  kawasan_jenis: string | null
  parti_name: string
  whatsapp: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
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
  mengapa_bertanding: string | null
  quote_peribadi: string | null
  tagline: string | null
  warna_utama: string | null
  bahasa: string | null
  template_id: string | null
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
  const router = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen]           = useState(false)
  const [editFields, setEditFields]       = useState<Record<string, string>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError]         = useState('')
  const [editSuccess, setEditSuccess]     = useState(false)

  useEffect(() => {
    fetch(`/api/admin/candidates/${id}`)
      .then(r => r.json())
      .then(({ candidate }: { candidate: Candidate }) => setCandidate(candidate))
  }, [id])

  const update = async (updates: Partial<Candidate>) => {
    if (!candidate) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const { candidate: updated, error } = await res.json()
      if (error) throw new Error(error)
      setCandidate(updated as Candidate)
    } catch (err) {
      alert(`Ralat semasa simpan: ${err instanceof Error ? err.message : 'Cuba semula.'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal padam candidate')
        return
      }
      router.push('/admin/candidates')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function openEdit() {
    if (!candidate) return
    setEditFields({
      full_name:          candidate.full_name          ?? '',
      preferred_name:     candidate.preferred_name     ?? '',
      tagline:            candidate.tagline            ?? '',
      profil_ringkas:     candidate.profil_ringkas     ?? '',
      mengapa_bertanding: candidate.mengapa_bertanding ?? '',
      quote_peribadi:     candidate.quote_peribadi     ?? '',
      warna_utama:        candidate.warna_utama        ?? '#1e3a5f',
      whatsapp:           candidate.whatsapp           ?? '',
      facebook_url:       candidate.facebook_url       ?? '',
      instagram_url:      candidate.instagram_url      ?? '',
      tiktok_url:         candidate.tiktok_url         ?? '',
    })
    setEditError('')
    setEditSuccess(false)
    setEditOpen(true)
  }

  async function handleEditFields() {
    setEditSubmitting(true)
    setEditError('')
    setEditSuccess(false)
    try {
      const payload: Record<string, string | null> = {}
      for (const [k, v] of Object.entries(editFields)) {
        payload[k] = v.trim() === '' ? null : v.trim()
      }
      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setEditError(data.error || 'Gagal'); return }
      setCandidate(data.candidate as Candidate)
      setEditSuccess(true)
    } finally {
      setEditSubmitting(false)
    }
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

      {/* Edit Data Calon */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <button
          onClick={() => { if (!editOpen) openEdit(); else setEditOpen(false) }}
          style={{
            width: '100%', padding: '14px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#374151',
          }}
        >
          <span>Edit Data Calon</span>
          <span style={{ fontSize: 20, lineHeight: 1, color: '#9ca3af' }}>{editOpen ? '−' : '+'}</span>
        </button>

        {editOpen && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f3f4f6' }}>
            {[
              { key: 'full_name',          label: 'Nama Penuh',           type: 'input' },
              { key: 'preferred_name',     label: 'Nama Panggilan',       type: 'input' },
              { key: 'tagline',            label: 'Tagline',              type: 'input' },
              { key: 'profil_ringkas',     label: 'Profil Ringkas',       type: 'textarea' },
              { key: 'mengapa_bertanding', label: 'Mengapa Bertanding',   type: 'textarea' },
              { key: 'quote_peribadi',     label: 'Quote Peribadi',       type: 'input' },
              { key: 'warna_utama',        label: 'Warna Utama (hex)',    type: 'input' },
              { key: 'whatsapp',           label: 'WhatsApp',             type: 'input' },
              { key: 'facebook_url',       label: 'Facebook URL',         type: 'input' },
              { key: 'instagram_url',      label: 'Instagram URL',        type: 'input' },
              { key: 'tiktok_url',         label: 'TikTok URL',           type: 'input' },
            ].map(({ key, label, type }) => (
              <div key={key} style={{ marginTop: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  {label}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    value={editFields[key] ?? ''}
                    onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 13,
                      border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none',
                      resize: 'vertical', boxSizing: 'border-box' as const,
                    }}
                  />
                ) : (
                  <input
                    value={editFields[key] ?? ''}
                    onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px', fontSize: 13,
                      border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none',
                      boxSizing: 'border-box' as const,
                    }}
                  />
                )}
              </div>
            ))}

            {editError && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 12 }}>⚠ {editError}</p>
            )}
            {editSuccess && (
              <p style={{ color: '#065f46', fontSize: 12, marginTop: 12 }}>✓ Dikemaskini.</p>
            )}

            <button
              onClick={handleEditFields}
              disabled={editSubmitting}
              style={{
                marginTop: 16, width: '100%', padding: 12, fontSize: 14, fontWeight: 600,
                background: editSubmitting ? '#e5e7eb' : '#111827',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: editSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}
      </div>

      {/* Batalkan & Padam */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#dc2626', textDecoration: 'underline', padding: '4px 8px',
            }}
          >
            Batalkan & Padam Candidate
          </button>
        ) : (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16 }}>
            <p style={{ fontSize: 13, color: '#991b1b', marginBottom: 14, fontWeight: 600 }}>
              Padam candidate ini? Data tidak boleh dipulihkan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                style={{
                  flex: 1, padding: 10, fontSize: 14, fontWeight: 600,
                  background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
                  borderRadius: 8, cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: 10, fontSize: 14, fontWeight: 600,
                  background: deleting ? '#e5e7eb' : '#dc2626',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Memproses...' : 'Ya, Padam'}
              </button>
            </div>
          </div>
        )}
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
