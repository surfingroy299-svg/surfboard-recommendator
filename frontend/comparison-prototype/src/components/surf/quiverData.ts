import type { FinLayout, TailKind } from '../outline/outlineGeometry'

/**
 * The quiver shown while the recommendation narrows.
 *
 * SIMULATED — this is a plausible spread of shapes, not the board database and
 * not the result of a query. Dimensions are realistic stock sizes for each
 * category so the boards relate to each other correctly: a 9'2" log really is
 * two-thirds longer than a 5'6" fish, and that difference is the whole point of
 * drawing them at one shared scale.
 *
 * Eleven boards, chosen to differ in every readable dimension — outline,
 * nose, tail, width and fin cluster — rather than to look numerous.
 */

export interface QuiverBoard {
  id: string
  lengthFt: number
  widthIn: number
  tail: TailKind
  category: string
  fins: FinLayout
  /** Category name, used by the caption line. */
  family: string
}

const ft = (feet: number, inches: number) => feet + inches / 12

export const QUIVER: QuiverBoard[] = [
  { id: 'fish-56', lengthFt: ft(5, 6), widthIn: 21, tail: 'swallow', category: 'fish', fins: 'twin', family: 'Fish' },
  { id: 'grov-57', lengthFt: ft(5, 7), widthIn: 20.5, tail: 'squash', category: 'groveler', fins: 'thruster', family: 'Groveler' },
  { id: 'grov-59', lengthFt: ft(5, 9), widthIn: 20.75, tail: 'swallow', category: 'groveler', fins: 'quad', family: 'Groveler' },
  { id: 'hyb-510', lengthFt: ft(5, 10), widthIn: 20, tail: 'squash', category: 'hybrid', fins: 'thruster', family: 'Hybrid' },
  { id: 'hyb-511', lengthFt: ft(5, 11), widthIn: 19.75, tail: 'round', category: 'hybrid', fins: 'five', family: 'Hybrid' },
  { id: 'ev-60', lengthFt: ft(6, 0), widthIn: 19.5, tail: 'squash', category: 'everyday_shortboard', fins: 'thruster', family: 'Everyday shortboard' },
  { id: 'perf-62', lengthFt: ft(6, 2), widthIn: 18.75, tail: 'round', category: 'performance_shortboard', fins: 'thruster', family: 'Performance shortboard' },
  { id: 'step-66', lengthFt: ft(6, 6), widthIn: 18.75, tail: 'pin', category: 'step_up', fins: 'thruster', family: 'Step-up' },
  { id: 'mid-610', lengthFt: ft(6, 10), widthIn: 21, tail: 'round', category: 'mid_length', fins: 'thruster', family: 'Mid-length' },
  { id: 'mid-74', lengthFt: ft(7, 4), widthIn: 21.5, tail: 'round', category: 'mid_length', fins: 'single', family: 'Mid-length' },
  { id: 'log-92', lengthFt: ft(9, 2), widthIn: 22.75, tail: 'round', category: 'longboard', fins: 'single', family: 'Longboard' },
]

/** The three that remain. Spread across the rack so narrowing reads as selection, not truncation. */
export const SURVIVOR_IDS = ['grov-59', 'ev-60', 'hyb-511']
