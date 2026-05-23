'use client'

import Link from 'next/link'
import { useAppState } from '@/lib/store'
import OrdersList from '@/components/dashboard/OrdersList'

const WORKFLOW: Array<{
  id: keyof ReturnType<typeof useAppState>['state']['moduleStatus']
  label: string
  href: string
  desc: string
  num: number
}> = [
  { num: 1, id: 'intake',    label: 'Intake',     href: '/intake',    desc: 'Load order dari Supabase' },
  { num: 2, id: 'assets',    label: 'Assets',     href: '/assets',    desc: 'Upload & optimise gambar' },
  { num: 3, id: 'copywrite', label: 'Copywrite',  href: '/copywrite', desc: 'Jana copy dengan AI' },
  { num: 4, id: 'build',     label: 'Build',      href: '/build',     desc: 'Inject template & preview' },
  { num: 5, id: 'preview',   label: 'Preview',    href: '/preview',   desc: 'Push ke preview site' },
  { num: 6, id: 'deploy',    label: 'Deploy',     href: '/deploy',    desc: 'Live deploy ke Cloudflare' },
]

const STATUS_DOT = {
  complete:    { bg: 'var(--color-success)', label: 'Done' },
  in_progress: { bg: 'var(--color-warning)', label: 'In Progress' },
  idle:        { bg: 'var(--color-border-strong)', label: '' },
}

export default function Dashboard() {
  const { state } = useAppState()

  const completedCount = Object.values(state.moduleStatus).filter(s => s === 'complete').length
  const hasClient = !!state.activeClient

  return (
    <div className="module-content" style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          1page.my operator tool · {completedCount}/6 modul selesai
        </p>
      </div>

      {/* Active client strip */}
      {hasClient ? (
        <div style={{
          marginBottom: 28,
          padding: '14px 18px',
          background: 'rgba(232,160,32,0.06)',
          border: '1px solid rgba(232,160,32,0.2)',
          borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>
              {state.activeClient!.seo.business_name}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 12 }}>
              {state.activeClient!._meta.template} · {state.activeClient!.project.status.toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {completedCount}/6 modul
          </span>
        </div>
      ) : (
        <div style={{
          marginBottom: 28,
          padding: '14px 18px',
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border-strong)',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Tiada client aktif. Load order dari senarai di bawah untuk mulakan.
          </p>
        </div>
      )}

      {/* Workflow steps */}
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
        Workflow
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
        {WORKFLOW.map((step, i) => {
          const status = state.moduleStatus[step.id]
          const dot    = STATUS_DOT[status]
          const prevDone = i === 0 || state.moduleStatus[WORKFLOW[i - 1].id] === 'complete'
          const dim    = !hasClient && step.id !== 'intake'

          return (
            <Link
              key={step.id}
              href={step.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                opacity: dim ? 0.45 : 1,
                pointerEvents: dim ? 'none' : undefined,
                transition: 'border-color 0.1s',
              }}
              onMouseEnter={(e) => { if (!dim) e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
              onMouseLeave={(e) => { if (!dim) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              {/* step number */}
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, letterSpacing: 0,
                background: status === 'complete' ? 'rgba(34,197,94,0.15)' : 'var(--color-surface-2)',
                color: status === 'complete' ? 'var(--color-success)' : 'var(--color-text-muted)',
                border: `1px solid ${status === 'complete' ? 'rgba(34,197,94,0.3)' : 'var(--color-border)'}`,
              }}>
                {status === 'complete' ? '✓' : step.num}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
                  color: 'var(--color-text-primary)',
                  display: 'block', marginBottom: 1,
                }}>
                  {step.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {step.desc}
                </span>
              </div>

              {status === 'in_progress' && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)',
                  border: '1px solid rgba(245,158,11,0.25)', letterSpacing: '0.04em',
                }}>
                  In Progress
                </span>
              )}
              {!prevDone && status === 'idle' && hasClient && (
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>→</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Orders */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Orders Terbaru
          </p>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Klik Load untuk mulakan kerja
          </span>
        </div>
        <OrdersList />
      </div>

      {/* AI info */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          AI
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent)' }}>
          claude-sonnet-4-6
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>· tukar provider dalam Copywrite</span>
      </div>
    </div>
  )
}
