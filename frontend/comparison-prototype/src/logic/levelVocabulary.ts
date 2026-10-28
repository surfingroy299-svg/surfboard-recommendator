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

/**
 * A noun phrase: "You are … — *an intermediate*."
 *
 * These track the SIX RUNG NAMES the skill question offers, not the internal
 * band names, so a surfer who answers "Expert / Pro-level" is not then told
 * they are an advanced surfer. The band and sub-level underneath are unchanged
 * and still drive every number.
 */
export const LEVEL_NAME: Record<string, string> = {
  'beginner/lower': 'a beginner',
  'beginner/mid': 'a beginner',
  'beginner/upper': 'an improving beginner',
  'intermediate/lower': 'a developing surfer',
  'intermediate/mid': 'an intermediate',
  'intermediate/upper': 'an advanced surfer',
  'advanced/lower': 'an expert surfer',
  'advanced/mid': 'an expert surfer',
  'advanced/upper': 'an expert surfer',
  'pro/lower': 'a professional-level surfer',
  'pro/mid': 'a professional-level surfer',
  'pro/upper': 'a professional-level surfer',
}

/**
 * A verb phrase: "You are *linking controlled turns and holding speed*".
 *
 * These describe what the surfer claimed, so they track the Q8 labels. When a
 * rung's label changes, the matching entry here changes with it.
 */
export const LEVEL_DOING: Record<string, string> = {
  'beginner/lower': 'standing up and riding straight toward shore',
  'beginner/mid': 'standing up and riding straight toward shore',
  'beginner/upper': 'angling along the wave face instead of riding straight',
  'intermediate/lower': 'making basic turns and starting to generate your own speed',
  'intermediate/mid': 'linking controlled turns and holding your speed',
  'intermediate/upper': 'surfing with speed, power and flow',
  'advanced/lower': 'surfing at a high-performance level',
  'advanced/mid': 'surfing at a high-performance level',
  'advanced/upper': 'surfing at a high-performance level',
  'pro/lower': 'surfing at a competitive level',
  'pro/mid': 'surfing at a competitive level',
  'pro/upper': 'surfing at a competitive level',
}

/**
 * One or two words for a facts row or a chip — the rung name the surfer picked.
 *
 * `intermediate/upper` reads "Advanced" and `advanced/lower` reads "Expert"
 * because that is how the skill question names those two rungs. The internal
 * band is still `intermediate` and `advanced` respectively; only the word
 * shown moves.
 */
export const LEVEL_SHORT: Record<string, string> = {
  'beginner/lower': 'Beginner',
  'beginner/mid': 'Beginner',
  'beginner/upper': 'Beginner+',
  'intermediate/lower': 'Developing',
  'intermediate/mid': 'Intermediate',
  'intermediate/upper': 'Advanced',
  'advanced/lower': 'Expert',
  'advanced/mid': 'Expert',
  'advanced/upper': 'Expert',
  'pro/lower': 'Professional',
  'pro/mid': 'Professional',
  'pro/upper': 'Professional',
}
