'use client'

import Link from 'next/link'
import { useAppState } from '@/lib/store'
import OrdersList from '@/components/dashboard/OrdersList'

const QUICK_LINKS = [
  { label: 'Intake', href: '/intake', desc: 'Upload CSV dari Google Forms' },
  { label: 'Assets', href: '/assets', desc: 'Upload & optimise images' },
  { label: 'Copywrite', href: '/copywrite', desc: 'Jana copy dengan AI' },
  { label: 'Build', href: '/build', desc: 'Inject template & preview' },
  { label: 'Preview', href: '/preview', desc: 'Push ke preview site' },
  { label: 'Deploy', href: '/deploy', desc: 'Live deploy ke Cloudflare' },
]

export default function Dashboard() {
  const { state } = useAppState()

  const completedCount = Object.values(state.moduleStatus).filter(
    (s) => s === 'complete'
  ).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 20,
          marginBottom: 28,
        }}
      >
        <h1
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 4,
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          1page.my operator tool
        </p>
      </div>

      {/* status bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'var(--color-border)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: 28,
        }}
      >
        {[
          {
            label: 'Active Client',
            value: state.activeClient?.seo.business_name ?? '—',
            mono: true,
          },
          {
            label: 'Modules Done',
            value: `${completedCount} / 6`,
            mono: false,
          },
          {
            label: 'Status',
            value: state.activeClient?.project.status.toUpperCase() ?? '—',
            mono: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: 'var(--color-surface)',
              padding: '14px 18px',
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: 14,
                fontFamily: item.mono ? 'var(--font-mono)' : 'inherit',
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* modules grid */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Modules
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 28,
        }}
      >
        {QUICK_LINKS.map((link) => {
          const modKey = link.label.toLowerCase() as keyof typeof state.moduleStatus
          const status = state.moduleStatus[modKey]

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                padding: '14px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                transition: 'border-color 0.1s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--color-border-strong)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--color-border)')
              }
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background:
                      status === 'complete'
                        ? 'var(--color-success)'
                        : status === 'in_progress'
                        ? 'var(--color-warning)'
                        : 'var(--color-text-muted)',
                    display: 'inline-block',
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {link.desc}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Orders from Supabase */}
      <div style={{ marginTop: 32 }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          Orders Terbaru
        </p>
        <OrdersList />
      </div>

      {/* ai provider info */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
          }}
        >
          AI
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--color-accent)',
          }}
        >
          claude · claude-sonnet-4-6
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          switch provider in Copywrite module
        </span>
      </div>
    </div>
  )
}
