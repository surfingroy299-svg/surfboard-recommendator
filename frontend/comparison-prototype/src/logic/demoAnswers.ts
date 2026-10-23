/**
 * The reference surfer from `comparison-experience-spec.md` section 3, expressed
 * as onboarding answers.
 *
 * Used by the prototype's "Skip to recommendation" control so a reviewer can
 * reach the later stages quickly. This is the surfer the fixed comparison copy
 * in `data/boards.ts` was written for, which is why Skip and the comparison
 * stay coherent with each other.
 *
 * Mapping notes — the spec describes Daniel in prose; these are the closest
 * honest answers, not answers chosen to produce a particular size:
 *   Q1  6'2" x 20 1/2" x 2 5/8", ~35 L, wide and forgiving -> hybrid
 *       (funboard is defined as 7'0"-8'0", so it does not fit)
 *   Q2  "stable, wide, forgiving", catches waves competently,
 *       "heavy and sluggish through turns"
 *   Q5  the one stated main frustration
 *   Q6  "quicker direction changes, more precise turns, lighter underfoot"
 *   Q8  can link turns and hold a line; he is reaching for smoothness,
 *       so the smoothness rung is not claimed
 *   Q9  "surfs approximately 2 to 3 times per week", "good general fitness"
 */

import type { Answers } from './answers'

export const demoAnswers = (): Answers => ({
  Q1: 'hybrid',
  Q2: ['catches_waves_easily', 'feels_stable_comfortable', 'hard_to_turn'],
  Q3: 'knows_dimensions',
  Q4: { length: '6’2″', volume: '34–37 L', volumeExact: null, modelBrand: '' },
  Q5: ['cant_perform_turns'],
  Q5FreeText: '',
  Q6: ['wants_turn_control', 'wants_freedom_to_move'],
  Q6FreeText: '',
  Q7: 'small_weak_waves',
  Q8: 'can_link_turns',
  Q9: { height: { value: 180, unit: 'cm' }, weight: { value: 80, unit: 'kg' }, fitness: 'weekly' },
})
