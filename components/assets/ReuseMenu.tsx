'use client'

import { useState, useRef, useEffect } from 'react'
import type { SlotResult } from './SlotCard'

interface ReuseMenuProps {
  sourceSlot: string
  sourcePath: string
  slug: string
  emptySlots: Array<{ slot: string; label: string }>
  onReused: (targetSlot: string, result: SlotResult) => void
}

export default function ReuseMenu({
  sourceSlot, sourcePath, slug, emptySlots, onReused,
}: ReuseMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function reuse(targetSlot: string) {
    setLoading(targetSlot)
    try {
      const res = await fetch('/api/assets/reuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath, targetSlot, slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onReused(targetSlot, data)
      setOpen(false)
    } catch (err) {
      console.error('Reuse failed:', err)
    } finally {
      setLoading(null)
    }
  }

  if (emptySlots.length === 0) return null

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          height: 22,
          padding: '0 8px',
          fontSize: 10,
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          transition: 'color 0.1s, border-color 0.1s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-secondary)'
          e.currentTarget.style.borderColor = 'var(--color-border-strong)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        Reuse →
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 50,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius)',
          minWidth: 160,
          overflow: 'hidden',
        }}>
          <p style={{
            padding: '6px 10px',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            borderBottom: '1px solid var(--color-border)',
          }}>
            Copy ke slot
          </p>
          {emptySlots.map(({ slot, label }) => (
            <button
              key={slot}
              onClick={() => reuse(slot)}
              disabled={loading === slot}
              style={{
                display: 'block',
                width: '100%',
                padding: '7px 10px',
                textAlign: 'left',
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                color: loading === slot ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                cursor: loading === slot ? 'wait' : 'pointer',
                transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={(e) => {
                if (loading !== slot) {
                  e.currentTarget.style.background = 'var(--color-surface)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              {loading === slot ? 'Processing...' : label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
