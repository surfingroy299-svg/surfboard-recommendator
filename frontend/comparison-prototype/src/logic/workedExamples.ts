/**
 * The worked examples from `logic/size-calculation-rules.md` section 13, as a
 * runnable check. If the sizing rules are edited, this is what catches drift
 * from the document.
 *
 * Runs automatically in dev (see main.tsx) and logs to the console.
 */

import { calculateSize, type BoardCategory } from './size'
import type { SizeDirection } from './decide'
import type { Band, Conditions, DemandLevel, Position, SubLevel, SurferProfile } from './profile'

function stubProfile(
  heightCm: number,
  weightKg: number,
  band: Band,
  sub_level: SubLevel,
  conditions: Conditions,
  perceived_demand_level: DemandLevel,
  position: Position,
): SurferProfile {
  const confidence = { level: 'high' as const, type: 'consistent_signals' as const, basis: 'fixture' }
  const axis = <S>(state: S) => ({ state, confidence, evidence: [], summary: '' })
  return {
    meta: {
      completeness: { questions_answered: 9, questions_total: 9, skipped: [], skip_reasons: {}, optional_fields_provided: {} },
      coherence: { assessment: 'consistent', note: null },
      flags: [],
    },
    physical: { height: { value: heightCm, unit: 'cm' }, weight: { value: weightKg, unit: 'kg' } },
    axes: {
      actual_surfing_level: axis({ band, sub_level, edge_flags: [] }),
      wave_context: axis({ conditions, usage_mode: 'baseline', perceived_demand_level }),
      board_fit_mismatch: axis({
        fit: 'limiting',
        direction: 'too_demanding',
        cause: 'size',
        competing_causes: null,
        conflict_explanation: null,
      }),
      support_vs_performance_need: axis({ position, alignment: 'aligned' }),
      user_intent: axis({ raw_intent: '', interpreted_intent: '', intent_gap: 'none' }),
    },
  }
}

interface Expectation {
  name: string
  profile: SurferProfile
  direction: SizeDirection
  category: BoardCategory
  volume: [number, number]
  length: [string, string]
}

const EXAMPLES: Expectation[] = [
  {
    name: 'A — lower-intermediate, weak waves, board too demanding, groveler',
    profile: stubProfile(178, 74, 'intermediate', 'lower', 'weak', 'low', 'needs_support'),
    direction: 'lean_up',
    category: 'groveler',
    volume: [44.4, 61.6],
    length: ['5’7″', '5’11″'],
  },
  {
    name: 'B — upper-intermediate, weak waves, category mismatch, groveler',
    profile: stubProfile(175, 72, 'intermediate', 'upper', 'weak', 'low', 'balanced'),
    direction: 'keep',
    category: 'groveler',
    volume: [30.2, 40.8],
    length: ['5’4″', '5’8″'],
  },
  {
    name: 'C — advanced, powerful waves, performance shortboard',
    profile: stubProfile(182, 82, 'advanced', 'lower', 'powerful', 'high', 'performance_capable'),
    direction: 'lean_down',
    category: 'shortboard',
    volume: [22.4, 32.8],
    length: ['5’10″', '6’2″'],
  },
]

export interface ExampleResult {
  name: string
  pass: boolean
  detail: string
}

export function runWorkedExamples(): ExampleResult[] {
  return EXAMPLES.map((e) => {
    const r = calculateSize(e.profile, e.direction, e.category)
    const pass =
      r.target_volume.min === e.volume[0] &&
      r.target_volume.max === e.volume[1] &&
      r.target_length.min_display === e.length[0] &&
      r.target_length.max_display === e.length[1]
    const detail = pass
      ? `${r.target_volume.min}–${r.target_volume.max} L · ${r.target_length.min_display}–${r.target_length.max_display}`
      : `expected ${e.volume[0]}–${e.volume[1]} L / ${e.length[0]}–${e.length[1]}, got ${r.target_volume.min}–${r.target_volume.max} L / ${r.target_length.min_display}–${r.target_length.max_display}`
    return { name: e.name, pass, detail }
  })
}

/** Dev-only console report. Silent when every example reproduces. */
export function reportWorkedExamples(): void {
  const results = runWorkedExamples()
  const failed = results.filter((r) => !r.pass)
  if (failed.length === 0) {
    console.info(`[size-calculation] ${results.length}/${results.length} worked examples reproduce the document.`)
    return
  }
  console.error('[size-calculation] implementation diverges from size-calculation-rules.md section 13:')
  for (const f of failed) console.error(`  ${f.name}: ${f.detail}`)
}
