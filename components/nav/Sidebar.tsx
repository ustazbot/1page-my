'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AppState, ModuleStatus } from '@/types/client'

const MODULES: Array<{ id: keyof AppState['moduleStatus']; label: string; href: string }> = [
  { id: 'intake',    label: 'INTAKE',     href: '/intake' },
  { id: 'assets',    label: 'ASSETS',     href: '/assets' },
  { id: 'copywrite', label: 'COPYWRITE',  href: '/copywrite' },
  { id: 'build',     label: 'BUILD',      href: '/build' },
  { id: 'preview',   label: 'PREVIEW',    href: '/preview' },
  { id: 'deploy',    label: 'DEPLOY',     href: '/deploy' },
]

function StatusDot({ status }: { status: ModuleStatus }) {
  const color =
    status === 'complete'    ? 'var(--color-success)' :
    status === 'in_progress' ? 'var(--color-warning)' :
                               'var(--color-text-muted)'
  return (
    <span style={{
      display: 'inline-block', width: 5, height: 5,
      borderRadius: '50%', background: color, flexShrink: 0, marginTop: 1,
    }} />
  )
}

interface SidebarProps {
  state: AppState
  onClose?: () => void
}

export default function Sidebar({ state, onClose }: SidebarProps) {
  const pathname = usePathname()

  function navLink(href: string) {
    return (
      pathname === href
        ? { background: 'var(--color-surface-2)', borderLeft: '2px solid var(--color-accent)' }
        : { background: 'transparent', borderLeft: '2px solid transparent' }
    )
  }

  return (
    <aside style={{
      width: '100%', height: '100%',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Wordmark + close button */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" onClick={onClose} style={{ textDecoration: 'none' }}>
          <span style={{ color: 'var(--color-text-primary)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em' }}>
            1page<span style={{ color: 'var(--color-accent)' }}>.my</span>
          </span>
          <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1, letterSpacing: '0.06em' }}>
            OPERATOR TOOL
          </p>
        </Link>

        {/* Close button — only visible on mobile via CSS */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
        {/* Dashboard */}
        <Link
          href="/operator"
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', marginBottom: 2,
            textDecoration: 'none', ...navLink('/operator'),
            transition: 'background 0.1s',
          }}
        >
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
            color: pathname === '/operator' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}>
            DASHBOARD
          </span>
        </Link>

        <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 20px 8px' }} />

        {MODULES.map((mod) => {
          const isActive = pathname.startsWith(mod.href)
          const status   = state.moduleStatus[mod.id]
          return (
            <Link
              key={mod.id}
              href={mod.href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', textDecoration: 'none',
                background: isActive ? 'var(--color-surface-2)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              <StatusDot status={status} />
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}>
                {mod.label}
              </span>
              {status === 'complete' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-success)' }}>✓</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Active client */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6,
        }}>
          Active Client
        </p>
        {state.activeClient ? (
          <>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--color-text-primary)', marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {state.activeClient.seo.business_name}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
              {state.activeClient._meta.template}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
            None selected
          </p>
        )}
      </div>
    </aside>
  )
}
