import { useRef, type PointerEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BoardVisual } from '../board/BoardVisual'
import { useComparison } from '../../state/comparisonState'
import { useReducedMotion } from '../../hooks/a11y'
import type { Board, BoardView } from '../../data/types'
import { Icon } from '../ui/Icon'

const VIEWS: Array<{ id: BoardView; label: string }> = [
  { id: 'deck', label: 'Deck' },
  { id: 'side', label: 'Side' },
  { id: 'bottom', label: 'Bottom' },
]

/**
 * Phase 1 hero: 2D image switch + zoom. This area is reserved for the future
 * free-rotate 3D surface; the layout around it will not need to change.
 */
export function InspectHero({ board }: { board: Board }) {
  const { state, dispatch } = useComparison()
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const inspect = state.inspect
  if (!inspect) return null
  const { view, zoomed } = inspect

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!zoomed || !stageRef.current) return
    const r = stageRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    stageRef.current.style.setProperty('--zx', `${x}%`)
    stageRef.current.style.setProperty('--zy', `${y}%`)
  }

  return (
    <div className="hero">
      <div
        ref={stageRef}
        className={`hero__stage hero__stage--${view}${zoomed ? ' is-zoomed' : ''}`}
        onPointerMove={onMove}
        onClick={() => dispatch({ type: 'setZoom', zoomed: !zoomed })}
        role="button"
        tabIndex={0}
        aria-pressed={zoomed}
        aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            dispatch({ type: 'setZoom', zoomed: !zoomed })
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="hero__layer"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <BoardVisual boardId={board.id} view={view} emphasis="hero" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hero__controls">
        <div className="segmented" role="tablist" aria-label="View">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              className="segmented__item"
              onClick={(e) => {
                e.stopPropagation()
                dispatch({ type: 'setInspectView', view: v.id })
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--icon"
          aria-pressed={zoomed}
          onClick={() => dispatch({ type: 'setZoom', zoomed: !zoomed })}
        >
          <Icon name={zoomed ? 'zoom-out' : 'zoom-in'} />
          {zoomed ? 'Zoom out' : 'Zoom'}
        </button>
      </div>
    </div>
  )
}
