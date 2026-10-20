/**
 * Size Calculation Step.
 *
 * Implements `logic/size-calculation-rules.md` sections 4–12 against the
 * input/output contract in `logic/size-calculation-step.md`. Every coefficient
 * below is taken from that document; none is tuned here. The document labels
 * them as initial calibration values, and section 15 tracks what would revise
 * them.
 *
 * Values are rounded to one decimal place after each step, which is what
 * reproduces the worked examples in section 13.
 */

import type { Band, DemandLevel, SubLevel, SurferProfile } from './profile'
import type { SizeDirection } from './decide'
import { physicalMetric } from './translate'
import { PHYSICAL_BOUNDS, toCm, toKg } from './answers'

export type BoardCategory =
  | 'shortboard'
  | 'performance_shortboard'
  | 'everyday_shortboard'
  | 'groveler'
  | 'fish'
  | 'hybrid'
  | 'step_up'
  | 'mid_length'
  | 'longboard'

/** Section 4 — baseline Guild Factor table. */
const GF: Record<string, [number, number]> = {
  'beginner/lower': [0.87, 1.0],
  'beginner/mid': [0.76, 0.9],
  'beginner/upper': [0.65, 0.8],
  'intermediate/lower': [0.53, 0.68],
  'intermediate/mid': [0.45, 0.58],
  'intermediate/upper': [0.37, 0.5],
  'advanced/lower': [0.32, 0.43],
  'advanced/mid': [0.28, 0.37],
  'advanced/upper': [0.25, 0.33],
  'pro/lower': [0.23, 0.32],
  'pro/mid': [0.23, 0.32],
  'pro/upper': [0.23, 0.32],
}

/** Section 5 — wave conditions adjustment, keyed on perceived_demand_level. */
const CONDITIONS_FACTOR: Record<DemandLevel, number> = { low: 1.07, moderate: 1.0, high: 0.93 }

/** Section 6 — board category context. */
const CATEGORY_MULTIPLIER: Record<BoardCategory, number> = {
  shortboard: 1.0,
  performance_shortboard: 1.0,
  everyday_shortboard: 1.03,
  groveler: 1.06,
  fish: 1.05,
  hybrid: 1.04,
  step_up: 0.96,
  mid_length: 1.45,
  longboard: 1.85,
}

/** Section 12.1 — length skill offset, in inches. */
const SKILL_OFFSET_IN: Record<string, number> = {
  'beginner/lower': 6,
  'beginner/mid': 5,
  'beginner/upper': 4,
  'intermediate/lower': 3,
  'intermediate/mid': 2,
  'intermediate/upper': 1,
  'advanced/lower': 0,
  'advanced/mid': -1,
  'advanced/upper': -2,
  'pro/lower': -3,
  'pro/mid': -3,
  'pro/upper': -3,
}

/** Section 12.1 — length category offset, in inches. */
const CATEGORY_OFFSET_IN: Record<BoardCategory, number> = {
  shortboard: 0,
  performance_shortboard: 0,
  everyday_shortboard: 1,
  groveler: -4,
  fish: -3,
  hybrid: 0,
  step_up: 4,
  mid_length: 14,
  longboard: 26,
}

export interface SizeOption {
  volume_min: number
  volume_max: number
  length_display: string
  note: string
}

export interface SizeResult {
  target_volume: { min: number; max: number; note: string | null }
  target_length: {
    min: number
    min_display: string
    max: number
    max_display: string
    note: string | null
  }
  split_size: { active: boolean; reason: string | null; option_a: SizeOption | null; option_b: SizeOption | null }
  /** The category this range is relative to — every volume output is category-relative (section 14). */
  category: BoardCategory
}

const round1 = (n: number): number => Math.round(n * 10) / 10
const key = (band: Band, sub: SubLevel) => `${band}/${sub}`

/** Section 12.2 — feet and inches, rounded to the nearest inch. Primes match the board data style. */
export function formatLength(totalInches: number): string {
  const rounded = Math.round(totalInches)
  const ft = Math.floor(rounded / 12)
  const inch = rounded - ft * 12
  return `${ft}’${inch}″`
}

export class InvalidPhysicalInput extends Error {}

/**
 * Section 14 — invalid physical input produces no output; the error is flagged
 * upstream rather than guessed around.
 */
export function physicalIsCalculable(p: SurferProfile['physical']): boolean {
  if (!p.height.value || !p.weight.value) return false
  const cm = toCm(p.height.value, p.height.unit)
  const kg = toKg(p.weight.value, p.weight.unit)
  return (
    cm >= PHYSICAL_BOUNDS.heightCm.min &&
    cm <= PHYSICAL_BOUNDS.heightCm.max &&
    kg >= PHYSICAL_BOUNDS.weightKg.min &&
    kg <= PHYSICAL_BOUNDS.weightKg.max
  )
}

export function calculateSize(
  profile: SurferProfile,
  sizeDirection: SizeDirection,
  category: BoardCategory,
): SizeResult {
  if (!physicalIsCalculable(profile.physical)) {
    throw new InvalidPhysicalInput('Height or weight is outside plausible human ranges.')
  }

  const { heightCm, weightKg } = physicalMetric(profile.physical)
  const level = profile.axes.actual_surfing_level.state
  const wave = profile.axes.wave_context.state
  const position = profile.axes.support_vs_performance_need.state.position
  const notes: string[] = []

  // ── Step 1: baseline GF range (section 4)
  const [gfMin, gfMax] = GF[key(level.band, level.sub_level)] ?? GF['intermediate/mid']
  let min = round1(weightKg * gfMin)
  let max = round1(weightKg * gfMax)

  // ── Step 2: wave conditions (section 5) — always applied, even at x1.00
  const waveConfidenceLow = profile.axes.wave_context.confidence.level === 'low'
  let factor = CONDITIONS_FACTOR[wave.perceived_demand_level]
  if (waveConfidenceLow) {
    factor = 1.0
    notes.push('Wave conditions confidence insufficient. Volume range is unadjusted for conditions.')
  } else {
    // Conflict between the two inputs: use the higher-volume direction at half magnitude.
    const impliedByConditions: DemandLevel | null =
      wave.conditions === 'weak' ? 'low' : wave.conditions === 'powerful' ? 'high' : wave.conditions === 'balanced' ? 'moderate' : null
    if (impliedByConditions && impliedByConditions !== wave.perceived_demand_level) {
      const other = CONDITIONS_FACTOR[impliedByConditions]
      const conservative = Math.max(factor, other)
      factor = 1 + (conservative - 1) / 2
    }
  }
  min = round1(min * factor)
  max = round1(max * factor)

  if (wave.conditions === 'mixed') {
    min = round1(min * 0.97)
    max = round1(max * 1.03)
  }

  // ── Step 3: board category context (section 6)
  min = round1(min * CATEGORY_MULTIPLIER[category])
  max = round1(max * CATEGORY_MULTIPLIER[category])

  const isLongFamily = category === 'mid_length' || category === 'longboard'
  if (isLongFamily) {
    min = round1(min * 0.9)
    max = round1(max * 1.1)
    notes.push(
      'Volume range for this category is a GF-based approximation. Precision is lower than for shortboard-family boards.',
    )
  }

  // Range as computed through section 6 — the basis for a split (section 9).
  const categoryMin = min
  const categoryMax = max

  // ── Step 4: size direction (sections 7, 9, 10)
  let split_size: SizeResult['split_size'] = { active: false, reason: null, option_a: null, option_b: null }

  if (sizeDirection === 'lean_up') {
    max = round1(max * 1.08)
    notes.push('Recommended emphasis: upper portion of range. Board too demanding — prefer toward the higher end.')
  } else if (sizeDirection === 'lean_down') {
    min = round1(min * 0.92)
    notes.push('Recommended emphasis: lower portion of range. Board too supportive — prefer toward the lower end.')
  } else if (sizeDirection === 'unclear') {
    min = round1(min * 0.92)
    max = round1(max * 1.08)
    notes.push('Range widened due to unclear size direction. Any board within this range is a valid size candidate.')
  } else if (sizeDirection === 'keep') {
    notes.push('Recommended emphasis: middle of range.')
  }

  // ── Step 5: support vs performance preference — note only, never bounds (section 8)
  if (position === 'needs_support') {
    notes.push(
      'Prefer boards toward the upper portion of the volume range. If a board is available in two sizes, lean toward the larger.',
    )
  } else if (position === 'performance_capable') {
    notes.push(
      'Prefer boards toward the lower portion of the volume range. If a board is available in two sizes, lean toward the smaller.',
    )
  }

  // ── Guardrail: minimum 3 L of width (section 14)
  if (max - min < 3) {
    const mid = (min + max) / 2
    min = round1(mid - 1.5)
    max = round1(mid + 1.5)
    notes.push('Range widened to minimum 3 L.')
  }

  // ── Length (section 12)
  const heightIn = heightCm / 2.54
  const centerIn = heightIn + (SKILL_OFFSET_IN[key(level.band, level.sub_level)] ?? 0) + CATEGORY_OFFSET_IN[category]
  const minIn = centerIn - 2
  const maxIn = centerIn + 2

  const target_length = {
    min: minIn / 12,
    min_display: formatLength(minIn),
    max: maxIn / 12,
    max_display: formatLength(maxIn),
    note: null as string | null,
  }

  // ── Split (section 9) — only when the Decision Layer asked for it
  if (sizeDirection === 'split') {
    const midpoint = (categoryMin + categoryMax) / 2
    const a = { lo: round1(midpoint - 0.5), hi: categoryMax }
    const b = { lo: categoryMin, hi: round1(midpoint + 0.5) }
    const overlap = Math.max(0, Math.min(a.hi, b.hi) - Math.max(a.lo, b.lo))
    const widthA = a.hi - a.lo
    const widthB = b.hi - b.lo
    if (widthA <= 0 || widthB <= 0 || overlap > 0.5 * Math.min(widthA, widthB)) {
      notes.push('Range too narrow to produce two distinct size options. Full range applies.')
    } else {
      split_size = {
        active: true,
        reason: 'Two size strategies are both valid for this profile.',
        option_a: {
          volume_min: a.lo,
          volume_max: a.hi,
          length_display: `${target_length.min_display} – ${target_length.max_display}`,
          note: 'Higher volume — more float, easier wave catching',
        },
        option_b: {
          volume_min: b.lo,
          volume_max: b.hi,
          length_display: `${target_length.min_display} – ${target_length.max_display}`,
          note: 'Lower volume — more responsive, more performance-oriented',
        },
      }
    }
  }

  return {
    target_volume: { min, max, note: notes.length ? notes.join(' ') : null },
    target_length,
    split_size,
    category,
  }
}
