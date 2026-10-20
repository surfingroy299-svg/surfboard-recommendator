import { WaveGlyph } from '../../components/surf/WaveGlyph'
import type { AnswerOption, Q8Value } from '../../logic/questions'

/**
 * Q8 is an ability ladder — the answers run lowest to highest, and the
 * Translation Layer keys band and sub-level off the highest one selected.
 * Nothing in a flat checkbox list shows that.
 *
 * Presented as ascending rungs with the ride line each one describes.
 *
 * Selection stays INDEPENDENT and capped at 3. It deliberately does not
 * auto-fill the rungs below a chosen one: `translate.ts` reads the whole set —
 * `largestRungGap()` lowers confidence when selections skip steps, and a lone
 * selection yields `single_source` — so auto-filling would quietly change the
 * profile the surfer gets.
 */
export function SkillLadder({
  options,
  values,
  max,
  onToggle,
}: {
  options: AnswerOption[]
  values: Q8Value[]
  max: number
  onToggle: (v: Q8Value) => void
}) {
  const atCap = values.length >= max
  return (
    <fieldset className="ladder">
      <legend className="visually-hidden">What usually happens when you catch a wave?</legend>
      {options.map((o, i) => {
        const selected = values.includes(o.value as Q8Value)
        const blocked = atCap && !selected
        return (
          <label
            key={o.value}
            className="rung"
            data-selected={selected || undefined}
            data-blocked={blocked || undefined}
          >
            <input
              type="checkbox"
              name="Q8"
              className="choice__input"
              checked={selected}
              disabled={blocked}
              onChange={() => onToggle(o.value as Q8Value)}
            />
            <span className="rung__index mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="rung__glyph">
              <WaveGlyph rung={o.value as Q8Value} />
            </span>
            <span className="rung__label">{o.label}</span>
            <span className="choice__mark choice__mark--box" aria-hidden="true" />
          </label>
        )
      })}
    </fieldset>
  )
}
