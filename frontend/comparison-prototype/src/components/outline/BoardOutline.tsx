import { SCALE } from './outlineGeometry'
import type { BoardOutlineData } from './boardOutlineData'
import type { BoardId } from '../../data/types'

const PAD = 22

/**
 * All three outlines overlaid, nose up and aligned at the tail.
 *
 * Vertical to match the deck imagery in Overview and Tail & Fins, which is the
 * same view of the board; horizontal reads as a leaf rather than a surfboard.
 * Aligning at the tail puts the boards on a shared baseline, the same
 * convention the Overview columns already use.
 *
 * Geometry is generated nose-at-origin along +x, so each board is rotated a
 * quarter turn and offset by its own length to bring every tail to one line.
 */
export function OutlineOverlay({ boards, focused }: { boards: BoardOutlineData[]; focused: BoardId | null }) {
  const maxL = Math.max(...boards.map((b) => b.spec.px.L))
  const maxW = Math.max(...boards.map((b) => b.spec.px.W))
  const vbW = maxW + PAD * 2
  const vbH = maxL + PAD * 2
  const tailY = PAD + maxL
  const cx = PAD + maxW / 2

  return (
    <svg
      className="outline"
      viewBox={`0 0 ${vbW} ${vbH}`}
      role="img"
      aria-label={`Outlines of ${boards.map((b) => b.label).join(', ')} overlaid nose-up and aligned at the tail, drawn to relative scale.`}
    >
      {/* The tail line is the alignment reference, so it is drawn, not implied. */}
      <line className="outline__datum" x1={PAD * 0.3} y1={tailY} x2={vbW - PAD * 0.3} y2={tailY} aria-hidden="true" />
      {boards.map((b) => {
        const dim = focused !== null && focused !== b.id
        return (
          <g
            key={b.id}
            className={`outline__board${dim ? ' is-dim' : ''}${focused === b.id ? ' is-focus' : ''}`}
            data-board={b.id}
            transform={`translate(${cx} ${tailY - b.spec.px.L}) rotate(90)`}
          >
            <path d={b.spec.path} />
          </g>
        )
      })}
    </svg>
  )
}

/**
 * The three tails, enlarged and overlaid.
 *
 * At full-board scale the tails converge into a few pixels, so the difference
 * between a squash, a swallow and a round — which Tail & Fins names but does
 * not draw — is unreadable. This shows the last fifth of each board at the
 * same relative scale as the main drawing, still aligned at the tail.
 */
export function TailDetail({ boards, focused }: { boards: BoardOutlineData[]; focused: BoardId | null }) {
  const maxW = Math.max(...boards.map((b) => b.spec.px.W))
  const region = Math.max(...boards.map((b) => b.spec.px.L)) * 0.18
  const pad = 8
  const vbW = maxW + pad * 2
  const vbH = region + pad * 2
  const cx = pad + maxW / 2
  const tailY = pad + region

  return (
    <svg
      className="taildetail"
      viewBox={`0 0 ${vbW} ${vbH}`}
      role="img"
      aria-label={`Tail shapes enlarged: ${boards.map((b) => `${b.label} ${b.tailDisplay}`).join(', ')}.`}
    >
      <line className="outline__datum" x1={pad * 0.5} y1={tailY} x2={vbW - pad * 0.5} y2={tailY} aria-hidden="true" />
      {boards.map((b) => {
        const dim = focused !== null && focused !== b.id
        return (
          <g
            key={b.id}
            className={`outline__board${dim ? ' is-dim' : ''}${focused === b.id ? ' is-focus' : ''}`}
            data-board={b.id}
            transform={`translate(${cx} ${tailY - b.spec.px.L}) rotate(90)`}
          >
            <path d={b.spec.path} />
          </g>
        )
      })}
    </svg>
  )
}

/** Inches per viewBox unit, for anything that needs to annotate the drawing. */
export const UNITS_PER_INCH = SCALE / 12
