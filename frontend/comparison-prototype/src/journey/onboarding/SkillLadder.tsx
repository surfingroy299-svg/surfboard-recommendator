import { WaveGlyph } from '../../components/surf/WaveGlyph'
import type { AnswerOption, Q8Value } from '../../logic/questions'
import { commitHandlers } from './commit'

/**
 * Q8 is an ability ladder — the answers run lowest to highest, and the rung
 * the surfer picks sets band and sub-level directly. Nothing in a flat list
 * shows that ordering, which is why each rung draws the line a surfer takes
 * across the face: the trajectory *is* the ability.
 *
 * ONE rung is chosen: the highest the surfer holds consistently. That answer
 * asserts the whole ladder beneath it, so the rungs below the selection are
 * shown as held rather than as unchosen alternatives — the ladder fills to the
 * selection. `translate.ts` reads the same implication, so what is drawn and
 * what is computed agree.
 *
 * This replaces an independent multi-select capped at 3. The old component
 * deliberately refused to auto-fill, because the Translation Layer then read
 * the whole selected set and auto-filling would have changed confidence
 * silently. Under single-select the implication IS the meaning, so filling is
 * now the honest rendering rather than a distortion of it.
 */
export function SkillLadder({
  options,
  value,
  onChange,
  onCommit,
}: {
  options: AnswerOption[]
  value: Q8Value | null
  onChange: (v: Q8Value) => void
  onCommit?: (v: Q8Value) => void
}) {
  const chosen = value === null ? -1 : options.findIndex((o) => o.value === value)

  return (
    <fieldset className="ladder">
      <legend className="visually-hidden">What is the most you can do consistently once you are riding?</legend>
      {options.map((o, i) => {
        const selected = o.value === value
        return (
          <label
            key={o.value}
            className="rung"
            data-selected={selected || undefined}
            /* Rungs beneath the selection are implied by it, so they read as
               held — dimmer than the choice itself, but not as untaken. */
            data-held={!selected && chosen > i ? '' : undefined}
            {...commitHandlers(o.value as Q8Value, onCommit)}
          >
            <input
              type="radio"
              name="Q8"
              className="choice__input"
              checked={selected}
              onChange={() => onChange(o.value as Q8Value)}
            />
            <span className="rung__index mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="rung__glyph">
              <WaveGlyph rung={o.value as Q8Value} />
            </span>
            <span className="rung__label">{o.label}</span>
            <span className="choice__mark" aria-hidden="true" />
          </label>
        )
      })}
    </fieldset>
  )
}
