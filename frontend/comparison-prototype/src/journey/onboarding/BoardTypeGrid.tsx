import { BoardForm } from '../../components/surf/BoardForm'
import type { FinLayout, TailKind } from '../../components/outline/outlineGeometry'
import type { AnswerOption, Q1Value } from '../../logic/questions'
import { commitHandlers } from './commit'

/**
 * Q1 asks which board you ride. A board type *is* a shape, so naming it in
 * text makes the surfer translate a word back into an object they already
 * recognise. Showing the shape removes that step.
 *
 * Drawn at true relative scale on a shared baseline: a funboard really is
 * longer than a shortboard, and that difference is half of what distinguishes
 * the categories.
 *
 * Two answers have no shape — "I'm not sure" and "I don't have a regular
 * board" — so they sit beneath as plain options rather than being given an
 * invented silhouette.
 */

export interface Shape {
  lengthFt: number
  widthIn: number
  tail: TailKind
  category: string
  fins: FinLayout
}

export const SHAPES: Partial<Record<Q1Value, Shape>> = {
  softboard: { lengthFt: 7.0, widthIn: 23, tail: 'round', category: 'softboard', fins: 'thruster' },
  funboard: { lengthFt: 7.5, widthIn: 21.5, tail: 'round', category: 'mid_length', fins: 'single' },
  fish: { lengthFt: 5.67, widthIn: 20.75, tail: 'swallow', category: 'fish', fins: 'twin' },
  hybrid: { lengthFt: 5.92, widthIn: 20, tail: 'squash', category: 'hybrid', fins: 'thruster' },
  shortboard: { lengthFt: 6.08, widthIn: 18.9, tail: 'round', category: 'performance_shortboard', fins: 'thruster' },
}

const TALLEST = Math.max(...Object.values(SHAPES).map((s) => s.lengthFt))

export function BoardTypeGrid({
  options,
  value,
  onChange,
  onCommit,
}: {
  options: AnswerOption[]
  value: Q1Value | null
  onChange: (v: Q1Value) => void
  /** Deliberate commit only — see ChoiceGroup for why this is not onChange. */
  onCommit?: (v: Q1Value) => void
}) {
  const shaped = options.filter((o) => SHAPES[o.value as Q1Value])
  const plain = options.filter((o) => !SHAPES[o.value as Q1Value])

  return (
    <fieldset className="btgrid">
      <legend className="visually-hidden">What board are you usually surfing?</legend>

      <div className="btgrid__shapes">
        {shaped.map((o) => {
          const shape = SHAPES[o.value as Q1Value]!
          const selected = o.value === value
          return (
            <label
              key={o.value}
              className="btcell"
              data-selected={selected || undefined}
              {...commitHandlers(o.value as Q1Value, onCommit)}
            >
              <input
                type="radio"
                name="Q1"
                className="choice__input"
                checked={selected}
                onChange={() => onChange(o.value as Q1Value)}
              />
              <span className="btcell__stage">
                {/* Height carries the real length ratio; boards share a baseline. */}
                <span className="btcell__board" style={{ height: `${(shape.lengthFt / TALLEST) * 100}%` }}>
                  <BoardForm {...shape} />
                </span>
              </span>
              <span className="btcell__label">{o.label}</span>
            </label>
          )
        })}
      </div>

      <div className="btgrid__plain">
        {plain.map((o) => {
          const selected = o.value === value
          return (
            <label
              key={o.value}
              className="choice choice--compact"
              data-selected={selected || undefined}
              {...commitHandlers(o.value as Q1Value, onCommit)}
            >
              <input
                type="radio"
                name="Q1"
                className="choice__input"
                checked={selected}
                onChange={() => onChange(o.value as Q1Value)}
              />
              <span className="choice__mark" aria-hidden="true" />
              <span className="choice__body">
                <span className="choice__label">{o.label}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
