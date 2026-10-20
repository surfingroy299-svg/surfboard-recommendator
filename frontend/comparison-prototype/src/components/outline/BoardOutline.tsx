import { buildOutline, parseLengthFt, parseTail, parseWidthIn, SCALE, type OutlineSpec } from './outlineGeometry'
import type { Board, BoardId } from '../../data/types'

export interface BoardOutlineData {
  id: BoardId
  label: string
  spec: OutlineSpec
  volume: string
  lengthDisplay: string
  widthDisplay: string
  tailDisplay: string
}

export function outlineFor(board: Board): BoardOutlineData {
  const spec = buildOutline(
    parseLengthFt(board.dimensions.length),
    parseWidthIn(board.dimensions.width),
    parseTail(board.tailFins.tail),
  )
  return {
    id: board.id,
    label: board.model,
    spec,
    volume: board.dimensions.volume,
    lengthDisplay: board.dimensions.length,
    widthDisplay: board.dimensions.width,
    tailDisplay: board.tailFins.tail,
  }
}

const PAD = 26

/**
 * All three outlines overlaid, aligned at the tail — the reference point a
 * shaper would use. Lengths and widths are drawn to true relative scale, so
 * the boards are deliberately NOT normalised to the same height.
 */
export function OutlineOverlay({
  boards,
  focused,
}: {
  boards: BoardOutlineData[]
  focused: BoardId | null
}) {
  const maxL = Math.max(...boards.map((b) => b.spec.px.L))
  const maxW = Math.max(...boards.map((b) => b.spec.px.W))
  const vbW = maxL + PAD * 2
  const vbH = maxW + PAD * 2

  return (
    <svg
      className="outline"
      viewBox={`0 0 ${vbW} ${vbH}`}
      role="img"
      aria-label={`Outlines of ${boards.map((b) => b.label).join(', ')} overlaid and aligned at the tail, drawn to relative scale.`}
    >
      {/* Tail reference line — the alignment point. */}
      <line
        className="outline__datum"
        x1={PAD + maxL}
        y1={PAD * 0.4}
        x2={PAD + maxL}
        y2={vbH - PAD * 0.4}
        aria-hidden="true"
      />
      {boards.map((b) => {
        const dx = PAD + (maxL - b.spec.px.L)
        const dy = vbH / 2
        const dim = focused !== null && focused !== b.id
        return (
          <g
            key={b.id}
            className={`outline__board${dim ? ' is-dim' : ''}${focused === b.id ? ' is-focus' : ''}`}
            data-board={b.id}
            transform={`translate(${dx} ${dy})`}
          >
            <path d={b.spec.path} />
          </g>
        )
      })}
    </svg>
  )
}

/**
 * A board's tail, drawn from the same geometry as the overlay — so the legend
 * shows the actual shape rather than a stand-in icon.
 */
export function TailGlyph({ data }: { data: BoardOutlineData }) {
  const { L, W } = data.spec.px
  const w = W * 0.62
  const h = W * 0.78
  return (
    <svg className="tailglyph" viewBox={`${L - w} ${-h / 2} ${w + 6} ${h}`} aria-hidden="true" focusable="false">
      <path d={data.spec.path} />
    </svg>
  )
}

/** Inches per viewBox unit, for anything that needs to annotate the drawing. */
export const UNITS_PER_INCH = SCALE / 12
