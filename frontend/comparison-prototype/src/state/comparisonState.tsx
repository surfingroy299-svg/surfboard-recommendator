import { createContext, useContext, useMemo, useReducer, useRef, type Dispatch, type ReactNode, type RefObject } from 'react'
import type { BoardId, BoardView, StateId } from '../data/types'

export const STATE_ORDER: readonly StateId[] = ['overview', 'outline', 'shape', 'tail-fins']

export const STATE_LABEL: Record<StateId, string> = {
  overview: 'Overview',
  outline: 'Outline',
  shape: 'Shape',
  'tail-fins': 'Tail & Fins',
}

export interface InspectState {
  boardId: BoardId
  view: BoardView
  zoomed: boolean
}

export interface ComparisonState {
  focusedBoardId: BoardId | null
  inspect: InspectState | null
  chatOpen: boolean
  savedBoardIds: BoardId[]
  toast: { id: number; message: string } | null
}

export type Action =
  | { type: 'focusBoard'; boardId: BoardId | null }
  | { type: 'openInspect'; boardId: BoardId; view?: BoardView }
  | { type: 'closeInspect' }
  | { type: 'setInspectView'; view: BoardView }
  | { type: 'setZoom'; zoomed: boolean }
  | { type: 'setChatOpen'; open: boolean }
  | { type: 'toggleSaved'; boardId: BoardId }
  | { type: 'toast'; message: string }
  | { type: 'clearToast' }

const initialState: ComparisonState = {
  focusedBoardId: null,
  inspect: null,
  chatOpen: false,
  savedBoardIds: [],
  toast: null,
}

let toastSeq = 0

function reducer(state: ComparisonState, action: Action): ComparisonState {
  switch (action.type) {
    case 'focusBoard':
      return state.focusedBoardId === action.boardId ? state : { ...state, focusedBoardId: action.boardId }
    case 'openInspect':
      // Underlying comparison state (focus, scroll) is left untouched on purpose.
      return { ...state, inspect: { boardId: action.boardId, view: action.view ?? 'deck', zoomed: false }, chatOpen: false }
    case 'closeInspect':
      return { ...state, inspect: null, chatOpen: false }
    case 'setInspectView':
      return state.inspect ? { ...state, inspect: { ...state.inspect, view: action.view, zoomed: false } } : state
    case 'setZoom':
      return state.inspect ? { ...state, inspect: { ...state.inspect, zoomed: action.zoomed } } : state
    case 'setChatOpen':
      return { ...state, chatOpen: action.open }
    case 'toggleSaved': {
      const saved = state.savedBoardIds.includes(action.boardId)
        ? state.savedBoardIds.filter((id) => id !== action.boardId)
        : [...state.savedBoardIds, action.boardId]
      return { ...state, savedBoardIds: saved }
    }
    case 'toast':
      return { ...state, toast: { id: ++toastSeq, message: action.message } }
    case 'clearToast':
      return { ...state, toast: null }
    default:
      return state
  }
}

interface ContextValue {
  state: ComparisonState
  dispatch: Dispatch<Action>
  /** Element that opened Inspect; focus returns here on close. */
  inspectTriggerRef: RefObject<HTMLElement | null>
}

const ComparisonContext = createContext<ContextValue | null>(null)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const inspectTriggerRef = useRef<HTMLElement | null>(null)
  const value = useMemo(() => ({ state, dispatch, inspectTriggerRef }), [state])
  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>
}

export function useComparison(): ContextValue {
  const ctx = useContext(ComparisonContext)
  if (!ctx) throw new Error('useComparison must be used inside ComparisonProvider')
  return ctx
}

export function emphasisFor(focused: BoardId | null, id: BoardId): 'default' | 'focus' | 'dim' {
  if (!focused) return 'default'
  return focused === id ? 'focus' : 'dim'
}
