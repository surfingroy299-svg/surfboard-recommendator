/**
 * PROTOTYPE-SPECIFIC — this is the one piece of logic with no documented rule.
 *
 * The Size Calculation Step requires a `board_category_context` and section 14
 * forbids producing a volume range without one, because every volume output is
 * category-relative. The Board Matching Layer supplies it per evaluation pass,
 * one category per board — but this prototype shows the surfer a single zone
 * before any board is evaluated, so it has to choose one category.
 *
 * The mapping below is derived from the direction patterns documented in
 * `logic/decision-layer.md` section 11.3 (too_demanding moves toward a more
 * forgiving category; too_supportive moves toward a more performance-oriented
 * one). It is a presentation decision, not a recommendation rule: when the real
 * Board Matching Layer exists, it supersedes this.
 */

import type { DecisionSignals } from './decide'
import type { SurferProfile } from './profile'
import type { BoardCategory } from './size'

export const CATEGORY_LABEL: Record<BoardCategory, string> = {
  shortboard: 'Shortboard',
  performance_shortboard: 'Performance shortboard',
  everyday_shortboard: 'Everyday shortboard',
  groveler: 'Groveler',
  fish: 'Fish',
  hybrid: 'Hybrid',
  step_up: 'Step-up',
  mid_length: 'Mid-length',
  longboard: 'Longboard',
}

/** One plain sentence about what the category is for, used in the profile reading. */
export const CATEGORY_NOTE: Record<BoardCategory, string> = {
  shortboard: 'built to reward technique in waves with some push',
  performance_shortboard: 'built for precise surfing in waves with real power',
  everyday_shortboard: 'a shortboard with enough forgiveness for ordinary days',
  groveler: 'built to make speed when the wave has none to give',
  fish: 'wide and fast through weak sections, loose off the tail',
  hybrid: 'shortboard feel with enough foam to stay easy',
  step_up: 'built to hold a line when the wave has real power',
  mid_length: 'long enough to glide, short enough to turn',
  longboard: 'built for glide and trim rather than quick direction changes',
}

export function selectCategoryContext(profile: SurferProfile, signals: DecisionSignals): BoardCategory {
  const direction = profile.axes.board_fit_mismatch.state.direction
  const conditions = profile.axes.wave_context.state.conditions
  const category = signals.category_direction.value

  if (category === 'change_likely') {
    if (conditions === 'powerful') return 'step_up'
    if (direction === 'too_supportive') return 'shortboard'
    if (conditions === 'weak') return 'groveler'
    return 'hybrid'
  }

  if (category === 'lean_change') return 'everyday_shortboard'

  // keep / split / unclear — the documented fallback, which carries section 6.3's caveat.
  return 'shortboard'
}

/** True when the category was a fallback rather than a positive choice (rules section 6.3). */
export function isFallbackCategory(signals: DecisionSignals): boolean {
  const v = signals.category_direction.value
  return v === 'split' || v === 'unclear'
}
