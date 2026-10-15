import type { ShapeAnnotations } from '../../data/types'

/**
 * Draws the nose-rocker bracket and the max-thickness marker over the side
 * image box. Coordinates are normalised to the box (0 = tail, 1 = nose).
 * Text explanations live in the row's callout rail; here only the measurement
 * marks and short labels sit on the geometry itself.
 */
export function GeometryAnnotation({ shape, active }: { shape: ShapeAnnotations; active?: 'rocker' | 'thickness' | null }) {
  const r = shape.noseRocker
  const t = shape.maxThickness
  return (
    <div className="geo" aria-hidden="true">
      <div
        className={`geo__bracket${active === 'rocker' ? ' is-active' : ''}`}
        style={{ left: `${r.from * 100}%`, width: `${(r.to - r.from) * 100}%` }}
      >
        <span className="geo__bracket-label mono">Nose rocker</span>
      </div>
      <div className={`geo__thickness${active === 'thickness' ? ' is-active' : ''}`} style={{ left: `${t.x * 100}%` }}>
        <span className="geo__thickness-label mono">{t.value}</span>
        <i className="geo__thickness-mark" />
      </div>
    </div>
  )
}
