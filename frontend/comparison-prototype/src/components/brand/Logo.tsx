import { buildOutline } from '../outline/outlineGeometry'

/**
 * Quiver — the mark and the wordmark.
 *
 * A quiver is the set of boards a surfer owns and chooses between, which is
 * exactly what this product helps you arrive at. So the mark draws one: three
 * boards of different lengths standing together, leaning the way boards lean
 * against a wall.
 *
 * The shapes come from `buildOutline()` — the same generator the comparison,
 * the matching rack and the board direction all use. The product's own
 * geometry is the one shape it is entitled to use as a mark, and it means the
 * logo cannot drift from the drawings inside the app.
 */

/** Three real lengths, so the mark has the proportions of an actual quiver. */
const BOARDS = [
  { lengthFt: 5.67, widthIn: 20.75, tail: 'swallow' as const, category: 'fish', lean: -5 },
  { lengthFt: 6.17, widthIn: 19, tail: 'round' as const, category: 'shortboard', lean: 1.5 },
  { lengthFt: 7.0, widthIn: 21.5, tail: 'round' as const, category: 'mid_length', lean: 6 },
]

const GAP = 7
const PAD = 4

export function Logo({ className = '' }: { className?: string }) {
  const specs = BOARDS.map((b) => ({ ...b, spec: buildOutline(b.lengthFt, b.widthIn, b.tail, b.category) }))
  const tallest = Math.max(...specs.map((s) => s.spec.px.L))

  // Lay the boards out along x, each leaning about the point where it rests.
  let x = PAD
  const placed = specs.map((s) => {
    const footprint = s.spec.px.W + Math.abs(Math.sin((s.lean * Math.PI) / 180)) * s.spec.px.L
    const cx = x + footprint / 2
    x += footprint + GAP
    return { ...s, cx }
  })
  const vbW = x - GAP + PAD
  const vbH = tallest + PAD * 2

  return (
    <span className={`logo ${className}`.trim()}>
      <svg className="logo__mark" viewBox={`0 0 ${vbW} ${vbH}`} aria-hidden="true" focusable="false">
        {placed.map((p, i) => (
          <path
            key={i}
            className="logo__board"
            d={p.spec.path}
            /* Pivot at the tail where the board rests, stand it nose-up, then
               lean it — the same move the matching rack makes. */
            transform={`translate(${p.cx} ${vbH - PAD}) rotate(${p.lean}) translate(0 ${-p.spec.px.L}) rotate(90)`}
          />
        ))}
      </svg>
      <span className="logo__word">Quiver</span>
    </span>
  )
}
