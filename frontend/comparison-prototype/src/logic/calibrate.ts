/**
 * Calibration — the surfer pushing back on what the system understood.
 *
 * A closed set of six adjustments. Anything outside it gets an honest refusal
 * naming what can be changed; nothing here pretends to understand free text it
 * cannot parse.
 *
 * Adjustments are an OVERLAY, never a mutation: the base profile is always
 * re-derived from the answers, then adjustments are re-applied on top. Changing
 * an onboarding answer therefore re-derives cleanly.
 *
 * Volume caps and floors clamp the computed zone as a labelled overlay rather
 * than editing any coefficient, which keeps `size-calculation-rules.md`
 * section 8 intact: preference must not move the formula's bounds.
 */

import type { Answers } from './answers'
import { PHYSICAL_BOUNDS } from './answers'
import { decide, type DecisionSignals } from './decide'
import type { Position, SurferProfile } from './profile'
import { calculateSize, physicalIsCalculable, type BoardCategory, type SizeResult } from './size'
import { selectCategoryContext } from './categoryContext'
import { translate } from './translate'

export type CalibrationIntent =
  | 'volume_cap'
  | 'volume_floor'
  | 'more_performance'
  | 'more_support'
  | 'physical_correction'
  | 'category_preference'

export interface Adjustment {
  id: string
  intent: CalibrationIntent
  /** Short chip label, e.g. "Cap volume at 36 L". */
  label: string
  volumeCap?: number
  volumeFloor?: number
  position?: Position
  weightKg?: number
  heightCm?: number
  category?: BoardCategory
}

export type ParseOutcome =
  | { ok: true; adjustment: Omit<Adjustment, 'id'> }
  | { ok: false; message: string }

export const VOLUME_BOUNDS = { min: 15, max: 80 } as const

const CATEGORY_WORDS: { re: RegExp; category: BoardCategory; name: string }[] = [
  { re: /\b(twin|fish)\b/i, category: 'fish', name: 'fish' },
  { re: /\b(groveler|grovell?er|small[- ]wave)\b/i, category: 'groveler', name: 'groveler' },
  { re: /\b(hybrid)\b/i, category: 'hybrid', name: 'hybrid' },
  { re: /\b(step[- ]?up)\b/i, category: 'step_up', name: 'step-up' },
  { re: /\b(mid[- ]?length|midlength)\b/i, category: 'mid_length', name: 'mid-length' },
  { re: /\b(longboard|log)\b/i, category: 'longboard', name: 'longboard' },
  { re: /\b(shortboard|performance board)\b/i, category: 'shortboard', name: 'shortboard' },
]

const UNRECOGNISED =
  'That one is outside what this prototype can adjust. It can change the volume ceiling or floor, push the profile toward performance or toward support, correct your height or weight, or size for a different board type.'

/**
 * Parse one calibration request. Deliberately conservative: a sentence that
 * does not clearly match one of the six intents is refused rather than guessed.
 */
export function parseCalibration(raw: string): ParseOutcome {
  const text = raw.trim().toLowerCase()
  if (!text) return { ok: false, message: UNRECOGNISED }

  const litres = text.match(/(\d+(?:\.\d+)?)\s*(?:l\b|lit(?:re|er)s?)/)
  const volume = litres ? Number(litres[1]) : null

  // ── Physical corrections
  const weight = text.match(/(\d+(?:\.\d+)?)\s*(kg|kilos?|kilograms?|lbs?|pounds?)/)
  if (weight) {
    const n = Number(weight[1])
    const kg = /lb|pound/.test(weight[2]) ? n / 2.2046 : n
    if (kg < PHYSICAL_BOUNDS.weightKg.min || kg > PHYSICAL_BOUNDS.weightKg.max) {
      return {
        ok: false,
        message: `That weight is outside the range this prototype accepts (${PHYSICAL_BOUNDS.weightKg.min}–${PHYSICAL_BOUNDS.weightKg.max} kg). Nothing was changed.`,
      }
    }
    return {
      ok: true,
      adjustment: { intent: 'physical_correction', label: `Weight ${Math.round(kg)} kg`, weightKg: kg },
    }
  }

  const heightCm = text.match(/(\d+(?:\.\d+)?)\s*cm\b/)
  const heightFt = text.match(/(\d)\s*(?:'|’|ft|feet)\s*(\d{1,2})?/)
  if (heightCm || (heightFt && /\b(tall|height|high)\b/.test(text))) {
    const cm = heightCm ? Number(heightCm[1]) : (Number(heightFt![1]) * 12 + Number(heightFt![2] ?? 0)) * 2.54
    if (cm < PHYSICAL_BOUNDS.heightCm.min || cm > PHYSICAL_BOUNDS.heightCm.max) {
      return {
        ok: false,
        message: `That height is outside the range this prototype accepts (${PHYSICAL_BOUNDS.heightCm.min}–${PHYSICAL_BOUNDS.heightCm.max} cm). Nothing was changed.`,
      }
    }
    return { ok: true, adjustment: { intent: 'physical_correction', label: `Height ${Math.round(cm)} cm`, heightCm: cm } }
  }

  // ── Volume floor / ceiling
  const wantsFloor = /\b(not? (?:go )?below|no lower than|at least|minimum|min\b|nothing under|don'?t go under)\b/.test(text)
  const wantsCap = /\b(too much|too big|too high|too large|no more than|at most|maximum|max\b|cap|less foam|too much foam|under)\b/.test(text)

  if (volume !== null && (wantsFloor || wantsCap)) {
    if (volume < VOLUME_BOUNDS.min || volume > VOLUME_BOUNDS.max) {
      return {
        ok: false,
        message: `${volume} L is outside the range this prototype accepts (${VOLUME_BOUNDS.min}–${VOLUME_BOUNDS.max} L). Nothing was changed.`,
      }
    }
    return wantsFloor
      ? { ok: true, adjustment: { intent: 'volume_floor', label: `No less than ${volume} L`, volumeFloor: volume } }
      : { ok: true, adjustment: { intent: 'volume_cap', label: `No more than ${volume} L`, volumeCap: volume } }
  }

  // ── Direction, without a number
  if (/\b(more performance|performance[- ]oriented|more aggressive|looser|more responsive|less foam|smaller board)\b/.test(text)) {
    return { ok: true, adjustment: { intent: 'more_performance', label: 'Lean performance', position: 'performance_capable' } }
  }
  if (/\b(easier|more support|more forgiving|more stable|more float|more volume|bigger board|more foam)\b/.test(text)) {
    return { ok: true, adjustment: { intent: 'more_support', label: 'Lean support', position: 'needs_support' } }
  }

  // ── Category preference
  const cat = CATEGORY_WORDS.find((c) => c.re.test(text))
  if (cat) {
    return {
      ok: true,
      adjustment: { intent: 'category_preference', label: `Size for a ${cat.name}`, category: cat.category },
    }
  }

  // ── A bare number with no direction is ambiguous; say so rather than guess.
  if (volume !== null) {
    return {
      ok: false,
      message: `Is ${volume} L a ceiling or a floor? Try "no more than ${volume} L" or "nothing below ${volume} L".`,
    }
  }

  return { ok: false, message: UNRECOGNISED }
}

export interface Derived {
  profile: SurferProfile
  signals: DecisionSignals
  category: BoardCategory
  size: SizeResult | null
  /** Set when the physical inputs cannot produce a size (rules section 14). */
  sizeError: string | null
  /** Volume bounds the surfer set by hand, applied over the computed zone. */
  clamped: { min: boolean; max: boolean }
}

let seq = 0
export const newAdjustmentId = (): string => `adj-${++seq}`

/** Later adjustments of the same kind replace earlier ones. */
export function addAdjustment(list: Adjustment[], next: Adjustment): Adjustment[] {
  const exclusive: CalibrationIntent[] = ['volume_cap', 'volume_floor', 'category_preference']
  const samePhysicalField = (a: Adjustment) =>
    next.intent === 'physical_correction' &&
    a.intent === 'physical_correction' &&
    (next.weightKg !== undefined) === (a.weightKg !== undefined)
  const directional = next.intent === 'more_performance' || next.intent === 'more_support'

  return [
    ...list.filter((a) => {
      if (exclusive.includes(next.intent) && a.intent === next.intent) return false
      if (samePhysicalField(a)) return false
      if (directional && (a.intent === 'more_performance' || a.intent === 'more_support')) return false
      return true
    }),
    next,
  ]
}

/**
 * Derive the effective profile, signals and sizing from the answers, with any
 * calibration applied on top.
 */
export function derive(answers: Answers, adjustments: Adjustment[] = []): Derived {
  const base = translate(answers)

  // Overrides that change the profile itself, before signals are produced.
  const positionAdj = [...adjustments].reverse().find((a) => a.position)
  const weightAdj = [...adjustments].reverse().find((a) => a.weightKg !== undefined)
  const heightAdj = [...adjustments].reverse().find((a) => a.heightCm !== undefined)

  const profile: SurferProfile = {
    ...base,
    physical: {
      height: heightAdj ? { value: Math.round(heightAdj.heightCm!), unit: 'cm' } : base.physical.height,
      weight: weightAdj ? { value: Math.round(weightAdj.weightKg!), unit: 'kg' } : base.physical.weight,
    },
    axes: {
      ...base.axes,
      support_vs_performance_need: positionAdj
        ? {
            ...base.axes.support_vs_performance_need,
            state: { ...base.axes.support_vs_performance_need.state, position: positionAdj.position! },
            confidence: {
              ...base.axes.support_vs_performance_need.confidence,
              basis: 'Set by the surfer during calibration.',
            },
          }
        : base.axes.support_vs_performance_need,
    },
  }

  const signals = decide(profile)
  const categoryAdj = [...adjustments].reverse().find((a) => a.category)
  const category = categoryAdj?.category ?? selectCategoryContext(profile, signals)

  if (!physicalIsCalculable(profile.physical)) {
    return {
      profile,
      signals,
      category,
      size: null,
      sizeError: 'Height and weight are needed before a size range can be calculated.',
      clamped: { min: false, max: false },
    }
  }

  const size = calculateSize(profile, signals.size_direction.value, category)

  // Surfer-set bounds, applied over the computed zone.
  const cap = [...adjustments].reverse().find((a) => a.volumeCap !== undefined)?.volumeCap
  const floor = [...adjustments].reverse().find((a) => a.volumeFloor !== undefined)?.volumeFloor
  const clamped = { min: false, max: false }
  if (cap !== undefined && cap < size.target_volume.max) {
    size.target_volume.max = Math.max(cap, size.target_volume.min)
    clamped.max = true
  }
  if (floor !== undefined && floor > size.target_volume.min) {
    size.target_volume.min = Math.min(floor, size.target_volume.max)
    clamped.min = true
  }

  return { profile, signals, category, size, sizeError: null, clamped }
}

/** True when a cap and floor would cross; the UI refuses such a pair. */
export function wouldInvert(list: Adjustment[], next: Omit<Adjustment, 'id'>): boolean {
  const cap = next.volumeCap ?? [...list].reverse().find((a) => a.volumeCap !== undefined)?.volumeCap
  const floor = next.volumeFloor ?? [...list].reverse().find((a) => a.volumeFloor !== undefined)?.volumeFloor
  return cap !== undefined && floor !== undefined && floor >= cap
}

/** Where in the range to recommend from (rules sections 7 and 8). */
export function rangeEmphasis(signals: DecisionSignals, position: Position): 'lower' | 'middle' | 'upper' | null {
  switch (signals.size_direction.value) {
    case 'lean_up':
      return 'upper'
    case 'lean_down':
      return 'lower'
    case 'keep':
      return position === 'needs_support' ? 'upper' : position === 'performance_capable' ? 'lower' : 'middle'
    default:
      return position === 'needs_support' ? 'upper' : position === 'performance_capable' ? 'lower' : null
  }
}
