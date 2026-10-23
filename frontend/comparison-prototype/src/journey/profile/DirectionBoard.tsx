import { useId } from 'react'
import { BoardBody, RailGradient } from '../../components/surf/BoardForm'
import { buildOutline } from '../../components/outline/outlineGeometry'
import type { BoardCategory } from '../../logic/size'

/**
 * The recommended direction, drawn.
 *
 * What the engine produces is a CATEGORY, a volume range and a length range.
 * It does not produce a width, a tail or a fin setup — so this drawing must
 * not imply one. Two omissions do that work, and both were already built:
 * `tail: 'unknown'` has a neutral rounded rendering in the geometry module,
 * and `fins={null}` draws no cluster at all. A board with no tail name and no
 * fins reads as a type of board rather than as a spec sheet.
 *
 * Length is real, so it is drawn at the midpoint of the recommended range and
 * the range is printed beside it. Width is the one unsourced number: deriving
 * it from volume over length would need a thickness assumption and would LOOK
 * like a measurement. These nominal widths exist only to give the silhouette
 * the proportions of its category, are aligned with the Q1 silhouettes so the
 * two drawings of a shape agree, and are never printed.
 *
 * Horizontal, because a 6'0" x 19" board is nearly 4:1 — nose-up in a sidebar
 * it would be 1100px tall. It also matches the Outline and Shape states, so
 * every drawn board in the product points the same way.
 */

const NOMINAL_WIDTH_IN: Record<BoardCategory, number> = {
  performance_shortboard: 18.5,
  shortboard: 18.9,
  everyday_shortboard: 19.25,
  step_up: 18.5,
  hybrid: 20,
  fish: 20.75,
  groveler: 20.5,
  mid_length: 21.5,
  longboard: 22.5,
}

const PAD = 7

export function DirectionBoard({
  category,
  lengthFt,
  label,
}: {
  category: BoardCategory
  /** Midpoint of the recommended length range, in feet. */
  lengthFt: number
  /** Spoken description for assistive tech, naming the range rather than this one length. */
  label: string
}) {
  const uid = useId().replace(/:/g, '')
  const spec = buildOutline(lengthFt, NOMINAL_WIDTH_IN[category], 'unknown', category)
  const { L, W } = spec.px

  return (
    <svg
      className="dirboard"
      viewBox={`0 0 ${L + PAD * 2} ${W + PAD * 2}`}
      role="img"
      aria-label={label}
      focusable="false"
    >
      <defs>
        <RailGradient id={`dir-${uid}`} />
      </defs>
      {/* Geometry runs along +x FROM THE NOSE, which draws nose-left. The
          Outline and Shape states both point nose-right, so it is mirrored to
          match — every drawn board in the product faces the same way. */}
      <g transform={`translate(${L + PAD} ${W / 2 + PAD}) scale(-1 1)`}>
        <BoardBody spec={spec} fins={null} gradientId={`dir-${uid}`} shadow={false} />
      </g>
    </svg>
  )
}
