import { PHYSICAL_BOUNDS, toCm, toKg, type PhysicalAnswer } from '../../logic/answers'

/**
 * Q9. Weight drives the volume calculation; height calibrates length. Units are
 * switchable because the sizing step normalises them anyway.
 *
 * Out-of-range values are flagged here rather than silently passed on: the Size
 * Calculation Step produces no output for implausible physical input.
 */
export function PhysicalFields({ value, onChange }: { value: PhysicalAnswer; onChange: (v: PhysicalAnswer) => void }) {
  const cm = value.height.value === null ? null : toCm(value.height.value, value.height.unit)
  const kg = value.weight.value === null ? null : toKg(value.weight.value, value.weight.unit)
  const heightOut = cm !== null && (cm < PHYSICAL_BOUNDS.heightCm.min || cm > PHYSICAL_BOUNDS.heightCm.max)
  const weightOut = kg !== null && (kg < PHYSICAL_BOUNDS.weightKg.min || kg > PHYSICAL_BOUNDS.weightKg.max)

  const num = (s: string): number | null => (s.trim() === '' ? null : Number(s))

  return (
    <div className="fields">
      <div className="field">
        <label className="field__label" htmlFor="phys-height">
          Height
        </label>
        <div className="field__row">
          <input
            id="phys-height"
            className="field__control mono"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            value={value.height.value ?? ''}
            aria-invalid={heightOut || undefined}
            aria-describedby={heightOut ? 'phys-height-note' : undefined}
            onChange={(e) => onChange({ ...value, height: { ...value.height, value: num(e.target.value) } })}
          />
          <UnitToggle
            options={['cm', 'in']}
            value={value.height.unit}
            onChange={(unit) => onChange({ ...value, height: { ...value.height, unit } })}
            label="Height unit"
          />
        </div>
        {heightOut && (
          <p id="phys-height-note" className="field__note">
            Needs to be between {PHYSICAL_BOUNDS.heightCm.min} and {PHYSICAL_BOUNDS.heightCm.max} cm.
          </p>
        )}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="phys-weight">
          Weight
        </label>
        <div className="field__row">
          <input
            id="phys-weight"
            className="field__control mono"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            value={value.weight.value ?? ''}
            aria-invalid={weightOut || undefined}
            aria-describedby={weightOut ? 'phys-weight-note' : undefined}
            onChange={(e) => onChange({ ...value, weight: { ...value.weight, value: num(e.target.value) } })}
          />
          <UnitToggle
            options={['kg', 'lbs']}
            value={value.weight.unit}
            onChange={(unit) => onChange({ ...value, weight: { ...value.weight, unit } })}
            label="Weight unit"
          />
        </div>
        {weightOut && (
          <p id="phys-weight-note" className="field__note">
            Needs to be between {PHYSICAL_BOUNDS.weightKg.min} and {PHYSICAL_BOUNDS.weightKg.max} kg.
          </p>
        )}
      </div>
    </div>
  )
}

function UnitToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="units" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className="units__item mono"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
