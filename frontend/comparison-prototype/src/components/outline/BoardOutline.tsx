import { SCALE } from './outlineGeometry'
import type { BoardOutlineData } from './boardOutlineData'
import type { BoardId } from '../../data/types'

const PAD = 22

/**
 * All three outlines overlaid, nose right, tails aligned on a left datum.
 *
 * Horizontal because a board's long axis is its dominant one and a wide
 * viewport has room for it: length differences then read along the direction
 * the eye already travels, as noses reaching different distances to the right,
 * while width differences read vertically where the outlines separate. Nose
 * right also matches the Shape state, so the two drawn comparisons finally
 * share one orientation.
 *
 * Geometry is generated nose-at-origin along +x, so each board is mirrored to
 * point the other way; the outline is symmetric about its long axis, so a
 * mirror is exactly "turn it round".
 */
export function OutlineOverlay({ boards, focused }: { boards: BoardOutlineData[]; focused: BoardId | null }) {
  const maxL = Math.max(...boards.map((b) => b.spec.px.L))
  const maxW = Math.max(...boards.map((b) => b.spec.px.W))
  const vbW = maxL + PAD * 2
  const vbH = maxW + PAD * 2
  const datumX = PAD
  const cy = vbH / 2

  return (
    <svg
      className="outline"
      viewBox={`0 0 ${vbW} ${vbH}`}
      role="img"
      aria-label={`Outlines of ${boards.map((b) => b.label).join(', ')} overlaid nose-right and aligned at the tail, drawn to relative scale.`}
    >
      {/* The tail line is the alignment reference, so it is drawn, not implied. */}
      <line className="outline__datum" x1={datumX} y1={PAD * 0.3} x2={datumX} y2={vbH - PAD * 0.3} aria-hidden="true" />
      {boards.map((b) => {
        const dim = focused !== null && focused !== b.id
        return (
          <g
            key={b.id}
            className={`outline__board${dim ? ' is-dim' : ''}${focused === b.id ? ' is-focus' : ''}`}
            data-board={b.id}
            transform={`translate(${datumX + b.spec.px.L} ${cy}) scale(-1 1)`}
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
  const pad = 10
  const vbW = region + pad * 2
  const vbH = maxW + pad * 2
  const datumX = pad
  const cy = vbH / 2

  return (
    <svg
      className="taildetail"
      viewBox={`0 0 ${vbW} ${vbH}`}
      role="img"
      aria-label={`Tail shapes enlarged: ${boards.map((b) => `${b.label} ${b.tailDisplay}`).join(', ')}.`}
    >
      <line className="outline__datum" x1={datumX} y1={pad * 0.4} x2={datumX} y2={vbH - pad * 0.4} aria-hidden="true" />
      {boards.map((b) => {
        const dim = focused !== null && focused !== b.id
        return (
          <g
            key={b.id}
            className={`outline__board${dim ? ' is-dim' : ''}${focused === b.id ? ' is-focus' : ''}`}
            data-board={b.id}
            transform={`translate(${datumX + b.spec.px.L} ${cy}) scale(-1 1)`}
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
