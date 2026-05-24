'use client'

import type { SheetRow } from '@/lib/csv'
import type { ClientData } from '@/types/client'
import type { JobStatus } from '@/lib/jobs'
import { sheetRowToClientData } from '@/lib/intake'

type Completeness = {
  status: 'ready' | 'incomplete' | 'critical'
  missing: string[]
  filled: string[]
}

interface ClientRowProps {
  row: SheetRow & { completeness: Completeness }
  isActive: boolean
  jobStatus: JobStatus | null
  onLoad: (data: ClientData, key: string) => void
}

const STATUS_COLOR = {
  ready: 'var(--color-success)',
  incomplete: 'var(--color-warning)',
  critical: 'var(--color-danger)',
}

const STATUS_LABEL = {
  ready: 'Ready',
  incomplete: 'Incomplete',
  critical: 'Missing Critical',
}

const JOB_COLOR: Record<JobStatus, string> = {
  draft: 'var(--color-text-muted)',
  in_progress: 'var(--color-warning)',
  complete: 'var(--color-info)',
  live: 'var(--color-success)',
}

export default function ClientRow({ row, isActive, jobStatus, onLoad }: ClientRowProps) {
  const { status, missing, filled } = row.completeness
  const dotColor = STATUS_COLOR[status]
  const isProcessed = jobStatus !== null

  function handleLoad() {
    const draft = sheetRowToClientData(row)
    const key = `${row.timestamp}|${row.business_name}`
    onLoad(draft, key)
  }

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--color-border)',
        opacity: isProcessed && !isActive ? 0.45 : 1,
        background: isActive ? 'rgba(232,160,32,0.04)' : 'transparent',
        transition: 'opacity 0.15s, background 0.1s',
      }}
    >
      {/* Completeness status */}
      <td style={{ padding: '10px 16px', width: 140, whiteSpace: 'nowrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: dotColor,
          }}
        >
          <span
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: dotColor,
              flexShrink: 0,
            }}
          />
          {STATUS_LABEL[status]}
        </span>
      </td>

      {/* Business name + timestamp */}
      <td style={{ padding: '10px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
          {row.business_name || <span style={{ color: 'var(--color-danger)' }}>—</span>}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
          {row.timestamp ? row.timestamp.split(' ')[0] : '—'}
        </p>
      </td>

      {/* Template */}
      <td style={{ padding: '10px 16px', width: 150 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {row.template_choice || '—'}
        </span>
      </td>

      {/* Fields */}
      <td style={{ padding: '10px 16px', width: 180 }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: missing.length ? 3 : 0 }}>
          <span style={{ color: 'var(--color-success)' }}>{filled.length}</span> filled
          {missing.length > 0 && (
            <> · <span style={{ color: dotColor }}>{missing.length} missing</span></>
          )}
        </p>
        {missing.length > 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {missing.join(', ')}
          </p>
        )}
      </td>

      {/* Job status badge */}
      <td style={{ padding: '10px 16px', width: 100 }}>
        {jobStatus ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: JOB_COLOR[jobStatus],
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: JOB_COLOR[jobStatus] }} />
            {jobStatus}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
        )}
      </td>

      {/* Action */}
      <td style={{ padding: '10px 16px', width: 100, textAlign: 'right' }}>
        <button
          onClick={handleLoad}
          style={{
            height: 28,
            padding: '0 12px',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.03em',
            background: isActive ? 'var(--color-accent)' : 'var(--color-surface-2)',
            color: isActive ? '#000' : 'var(--color-text-secondary)',
            border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all 0.1s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.borderColor = 'var(--color-accent)'
              e.currentTarget.style.color = 'var(--color-accent)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }
          }}
        >
          {isActive ? 'Active' : isProcessed ? 'Reload' : 'Load'}
        </button>
      </td>
    </tr>
  )
}
