/**
 * Translation Layer — onboarding answers to a Surfer Profile.
 *
 * Implements `logic/translation-layer.md` sections 5–10 against the schema in
 * `logic/surfer-profile-schema.md`. Section references in comments point at the
 * rule each block implements. Nothing here decides or recommends (section 13).
 *
 * Where the schema's illustrative example profile and the rules table disagree
 * — `can_link_turns` maps to intermediate/mid in section 6.1 but appears as
 * intermediate/upper in the example — the rules table wins.
 */

import type { Answers } from './answers'
import { skipReasons, toCm, toKg, visibleQuestionIds } from './answers'
import { Q8_LADDER, type Q2Value, type Q5Value, type Q6Value, type Q8Value } from './questions'
import {
  escalateFit,
  type Alignment,
  type Axis,
  type Band,
  type BoardFitState,
  type Cause,
  type Confidence,
  type Evidence,
  type Fit,
  type FitDirection,
  type IntentGap,
  type LevelState,
  type MetaFlagType,
  type Position,
  type SubLevel,
  type SupportPerformanceState,
  type SurferProfile,
  type UserIntentState,
  type WaveContextState,
} from './profile'

// ───────────────────────── Axis 1 — Actual Surfing Level (section 6)

/** Section 6.1: the highest-selected Q8 rung sets band and sub_level. */
const LEVEL_BY_RUNG: Record<Q8Value, { band: Band; sub_level: SubLevel }> = {
  can_stand_ride_straight: { band: 'beginner', sub_level: 'lower' },
  can_ride_face: { band: 'beginner', sub_level: 'upper' },
  can_make_basic_turns: { band: 'intermediate', sub_level: 'lower' },
  can_link_turns: { band: 'intermediate', sub_level: 'mid' },
  can_link_turns_smoothly: { band: 'intermediate', sub_level: 'upper' },
  can_position_strategically: { band: 'advanced', sub_level: 'lower' },
}

/** Q2 / Q5 values that corroborate an intermediate reading (section 6.2). */
const LEVEL_CORROBORATING_Q2: Q2Value[] = ['catches_waves_easily', 'loses_speed_easily', 'feels_stable_comfortable']
const LEVEL_CORROBORATING_Q5: Q5Value[] = [
  'loses_speed_on_wave',
  'cant_generate_speed_weak_waves',
  'struggles_to_catch_waves_consistently',
]

/** Q8 selections that place a paddling struggle in conflict with high skill (section 6.4). */
const HIGH_RUNGS: Q8Value[] = ['can_link_turns_smoothly', 'can_position_strategically']

function rungIndexes(q8: Q8Value[]): number[] {
  return q8.map((v) => Q8_LADDER.indexOf(v)).sort((a, b) => a - b)
}

/**
 * Largest step between consecutive selected rungs. 1 is contiguous.
 *
 * Section 6.4 treats skipped rungs as a signal. Both worked examples skip two
 * or more rungs, so a gap of 3+ is read as the "large unexplained gap" that
 * drops confidence to low; a single skipped rung is treated as the minor
 * tension section 6.3 maps to medium.
 */
function largestRungGap(q8: Q8Value[]): number {
  const idx = rungIndexes(q8)
  let gap = 1
  for (let i = 1; i < idx.length; i++) gap = Math.max(gap, idx[i] - idx[i - 1])
  return gap
}

function translateLevel(a: Answers): Axis<LevelState> {
  const evidence: Evidence[] = []
  const selected = a.Q8
  const highest = selected.reduce<Q8Value | null>(
    (best, v) => (best === null || Q8_LADDER.indexOf(v) > Q8_LADDER.indexOf(best) ? v : best),
    null,
  )

  // Q8 is never gated, so a missing answer is an edge case only.
  if (!highest) {
    return {
      state: { band: 'intermediate', sub_level: 'lower', edge_flags: [] },
      confidence: { level: 'low', type: 'insufficient_data', basis: 'No skill signals were provided.' },
      evidence,
      summary: 'Skill level could not be established from the answers given.',
    }
  }

  const { band, sub_level } = LEVEL_BY_RUNG[highest]
  evidence.push({
    source: 'Q8',
    value: highest,
    contribution: 'primary signal — highest selected skill sets band and sub-level',
  })
  for (const v of selected) {
    if (v === highest) continue
    evidence.push({ source: 'Q8', value: v, contribution: 'supporting signal — confirms the ladder below the highest skill' })
  }

  const edge_flags: LevelState['edge_flags'] = []
  // Section 6.1: leans_advanced when the top two rungs are both selected.
  if (selected.includes('can_position_strategically') && selected.includes('can_link_turns_smoothly')) {
    edge_flags.push('leans_advanced')
  }
  if (highest === 'can_stand_ride_straight' || highest === 'can_ride_face') edge_flags.push('leans_beginner')

  const corroboratingQ2 = a.Q2.filter((v) => LEVEL_CORROBORATING_Q2.includes(v))
  const corroboratingQ5 = a.Q5.filter((v) => LEVEL_CORROBORATING_Q5.includes(v))
  for (const v of corroboratingQ2) {
    evidence.push({ source: 'Q2', value: v, contribution: 'supporting signal — consistent with the inferred level' })
  }
  for (const v of corroboratingQ5) {
    evidence.push({ source: 'Q5', value: v, contribution: 'supporting signal — consistent with the inferred level' })
  }

  const gap = largestRungGap(selected)
  const paddleStruggle =
    a.Q2.includes('struggles_to_catch_waves') || a.Q5.includes('struggles_to_catch_waves_consistently')
  const highSkill = HIGH_RUNGS.includes(highest)
  const corroborated = corroboratingQ2.length + corroboratingQ5.length > 0

  let confidence: Confidence
  if (gap >= 3) {
    // Section 6.4 — large skill gap.
    confidence = {
      level: 'low',
      type: 'conflicting_signals',
      basis: 'Selected skills skip several steps of the ladder, so the level reading is uncertain.',
    }
  } else if (highSkill && paddleStruggle) {
    // Section 6.4 — do NOT lower the band; the barrier is board or conditions.
    confidence = {
      level: 'medium',
      type: 'conflicting_signals',
      basis:
        'Skill answers and reported trouble catching waves pull in different directions. Band held at the skill answer — a paddling barrier is more likely board or conditions than ability.',
    }
  } else if (selected.length === 1) {
    confidence = {
      level: 'medium',
      type: 'single_source',
      basis: 'One skill answer selected, with no second signal to confirm it.',
    }
  } else if (gap === 2) {
    confidence = {
      level: 'medium',
      type: 'conflicting_signals',
      basis: 'Selected skills skip a step of the ladder.',
    }
  } else if (corroborated) {
    confidence = {
      level: 'high',
      type: 'consistent_signals',
      basis: 'Skill answers form a continuous range and the board-feel answers agree with that level.',
    }
  } else {
    confidence = {
      level: 'medium',
      type: 'consistent_signals',
      basis: 'Skill answers are coherent, but nothing else in the answers confirms the level.',
    }
  }

  return {
    state: { band, sub_level, edge_flags },
    confidence,
    evidence,
    summary: `${sub_level} ${band} surfer, read from demonstrated ability rather than self-assessment.`,
  }
}

// ───────────────────────── Axis 2 — Wave Context (section 7)

/** Section 7.1: Q7 maps directly to all three state fields. */
const WAVE_BY_Q7 = {
  small_weak_waves: { conditions: 'weak', usage_mode: 'baseline', perceived_demand_level: 'low' },
  medium_waves_with_push: { conditions: 'balanced', usage_mode: 'baseline', perceived_demand_level: 'moderate' },
  powerful_steep_waves: { conditions: 'powerful', usage_mode: 'baseline', perceived_demand_level: 'high' },
  variable_conditions: { conditions: 'mixed', usage_mode: 'variable', perceived_demand_level: 'moderate' },
} as const satisfies Record<string, WaveContextState>

const WAVE_SUMMARY: Record<string, string> = {
  small_weak_waves: 'Small, low-power surf. The board has to make its own speed.',
  medium_waves_with_push: 'Waves with moderate push and a readable face. The board should work across a range.',
  powerful_steep_waves: 'Steeper, faster surf. The board has to handle real power.',
  variable_conditions: 'No dominant wave type. Versatility matters more than condition-specific tuning.',
}

function translateWaveContext(a: Answers): Axis<WaveContextState> {
  if (!a.Q7) {
    return {
      state: { conditions: 'mixed', usage_mode: 'unclear', perceived_demand_level: 'moderate' },
      confidence: { level: 'low', type: 'insufficient_data', basis: 'No environment answer was given.' },
      evidence: [],
      summary: 'Wave context unknown.',
    }
  }

  const state: WaveContextState = { ...WAVE_BY_Q7[a.Q7] }
  const evidence: Evidence[] = [
    { source: 'Q7', value: a.Q7, contribution: 'primary signal — defines the baseline wave conditions' },
  ]

  // Section 7.2: Q5 reinforces or contradicts, but never overrides Q7.
  let confidence: Confidence
  const weakSignal = a.Q5.includes('cant_generate_speed_weak_waves')
  if (weakSignal && a.Q7 === 'small_weak_waves') {
    evidence.push({
      source: 'Q5',
      value: 'cant_generate_speed_weak_waves',
      contribution: 'reinforcing signal — confirms weak conditions from a second context',
    })
    confidence = {
      level: 'high',
      type: 'consistent_signals',
      basis: 'Environment answer and the reported speed problem both describe weak surf.',
    }
  } else if (weakSignal && a.Q7 === 'medium_waves_with_push') {
    evidence.push({
      source: 'Q5',
      value: 'cant_generate_speed_weak_waves',
      contribution: 'tension — describes weak-wave speed trouble while the stated environment has push',
    })
    confidence = {
      level: 'medium',
      type: 'conflicting_signals',
      basis: 'Stated environment has push, but the reported problem is specific to weak waves.',
    }
  } else if (weakSignal && a.Q7 === 'powerful_steep_waves') {
    evidence.push({
      source: 'Q5',
      value: 'cant_generate_speed_weak_waves',
      contribution: 'unusual combination — noted, state unchanged (Q7 is authoritative)',
    })
    confidence = {
      level: 'high',
      type: 'single_source',
      basis: 'Environment answer is clear. The weak-wave speed answer is an unusual pairing and is noted only.',
    }
  } else if (a.Q7 === 'variable_conditions') {
    confidence = {
      level: 'medium',
      type: 'single_source',
      basis:
        'Variable conditions reported; demand level set to moderate as a default midpoint — the actual range is unknown.',
    }
  } else {
    confidence = { level: 'high', type: 'single_source', basis: 'A single, clear answer about typical conditions.' }
  }

  return { state, confidence, evidence, summary: WAVE_SUMMARY[a.Q7] }
}

// ───────────────────────── Axis 3 — Board Fit / Mismatch (section 8)

const Q2_NEGATIVE_MODERATE: Q2Value[] = ['struggles_to_catch_waves', 'loses_speed_easily']
const Q2_NEGATIVE_STRONG: Q2Value[] = ['feels_too_small_unstable']
const Q2_POSITIVE: Q2Value[] = ['catches_waves_easily', 'feels_stable_comfortable']

/** Section 5.0.2 reinforcing pairs: a Q5 value already flagged by Q2. */
const REINFORCES: Partial<Record<Q5Value, Q2Value[]>> = {
  struggles_to_catch_waves_consistently: ['struggles_to_catch_waves'],
  loses_speed_on_wave: ['loses_speed_easily'],
  cant_generate_speed_weak_waves: ['loses_speed_easily'],
  feels_unstable: ['feels_too_small_unstable'],
  cant_perform_turns: ['hard_to_turn'],
}

function translateBoardFit(a: Answers, level: Axis<LevelState>): Axis<BoardFitState> {
  // Step 1 (section 8.1) — no regular board stops the assessment.
  if (a.Q1 === 'no_regular_board') {
    return {
      state: {
        fit: 'unknown',
        direction: 'roughly_right',
        cause: 'unclear',
        competing_causes: null,
        conflict_explanation: null,
      },
      confidence: { level: 'low', type: 'data_gap', basis: 'No regular board to assess against.' },
      evidence: [{ source: 'Q1', value: 'no_regular_board', contribution: 'no basis for a fit assessment' }],
      summary: 'No current board to diagnose. Recommendation rests on skill, conditions, pain points and goals.',
    }
  }

  const evidence: Evidence[] = []
  if (a.Q1) {
    evidence.push({ source: 'Q1', value: a.Q1, contribution: 'board category context for the fit assessment' })
  }

  // Step 2 (section 8.2) — fit level from Q2 feel signals.
  const moderate = a.Q2.filter((v) => Q2_NEGATIVE_MODERATE.includes(v))
  const strong = a.Q2.filter((v) => Q2_NEGATIVE_STRONG.includes(v))
  const positive = a.Q2.filter((v) => Q2_POSITIVE.includes(v))
  const ambiguous = a.Q2.includes('hard_to_turn')
  const negativeCount = moderate.length + strong.length

  let fit: Fit
  if (a.Q2.length === 0) fit = 'unknown'
  else if (strong.length > 0 && negativeCount >= 2) fit = 'strongly_mismatched'
  else if (negativeCount >= 3) fit = 'strongly_mismatched'
  else if (strong.length > 0 || moderate.length >= 2) fit = 'mismatched'
  else if (moderate.length === 1) fit = 'limiting'
  else if (ambiguous) fit = 'limiting'
  else if (positive.length > 0) fit = 'well_matched'
  else fit = 'unknown'

  for (const v of a.Q2) {
    evidence.push({
      source: 'Q2',
      value: v,
      contribution: Q2_POSITIVE.includes(v)
        ? 'supporting signal — no problem reported on this dimension'
        : 'primary signal — reported problem with the current board',
    })
  }

  // Step 3 (section 8.3) — Q5 escalation or reinforcement.
  for (const v of a.Q5) {
    const pair = REINFORCES[v] ?? []
    const alreadyFlagged = pair.some((q2) => a.Q2.includes(q2))
    if (v === 'feels_stuck') continue // does not change the fit tier
    if (alreadyFlagged) {
      evidence.push({
        source: 'Q5',
        value: v,
        contribution: 'reinforcing signal — confirms the Q2 observation from a different context',
      })
      continue
    }
    if (v === 'cant_perform_turns') {
      evidence.push({ source: 'Q5', value: v, contribution: 'ambiguous signal — direction resolved separately' })
      continue
    }
    if (v === 'cant_generate_speed_weak_waves' && negativeCount > 0 && fit === 'limiting') {
      fit = 'mismatched' // high-specificity signal (section 8.3)
    } else if (fit !== 'unknown') {
      fit = escalateFit(fit)
    } else {
      fit = 'limiting'
    }
    evidence.push({ source: 'Q5', value: v, contribution: 'new dimension not reported in board feel — escalates the fit reading' })
  }

  // Step 4 (section 8.4) — direction.
  const supportiveBoard = a.Q1 === 'softboard' || a.Q1 === 'funboard'
  const demandingBoard = a.Q1 === 'shortboard' || a.Q1 === 'hybrid'
  const midPlus = level.state.band === 'advanced' || level.state.sub_level !== 'lower' || level.state.band === 'pro'

  let direction: FitDirection = 'roughly_right'
  const tooDemanding =
    a.Q2.includes('feels_too_small_unstable') ||
    a.Q5.includes('feels_unstable') ||
    (a.Q2.includes('struggles_to_catch_waves') && demandingBoard) ||
    (a.Q5.includes('struggles_to_catch_waves_consistently') && a.Q1 === 'shortboard') ||
    (a.Q2.includes('loses_speed_easily') && a.Q1 === 'shortboard' && a.Q7 === 'small_weak_waves')
  const tooSupportive =
    (supportiveBoard && midPlus && (a.Q2.includes('hard_to_turn') || a.Q5.includes('cant_perform_turns'))) ||
    (supportiveBoard && (a.Q8.includes('can_link_turns') || a.Q8.includes('can_link_turns_smoothly'))) ||
    (a.Q2.includes('feels_stable_comfortable') &&
      (a.Q6.includes('wants_freedom_to_move') || a.Q6.includes('wants_speed_and_flow')))

  if (tooDemanding && !tooSupportive) direction = 'too_demanding'
  else if (tooSupportive && !tooDemanding) direction = 'too_supportive'
  else if (tooDemanding && tooSupportive) direction = 'too_demanding' // constraint reading wins
  else direction = 'roughly_right'

  // Step 5 (section 8.5) — cause.
  const sizeCause =
    a.Q2.includes('feels_too_small_unstable') ||
    a.Q5.includes('feels_unstable') ||
    (a.Q2.includes('struggles_to_catch_waves') && (a.Q1 === 'fish' || a.Q1 === 'hybrid'))
  const categoryCause =
    (a.Q1 === 'shortboard' &&
      a.Q7 === 'small_weak_waves' &&
      (a.Q2.includes('loses_speed_easily') ||
        a.Q5.includes('loses_speed_on_wave') ||
        a.Q5.includes('cant_generate_speed_weak_waves'))) ||
    (supportiveBoard && midPlus && (a.Q2.includes('hard_to_turn') || a.Q5.includes('cant_perform_turns')))

  let cause: Cause = 'unclear'
  let competing_causes: Cause[] | null = null
  let conflict_explanation: string | null = null
  if (sizeCause && categoryCause) {
    cause = 'mixed'
    competing_causes = ['size', 'category']
    conflict_explanation =
      'Both the board size and the board type look involved. Either could be the dominant cause on its own.'
  } else if (categoryCause) cause = 'category'
  else if (sizeCause) cause = 'size'
  else if (fit === 'well_matched') cause = 'unclear'
  // Section 8.5 reserves `context` for a board that is "functionally correct"
  // and says to use it sparingly, so it is not applied to a board the previous
  // step already read as pulling in a direction.
  else if (direction === 'roughly_right' && a.Q7 === 'small_weak_waves' && (a.Q1 === 'fish' || a.Q1 === 'hybrid')) {
    cause = 'context'
  }

  if (a.Q4.volume) {
    evidence.push({
      source: 'Q4',
      value: a.Q4.volume,
      contribution: 'reported board volume — dimensional context for the fit reading',
    })
  }
  if (a.Q4.length) {
    evidence.push({ source: 'Q4', value: a.Q4.length, contribution: 'reported board length — dimensional context' })
  }

  // Section 8.7 / 8.8 — confidence, including the Q2-positive vs Q5-negative conflict.
  // 8.8 is about a positive and a negative on the SAME dimension, not merely a
  // positive and a negative coexisting: a board can honestly paddle well and
  // still turn badly, and 5.0.2 treats hard_to_turn + cant_perform_turns as
  // reinforcing rather than conflicting.
  const CONTRADICTORY: [Q2Value, Q5Value][] = [
    ['catches_waves_easily', 'struggles_to_catch_waves_consistently'],
    ['feels_stable_comfortable', 'feels_unstable'],
  ]
  const q2PositiveQ5Negative = CONTRADICTORY.some(([q2, q5]) => a.Q2.includes(q2) && a.Q5.includes(q5))
  const hasDimensions = a.Q3 === 'knows_dimensions' && !!a.Q4.volume
  let confidence: Confidence
  if (a.Q1 === 'unsure' && a.Q2.length <= 1) {
    confidence = { level: 'low', type: 'insufficient_data', basis: 'Board type unknown and few feel signals given.' }
  } else if (q2PositiveQ5Negative) {
    confidence = {
      level: 'medium',
      type: 'conflicting_signals',
      basis: 'Board feel reads positive while the reported frustration does not. Pain points were treated as primary.',
    }
  } else if (hasDimensions && fit !== 'unknown') {
    confidence = {
      level: 'high',
      type: 'consistent_signals',
      basis: 'Feel signals and the reported dimensions support the same reading.',
    }
  } else if (a.Q3 === 'does_not_know_dimensions') {
    confidence = {
      level: 'medium',
      type: 'data_gap',
      basis: 'Board dimensions unavailable — fit assessed from feel signals only.',
    }
  } else if (a.Q1 === 'unsure') {
    confidence = { level: 'medium', type: 'insufficient_data', basis: 'Board type unknown; assessed from feel only.' }
  } else {
    confidence = { level: 'medium', type: 'single_source', basis: 'Assessed from board-feel answers alone.' }
  }

  const summaries: Record<Fit, string> = {
    well_matched: 'The current board looks broadly right for this surfer.',
    limiting: 'The current board appears to be holding this surfer back in at least one way.',
    mismatched: 'The current board looks mismatched for this surfer.',
    strongly_mismatched: 'The current board looks clearly wrong for this surfer.',
    unknown: 'Not enough information to judge the current board.',
  }

  return {
    state: { fit, direction, cause, competing_causes, conflict_explanation },
    confidence,
    evidence,
    summary: summaries[fit],
  }
}

// ───────────────────────── Axis 4 — Support vs Performance (section 9)

function translateSupportPerformance(
  a: Answers,
  level: Axis<LevelState>,
  boardFit: Axis<BoardFitState>,
): Axis<SupportPerformanceState> {
  const evidence: Evidence[] = []
  const strongSupport: string[] = []
  const moderateSupport: string[] = []
  const strongPerformance: string[] = []
  const moderatePerformance: string[] = []

  // Section 9.1 — signals toward needs_support.
  if (a.Q6.includes('wants_stability')) strongSupport.push('wants_stability')
  if (a.Q6.includes('wants_easier_wave_catch')) strongSupport.push('wants_easier_wave_catch')
  if (a.Q5.includes('feels_unstable')) strongSupport.push('feels_unstable')
  if (level.state.band === 'beginner' || level.state.sub_level === 'lower') moderateSupport.push('level')
  if (boardFit.state.direction === 'too_demanding') moderateSupport.push('too_demanding')
  if (a.Q5.includes('struggles_to_catch_waves_consistently')) moderateSupport.push('struggles_to_catch_waves_consistently')

  // Section 9.1 — signals toward performance_capable.
  const highRung = a.Q8.includes('can_link_turns_smoothly') || a.Q8.includes('can_position_strategically')
  const performanceGoal = a.Q6.includes('wants_speed_and_flow') || a.Q6.includes('wants_freedom_to_move')
  if (highRung && performanceGoal) strongPerformance.push('skill_and_goal')
  if (boardFit.state.direction === 'too_supportive') moderatePerformance.push('too_supportive')
  const midPlus = level.state.sub_level !== 'lower' || level.state.band === 'advanced' || level.state.band === 'pro'
  if (a.Q6.includes('wants_freedom_to_move') && midPlus) moderatePerformance.push('wants_freedom_to_move')
  if (a.Q6.includes('wants_speed_and_flow') && midPlus) moderatePerformance.push('wants_speed_and_flow')

  for (const v of a.Q6) evidence.push({ source: 'Q6', value: v, contribution: 'stated goal — direction signal' })
  for (const v of a.Q5) evidence.push({ source: 'Q5', value: v, contribution: 'pain point — support or performance signal' })

  // Section 9.2 — position.
  const upperOrAbove = level.state.band === 'advanced' || level.state.band === 'pro' || level.state.sub_level === 'upper'
  let position: Position
  if ((strongSupport.length >= 1 || moderateSupport.length >= 2) && strongPerformance.length === 0) {
    position = 'needs_support'
  } else if (strongPerformance.length >= 1 && upperOrAbove && strongSupport.length === 0 && moderateSupport.length === 0) {
    position = 'performance_capable'
  } else {
    position = 'balanced'
  }

  // Section 9.3 — alignment between stated goals and inferred need.
  const wantsPerformance = performanceGoal
  const wantsSupport = a.Q6.includes('wants_stability') || a.Q6.includes('wants_easier_wave_catch')
  let alignment: Alignment = 'aligned'
  if (position === 'needs_support' && wantsPerformance && a.Q6.length >= 2 && !wantsSupport) alignment = 'strong_gap'
  else if (position === 'needs_support' && wantsPerformance) alignment = 'mild_gap'
  else if (position === 'performance_capable' && wantsSupport) alignment = 'mild_gap'
  else if (position === 'balanced' && wantsPerformance && !midPlus) alignment = 'mild_gap'

  const confidence: Confidence = (() => {
    const directionalQ5 = a.Q5.some((v) => v !== 'feels_stuck')
    const directionalQ6 = a.Q6.some((v) => v !== 'wants_progression' && v !== 'wants_turn_control')
    if (directionalQ5 && directionalQ6) {
      const same = (wantsSupport && position === 'needs_support') || (wantsPerformance && position !== 'needs_support')
      return same
        ? { level: 'high', type: 'consistent_signals', basis: 'Pain points and goals point the same way.' }
        : { level: 'medium', type: 'conflicting_signals', basis: 'Pain points and goals pull in different directions.' }
    }
    if (directionalQ5 || directionalQ6) {
      return { level: 'medium', type: 'single_source', basis: 'Only one of pain points or goals gives a direction.' }
    }
    return {
      level: 'low',
      type: 'insufficient_data',
      basis: 'Neither the pain points nor the goals point in a clear direction.',
    }
  })()

  const summaries: Record<Position, string> = {
    needs_support: 'This surfer needs a board that gives something back before it asks anything.',
    balanced: 'Sits between needing support and being ready for more performance.',
    performance_capable: 'Ready for equipment that rewards technique rather than protecting against mistakes.',
  }

  return { state: { position, alignment }, confidence, evidence, summary: summaries[position] }
}

// ───────────────────────── Axis 5 — User Intent (section 10)

const RAW_INTENT: Record<Q6Value, string> = {
  wants_speed_and_flow: 'more speed and flow on the wave',
  wants_turn_control: 'more control when turning',
  wants_stability: 'more stability and confidence',
  wants_freedom_to_move: 'more freedom to move and try things',
  wants_easier_wave_catch: 'catch waves more easily and consistently',
  wants_progression: 'improve and progress my surfing',
}

/** Section 10.1 — the documented two-selection combinations. */
const RAW_INTENT_PAIRS: { pair: [Q6Value, Q6Value]; text: string }[] = [
  { pair: ['wants_speed_and_flow', 'wants_freedom_to_move'], text: 'more speed, flow, and freedom to move on the wave' },
  { pair: ['wants_stability', 'wants_easier_wave_catch'], text: 'more stability and easier wave catching' },
  { pair: ['wants_progression', 'wants_speed_and_flow'], text: 'improve my surfing, particularly around speed and flow' },
  { pair: ['wants_progression', 'wants_stability'], text: 'improve my surfing and feel more stable and confident' },
]

/** Section 10.1 — Q6 = wants_progression alone takes its anchor from Q5. */
const PROGRESSION_ANCHOR: Partial<Record<Q5Value, string>> = {
  loses_speed_on_wave: 'improve my surfing, particularly around generating speed',
  cant_generate_speed_weak_waves: 'improve my surfing, particularly around generating speed',
  feels_unstable: 'improve my surfing and build more stability',
  struggles_to_catch_waves_consistently: 'improve my surfing and catch waves more reliably',
  cant_perform_turns: 'improve my surfing, particularly around turning',
}

/** Shared theme between a goal and a pain point, used by Rule A. */
const THEME_Q6: Partial<Record<Q6Value, string>> = {
  wants_speed_and_flow: 'speed',
  wants_turn_control: 'turns',
  wants_stability: 'stability',
  wants_easier_wave_catch: 'access',
  wants_freedom_to_move: 'freedom',
}
const THEME_Q5: Partial<Record<Q5Value, string>> = {
  loses_speed_on_wave: 'speed',
  cant_generate_speed_weak_waves: 'speed',
  cant_perform_turns: 'turns',
  feels_unstable: 'stability',
  struggles_to_catch_waves_consistently: 'access',
  feels_stuck: 'freedom',
}

function buildRawIntent(a: Answers): string {
  const goals = a.Q6
  if (goals.length === 0) return 'improve my surfing'
  if (goals.length === 1) {
    if (goals[0] === 'wants_progression') {
      for (const p of a.Q5) {
        const anchored = PROGRESSION_ANCHOR[p]
        if (anchored) return anchored
      }
    }
    return RAW_INTENT[goals[0]]
  }
  const match = RAW_INTENT_PAIRS.find(
    ({ pair }) => pair.every((v) => goals.includes(v)) && goals.length === 2,
  )
  if (match) return match.text
  return `${RAW_INTENT[goals[0]]} and ${RAW_INTENT[goals[1]]}`
}

function translateIntent(
  a: Answers,
  boardFit: Axis<BoardFitState>,
  sp: Axis<SupportPerformanceState>,
): Axis<UserIntentState> {
  const raw_intent = buildRawIntent(a)
  const evidence: Evidence[] = a.Q6.map((v) => ({
    source: 'Q6' as const,
    value: v,
    contribution: 'primary signal — defines the stated goal',
  }))
  for (const v of a.Q5) {
    evidence.push({ source: 'Q5', value: v, contribution: 'pain point — context for interpreting the goal' })
  }
  if (a.Q6FreeText.trim()) {
    evidence.push({ source: 'Q6', value: 'free_text_goal', contribution: 'Agent-only in V1; raw content preserved.' })
  }
  if (a.Q5FreeText.trim()) {
    evidence.push({ source: 'Q5', value: 'free_text_pain', contribution: 'Agent-only in V1; raw content preserved.' })
  }

  const sharedTheme = a.Q6.some((g) => a.Q5.some((p) => THEME_Q6[g] && THEME_Q6[g] === THEME_Q5[p]))
  const progressionOnly = a.Q6.length === 1 && a.Q6[0] === 'wants_progression'
  const specificPain = a.Q5.some((p) => p !== 'feels_stuck')
  const wantsPerformance = a.Q6.includes('wants_speed_and_flow') || a.Q6.includes('wants_freedom_to_move')
  const wantsSafety = a.Q6.includes('wants_stability') || a.Q6.includes('wants_easier_wave_catch')

  let interpreted_intent: string
  let intent_gap: IntentGap

  // When the cause is unresolved the direction usually still is, so the
  // sentence leans on that rather than trailing off. This claims no cause the
  // steps above did not find.
  const unresolved =
    boardFit.state.fit === 'unknown'
      ? 'this is read from your surfing rather than from a current board'
      : boardFit.state.direction === 'too_supportive'
        ? 'the move is toward less board under you, not more'
        : boardFit.state.direction === 'too_demanding'
          ? 'the move is toward a board that gives more back'
          : 'the change is one of character rather than size'

  const mechanism =
    boardFit.state.cause === 'category'
      ? 'a different board type is the most likely route'
      : boardFit.state.cause === 'size'
        ? 'a size change is the most likely route'
        : boardFit.state.cause === 'mixed'
          ? 'both board type and size look involved'
          : unresolved

  if (sharedTheme) {
    // Rule A — aligned pain and goal.
    interpreted_intent = `${raw_intent} — ${mechanism}.`
    intent_gap = 'minor'
  } else if (progressionOnly && specificPain) {
    // Rule B — broad progression goal resolved by Q5.
    interpreted_intent = `progress by addressing the reported problem first — ${mechanism}.`
    intent_gap = 'significant'
  } else if (wantsPerformance && sp.state.position === 'needs_support') {
    // Rule C — performance goal with a support need.
    interpreted_intent = `the stated goal is ${raw_intent}, but the profile suggests more support is the prerequisite — a better-matched board addresses that first and makes the rest possible.`
    intent_gap = 'significant'
  } else if (wantsSafety && boardFit.state.direction === 'too_supportive') {
    // Rule D — support goal on an already over-supportive board.
    interpreted_intent = `the stated goal is ${raw_intent}, but the current board may already be over-supportive — a modest step toward performance could improve the feel without costing confidence.`
    intent_gap = 'significant'
  } else {
    // Rule E — plain restatement.
    interpreted_intent = raw_intent
    intent_gap = 'none'
  }

  const confidence: Confidence = (() => {
    if (a.Q6.length === 0 && a.Q5.length === 0) {
      return { level: 'low', type: 'insufficient_data', basis: 'No goals or pain points given.' }
    }
    if (sharedTheme) {
      return { level: 'high', type: 'consistent_signals', basis: 'The stated goal and the reported problem match.' }
    }
    if (progressionOnly && !specificPain) {
      return { level: 'low', type: 'insufficient_data', basis: 'Both the goal and the frustration are broad.' }
    }
    if (progressionOnly) {
      return { level: 'medium', type: 'indirect_inference', basis: 'Broad goal, read through the specific pain point.' }
    }
    if (wantsPerformance && sp.state.position === 'needs_support') {
      return { level: 'medium', type: 'conflicting_signals', basis: 'The goal runs ahead of what the profile supports.' }
    }
    return { level: 'medium', type: 'single_source', basis: 'Goal is clear; the pain points point elsewhere.' }
  })()

  return {
    state: { raw_intent, interpreted_intent, intent_gap },
    confidence,
    evidence,
    summary: interpreted_intent,
  }
}

// ───────────────────────── Meta (section 5.0.3)

function buildMeta(a: Answers, axes: SurferProfile['axes']): SurferProfile['meta'] {
  const skips = skipReasons(a)
  const skipped = Object.keys(skips) as (keyof typeof skips)[]
  const visible = visibleQuestionIds(a)

  const flags: { type: MetaFlagType; note: string }[] = []
  if (a.Q3 === 'does_not_know_dimensions') {
    flags.push({
      type: 'missing_dimensions',
      note: 'Board dimensions unavailable — board fit assessed from feel signals only',
    })
  }
  if (a.Q1 === 'no_regular_board') {
    flags.push({ type: 'no_regular_board', note: 'No regular board — board fit axis has limited basis' })
  }
  const contradictoryFeel =
    (a.Q2.includes('catches_waves_easily') && a.Q2.includes('struggles_to_catch_waves')) ||
    (a.Q2.includes('feels_stable_comfortable') && a.Q2.includes('feels_too_small_unstable'))
  if (contradictoryFeel) {
    flags.push({ type: 'conflicting_feel_signals', note: 'Board feel selections contradict each other' })
  }
  if (a.Q8.length >= 2 && largestRungGap(a.Q8) >= 3) {
    flags.push({ type: 'ambiguous_level', note: 'Skill selections skip several steps of the ladder' })
  }
  const noProgressionSignal =
    a.Q6.length === 1 && a.Q6[0] === 'wants_progression' && a.Q5.every((v) => v === 'feels_stuck')
  if (noProgressionSignal) {
    flags.push({ type: 'no_progression_signal', note: 'Goals give no clear direction to progress in' })
  }
  const limitedSignals = [
    a.Q1 === 'unsure',
    a.Q3 === 'does_not_know_dimensions',
    a.Q8.length === 1 && Q8_LADDER.indexOf(a.Q8[0]) <= 1,
    a.Q5.every((v) => v === 'feels_stuck') && a.Q6.every((v) => v === 'wants_progression'),
  ].filter(Boolean).length
  if (limitedSignals >= 2) {
    flags.push({ type: 'limited_profile', note: 'Several answers were non-specific — interpret with caution' })
  }

  // Coherence across the finished axes.
  const lowConfidence = Object.values(axes).filter((x) => x.confidence.level === 'low').length
  const conflicting = Object.values(axes).filter((x) => x.confidence.type === 'conflicting_signals').length
  let assessment: SurferProfile['meta']['coherence']['assessment'] = 'consistent'
  let note: string | null = null
  if (conflicting >= 2 || (conflicting >= 1 && lowConfidence >= 1)) {
    assessment = 'conflicting'
    note = 'Several answers pull against each other; the reading below is deliberately cautious.'
  } else if (conflicting === 1 || axes.support_vs_performance_need.state.alignment !== 'aligned') {
    assessment = 'mixed'
    note = 'There is some tension between what was reported and what was asked for, but it is explicable.'
  }

  return {
    completeness: {
      questions_answered: visible.length,
      questions_total: 9,
      skipped,
      skip_reasons: skips,
      optional_fields_provided: {
        Q4_model_brand: !!a.Q4.modelBrand.trim(),
        Q5_free_text: !!a.Q5FreeText.trim(),
        Q6_free_text: !!a.Q6FreeText.trim(),
      },
    },
    coherence: { assessment, note },
    flags,
  }
}

// ───────────────────────── Entry point

export function translate(a: Answers): SurferProfile {
  const actual_surfing_level = translateLevel(a)
  const wave_context = translateWaveContext(a)
  const board_fit_mismatch = translateBoardFit(a, actual_surfing_level)
  const support_vs_performance_need = translateSupportPerformance(a, actual_surfing_level, board_fit_mismatch)
  const user_intent = translateIntent(a, board_fit_mismatch, support_vs_performance_need)

  const axes = {
    actual_surfing_level,
    wave_context,
    board_fit_mismatch,
    support_vs_performance_need,
    user_intent,
  }

  return {
    meta: buildMeta(a, axes),
    physical: {
      height: { value: a.Q9.height.value ?? 0, unit: a.Q9.height.unit },
      weight: { value: a.Q9.weight.value ?? 0, unit: a.Q9.weight.unit },
    },
    axes,
  }
}

/** Normalised physical values, used by the Size Calculation Step. */
export function physicalMetric(p: SurferProfile['physical']): { heightCm: number; weightKg: number } {
  return { heightCm: toCm(p.height.value, p.height.unit), weightKg: toKg(p.weight.value, p.weight.unit) }
}
