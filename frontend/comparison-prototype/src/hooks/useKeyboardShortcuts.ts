import { useEffect } from 'react'
import { STATE_ORDER } from '../state/comparisonState'
import type { BoardId, StateId } from '../data/types'

const BOARD_KEYS: Record<string, BoardId> = { '1': 'a', '2': 'b', '3': 'c' }

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * 1 / 2 / 3 focus a board in the current section; ← / → move between states.
 * Inert while Inspect is open (Radix owns Esc there) or while typing.
 */
export function useKeyboardShortcuts(opts: {
  activeState: StateId
  inspectOpen: boolean
  goTo: (state: StateId) => void
}) {
  const { activeState, inspectOpen, goTo } = opts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (inspectOpen || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      const boardId = BOARD_KEYS[e.key]
      if (boardId) {
        const el = document.querySelector<HTMLElement>(`#${activeState} [data-board-button="${boardId}"]`)
        el?.focus()
        return
      }
      const i = STATE_ORDER.indexOf(activeState)
      if (e.key === 'ArrowRight' && i < STATE_ORDER.length - 1) goTo(STATE_ORDER[i + 1])
      if (e.key === 'ArrowLeft' && i > 0) goTo(STATE_ORDER[i - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeState, inspectOpen, goTo])
}
