'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { parseCSV, assessRow, rowKey, type SheetRow } from '@/lib/csv'
import { markProcessed, isProcessed, getJobStatus, type JobStatus } from '@/lib/jobs'
import { useAppState } from '@/lib/store'
import type { ClientData } from '@/types/client'
import ClientRow from './ClientRow'

type AnnotatedRow = SheetRow & {
  completeness: ReturnType<typeof assessRow>
  key: string
}

export default function SheetsPuller() {
  const { state, dispatch } = useAppState()
  const [rows, setRows] = useState<AnnotatedRow[]>([])
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus | null>>({})
  const [showProcessed, setShowProcessed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [unmapped, setUnmapped] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Refresh job statuses whenever rows change
  useEffect(() => {
    const statuses: Record<string, JobStatus | null> = {}
    for (const row of rows) {
      statuses[row.key] = getJobStatus(row.key)
    }
    setJobStatuses(statuses)
  }, [rows])

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Format tidak disokong. Upload fail CSV sahaja.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { rows: parsed, unmappedHeaders } = parseCSV(text)

      if (parsed.length === 0) {
        setError('Fail CSV kosong atau format tidak dikenali.')
        return
      }

      const annotated: AnnotatedRow[] = parsed.map((row) => ({
        ...row,
        completeness: assessRow(row),
        key: rowKey(row),
      }))

      setRows(annotated)
      setFileName(file.name)
      setUnmapped(unmappedHeaders)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function handleLoadClient(data: ClientData, key: string) {
    dispatch({ type: 'SET_CLIENT', payload: data })
    dispatch({ type: 'SET_MODULE_STATUS', module: 'intake', status: 'complete' })
    markProcessed(key, data.seo.business_name, data.project.slug)
    setJobStatuses((prev) => ({ ...prev, [key]: 'draft' }))
  }

  const displayRows = showProcessed
    ? rows
    : rows.filter((r) => !isProcessed(r.key))

  const processedCount = rows.filter((r) => isProcessed(r.key)).length
  const readyCount = displayRows.filter((r) => r.completeness.status === 'ready').length
  const criticalCount = displayRows.filter((r) => r.completeness.status === 'critical').length

  return (
    <div>
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
          borderRadius: 'var(--radius)',
          padding: '28px 24px',
          marginBottom: 20,
          cursor: 'pointer',
          background: dragOver ? 'rgba(232,160,32,0.04)' : 'transparent',
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
        <div
          style={{
            width: 36, height: 36,
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--color-text-muted)',
            fontSize: 16,
          }}
        >
          ↑
        </div>
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 3 }}>
            {fileName
              ? <><span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fileName}</span> — klik untuk ganti</>
              : 'Drop CSV atau klik untuk pilih fail'
            }
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Export dari Google Sheets → File → Download → CSV
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--color-danger)',
        }}>
          {error}
        </div>
      )}

      {/* Unmapped headers warning */}
      {unmapped.length > 0 && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 'var(--radius)',
          marginBottom: 16,
          fontSize: 12,
          color: 'var(--color-warning)',
        }}>
          <span style={{ fontWeight: 600 }}>Column tidak dikenali: </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{unmapped.join(', ')}</span>
        </div>
      )}

      {/* Table toolbar */}
      {rows.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{displayRows.length}</span> submission
            </span>
            {readyCount > 0 && (
              <span><span style={{ color: 'var(--color-success)' }}>{readyCount}</span> ready</span>
            )}
            {criticalCount > 0 && (
              <span><span style={{ color: 'var(--color-danger)' }}>{criticalCount}</span> critical</span>
            )}
            {processedCount > 0 && (
              <span><span style={{ color: 'var(--color-text-muted)' }}>{processedCount}</span> processed</span>
            )}
          </div>

          {processedCount > 0 && (
            <button
              onClick={() => setShowProcessed(!showProcessed)}
              style={{
                height: 26,
                padding: '0 10px',
                fontSize: 11,
                fontWeight: 500,
                background: 'transparent',
                color: showProcessed ? 'var(--color-accent)' : 'var(--color-text-muted)',
                border: `1px solid ${showProcessed ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.1s',
              }}
            >
              {showProcessed ? 'Hide processed' : `Show all (${processedCount} processed)`}
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {displayRows.length > 0 ? (
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                {['Status', 'Bisnes', 'Template', 'Fields', 'Job', ''].map((h) => (
                  <th key={h} style={{
                    padding: '8px 16px',
                    textAlign: 'left',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <ClientRow
                  key={row.key}
                  row={row}
                  isActive={state.activeClient?.seo.business_name === row.business_name}
                  jobStatus={jobStatuses[row.key] ?? null}
                  onLoad={handleLoadClient}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length > 0 && !showProcessed ? (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Semua {processedCount} submission telah diproses.
          </p>
          <button
            onClick={() => setShowProcessed(true)}
            style={{
              fontSize: 12, color: 'var(--color-accent)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Tunjuk semua →
          </button>
        </div>
      ) : null}

      {/* Active client indicator */}
      {state.activeClient && (
        <div style={{
          marginTop: 20,
          padding: '12px 16px',
          background: 'rgba(232,160,32,0.06)',
          border: '1px solid rgba(232,160,32,0.2)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Active:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{state.activeClient.seo.business_name}</strong>
            {' — '}
            <span style={{ color: 'var(--color-accent)' }}>{state.activeClient._meta.template}</span>
          </span>
        </div>
      )}
    </div>
  )
}
