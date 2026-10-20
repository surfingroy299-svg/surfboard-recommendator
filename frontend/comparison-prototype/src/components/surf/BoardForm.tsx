import { useId, type ReactNode } from 'react'
import {
  buildOutline,
  finPath,
  finsFor,
  stringerPath,
  type FinLayout,
  type OutlineSpec,
  type TailKind,
} from '../outline/outlineGeometry'

/**
 * A generated board rendered as a physical object rather than a diagram.
 *
 * Same geometry the Outline comparison uses, plus the four details that
 * separate "a board" from "a shape": a fin cluster, a stringer, rail shading
 * across the width, and a contact shadow. All derived from the dimensions —
 * nothing drawn per board by hand.
 *
 * `BoardBody` renders group-level content so several boards can share one
 * parent SVG and therefore one scale, which is what keeps a quiver honest
 * about relative size. `BoardForm` wraps a single board in its own SVG.
 */

/** Rail shading: darker at both rails, light down the crown. */
export function RailGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="var(--bform-rail)" />
      <stop offset="0.22" stopColor="var(--bform-deck)" />
      <stop offset="0.5" stopColor="var(--bform-crown)" />
      <stop offset="0.78" stopColor="var(--bform-deck)" />
      <stop offset="1" stopColor="var(--bform-rail)" />
    </linearGradient>
  )
}

export function BoardBody({
  spec,
  fins = 'thruster',
  gradientId,
  shadow = true,
}: {
  spec: OutlineSpec
  fins?: FinLayout | null
  gradientId: string
  shadow?: boolean
}) {
  const { L, W } = spec.px
  return (
    <>
      {shadow && <ellipse className="bform__shadow" cx={L * 0.52} cy={0} rx={L * 0.47} ry={W * 0.5} />}
      <path className="bform__body" d={spec.path} fill={`url(#${gradientId})`} />
      <path className="bform__stringer" d={stringerPath(spec)} />
      {/* Fins sit on top: this is the bottom of the board, so they face us. */}
      {fins && finsFor(spec, fins).map((f, i) => <path key={i} className="bform__fin" d={finPath(f)} />)}
    </>
  )
}

const PAD = 10

export interface BoardFormProps {
  lengthFt: number
  widthIn: number
  tail: TailKind
  category?: string
  fins?: FinLayout | null
  className?: string
  /** Names the board for assistive tech; omit when a surrounding control names it. */
  label?: string
  children?: ReactNode
}

/** One board, nose up, in its own SVG. */
export function BoardForm({
  lengthFt,
  widthIn,
  tail,
  category = 'shortboard',
  fins = 'thruster',
  className = '',
  label,
}: BoardFormProps) {
  const uid = useId().replace(/:/g, '')
  const spec = buildOutline(lengthFt, widthIn, tail, category)
  const { L, W } = spec.px
  const vbW = W + PAD * 2
  const vbH = L + PAD * 2

  return (
    <svg
      className={`bform ${className}`.trim()}
      viewBox={`0 0 ${vbW} ${vbH}`}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <RailGradient id={`rail-${uid}`} />
      </defs>
      {/* Geometry runs along +x from the nose, so a quarter turn stands it nose-up. */}
      <g transform={`translate(${vbW / 2} ${PAD}) rotate(90)`}>
        <BoardBody spec={spec} fins={fins} gradientId={`rail-${uid}`} />
      </g>
    </svg>
  )
}
