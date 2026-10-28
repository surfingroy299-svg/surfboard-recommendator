import { buildOutline, type TailKind } from '../outline/outlineGeometry'

/**
 * A squash, swallow or round tail, seen from above.
 *
 * This is the actual outline, not a symbol for it. The path comes from
 * `buildOutline()` — the same generator the comparison outlines, the matching
 * rack, the recommendation drawing and the logo all use — and the glyph is
 * simply a viewBox cropped to the last few inches of it. So the two rails run
 * in from the top and the shape at the bottom is the tail a shaper would cut,
 * rather than a square, a W and a circle standing in for three words.
 *
 * ONE REFERENCE SHAPE for all three. The glyph illustrates a tail, not a
 * board, so holding the outline constant and changing only the tail is what
 * makes the three readable against each other. A 6'0" x 19 3/4" hybrid sits in
 * the middle of the range the product covers; its tail is broad enough that
 * the swallow's notch survives at 32px.
 *
 * ONE SHARED BOX for all three, taken from the union of the three tails'
 * windows, so the glyphs are the same size and — the point of the thing — the
 * measured end of the board falls on the same line in each. A round tail then
 * visibly reaches further past that line than a swallow does, which is true of
 * the boards and is most of what distinguishes them.
 */

const REFERENCE = { lengthFt: 6, widthIn: 19.75, category: 'hybrid' }
const KINDS: TailKind[] = ['squash', 'swallow', 'round']

/** Room for the stroke, in viewBox units. */
const PAD = 3

const SPECS = Object.fromEntries(
  KINDS.map((t) => [t, buildOutline(REFERENCE.lengthFt, REFERENCE.widthIn, t, REFERENCE.category)]),
) as Record<TailKind, ReturnType<typeof buildOutline>>

const BOX = (() => {
  const boxes = KINDS.map((t) => SPECS[t].tailBox)
  // x0 does not depend on the tail (the cubic's x control points are fixed),
  // but taking the min costs nothing and removes the assumption.
  const x0 = Math.min(...boxes.map((b) => b.x0)) - PAD
  const x1 = Math.max(...boxes.map((b) => b.x1)) + PAD
  const yHalf = Math.max(...boxes.map((b) => b.yHalf)) + PAD
  return { x0, x1, yHalf, w: yHalf * 2, h: x1 - x0 }
})()

export function TailGlyph({ tail }: { tail: TailKind }) {
  const spec = SPECS[tail] ?? SPECS.round
  return (
    <svg
      className="tailglyph"
      viewBox={`0 0 ${BOX.w} ${BOX.h}`}
      width={BOX.w}
      height={BOX.h}
      aria-hidden="true"
      focusable="false"
    >
      {/* Geometry runs along +x from the nose, so a quarter turn stands the
          board up with the tail at the bottom — the way FinGlyph, directly
          below this row, already draws its cluster. Everything above the
          window is simply outside the viewBox and is not painted. */}
      <path d={spec.path} transform={`rotate(90) translate(${-BOX.x0} ${-BOX.yHalf})`} />
    </svg>
  )
}
