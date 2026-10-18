import type { FinLayout } from '../../data/types'

/** Small schematic of the fin layout. A diagram, not a board rendering. */
export function FinGlyph({ layout }: { layout: FinLayout }) {
  const dots: Array<[number, number, number]> = (() => {
    switch (layout) {
      case 'twin':
        return [[9, 14, 2.2], [31, 14, 2.2]]
      case 'thruster':
        return [[9, 12, 2.2], [31, 12, 2.2], [20, 26, 2.2]]
      case 'quad':
        return [[8, 10, 2.2], [32, 10, 2.2], [13, 24, 1.9], [27, 24, 1.9]]
      case 'twin-plus-one':
        return [[9, 12, 2.2], [31, 12, 2.2], [20, 26, 1.6]]
      case 'five-fin':
        return [[8, 10, 2.1], [32, 10, 2.1], [13, 22, 1.9], [27, 22, 1.9], [20, 30, 2.1]]
    }
  })()
  return (
    <svg className="finglyph" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false">
      <line x1="20" y1="2" x2="20" y2="38" />
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </svg>
  )
}
