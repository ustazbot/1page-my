'use client'

import { useState } from 'react'
import SheetsPuller from './SheetsPuller'
import { useAppState } from '@/lib/store'
import type { AppStateAction } from '@/lib/store'
import type { ClientData } from '@/types/client'

// ─── SEO Extras (operator fills manually) ────────────────────────────────────

const PRICE_RANGE_OPTIONS = [
  { value: '$',   label: '$ — Berpatutan' },
  { value: '$$',  label: '$$ — Sederhana' },
  { value: '$$$', label: '$$$ — Premium' },
]

const inputSm: React.CSSProperties = {
  height: 32, padding: '0 10px',
  fontSize: 12, fontFamily: 'var(--font-mono)',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  width: '100%',
}

function SeoExtras({ client, dispatch }: { client: ClientData; dispatch: React.Dispatch<AppStateAction> }) {
  function set(patch: Partial<ClientData>) {
    dispatch({ type: 'UPDATE_CLIENT', payload: patch })
  }

  const hasGeo = !!client.location.geo_lat && !!client.location.geo_lng
  const hasHours = !!client.seo.opening_hours_schema
  const hasPrice = !!client.seo.price_range

  return (
    <div style={{
      marginBottom: 24,
      padding: '14px 16px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase',
        }}>
          Maklumat SEO Tempatan
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          {[hasGeo, hasHours, hasPrice].map((ok, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: ok ? 'var(--color-success)' : 'var(--color-border-strong)',
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* GPS Coordinates */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 5 }}>
            Koordinat GPS <span style={{ opacity: 0.6 }}>— salin dari Google Maps (klik kanan → koordinat)</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              style={inputSm}
              placeholder="Latitud  3.1234"
              value={client.location.geo_lat ?? ''}
              onChange={(e) => set({ location: { ...client.location, geo_lat: e.target.value } })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <input
              style={inputSm}
              placeholder="Longitud  101.6789"
              value={client.location.geo_lng ?? ''}
              onChange={(e) => set({ location: { ...client.location, geo_lng: e.target.value } })}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
        </div>

        {/* Opening hours schema */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 5 }}>
            Waktu Operasi (format schema) <span style={{ opacity: 0.6 }}>— contoh: Mo-Fr 09:00-18:00, Sa 09:00-13:00</span>
          </p>
          <input
            style={inputSm}
            placeholder="Mo-Su 08:00-22:00"
            value={client.seo.opening_hours_schema ?? ''}
            onChange={(e) => set({ seo: { ...client.seo, opening_hours_schema: e.target.value } })}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </div>

        {/* Price range */}
        <div>
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 5 }}>
            Julat Harga
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {PRICE_RANGE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => set({ seo: { ...client.seo, price_range: value } })}
                style={{
                  height: 32, padding: '0 12px',
                  fontSize: 11, fontFamily: 'var(--font-sans)',
                  background: client.seo.price_range === value ? 'rgba(232,160,32,0.1)' : 'var(--color-surface)',
                  color: client.seo.price_range === value ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  border: `1px solid ${client.seo.price_range === value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function IntakeModule() {
  const { state, dispatch } = useAppState()
  const [expandedClient, setExpandedClient] = useState(false)

  return (
    <div className="module-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      {/* Page header */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 20,
          marginBottom: 28,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
            }}
          >
            Intake
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Upload CSV dari Google Forms · drag-drop atau klik untuk pilih fail
          </p>
        </div>

        {state.activeClient && (
          <button
            onClick={() => setExpandedClient(!expandedClient)}
            style={{
              height: 28,
              padding: '0 12px',
              fontSize: 11,
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {expandedClient ? 'Hide' : 'View'} Draft JSON
          </button>
        )}
      </div>

      {/* Draft JSON viewer */}
      {expandedClient && state.activeClient && (
        <div
          style={{
            marginBottom: 24,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 14px',
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
              }}
            >
              ClientData Draft
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-accent)',
              }}
            >
              {state.activeClient._meta.template}
            </span>
          </div>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              padding: '16px',
              margin: 0,
              overflowX: 'auto',
              background: 'var(--color-bg)',
              maxHeight: 320,
              overflowY: 'auto',
              lineHeight: 1.7,
            }}
          >
            {JSON.stringify(state.activeClient, null, 2)}
          </pre>
        </div>
      )}

      {/* Field checklist for active client */}
      {state.activeClient && (
        <div
          style={{
            marginBottom: 24,
            padding: '14px 16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Field Checklist — {state.activeClient.seo.business_name}
          </p>
          <div
            className="module-grid-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
            }}
          >
            {[
              ['Nama Bisnes', !!state.activeClient.seo.business_name],
              ['Tagline', !!state.activeClient.seo.tagline],
              ['Hero Image', !!state.activeClient.hero.hero_image],
              ['Logo', !!state.activeClient.hero.logo_image],
              ['Telefon', !!state.activeClient.contact.contact_phone],
              ['WhatsApp', !!state.activeClient.contact.whatsapp_link],
              ['Alamat', !!state.activeClient.location.full_address],
              ['Waktu Ops', !!state.activeClient.location.operating_hours],
              ['Produk', state.activeClient.products.items.length > 0],
              ['Instagram', !!state.activeClient.social.links.instagram],
              ['Facebook', !!state.activeClient.social.links.facebook],
              ['Template', !!state.activeClient._meta.template],
            ].map(([label, filled]) => (
              <div
                key={String(label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: filled ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: filled ? 'var(--color-success)' : 'var(--color-border-strong)',
                    flexShrink: 0,
                  }}
                />
                {String(label)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO extras — operator fills in manually */}
      {state.activeClient && (
        <SeoExtras
          client={state.activeClient}
          dispatch={dispatch}
        />
      )}

      {/* Main puller */}
      <SheetsPuller />
    </div>
  )
}
