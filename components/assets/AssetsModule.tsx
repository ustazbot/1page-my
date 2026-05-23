'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useAppState } from '@/lib/store'
import SlotCard, { type SlotResult } from './SlotCard'
import ReuseMenu from './ReuseMenu'
import type { ClientData } from '@/types/client'

// ─── Slot definitions ────────────────────────────────────────────────────────

const SLOTS_MAIN = [
  { slot: 'hero',  label: 'Hero Image',  hint: 'max 1200px · WebP 85' },
  { slot: 'logo',  label: 'Logo',        hint: 'max 400px · PNG' },
  { slot: 'og',    label: 'OG Image',    hint: '1200×630 · JPG' },
  { slot: 'about', label: 'About Image', hint: 'max 800px · WebP 85' },
]

const SLOTS_GALLERY = Array.from({ length: 6 }, (_, i) => ({
  slot: `gallery_${i + 1}`,
  label: `Gallery ${i + 1}`,
  hint: 'max 800px · WebP 80',
}))

const SLOTS_PRODUCTS = Array.from({ length: 6 }, (_, i) => ({
  slot: `product_${i + 1}`,
  label: `Product ${i + 1}`,
  hint: 'max 600px · WebP 80',
}))

const ALL_SLOTS = [
  ...SLOTS_MAIN,
  ...SLOTS_GALLERY,
  ...SLOTS_PRODUCTS,
]

// ─── Slot ↔ ClientData helpers ───────────────────────────────────────────────

function getSlotImage(data: ClientData, slot: string): string | undefined {
  if (slot === 'hero')  return data.hero.hero_image || undefined
  if (slot === 'logo')  return data.hero.logo_image || undefined
  if (slot === 'og')    return data.seo.og_image || undefined
  if (slot === 'about') return data.about.about_image || undefined

  const gm = slot.match(/^gallery_(\d)$/)
  if (gm) return data.gallery.images[parseInt(gm[1]) - 1]?.url || undefined

  const pm = slot.match(/^product_(\d)$/)
  if (pm) return data.products.items[parseInt(pm[1]) - 1]?.image || undefined
}

function applySlot(data: ClientData, slot: string, result: SlotResult): Partial<ClientData> {
  const url = result.publicPath
  if (slot === 'hero')  return { hero: { ...data.hero, hero_image: url } }
  if (slot === 'logo')  return { hero: { ...data.hero, logo_image: url } }
  if (slot === 'og')    return { seo: { ...data.seo, og_image: url } }
  if (slot === 'about') return { about: { ...data.about, about_image: url } }

  const gm = slot.match(/^gallery_(\d)$/)
  if (gm) {
    const idx = parseInt(gm[1]) - 1
    const images = [...data.gallery.images]
    images[idx] = { id: idx + 1, url, alt: images[idx]?.alt ?? '' }
    return { gallery: { ...data.gallery, images, enabled: true } }
  }

  const pm = slot.match(/^product_(\d)$/)
  if (pm) {
    const idx = parseInt(pm[1]) - 1
    const items = [...data.products.items]
    items[idx] = { ...(items[idx] ?? { id: idx + 1, name: '', desc: '' }), image: url }
    return { products: { ...data.products, items } }
  }
  return {}
}

// ─── Logo fallback preview ────────────────────────────────────────────────────

function LogoFallback({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
        color: 'var(--color-text-muted)', textTransform: 'uppercase',
      }}>
        Logo Fallback
      </span>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--color-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--color-border)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#000' }}>
          {initials}
        </span>
      </div>
      <p style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Auto-generated jika tiada logo</p>
    </div>
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 14, paddingBottom: 8,
      borderBottom: '1px solid var(--color-border)',
    }}>
      <p style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
        color: 'var(--color-text-muted)', textTransform: 'uppercase',
      }}>
        {label}
      </p>
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{count} slots</span>
    </div>
  )
}

// ─── Main module ─────────────────────────────────────────────────────────────

export default function AssetsModule() {
  const { state, dispatch } = useAppState()
  const client = state.activeClient

  // ── Mechanism 2: auto-disable gallery if no images after client loads ─────
  useEffect(() => {
    if (!client) return
    const hasGalleryImages = client.gallery.images.some((img) => img.url)
    if (client.gallery.enabled && !hasGalleryImages) {
      dispatch({
        type: 'UPDATE_CLIENT',
        payload: { gallery: { ...client.gallery, enabled: false } },
      })
    }
  }, [client?.gallery.images]) // eslint-disable-line

  function handleProcessed(slot: string, result: SlotResult) {
    if (!client) return
    const patch = applySlot(client, slot, result)
    dispatch({ type: 'UPDATE_CLIENT', payload: patch })
    dispatch({ type: 'SET_MODULE_STATUS', module: 'assets', status: 'in_progress' })

    // ── Mechanism 2: auto-copy hero → OG if OG empty ──────────────────────
    if (slot === 'hero' && !client.seo.og_image) {
      fetch('/api/assets/reuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePath: result.publicPath,
          targetSlot: 'og',
          slug: client.project.slug,
        }),
      })
        .then((r) => r.json())
        .then((ogResult) => {
          dispatch({
            type: 'UPDATE_CLIENT',
            payload: { seo: { ...client.seo, og_image: ogResult.publicPath } },
          })
        })
        .catch(() => {}) // silent — user can manually assign later
    }

    // ── Mark assets complete if hero is filled ────────────────────────────
    const updatedClient = { ...client, ...patch } as ClientData
    const heroFilled = slot === 'hero'
      ? !!result.publicPath
      : !!updatedClient.hero.hero_image
    if (heroFilled) {
      dispatch({ type: 'SET_MODULE_STATUS', module: 'assets', status: 'complete' })
    }
  }

  function handleReused(targetSlot: string, result: SlotResult) {
    if (!client) return
    const patch = applySlot(client, targetSlot, result)
    dispatch({ type: 'UPDATE_CLIENT', payload: patch })
  }

  // Build list of empty slots (for reuse menu)
  function emptySlots(excludeSlot: string) {
    if (!client) return []
    return ALL_SLOTS
      .filter((s) => s.slot !== excludeSlot && !getSlotImage(client, s.slot))
      .map((s) => ({ slot: s.slot, label: s.label }))
  }

  const filledCount = client
    ? ALL_SLOTS.filter((s) => getSlotImage(client, s.slot)).length
    : 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="module-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: 20, marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Assets
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Upload & optimise images · drag-drop ke slot atau tekan +
          </p>
        </div>
        {client && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>
              {client.seo.business_name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {filledCount} / {ALL_SLOTS.length} slots diisi
            </p>
          </div>
        )}
      </div>

      {/* No client guard */}
      {!client ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Tiada client aktif. Pergi ke Intake dahulu.
          </p>
          <Link href="/intake" style={{ fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>
            → Pergi ke Intake
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          {/* Tip — shown only if client has few images */}
          {filledCount < 2 && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(232,160,32,0.06)',
              border: '1px solid rgba(232,160,32,0.15)',
              borderRadius: 'var(--radius)',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
            }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Tip: </span>
              Upload hero image dahulu — ia akan auto-copy ke OG slot. Gunakan butang{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Reuse →</span>{' '}
              pada slot yang dah diisi untuk assign ke slot lain.
            </div>
          )}

          {/* Core slots */}
          <div>
            <SectionLabel label="Core Images" count={4} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {SLOTS_MAIN.map(({ slot, label, hint }) => (
                <SlotCard
                  key={slot}
                  slot={slot}
                  label={label}
                  hint={hint}
                  slug={client.project.slug}
                  currentImage={getSlotImage(client, slot)}
                  onProcessed={handleProcessed}
                  reuseMenu={
                    getSlotImage(client, slot) ? (
                      <ReuseMenu
                        sourceSlot={slot}
                        sourcePath={getSlotImage(client, slot)!}
                        slug={client.project.slug}
                        emptySlots={emptySlots(slot)}
                        onReused={handleReused}
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
            {!client.hero.logo_image && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <LogoFallback name={client.seo.business_name} />
              </div>
            )}
          </div>

          {/* Gallery slots */}
          <div>
            <SectionLabel label="Gallery" count={6} />
            {!client.gallery.enabled && (
              <div style={{
                marginBottom: 12, padding: '8px 12px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, color: 'var(--color-warning)' }}>
                  Gallery disabled — tiada gambar. Upload untuk aktifkan semula.
                </span>
                <button
                  onClick={() => dispatch({
                    type: 'UPDATE_CLIENT',
                    payload: { gallery: { ...client.gallery, enabled: true } },
                  })}
                  style={{
                    fontSize: 10, color: 'var(--color-warning)',
                    background: 'none', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 'var(--radius-sm)', padding: '2px 8px',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}
                >
                  Aktifkan
                </button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
              {SLOTS_GALLERY.map(({ slot, label, hint }) => (
                <SlotCard
                  key={slot}
                  slot={slot}
                  label={label}
                  hint={hint}
                  slug={client.project.slug}
                  currentImage={getSlotImage(client, slot)}
                  onProcessed={handleProcessed}
                  reuseMenu={
                    getSlotImage(client, slot) ? (
                      <ReuseMenu
                        sourceSlot={slot}
                        sourcePath={getSlotImage(client, slot)!}
                        slug={client.project.slug}
                        emptySlots={emptySlots(slot)}
                        onReused={handleReused}
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
          </div>

          {/* Product slots */}
          <div>
            <SectionLabel label="Product Images" count={6} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
              {SLOTS_PRODUCTS.map(({ slot, label, hint }) => (
                <SlotCard
                  key={slot}
                  slot={slot}
                  label={label}
                  hint={hint}
                  slug={client.project.slug}
                  currentImage={getSlotImage(client, slot)}
                  onProcessed={handleProcessed}
                  reuseMenu={
                    getSlotImage(client, slot) ? (
                      <ReuseMenu
                        sourceSlot={slot}
                        sourcePath={getSlotImage(client, slot)!}
                        slug={client.project.slug}
                        emptySlots={emptySlots(slot)}
                        onReused={handleReused}
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
          </div>

          {/* Progress footer */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
              color: 'var(--color-text-muted)', textTransform: 'uppercase',
            }}>
              Progress
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ color: filledCount > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {filledCount}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}> / {ALL_SLOTS.length} slots</span>
            </span>
            {!client.hero.hero_image && (
              <span style={{ fontSize: 11, color: 'var(--color-warning)' }}>
                · Hero image wajib
              </span>
            )}
            {client.gallery.enabled
              ? <span style={{ fontSize: 11, color: 'var(--color-success)' }}>· Gallery aktif</span>
              : <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>· Gallery disabled</span>
            }
          </div>

        </div>
      )}
    </div>
  )
}
