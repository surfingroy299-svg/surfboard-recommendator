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
  volume: string | null
  /** Optional free text. V1: not processed by the Translation Layer. */
  modelBrand: string
}

export interface PhysicalAnswer {
  height: { value: number | null; unit: HeightUnit }
  weight: { value: number | null; unit: WeightUnit }
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
  Q4: { length: null, volume: null, modelBrand: '' },
  Q5: [],
  Q5FreeText: '',
  Q6: [],
  Q6FreeText: '',
  Q7: null,
  Q8: null,
  Q9: { height: { value: null, unit: 'cm' }, weight: { value: null, unit: 'kg' } },
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
