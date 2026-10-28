import type { SurferProfile } from './types'

/**
 * Fixed demo surfer from the specification.
 *
 * The profile screen reads ONLY `name` and `country` from here — the two
 * things onboarding never asks for, shown as clearly-marked demo data so the
 * dashboard has an identity.
 *
 * Everything else is SUPERSEDED by the live engine and must not be rendered:
 *
 *   targetZone  MOCK sizing. Says 30–33 L where the engine computes 38.5–49.6 L
 *               for the same surfer. Rendering it would contradict the panel
 *               beside it.
 *   sessions    Says "2–3 a week"; the live Q9 fitness answer says "1–2 times
 *               a week".
 *   level, heightCm, weightKg, conditions, currentBoard
 *               All duplicate live answers and would desync the moment someone
 *               answers differently.
 *   horizon, constraint, frustration, goal, age
 *               No engine basis. `horizon` is the tempting one — it reads like
 *               a progression plan — and is exactly the false precision the
 *               "Where we are taking you" section must not invent.
 */
export const surfer: SurferProfile = {
  name: 'Daniel',
  age: 28,
  country: 'Israel',
  level: 'Intermediate',
  heightCm: 180,
  weightKg: 80,
  sessions: '2–3 sessions a week when conditions allow',
  fitness: 'Good general fitness',
  currentBoard: {
    dimensions: '6’2″ × 20 1/2″ × 2 5/8″',
    volume: '≈ 35 L',
    construction: 'EPS',
    feel: 'Stable, wide and forgiving; bought when Daniel was less skilled',
  },
  frustration: 'Feels heavy and sluggish through turns',
  goal: 'Quicker direction changes, stronger and more precise turns, a lighter feeling underfoot',
  constraint: 'Not an unforgiving high-performance shortboard',
  waveCatching: 'Competent, not dominant in crowded peaks',
  conditions: 'Israeli surf, roughly 1–3 ft',
  progressionPreference: 'Balanced',
  horizon: 'One main board that stays relevant for 2–3 years; the 35 L board stays for very small days',
  targetZone: { length: '5’10″ – 6’1″', volume: '30 – 33 L' },
}
