import type { AnswerOption } from '../../logic/questions'

/**
 * Multi-select with a cap. At the cap, unchosen options go quiet but stay
 * legible and keep their label — they are not hidden, and the limit is stated
 * once above rather than as an error after the fact.
 */
export function MultiChoiceGroup<T extends string>({
  name,
  legend,
  options,
  values,
  max,
  onToggle,
}: {
  name: string
  legend: string
  options: AnswerOption[]
  values: T[]
  max: number
  onToggle: (v: T) => void
}) {
  const atCap = values.length >= max
  return (
    <fieldset className="choices">
      <legend className="visually-hidden">{legend}</legend>
      {options.map((o) => {
        const selected = values.includes(o.value as T)
        const blocked = atCap && !selected
        return (
          <label key={o.value} className="choice" data-selected={selected || undefined} data-blocked={blocked || undefined}>
            <input
              type="checkbox"
              name={name}
              className="choice__input"
              checked={selected}
              disabled={blocked}
              onChange={() => onToggle(o.value as T)}
            />
            <span className="choice__body">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
            <span className="choice__mark choice__mark--box" aria-hidden="true" />
          </label>
        )
      })}
    </fieldset>
  )
}
