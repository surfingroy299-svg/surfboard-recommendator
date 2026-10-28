/**
 * Presentation-level demo data.
 *
 * This file exists so the demo reads as a finished product without putting
 * invented answers into the recommendation engine. Everything here is
 * DISPLAY ONLY:
 *
 *   - it is read by components, never by `translate()`, `decide()` or
 *     `calculateSize()`
 *   - it never enters `Answers`, so no axis, signal, volume or length moves
 *   - a real user's own answers always take precedence
 *
 * The rule to keep: if a value would change a number the engine computes, it
 * does not belong here — it belongs in `demoAnswers.ts`, where changing it is
 * a deliberate decision with a verification cost.
 */

/**
 * A second pain point for the demo surfer.
 *
 * Q5 permits two and the spec's reference surfer plainly has more than one
 * frustration, but `demoAnswers` carries a single value — deliberately, since
 * `boards.ts`' fixed comparison copy was written against that exact profile.
 * Adding a second Q5 answer would escalate `board_fit_mismatch` and move the
 * volume range, so the second challenge is supplied here instead: the card
 * shows two, and the engine still sees one.
 *
 * Shown only when the surfer is the demo surfer and has not added a second of
 * their own — see `WhatYouTold`.
 */
export const DEMO_SECOND_CHALLENGE = 'I lose speed through flat sections'

/** True when the answers are the untouched demo set rather than a real run. */
export function isDemoChallengeSet(values: readonly string[]): boolean {
  return values.length === 1 && values[0] === 'cant_perform_turns'
}
