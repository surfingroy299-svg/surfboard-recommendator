import { useId, useMemo } from 'react'
import { buildOutline } from '../outline/outlineGeometry'
import { BoardBody, RailGradient } from './BoardForm'
import { QUIVER, type QuiverBoard } from './quiverData'

/**
 * A rack of boards standing on a shared floor.
 *
 * One SVG, one coordinate system — so every board is drawn at the same scale
 * and the size differences between a log and a fish are real rather than
 * decorative. Boards stand tail-down on a common baseline, the way a rack
 * actually holds them, with a slight alternating lean so the row reads as
 * objects rather than a chart.
 */

const GAP = 20
const PAD = 26

/**
 * Lean per position, in degrees. Hand-set rather than alternating: an even
 * zig-zag reads as a pattern, and a rack of boards does not stand in a pattern.
 */
const LEANS = [2.6, -1.4, 3.4, -2.8, 1.2, -3.2, 2.1, -1.8, 3.0, -2.2, 1.6]

export interface QuiverProps {
  boards?: QuiverBoard[]
  /** When set, boards outside the list recede. Omit to show the full rack. */
  keep?: string[] | null
  className?: string
}

export function Quiver({ boards = QUIVER, keep = null, className = '' }: QuiverProps) {
  const uid = useId().replace(/:/g, '')

  const laid = useMemo(() => {
    let x = PAD
    const items = boards.map((b, i) => {
      const spec = buildOutline(b.lengthFt, b.widthIn, b.tail, b.category)
      const lean = LEANS[i % LEANS.length]
      // Leaning widens the footprint slightly; allow for it so boards never touch.
      const footprint = spec.px.W + Math.abs(Math.sin((lean * Math.PI) / 180)) * spec.px.L
      const cx = x + footprint / 2
      x += footprint + GAP
      return { board: b, spec, lean, cx }
    })
    return { items, width: x - GAP + PAD }
  }, [boards])

  const tallest = Math.max(...laid.items.map((i) => i.spec.px.L))
  const baseline = PAD + tallest
  const height = baseline + PAD * 1.4

  return (
    <svg
      className={`quiver ${className}`.trim()}
      viewBox={`0 0 ${laid.width} ${height}`}
      role="img"
      aria-label={`A rack of ${boards.length} surfboards of different lengths, outlines, tails and fin setups.`}
      focusable="false"
    >
      <defs>
        <RailGradient id={`rail-${uid}`} />
      </defs>

      {/* The floor the rack stands on. */}
      <line className="quiver__floor" x1={PAD * 0.5} y1={baseline} x2={laid.width - PAD * 0.5} y2={baseline} />

      {laid.items.map(({ board, spec, cx }) => (
        <ellipse
          key={`sh-${board.id}`}
          className="quiver__contact"
          cx={cx}
          cy={baseline}
          rx={spec.px.W * 0.42}
          ry={spec.px.W * 0.1}
        />
      ))}

      {laid.items.map(({ board, spec, lean, cx }) => {
        const receded = keep ? !keep.includes(board.id) : false
        return (
          <g
            key={board.id}
            className={`quiver__board${receded ? ' is-receded' : ''}${keep && !receded ? ' is-kept' : ''}`}
            data-board={board.id}
            /* Pivot about the tail where the board rests, then stand it nose-up:
               the geometry runs nose-at-origin along +x, so it is raised by its
               own length before the quarter turn. */
            transform={`translate(${cx} ${baseline}) rotate(${lean}) translate(0 ${-spec.px.L}) rotate(90)`}
          >
            <BoardBody spec={spec} fins={board.fins} gradientId={`rail-${uid}`} shadow={false} />
          </g>
        )
      })}
    </svg>
  )
}
