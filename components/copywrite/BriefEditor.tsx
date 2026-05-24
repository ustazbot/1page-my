'use client'

import type { CopyBrief } from '@/lib/claude'

interface BriefEditorProps {
  brief: CopyBrief
  provider: 'claude' | 'deepseek'
  loading: boolean
  onChange: (brief: CopyBrief) => void
  onProviderChange: (p: 'claude' | 'deepseek') => void
  onGenerate: () => void
}

const TONE_OPTIONS: CopyBrief['tone'][] = ['Profesional', 'Mesra', 'Bold', 'Warm']

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 10px',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  fontSize: 13,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.1s',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: 'auto',
  minHeight: 72,
  padding: '8px 10px',
  resize: 'vertical',
  lineHeight: 1.5,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.1em',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  marginBottom: 5,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function BriefEditor({
  brief, provider, loading, onChange, onProviderChange, onGenerate,
}: BriefEditorProps) {
  function set<K extends keyof CopyBrief>(key: K, value: CopyBrief[K]) {
    onChange({ ...brief, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Section header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase',
        }}>
          Brief
        </p>
        {/* Provider toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          {(['claude', 'deepseek'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onProviderChange(p)}
              style={{
                height: 22,
                padding: '0 8px',
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
                background: provider === p ? 'var(--color-surface-2)' : 'transparent',
                color: provider === p ? 'var(--color-accent)' : 'var(--color-text-muted)',
                border: `1px solid ${provider === p ? 'var(--color-accent)' : 'transparent'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Nama Bisnes">
          <input
            style={inputStyle}
            value={brief.business_name}
            onChange={(e) => set('business_name', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </Field>

        <Field label="Industri / Kategori">
          <input
            style={inputStyle}
            placeholder="cth: Bakeri, Servis AC, Kedai Runcit"
            value={brief.industry}
            onChange={(e) => set('industry', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </Field>

        <Field label="Produk / Servis Utama">
          <textarea
            style={textareaStyle}
            placeholder="Senaraikan produk atau servis utama"
            value={brief.products}
            onChange={(e) => set('products', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </Field>

        <Field label="Target Pelanggan">
          <input
            style={inputStyle}
            placeholder="cth: Ibu bapa, Pemilik kereta, Syarikat kecil"
            value={brief.target_audience}
            onChange={(e) => set('target_audience', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </Field>

        <Field label="Lokasi">
          <input
            style={inputStyle}
            placeholder="cth: Puchong, Selangor"
            value={brief.location}
            onChange={(e) => set('location', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </Field>

        <Field label="Unique Selling Point (USP)">
          <textarea
            style={{ ...textareaStyle, minHeight: 60 }}
            placeholder="Apa yang buat bisnes ini lain dari pesaing?"
            value={brief.usp}
            onChange={(e) => set('usp', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </Field>

        {/* Tone + Language row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Tone">
            <select
              value={brief.tone}
              onChange={(e) => set('tone', e.target.value as CopyBrief['tone'])}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a4845'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: 28,
              }}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t} style={{ background: '#1a1a1a' }}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Bahasa">
            <div style={{ display: 'flex', height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {(['BM', 'BM+English'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => set('language', lang)}
                  style={{
                    flex: 1,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    background: brief.language === lang ? 'var(--color-surface-2)' : 'transparent',
                    color: brief.language === lang ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    border: 'none',
                    borderRight: lang === 'BM' ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={loading || !brief.business_name}
          style={{
            height: 36,
            width: '100%',
            marginTop: 4,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.02em',
            background: loading || !brief.business_name
              ? 'var(--color-surface-2)'
              : 'var(--color-accent)',
            color: loading || !brief.business_name ? 'var(--color-text-muted)' : '#000',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: loading || !brief.business_name ? 'not-allowed' : 'pointer',
            transition: 'background 0.1s',
          }}
        >
          {loading ? 'Menjana...' : `Jana Copy — ${provider}`}
        </button>
      </div>
    </div>
  )
}
