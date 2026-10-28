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
 *   Q8  surfs with speed and flow and turns strongly throughout
 *
 * Q8 is the one answer chosen for the demo rather than read from the spec,
 * and it is marked here because that is a decision, not a transcription. The
 * spec's Daniel is reaching for smoothness, which is the rung below. At that
 * rung the Guild Factor table returns 38.5-49.6 L for 80 kg, and every board
 * in the fixed shortlist is 31-36 L — the demo showed a recommendation that
 * none of its own three boards satisfied. One rung up returns a range the
 * shortlist sits inside. The engine is untouched; this is the input moving,
 * not the formula. See the sizing calibration note in size-calculation-rules.
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
  Q8: 'can_link_turns_smoothly',
  Q9: { height: { value: 180, unit: 'cm' }, weight: { value: 80, unit: 'kg' }, fitness: 'weekly' },
})
