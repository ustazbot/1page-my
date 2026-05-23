'use client'

import { useReducer, useEffect, useState, useCallback } from 'react'
import { AppContext, appReducer, defaultState, persistState, loadPersistedState } from '@/lib/store'
import Sidebar from '@/components/nav/Sidebar'

export default function AppProvider({ children }: { children: React.ReactNode }) {
  // Always start with defaultState for SSR — restore from localStorage after mount
  const [state, dispatch] = useReducer(appReducer, defaultState)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar  = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    const persisted = loadPersistedState()
    if (persisted) dispatch({ type: 'RESTORE_STATE', payload: persisted })
  }, [])

  useEffect(() => {
    persistState(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {/* Mobile top bar */}
      <div className="op-topbar">
        <button
          onClick={openSidebar}
          aria-label="Buka menu"
          style={{
            width: 36, height: 36, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5,
            background: 'transparent', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', cursor: 'pointer', flexShrink: 0,
          }}
        >
          {[0,1,2].map((i) => (
            <span key={i} style={{ width: 16, height: 1.5, background: 'var(--color-text-secondary)', display: 'block' }} />
          ))}
        </button>
        <span style={{
          fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)',
          letterSpacing: '-0.03em',
        }}>
          1page<span style={{ color: 'var(--color-accent)' }}>.my</span>
        </span>
        {state.activeClient && (
          <span style={{
            fontSize: 11, color: 'var(--color-text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            textAlign: 'right',
          }}>
            {state.activeClient.seo.business_name}
          </span>
        )}
      </div>

      {/* Backdrop */}
      <div
        className={`op-backdrop${sidebarOpen ? ' sidebar-open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`op-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <Sidebar state={state} onClose={closeSidebar} />
      </div>

      {/* Main content */}
      <main className="op-main">
        {children}
      </main>
    </AppContext.Provider>
  )
}
