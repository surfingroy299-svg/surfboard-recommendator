/**
 * Decision Layer — advisory signals from a Surfer Profile.
 *
 * Implements `logic/decision-layer.md` section 11: the precedence-ordered
 * mapping tables for all six signals, plus the cross-signal consistency rules
 * in 11.7. Advisory only — this layer selects no boards (section 12).
 *
 * The document writes Progression Direction's fifth value as "split / unclear",
 * a single combined value; it is `split_unclear` here.
 */

import type { ConfidenceLevel, SurferProfile } from './profile'

export type ProgressionDirection = 'maintain' | 'support_more' | 'challenge_more' | 'redirect' | 'split_unclear'
export type SizeDirection = 'keep' | 'lean_up' | 'lean_down' | 'split' | 'unclear'
export type CategoryDirection = 'keep' | 'lean_change' | 'change_likely' | 'split' | 'unclear'
export type ChallengeLevel = 'conservative' | 'balanced' | 'progressive' | 'mixed' | 'unclear'
export type IntentModeration = 'preserved' | 'partially_moderated' | 'strongly_moderated'
export type UncertaintyFlag = 'low_confidence' | 'conflicting_signals' | 'no_dominant_direction' | 'insufficient_data'

export type AxisName =
  | 'actual_surfing_level'
  | 'wave_context'
  | 'board_fit_mismatch'
  | 'support_vs_performance_need'
  | 'user_intent'

/** Section 10a — the per-signal output format. */
export interface Signal<V> {
  value: V
  confidence: ConfidenceLevel
  basis: string
  source_axes: AxisName[]
  flags: string[]
}

export interface DecisionSignals {
  progression_direction: Signal<ProgressionDirection>
  size_direction: Signal<SizeDirection>
  category_direction: Signal<CategoryDirection>
  challenge_level: Signal<ChallengeLevel>
  intent_moderation: Signal<IntentModeration>
  uncertainty_flags: UncertaintyFlag[]
}

/** `cause` names size either directly or as one of the competing causes. */
function causeIncludesSize(p: SurferProfile): boolean {
  const { cause, competing_causes } = p.axes.board_fit_mismatch.state
  return cause === 'size' || (cause === 'mixed' && !!competing_causes?.includes('size'))
}

function causeIncludesCategory(p: SurferProfile): boolean {
  const { cause, competing_causes } = p.axes.board_fit_mismatch.state
  return cause === 'category' || (cause === 'mixed' && !!competing_causes?.includes('category'))
}

function q1Value(p: SurferProfile): string | null {
  return p.axes.board_fit_mismatch.evidence.find((e) => e.source === 'Q1')?.value ?? null
}

// ───────────────────────── 11.1 Progression Direction

function progressionDirection(p: SurferProfile): Signal<ProgressionDirection> {
  const fitAxis = p.axes.board_fit_mismatch
  const { fit, direction, cause } = fitAxis.state
  const level = p.axes.actual_surfing_level.state
  const source_axes: AxisName[] = ['board_fit_mismatch', 'actual_surfing_level', 'support_vs_performance_need']
  const flags: string[] = []

  // Additional constraints on challenge_more, checked before priority 6 can apply.
  const challengeBlocked =
    level.band === 'beginner' ||
    (p.axes.wave_context.state.perceived_demand_level === 'high' &&
      level.band === 'intermediate' &&
      level.sub_level === 'lower')

  if (p.axes.support_vs_performance_need.state.position === 'performance_capable' && direction === 'too_demanding') {
    flags.push('user_intent_diverges')
  }

  let value: ProgressionDirection
  let basis: string
  if (fit === 'unknown') {
    value = 'split_unclear'
    basis = 'No current board to diagnose, so no single progression direction is supported.'
  } else if (fit === 'strongly_mismatched' && direction === 'too_demanding') {
    value = 'support_more'
    basis = 'The current board is clearly too demanding. Fixing that comes before any added challenge.'
  } else if (cause === 'category') {
    value = 'redirect'
    basis = 'The board type is the problem, not the difficulty level. A wave-appropriate category resolves it.'
  } else if (cause === 'mixed' && direction === 'too_demanding') {
    value = 'redirect'
    basis = 'Board type and size both look involved. Difficulty calibration is carried by the challenge level.'
    // Priority 5. The table also excludes cause = category here; priority 3 has
    // already returned for that case, so it is not re-tested.
  } else if (direction === 'too_demanding' && (fit === 'limiting' || fit === 'mismatched')) {
    value = 'support_more'
    basis = 'The current board asks more than it gives back for this surfer.'
  } else if (direction === 'too_supportive' && level.band !== 'beginner' && !challengeBlocked) {
    value = 'challenge_more'
    basis = 'The current board is holding this surfer below what they can handle.'
  } else if (direction === 'roughly_right' || fit === 'well_matched') {
    value = 'maintain'
    basis = 'The current board is broadly right; no directional change is indicated.'
  } else if (cause === 'context') {
    value = 'maintain'
    basis = 'The board is functionally correct — the conditions are the constraint.'
  } else {
    value = 'split_unclear'
    basis = 'The signals do not resolve into one direction.'
  }

  if (value === 'challenge_more' && challengeBlocked) flags.push('moderate_challenge_only')

  const confidence: ConfidenceLevel =
    fit === 'unknown' || fitAxis.confidence.level === 'low'
      ? 'low'
      : fitAxis.confidence.level === 'medium'
        ? 'medium'
        : 'high'

  return { value, confidence, basis, source_axes, flags }
}

// ───────────────────────── 11.2 Size Direction

function sizeDirection(p: SurferProfile, progression: ProgressionDirection): Signal<SizeDirection> {
  const fitAxis = p.axes.board_fit_mismatch
  const { fit, direction, cause } = fitAxis.state
  const source_axes: AxisName[] = ['board_fit_mismatch', 'support_vs_performance_need']

  let value: SizeDirection
  let basis: string
  if (fit === 'unknown') {
    value = 'unclear'
    basis = 'No current board to size against.'
  } else if (cause === 'unclear' && fitAxis.confidence.level === 'low') {
    value = 'unclear'
    basis = 'The cause of the mismatch is not clear enough to point the sizing anywhere.'
  } else if (cause === 'category') {
    value = 'keep'
    basis = 'Size is not the problem. Standard sizing applies for the new category.'
  } else if (cause === 'context') {
    value = 'keep'
    basis = 'Conditions are the issue, not the size.'
  } else if (fit === 'well_matched') {
    value = 'keep'
    basis = 'The current board fits; no size change is indicated.'
  } else if (direction === 'too_demanding' && causeIncludesSize(p)) {
    value = 'lean_up'
    basis =
      fit === 'limiting'
        ? 'The board is slightly too demanding for its size. A modest step up is indicated.'
        : 'The board is too demanding primarily because of its size. A clear step up is indicated.'
  } else if (direction === 'too_supportive' && causeIncludesSize(p)) {
    value = 'lean_down'
    basis = 'The board carries more volume than this surfer needs.'
  } else if (progression === 'split_unclear') {
    value = 'split'
    basis = 'Two sizing strategies are both defensible for this profile.'
  } else {
    value = 'keep'
    basis = 'Nothing in the profile argues for moving away from standard sizing.'
  }

  const confidence: ConfidenceLevel =
    fit === 'unknown' || (cause === 'unclear' && fitAxis.confidence.level === 'low')
      ? 'low'
      : cause === 'mixed' || fitAxis.confidence.type === 'data_gap'
        ? 'medium'
        : fitAxis.confidence.level

  return { value, confidence, basis, source_axes, flags: [] }
}

// ───────────────────────── 11.3 Category Direction

function categoryDirection(p: SurferProfile): Signal<CategoryDirection> {
  const fitAxis = p.axes.board_fit_mismatch
  const { fit, direction, cause } = fitAxis.state
  const level = p.axes.actual_surfing_level.state
  const conditions = p.axes.wave_context.state.conditions
  const q1 = q1Value(p)
  const source_axes: AxisName[] = ['board_fit_mismatch', 'wave_context', 'actual_surfing_level']

  let value: CategoryDirection
  let basis: string
  if (fit === 'unknown') {
    value = 'unclear'
    basis = 'No current board to compare a category against.'
  } else if (cause === 'unclear') {
    value = 'unclear'
    basis = 'The cause of the mismatch is not clear enough to argue for a category change.'
  } else if (cause === 'category') {
    value = 'change_likely'
    basis =
      direction === 'too_demanding'
        ? 'A more forgiving category suits these conditions and this surfer better.'
        : 'A more performance-oriented category suits this surfer better.'
  } else if (cause === 'context') {
    value = 'keep'
    basis = 'The category is appropriate; conditions are the limiting factor.'
  } else if (cause === 'size' && fit === 'well_matched') {
    value = 'keep'
    basis = 'The category works; only the size is in question.'
  } else if (cause === 'mixed') {
    const sizeDominant = causeIncludesSize(p) && !causeIncludesCategory(p)
    value = sizeDominant ? 'lean_change' : 'split'
    basis = sizeDominant
      ? 'A category change is part of the answer but not the whole story.'
      : 'A size change and a category change are both valid paths from here.'
  } else if (cause === 'size' && direction === 'too_demanding' && q1 === 'shortboard' && level.band === 'intermediate' && level.sub_level === 'lower') {
    value = 'lean_change'
    basis = 'A size increase within the shortboard category may not be enough on its own.'
  } else if (cause === 'size' && conditions === 'weak' && q1 === 'shortboard') {
    value = 'lean_change'
    basis = 'In weak surf a wave-appropriate category is worth considering alongside the size change.'
  } else if (conditions === 'mixed') {
    value = 'split'
    basis = 'Conditions vary too much to settle on one category.'
  } else {
    value = 'keep'
    basis = 'No reason to move away from the current category.'
  }

  const confidence: ConfidenceLevel =
    cause === 'unclear' || fit === 'unknown'
      ? 'low'
      : cause === 'mixed' || q1 === 'unsure' || p.axes.wave_context.confidence.level === 'medium'
        ? 'medium'
        : 'high'

  return { value, confidence, basis, source_axes, flags: [] }
}

// ───────────────────────── 11.4 Challenge Level

function challengeLevel(p: SurferProfile): Signal<ChallengeLevel> {
  const level = p.axes.actual_surfing_level.state
  const { fit, direction } = p.axes.board_fit_mismatch.state
  const { position, alignment } = p.axes.support_vs_performance_need.state
  const demand = p.axes.wave_context.state.perceived_demand_level
  const source_axes: AxisName[] = [
    'actual_surfing_level',
    'support_vs_performance_need',
    'board_fit_mismatch',
    'wave_context',
  ]

  const contributing = [
    p.axes.actual_surfing_level,
    p.axes.support_vs_performance_need,
    p.axes.board_fit_mismatch,
  ]
  const anyLow = contributing.some((x) => x.confidence.level === 'low')

  // Hard ceilings (applied before the mapping).
  const ceilingBalanced = level.band === 'beginner' || (fit === 'strongly_mismatched' && direction === 'too_demanding')

  let value: ChallengeLevel
  let basis: string
  if (level.band === 'beginner') {
    value = 'conservative'
    basis = 'At this stage, equipment should make surfing easier, not harder.'
  } else if (fit === 'strongly_mismatched' && direction === 'too_demanding') {
    value = 'conservative'
    basis = 'Fix the mismatch before adding any challenge.'
  } else if (position === 'needs_support' && demand === 'high') {
    value = 'conservative'
    basis = 'The conditions already exceed what this surfer is comfortable with.'
  } else if (anyLow) {
    value = 'conservative'
    basis = 'Signals are uncertain, so the recommendation stays on the safe side.'
  } else if (
    p.axes.wave_context.state.conditions === 'mixed' ||
    alignment === 'strong_gap' ||
    p.meta.flags.some((f) => f.type === 'ambiguous_level')
  ) {
    value = 'mixed'
    basis = 'The profile points in more than one direction at once.'
  } else if (
    (level.sub_level === 'upper' || level.band === 'advanced' || level.band === 'pro') &&
    direction === 'too_supportive' &&
    position === 'performance_capable'
  ) {
    value = 'progressive'
    basis = 'Ability and appetite both support a step toward more demanding equipment.'
  } else if (fit === 'limiting' && position === 'balanced') {
    value = 'balanced'
    basis = 'A meaningful but unspectacular step is the right size of change here.'
  } else if (level.band === 'intermediate' && (level.sub_level === 'lower' || level.sub_level === 'mid') && position === 'balanced') {
    value = 'balanced'
    basis = 'Steady progression without forcing it.'
  } else {
    value = 'balanced'
    basis = 'Nothing argues for either extreme.'
  }

  if (ceilingBalanced && value === 'progressive') value = 'balanced'

  const confidence: ConfidenceLevel = anyLow
    ? 'low'
    : p.axes.actual_surfing_level.confidence.level === 'high' &&
        p.axes.support_vs_performance_need.confidence.level !== 'low'
      ? 'high'
      : 'medium'

  return { value, confidence, basis, source_axes, flags: [] }
}

// ───────────────────────── 11.5 Intent Moderation

function intentModeration(p: SurferProfile): Signal<IntentModeration> {
  const gap = p.axes.user_intent.state.intent_gap
  const alignment = p.axes.support_vs_performance_need.state.alignment

  let value: IntentModeration
  if (gap === 'none' && alignment === 'aligned') value = 'preserved'
  else if (gap === 'significant' || alignment === 'strong_gap') value = 'strongly_moderated'
  else value = 'partially_moderated'

  // Conflict handling: alignment is the stronger cross-axis signal.
  if (gap === 'none' && alignment === 'strong_gap') value = 'strongly_moderated'
  if (gap === 'significant' && alignment === 'aligned') value = 'partially_moderated'

  const basis =
    value === 'preserved'
      ? 'What this surfer asked for is what the profile supports.'
      : value === 'partially_moderated'
        ? 'The stated goal holds, with some context added around it.'
        : 'The stated goal was reframed around what the profile suggests has to come first.'

  return {
    value,
    confidence: p.axes.user_intent.confidence.level === 'low' ? 'medium' : 'high',
    basis,
    source_axes: ['user_intent', 'support_vs_performance_need'],
    flags: [],
  }
}

// ───────────────────────── 11.6 Uncertainty Flags

function uncertaintyFlags(
  p: SurferProfile,
  progression: Signal<ProgressionDirection>,
  size: Signal<SizeDirection>,
  category: Signal<CategoryDirection>,
  challenge: Signal<ChallengeLevel>,
): UncertaintyFlag[] {
  const flags = new Set<UncertaintyFlag>()
  const axes = Object.values(p.axes)

  if (axes.some((x) => x.confidence.level === 'low')) flags.add('low_confidence')

  if (
    axes.some((x) => x.confidence.type === 'conflicting_signals') ||
    (p.axes.board_fit_mismatch.state.direction === 'too_demanding' &&
      p.axes.support_vs_performance_need.state.position === 'performance_capable') ||
    (p.axes.user_intent.state.intent_gap === 'significant' &&
      p.axes.support_vs_performance_need.state.alignment === 'strong_gap') ||
    (challenge.value === 'conservative' && size.value === 'lean_down')
  ) {
    flags.add('conflicting_signals')
  }

  if (
    progression.value === 'split_unclear' ||
    ((category.value === 'split' || category.value === 'unclear') &&
      (size.value === 'split' || size.value === 'unclear')) ||
    challenge.value === 'mixed' ||
    challenge.value === 'unclear'
  ) {
    flags.add('no_dominant_direction')
  }

  if (
    axes.some((x) => x.confidence.type === 'insufficient_data' || x.confidence.type === 'data_gap') ||
    p.meta.flags.some((f) => f.type === 'limited_profile') ||
    p.axes.board_fit_mismatch.state.fit === 'unknown'
  ) {
    flags.add('insufficient_data')
  }

  return [...flags]
}

// ───────────────────────── Entry point

export function decide(p: SurferProfile): DecisionSignals {
  const progression_direction = progressionDirection(p)
  const size_direction = sizeDirection(p, progression_direction.value)
  const category_direction = categoryDirection(p)
  const challenge_level = challengeLevel(p)
  const intent_moderation = intentModeration(p)
  const uncertainty_flags = uncertaintyFlags(
    p,
    progression_direction,
    size_direction,
    category_direction,
    challenge_level,
  )

  const signals: DecisionSignals = {
    progression_direction,
    size_direction,
    category_direction,
    challenge_level,
    intent_moderation,
    uncertainty_flags,
  }

  reconcileCrossSignals(signals)

  // Guarded so the rules can also be exercised outside Vite (see logic fixtures).
  if (typeof import.meta.env !== 'undefined' && import.meta.env.DEV) assertCrossSignalConsistency(p, signals)
  return signals
}

/**
 * Section 11.7 states required relationships between signals, but the
 * per-signal tables in 11.1-11.4 can still produce a pair that breaks one:
 * a board read as too supportive gives `challenge_more`, while a low-confidence
 * axis independently pulls the challenge level to `conservative`.
 *
 * 11.7 phrases each rule as a constraint on the dependent signal, so that is
 * what is adjusted here, and the adjustment is recorded in the signal's flags
 * rather than applied silently.
 */
function reconcileCrossSignals(s: DecisionSignals): void {
  const prog = s.progression_direction.value

  // 11.7.1 — support_more is never progressive.
  if (prog === 'support_more' && s.challenge_level.value === 'progressive') {
    s.challenge_level.value = 'balanced'
    s.challenge_level.flags.push('moderated_for_support_more')
  }

  // 11.7.2 — challenge_more is never conservative.
  if (prog === 'challenge_more' && s.challenge_level.value === 'conservative') {
    s.challenge_level.value = 'balanced'
    s.challenge_level.basis =
      'Held at a moderate step: the board is holding this surfer back, but the signals behind that are not strong enough to push harder.'
    s.challenge_level.flags.push('moderate_challenge_only')
  }

  // 11.7.3 — redirect requires a category move.
  if (prog === 'redirect' && (s.category_direction.value === 'keep' || s.category_direction.value === 'split')) {
    s.category_direction.value = 'lean_change'
    s.category_direction.flags.push('implied_by_redirect')
  }
}

/**
 * Section 11.7 — required relationships between the six signals.
 * Dev-only: a violation is a bug in the mapping rules above, not a user error.
 */
export function crossSignalViolations(p: SurferProfile, s: DecisionSignals): string[] {
  const v: string[] = []
  const prog = s.progression_direction.value
  const challenge = s.challenge_level.value
  const size = s.size_direction.value
  const category = s.category_direction.value

  if (prog === 'support_more' && challenge === 'progressive') v.push('11.7.1 support_more must not be progressive')
  if (prog === 'challenge_more' && challenge === 'conservative') v.push('11.7.2 challenge_more must not be conservative')
  if (prog === 'redirect' && category === 'keep') v.push('11.7.3 redirect requires a category change')
  if (size === 'keep' && category === 'keep' && prog !== 'maintain' && prog !== 'split_unclear') {
    v.push('11.7.4 keep/keep requires maintain or split_unclear')
  }
  if (challenge === 'conservative' && size === 'lean_down' && !s.uncertainty_flags.includes('conflicting_signals')) {
    v.push('11.7.5 conservative + lean_down requires conflicting_signals')
  }
  if (prog === 'split_unclear' && !s.uncertainty_flags.includes('no_dominant_direction')) {
    v.push('11.7.6 split_unclear requires no_dominant_direction')
  }
  if (p.axes.board_fit_mismatch.state.fit === 'unknown' && !s.uncertainty_flags.includes('insufficient_data')) {
    v.push('11.7.7 fit=unknown requires insufficient_data')
  }
  return v
}

function assertCrossSignalConsistency(p: SurferProfile, s: DecisionSignals): void {
  const v = crossSignalViolations(p, s)
  if (v.length) console.warn('[decision-layer] cross-signal consistency violated:', v)
}
