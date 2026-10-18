import type { SurferProfile } from './types'

/** Fixed demo surfer from the specification. Target zone is MOCK sizing output. */
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
