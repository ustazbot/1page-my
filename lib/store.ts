'use client'

import { createContext, useContext } from 'react'
import type { AppState, ClientData, ModuleStatus } from '@/types/client'

export const defaultState: AppState = {
  activeClient: null,
  moduleStatus: {
    intake: 'idle',
    assets: 'idle',
    copywrite: 'idle',
    build: 'idle',
    preview: 'idle',
    deploy: 'idle',
  },
}

export type AppStateAction =
  | { type: 'SET_CLIENT'; payload: ClientData }
  | { type: 'UPDATE_CLIENT'; payload: Partial<ClientData> }
  | { type: 'SET_MODULE_STATUS'; module: keyof AppState['moduleStatus']; status: ModuleStatus }
  | { type: 'CLEAR_CLIENT' }
  | { type: 'RESTORE_STATE'; payload: AppState }

export function appReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'SET_CLIENT':
      return { ...state, activeClient: action.payload }
    case 'UPDATE_CLIENT':
      if (!state.activeClient) return state
      return {
        ...state,
        activeClient: { ...state.activeClient, ...action.payload },
      }
    case 'SET_MODULE_STATUS':
      return {
        ...state,
        moduleStatus: { ...state.moduleStatus, [action.module]: action.status },
      }
    case 'CLEAR_CLIENT':
      return { ...state, activeClient: null }
    case 'RESTORE_STATE':
      return action.payload
    default:
      return state
  }
}

export const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppStateAction>
}>({
  state: defaultState,
  dispatch: () => {},
})

export function useAppState() {
  return useContext(AppContext)
}

const STORAGE_KEY = '1page_app_state'

export function persistState(state: AppState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function loadPersistedState(): AppState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
