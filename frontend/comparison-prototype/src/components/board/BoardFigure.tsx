import { useRef, type PointerEvent, type ReactNode } from 'react'
import { emphasisFor, useComparison } from '../../state/comparisonState'
import type { Board, BoardView } from '../../data/types'
import { useAnnounce } from '../../hooks/a11y'

interface Props {
  board: Board
  /** Which view Inspect should open with from this context. */
  inspectView: BoardView
  /**
   * Rendered ABOVE the visual and OUTSIDE the button. A heading belongs here
   * rather than in `visual`: the button carries its own aria-label, which
   * replaces its content for assistive tech, so a heading inside it would
   * vanish from the document outline.
   */
  header?: ReactNode
  /** The visual (BoardVisual) rendered inside the interactive control. */
  visual: ReactNode
  /** Everything else in the column/row: text, scales, callouts. */
  children?: ReactNode
  className?: string
}

/**
 * One board's interactive unit. Shared grammar across all three states:
 * hover (mouse) or keyboard focus = temporary Focus; click / Enter = Inspect.
 * Touch has no hover, so a tap goes straight to Inspect.
 */
export function BoardFigure({ board, inspectView, header, visual, children, className = '' }: Props) {
  const { state, dispatch, inspectTriggerRef } = useComparison()
  const announce = useAnnounce()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const emphasis = emphasisFor(state.focusedBoardId, board.id)

  const focus = (on: boolean) => dispatch({ type: 'focusBoard', boardId: on ? board.id : null })

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') focus(true)
  }
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') focus(false)
  }

  const open = () => {
    inspectTriggerRef.current = buttonRef.current
    dispatch({ type: 'openInspect', boardId: board.id, view: inspectView })
    announce(`Inspecting ${board.model}`)
  }

  return (
    <article
      className={`board ${className}`.trim()}
      data-board={board.id}
      data-emphasis={emphasis}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={(e) => {
        // Clicks anywhere on the unit open Inspect, unless a nested control handled them.
        if ((e.target as HTMLElement).closest('button, a') === buttonRef.current || !(e.target as HTMLElement).closest('button, a')) open()
      }}
    >
      {header}
      <button
        ref={buttonRef}
        type="button"
        className="board__button"
        data-board-button={board.id}
        aria-label={`Inspect ${board.model}`}
        onFocus={() => focus(true)}
        onBlur={() => focus(false)}
        onClick={(e) => {
          e.stopPropagation()
          open()
        }}
      >
        {visual}
      </button>
      {children}
    </article>
  )
}
