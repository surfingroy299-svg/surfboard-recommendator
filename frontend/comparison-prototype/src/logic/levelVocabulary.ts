/**
 * How a band / sub_level pair is said in words.
 *
 * Extracted from interpret.ts because two surfaces now need the level
 * vocabulary — the profile reading and the profile facts block — and
 * interpret.ts is the copy module, not a shared vocabulary module. Keeping
 * these here means a component that needs the words does not have to import
 * the whole reading generator.
 *
 * Keyed `band/sub_level`. All twelve combinations are covered even though the
 * Q8 ladder only reaches six of them, because calibration and future inputs
 * can place a surfer anywhere in the table.
 */

import type { Band, SubLevel } from './profile'

export const levelKey = (band: Band, sub: SubLevel) => `${band}/${sub}`

/** A noun phrase: "You are … — *an upper intermediate*." */
export const LEVEL_NAME: Record<string, string> = {
  'beginner/lower': 'a beginner',
  'beginner/mid': 'a beginner',
  'beginner/upper': 'an improving beginner',
  'intermediate/lower': 'an early intermediate',
  'intermediate/mid': 'a mid-intermediate',
  'intermediate/upper': 'an upper intermediate',
  'advanced/lower': 'an advanced surfer',
  'advanced/mid': 'an advanced surfer',
  'advanced/upper': 'an advanced surfer',
  'pro/lower': 'a professional-level surfer',
  'pro/mid': 'a professional-level surfer',
  'pro/upper': 'a professional-level surfer',
}

/**
 * A verb phrase: "You are *linking turns and holding your line*".
 *
 * These describe what the surfer claimed, so they track the Q8 labels. When a
 * rung's label changes, the matching entry here changes with it — `advanced/lower`
 * moved from take-off selection to the cutback when rung 06 was reworded.
 */
export const LEVEL_DOING: Record<string, string> = {
  'beginner/lower': 'getting to your feet and riding straight',
  'beginner/mid': 'getting to your feet and riding straight',
  'beginner/upper': 'angling along the face rather than straight to shore',
  'intermediate/lower': 'turning on the face and changing direction when you want to',
  'intermediate/mid': 'linking turns and holding your line',
  'intermediate/upper': 'linking turns smoothly and holding speed through the wave',
  'advanced/lower': 'linking turns through to a full cutback and back to the foam',
  'advanced/mid': 'surfing with intent and finishing your manoeuvres',
  'advanced/upper': 'surfing with intent and finishing your manoeuvres',
  'pro/lower': 'surfing at a competitive level',
  'pro/mid': 'surfing at a competitive level',
  'pro/upper': 'surfing at a competitive level',
}

/** A two-or-three word label for a facts row or a chip. */
export const LEVEL_SHORT: Record<string, string> = {
  'beginner/lower': 'Beginner',
  'beginner/mid': 'Beginner',
  'beginner/upper': 'Improving beginner',
  'intermediate/lower': 'Early intermediate',
  'intermediate/mid': 'Mid intermediate',
  'intermediate/upper': 'Upper intermediate',
  'advanced/lower': 'Advanced',
  'advanced/mid': 'Advanced',
  'advanced/upper': 'Advanced',
  'pro/lower': 'Professional',
  'pro/mid': 'Professional',
  'pro/upper': 'Professional',
}
