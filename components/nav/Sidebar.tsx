'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AppState, ModuleStatus } from '@/types/client'

const MODULES: Array<{ id: keyof AppState['moduleStatus']; label: string; href: string }> = [
  { id: 'intake', label: 'INTAKE', href: '/intake' },
  { id: 'assets', label: 'ASSETS', href: '/assets' },
  { id: 'copywrite', label: 'COPYWRITE', href: '/copywrite' },
  { id: 'build', label: 'BUILD', href: '/build' },
  { id: 'preview', label: 'PREVIEW', href: '/preview' },
  { id: 'deploy', label: 'DEPLOY', href: '/deploy' },
]

function StatusDot({ status }: { status: ModuleStatus }) {
  const color =
    status === 'complete'
      ? 'var(--color-success)'
      : status === 'in_progress'
      ? 'var(--color-warning)'
      : 'var(--color-text-muted)'

  return (
    <span
      style={{
        display: 'inline-block',
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        marginTop: 1,
      }}
    />
  )
}

interface SidebarProps {
  state: AppState
}

export default function Sidebar({ state }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
      }}
    >
      {/* wordmark */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            1page
            <span style={{ color: 'var(--color-accent)' }}>.my</span>
          </span>
        </Link>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            marginTop: 2,
            letterSpacing: '0.05em',
          }}
        >
          OPERATOR TOOL
        </p>
      </div>

      {/* nav */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        {/* Dashboard link */}
        <Link
          href="/operator"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', marginBottom: 4,
            textDecoration: 'none',
            background: pathname === '/operator' ? 'var(--color-surface-2)' : 'transparent',
            borderLeft: pathname === '/operator' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
          onMouseEnter={(e) => { if (pathname !== '/operator') e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          onMouseLeave={(e) => { if (pathname !== '/operator') e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            color: pathname === '/operator' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}>
            DASHBOARD
          </span>
        </Link>

        <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 20px 8px' }} />

        {MODULES.map((mod) => {
          const isActive = pathname.startsWith(mod.href)
          const status = state.moduleStatus[mod.id]

          return (
            <Link
              key={mod.id}
              href={mod.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 20px',
                textDecoration: 'none',
                background: isActive ? 'var(--color-surface-2)' : 'transparent',
                borderLeft: isActive
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <StatusDot status={status} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                }}
              >
                {mod.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* active client */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Active Client
        </p>

        {state.activeClient ? (
          <>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--color-text-primary)',
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {state.activeClient.seo.business_name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text-muted)',
                marginBottom: 2,
              }}
            >
              {state.activeClient._meta.template}
            </p>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                color:
                  state.activeClient.project.status === 'live'
                    ? 'var(--color-success)'
                    : state.activeClient.project.status === 'preview'
                    ? 'var(--color-warning)'
                    : 'var(--color-text-muted)',
              }}
            >
              <StatusDot
                status={
                  state.activeClient.project.status === 'live'
                    ? 'complete'
                    : state.activeClient.project.status === 'preview'
                    ? 'in_progress'
                    : 'idle'
                }
              />
              {state.activeClient.project.status.toUpperCase()}
            </span>
          </>
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            None selected
          </p>
        )}
      </div>
    </aside>
  )
}
