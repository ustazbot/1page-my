'use client'

import { useState } from 'react'
import type { CopyOutput } from '@/types/client'
import type { CopyBrief } from '@/lib/claude'

interface CopyOutputProps {
  output: Partial<CopyOutput> | null
  streamBuffer: string
  streaming: boolean
  provider: 'claude' | 'deepseek'
  brief: CopyBrief
  onChange: (output: Partial<CopyOutput>) => void
  onAcceptAll: (output: CopyOutput) => void
}

// Field groups for organised display
const FIELD_GROUPS: Array<{
  section: string
  fields: Array<{ key: keyof CopyOutput; label: string; multiline?: boolean; maxLen?: number }>
}> = [
  {
    section: 'Hero',
    fields: [
      { key: 'hero_headline_part1', label: 'Headline Baris 1' },
      { key: 'hero_headline_part2', label: 'Headline Baris 2' },
      { key: 'hero_badge',          label: 'Badge (atas)' },
      { key: 'tagline',             label: 'Tagline' },
    ],
  },
  {
    section: 'About',
    fields: [
      { key: 'about_title',       label: 'Tajuk About' },
      { key: 'about_paragraph_1', label: 'Perenggan 1', multiline: true },
      { key: 'about_paragraph_2', label: 'Perenggan 2', multiline: true },
    ],
  },
  {
    section: 'Produk & Galeri',
    fields: [
      { key: 'products_title',    label: 'Tajuk Produk' },
      { key: 'products_subtitle', label: 'Subtitle Produk' },
      { key: 'gallery_title',     label: 'Tajuk Gallery' },
      { key: 'gallery_subtitle',  label: 'Subtitle Gallery' },
    ],
  },
  {
    section: 'Lokasi & Sosial',
    fields: [
      { key: 'location_title',    label: 'Tajuk Lokasi' },
      { key: 'location_subtitle', label: 'Subtitle Lokasi' },
      { key: 'social_title',      label: 'Tajuk Sosial' },
      { key: 'social_subtitle',   label: 'Subtitle Sosial' },
    ],
  },
  {
    section: 'CTA',
    fields: [
      { key: 'cta_title',        label: 'CTA Title' },
      { key: 'cta_desc',         label: 'CTA Deskripsi' },
      { key: 'cta_primary_text', label: 'Teks Butang Utama' },
      { key: 'cta_button_text',  label: 'Teks CTA Nav' },
    ],
  },
  {
    section: 'SEO',
    fields: [
      { key: 'seo_description', label: 'Meta Description', multiline: true, maxLen: 160 },
      { key: 'seo_keywords',    label: 'Keywords' },
    ],
  },
]

function RegenButton({
  fieldKey, currentValue, brief, provider,
  onRegen,
}: {
  fieldKey: string
  currentValue: string
  brief: CopyBrief
  provider: 'claude' | 'deepseek'
  onRegen: (key: string, value: string) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleRegen() {
    setLoading(true)
    try {
      const res = await fetch('/api/copywrite/regen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName: fieldKey, currentValue, brief, provider }),
      })
      const data = await res.json()
      if (data.value) onRegen(fieldKey, data.value)
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={handleRegen}
      disabled={loading}
      title="Jana semula field ini"
      style={{
        width: 22, height: 22,
        fontSize: 12,
        background: 'transparent',
        color: loading ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'color 0.1s, border-color 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.color = 'var(--color-accent)'
          e.currentTarget.style.borderColor = 'var(--color-accent)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-muted)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      {loading ? '…' : '↺'}
    </button>
  )
}

export default function CopyOutputPanel({
  output, streamBuffer, streaming, provider, brief, onChange, onAcceptAll,
}: CopyOutputProps) {
  function setField(key: keyof CopyOutput, value: string) {
    onChange({ ...output, [key]: value })
  }

  const isComplete = !streaming && output !== null
  const allFilled = output && Object.keys(output).length >= 18

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase',
        }}>
          Output
          {streaming && (
            <span style={{ marginLeft: 8, color: 'var(--color-accent)', fontWeight: 400 }}>
              · streaming...
            </span>
          )}
        </p>
        {isComplete && allFilled && (
          <button
            onClick={() => onAcceptAll(output as CopyOutput)}
            style={{
              height: 26, padding: '0 12px',
              fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              background: 'var(--color-accent)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Accept All →
          </button>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* Empty state */}
        {!streaming && !output && (
          <div style={{
            height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Isi brief di sebelah kiri<br />
              <span style={{ fontSize: 11 }}>dan tekan "Jana Copy"</span>
            </p>
          </div>
        )}

        {/* Live stream view */}
        {streaming && (
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}>
            {streamBuffer}
            <span style={{
              display: 'inline-block', width: 8, height: 13,
              background: 'var(--color-accent)',
              animation: 'blink 1s step-end infinite',
              verticalAlign: 'middle',
              marginLeft: 2,
            }} />
          </pre>
        )}

        {/* Editable fields once complete */}
        {isComplete && output && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {FIELD_GROUPS.map(({ section, fields }) => (
              <div key={section}>
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
                  color: 'var(--color-text-muted)', textTransform: 'uppercase',
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  {section}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {fields.map(({ key, label, multiline, maxLen }) => {
                    const val = (output[key] as string) ?? ''
                    return (
                      <div key={key}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', marginBottom: 4,
                        }}>
                          <label style={{
                            fontSize: 10, fontWeight: 500,
                            color: 'var(--color-text-muted)',
                            letterSpacing: '0.06em',
                          }}>
                            {label}
                            {maxLen && (
                              <span style={{
                                marginLeft: 8,
                                color: val.length > maxLen
                                  ? 'var(--color-danger)'
                                  : val.length > maxLen * 0.85
                                  ? 'var(--color-warning)'
                                  : 'var(--color-text-muted)',
                              }}>
                                {val.length}/{maxLen}
                              </span>
                            )}
                          </label>
                          <RegenButton
                            fieldKey={key}
                            currentValue={val}
                            brief={brief}
                            provider={provider}
                            onRegen={(k, v) => setField(k as keyof CopyOutput, v)}
                          />
                        </div>
                        {multiline ? (
                          <textarea
                            value={val}
                            onChange={(e) => setField(key, e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: 72,
                              padding: '8px 10px',
                              background: 'var(--color-surface-2)',
                              border: `1px solid ${maxLen && val.length > maxLen ? 'var(--color-danger)' : 'var(--color-border)'}`,
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-primary)',
                              fontSize: 13,
                              fontFamily: 'var(--font-sans)',
                              lineHeight: 1.5,
                              resize: 'vertical',
                              outline: 'none',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                            onBlur={(e) => (e.target.style.borderColor =
                              maxLen && val.length > maxLen ? 'var(--color-danger)' : 'var(--color-border)'
                            )}
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setField(key, e.target.value)}
                            style={{
                              width: '100%',
                              height: 34,
                              padding: '0 10px',
                              background: 'var(--color-surface-2)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-primary)',
                              fontSize: 13,
                              fontFamily: 'var(--font-sans)',
                              outline: 'none',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
