import type { AnswerOption } from '../../logic/questions'

/** Single choice. Rows with a rule, not cards: the label does the work. */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: AnswerOption[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <fieldset className="choices">
      <legend className="visually-hidden">{legend}</legend>
      {options.map((o) => {
        const selected = o.value === value
        return (
          <label key={o.value} className="choice" data-selected={selected || undefined}>
            <input
              type="radio"
              name={name}
              className="choice__input"
              checked={selected}
              onChange={() => onChange(o.value as T)}
            />
            <span className="choice__body">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
            <span className="choice__mark" aria-hidden="true" />
          </label>
        )
      })}
    </fieldset>
  )
}
