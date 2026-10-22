/**
 * Onboarding answer state, question routing and caps.
 *
 * Routing follows `translation-layer.md` section 5.0.3 and the per-answer
 * definitions in `onboarding-questions.md`. Caps come from each question's
 * declared type (Q2 max 3, Q5 max 2, Q6 max 2). Q8 is a single-select ladder.
 */

import type { QuestionId, Q1Value, Q2Value, Q3Value, Q5Value, Q6Value, Q7Value, Q8Value } from './questions'
import { QUESTIONS } from './questions'

export type HeightUnit = 'cm' | 'in'
export type WeightUnit = 'kg' | 'lbs'

export interface DimensionsAnswer {
  length: string | null
  /**
   * Display string either way — a picked bucket ("31–34 L") or a typed exact
   * value ("32.4 L"). `translate.ts` passes this straight to the evidence
   * trail and tests it for presence, so it must stay a non-empty string
   * whenever the question is answered.
   */
  volume: string | null
  /**
   * The number, when the surfer typed an exact volume; null when they picked a
   * range. This is what preserves the exact/approximate distinction the
   * question needs, without changing the shape `volume` has always had.
   */
  volumeExact: number | null
  /** Optional free text. V1: not processed by the Translation Layer. */
  modelBrand: string
}

/** How much the surfer is in the water, roughly. */
export type Fitness = 'rarely' | 'occasionally' | 'weekly' | 'often' | 'daily'

export const FITNESS_OPTIONS: { value: Fitness; label: string; short: string }[] = [
  { value: 'rarely', label: 'Rarely or never', short: 'Rarely active' },
  { value: 'occasionally', label: 'Occasionally', short: 'Occasionally active' },
  { value: 'weekly', label: '1–2 times a week', short: '1–2 times a week' },
  { value: 'often', label: '3–5 times a week', short: '3–5 times a week' },
  { value: 'daily', label: 'Almost every day', short: 'Almost every day' },
]

export interface PhysicalAnswer {
  height: { value: number | null; unit: HeightUnit }
  weight: { value: number | null; unit: WeightUnit }
  /**
   * Collected and shown back in the profile; NOT consumed by the Translation
   * Layer or the Size Calculation Step, because no document defines a rule for
   * it — `size-calculation-rules.md` section 8 explicitly leaves fitness as
   * part of the uncertainty the range width absorbs.
   *
   * Optional, so it never gates `isAnswered('Q9')`, and deliberately absent
   * from `SurferProfile.physical`, which is the sizing input. Putting it there
   * would invite the next person to index it into the Guild Factor table.
   */
  fitness: Fitness | null
}

export interface Answers {
  Q1: Q1Value | null
  Q2: Q2Value[]
  Q3: Q3Value | null
  Q4: DimensionsAnswer
  Q5: Q5Value[]
  Q5FreeText: string
  Q6: Q6Value[]
  Q6FreeText: string
  Q7: Q7Value | null
  /**
   * The highest rung held consistently. A scalar rather than a one-element
   * array on purpose: `translate.ts` used to read the whole selected set, and
   * an array would let `Q8.length === 1` and `largestRungGap(Q8)` keep
   * compiling as permanent constants — no type error, no failed assertion,
   * just a quietly different profile. The scalar makes every such site a
   * compile error instead.
   */
  Q8: Q8Value | null
  Q9: PhysicalAnswer
}

export const emptyAnswers = (): Answers => ({
  Q1: null,
  Q2: [],
  Q3: null,
  Q4: { length: null, volume: null, volumeExact: null, modelBrand: '' },
  Q5: [],
  Q5FreeText: '',
  Q6: [],
  Q6FreeText: '',
  Q7: null,
  Q8: null,
  Q9: { height: { value: null, unit: 'cm' }, weight: { value: null, unit: 'kg' }, fitness: null },
})

export type SkipReason = 'user_did_not_know_dimensions' | 'no_regular_board'

/**
 * Which questions are asked, given the answers so far.
 *
 * Q1 = no_regular_board drops Q2–Q4. The Q1 answer definition states that
 * "Q2, Q3, Q4 have no valid basis"; section 5.0.3 phrases Q2 as "adapted".
 * Adapting would mean inventing alternative question copy, so the question is
 * skipped instead and the reason recorded — Axis 3 resolves to `unknown` from
 * Q1 alone either way (section 8.1).
 */
export function visibleQuestionIds(a: Answers): QuestionId[] {
  const skipped = skipReasons(a)
  return QUESTIONS.map((q) => q.id).filter((id) => !(id in skipped))
}

export function skipReasons(a: Answers): Partial<Record<QuestionId, SkipReason>> {
  if (a.Q1 === 'no_regular_board') {
    return { Q2: 'no_regular_board', Q3: 'no_regular_board', Q4: 'no_regular_board' }
  }
  if (a.Q3 === 'does_not_know_dimensions') {
    return { Q4: 'user_did_not_know_dimensions' }
  }
  return {}
}

/** Multi-select caps, declared per question. */
export function maxFor(id: QuestionId): number | null {
  const q = QUESTIONS.find((x) => x.id === id)
  return q && q.kind === 'multi' ? q.max : null
}

/** Toggle a multi-select value, refusing to exceed the cap. */
export function toggleCapped<T extends string>(current: T[], value: T, max: number): T[] {
  if (current.includes(value)) return current.filter((v) => v !== value)
  if (current.length >= max) return current
  return [...current, value]
}

export function isAnswered(a: Answers, id: QuestionId): boolean {
  switch (id) {
    case 'Q1':
      return a.Q1 !== null
    case 'Q2':
      return a.Q2.length > 0
    case 'Q3':
      return a.Q3 !== null
    case 'Q4':
      return a.Q4.length !== null && a.Q4.volume !== null
    case 'Q5':
      return a.Q5.length > 0
    case 'Q6':
      return a.Q6.length > 0
    case 'Q7':
      return a.Q7 !== null
    case 'Q8':
      return a.Q8 !== null
    case 'Q9':
      return a.Q9.height.value !== null && a.Q9.weight.value !== null
  }
}

export function isComplete(a: Answers): boolean {
  return visibleQuestionIds(a).every((id) => isAnswered(a, id))
}

/** Physical input bounds. Outside these the Size Calculation Step produces no output (rules section 14). */
export const PHYSICAL_BOUNDS = {
  heightCm: { min: 120, max: 220 },
  weightKg: { min: 30, max: 200 },
} as const

export function toCm(value: number, unit: HeightUnit): number {
  return unit === 'cm' ? value : value * 2.54
}

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value / 2.2046
}

/**
 * Re-express a measurement in another unit.
 *
 * Switching the unit has to convert the number, not just relabel it: a surfer
 * who enters 80 kg and switches to lbs means 176 lbs, not 80. Returning null
 * for null keeps an unanswered field unanswered.
 */
export function convertHeight(value: number | null, from: HeightUnit, to: HeightUnit): number | null {
  if (value === null || from === to) return value
  const cm = toCm(value, from)
  return to === 'cm' ? Math.round(cm) : Math.round((cm / 2.54) * 10) / 10
}

export function convertWeight(value: number | null, from: WeightUnit, to: WeightUnit): number | null {
  if (value === null || from === to) return value
  const kg = toKg(value, from)
  return to === 'kg' ? Math.round(kg * 10) / 10 : Math.round(kg * 2.2046 * 10) / 10
}

export function physicalIsValid(p: PhysicalAnswer): boolean {
  if (p.height.value === null || p.weight.value === null) return false
  const cm = toCm(p.height.value, p.height.unit)
  const kg = toKg(p.weight.value, p.weight.unit)
  return (
    cm >= PHYSICAL_BOUNDS.heightCm.min &&
    cm <= PHYSICAL_BOUNDS.heightCm.max &&
    kg >= PHYSICAL_BOUNDS.weightKg.min &&
    kg <= PHYSICAL_BOUNDS.weightKg.max
  )
}
