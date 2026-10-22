import { useId } from 'react'
import {
  FITNESS_OPTIONS,
  PHYSICAL_BOUNDS,
  convertHeight,
  convertWeight,
  toCm,
  toKg,
  type Fitness,
  type HeightUnit,
  type PhysicalAnswer,
  type WeightUnit,
} from '../../logic/answers'
import { ModeToggle } from './ModeToggle'

/**
 * Q9. Weight drives the volume calculation; height calibrates length. Units are
 * switchable because the sizing step normalises them anyway.
 *
 * Each measure is a slider and a number bound to one value. Most people know
 * their own height and weight well enough to drag to it, and a slider makes
 * the plausible span visible — but anyone who wants 78.5 can type it, and the
 * number input stays the accessible value either way.
 *
 * Out-of-range values are flagged here rather than silently passed on: the Size
 * Calculation Step produces no output for implausible physical input.
 *
 * Switching a unit CONVERTS the value. It used only to relabel it, which meant
 * 80 kg quietly became 80 lbs — invisible while the field was a bare number,
 * obvious the moment a slider had to place it on a scale.
 *
 * Fitness rides along on this screen rather than becoming a tenth question —
 * the journey says "nine questions" in four places and reports
 * `questions_total: 9`. It is collected and shown back, and nothing else: no
 * document defines a sizing rule for it, so none is invented here.
 */

/** Slider span per unit. Wider than the accepted bounds would be unusable. */
const RANGE = {
  cm: { min: 140, max: 210, step: 1 },
  in: { min: 55, max: 83, step: 1 },
  kg: { min: 40, max: 140, step: 1 },
  lbs: { min: 88, max: 310, step: 1 },
} as const

export function PhysicalFields({ value, onChange }: { value: PhysicalAnswer; onChange: (v: PhysicalAnswer) => void }) {
  const cm = value.height.value === null ? null : toCm(value.height.value, value.height.unit)
  const kg = value.weight.value === null ? null : toKg(value.weight.value, value.weight.unit)
  const heightOut = cm !== null && (cm < PHYSICAL_BOUNDS.heightCm.min || cm > PHYSICAL_BOUNDS.heightCm.max)
  const weightOut = kg !== null && (kg < PHYSICAL_BOUNDS.weightKg.min || kg > PHYSICAL_BOUNDS.weightKg.max)

  return (
    <div className="fields fields--physical">
      <Measure
        id="phys-height"
        label="Height"
        value={value.height.value}
        unit={value.height.unit}
        units={['cm', 'in']}
        unitLabel="Height unit"
        invalid={heightOut}
        note={`Needs to be between ${PHYSICAL_BOUNDS.heightCm.min} and ${PHYSICAL_BOUNDS.heightCm.max} cm.`}
        onValue={(v) => onChange({ ...value, height: { ...value.height, value: v } })}
        onUnit={(unit) => onChange({ ...value, height: { value: convertHeight(value.height.value, value.height.unit, unit), unit } })}
      />

      <Measure
        id="phys-weight"
        label="Weight"
        value={value.weight.value}
        unit={value.weight.unit}
        units={['kg', 'lbs']}
        unitLabel="Weight unit"
        invalid={weightOut}
        note={`Needs to be between ${PHYSICAL_BOUNDS.weightKg.min} and ${PHYSICAL_BOUNDS.weightKg.max} kg.`}
        onValue={(v) => onChange({ ...value, weight: { ...value.weight, value: v } })}
        onUnit={(unit) => onChange({ ...value, weight: { value: convertWeight(value.weight.value, value.weight.unit, unit), unit } })}
      />

      <fieldset className="field field--wide fitness">
        <legend className="field__label">
          How physically active are you? <span className="field__optional">optional</span>
        </legend>
        <div className="fitness__row">
          {FITNESS_OPTIONS.map((o) => (
            <label key={o.value} className="fchip" data-selected={value.fitness === o.value || undefined}>
              <input
                type="radio"
                name="fitness"
                className="choice__input"
                checked={value.fitness === o.value}
                onChange={() => onChange({ ...value, fitness: o.value as Fitness })}
              />
              <span className="fchip__label">{o.label}</span>
            </label>
          ))}
        </div>
        <p className="field__hint">
          A rough sense of your conditioning. It is recorded with your profile and does not change your size range.
        </p>
      </fieldset>
    </div>
  )
}

function Measure<U extends HeightUnit | WeightUnit>({
  id,
  label,
  value,
  unit,
  units,
  unitLabel,
  invalid,
  note,
  onValue,
  onUnit,
}: {
  id: string
  label: string
  value: number | null
  unit: U
  units: readonly U[]
  unitLabel: string
  invalid: boolean
  note: string
  onValue: (v: number | null) => void
  onUnit: (u: U) => void
}) {
  const sliderId = useId()
  const span = RANGE[unit as keyof typeof RANGE]
  // The slider needs a position before the surfer has answered. It starts at
  // the middle of the span but stays visibly unset until they commit, so an
  // untouched control never looks like an answer.
  const unset = value === null
  const pos = unset ? Math.round((span.min + span.max) / 2) : value

  return (
    <div className="field field--measure">
      <div className="field__head">
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
        <ModeToggle
          label={unitLabel}
          value={unit}
          onChange={onUnit}
          options={units.map((u) => ({ value: u, label: u }))}
        />
      </div>

      <div className="field__row">
        <input
          id={id}
          className="field__control field__control--num mono"
          type="number"
          inputMode="decimal"
          step="0.1"
          autoComplete="off"
          value={value ?? ''}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-note` : undefined}
          onChange={(e) => onValue(e.target.value.trim() === '' ? null : Number(e.target.value))}
        />
        <span className="field__unit mono">{unit}</span>
      </div>

      {/* The slider is the quick path. It is labelled by the same text as the
          number and marked aria-hidden from the a11y tree's point of view is
          wrong here — it IS operable by keyboard, so it keeps its own label. */}
      <div className="slider" data-unset={unset || undefined}>
        <input
          id={sliderId}
          className="slider__input"
          type="range"
          min={span.min}
          max={span.max}
          step={span.step}
          value={pos}
          aria-label={`${label}, slider`}
          onChange={(e) => onValue(Number(e.target.value))}
        />
        <div className="slider__scale mono" aria-hidden="true">
          <span>{span.min}</span>
          <span>{span.max}</span>
        </div>
      </div>

      {invalid && (
        <p id={`${id}-note`} className="field__note">
          {note}
        </p>
      )}
    </div>
  )
}
