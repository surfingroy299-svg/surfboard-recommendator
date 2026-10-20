// Neutral shared layer: typed access to the canonical mock data.
// Sources: design-exploration/shared/mock-data/*.json (citations inside).
import boardsSourceJson from '../../../../shared/mock-data/boards-source.json'
import surferJson from '../../../../shared/mock-data/surfer.json'
import recommendationJson from '../../../../shared/mock-data/recommendation.json'

export interface StockDimension {
  dimension_id: string
  length: number
  length_display: string
  width: number
  width_display: string
  thickness: number
  thickness_display: string
  volume_liters: number
  volume_display: string
}

export interface BoardSource {
  model_id: string
  model_name: string
  category: string
  condition_tags: string[]
  surfer_fit_profile: {
    level_range: { min: string; max: string }
    helps_with: string[]
    requires: string[]
    fit_notes?: string
  }
  performance_traits: Record<string, number | string>
  performance_tags: string[]
  display_description?: string
  shape_profile: Record<string, string>
  stock_dimensions: StockDimension[]
}

export type DimensionResult = 'strong' | 'moderate' | 'weak' | 'unknown'

export interface Assessment {
  result: DimensionResult
  note: string
}

export interface BoardEval {
  model_name: string
  category: string
  size_pass: 'groveler' | 'hybrid' | 'shortboard'
  match_strength: 'strong' | 'moderate'
  match_average: number
  recommended_size: {
    display: string
    length_display: string
    volume_liters: number
    flag: string | null
  }
  dimension_assessments: Record<string, Assessment>
  data_gaps: string[]
  role: string | null
  why: string
  advantage: string
  tradeoff: string
}

export const surfer = surferJson as unknown as {
  persona: { name: string; blurb: string }
  raw_answers: Record<string, unknown>
  profile: {
    meta: { flags: { type: string; note: string }[] }
    physical: { height: { value: number }; weight: { value: number } }
    axes: Record<
      string,
      { state: Record<string, unknown>; confidence: { level: string; type: string; basis: string }; summary: string }
    >
  }
  signals: Record<string, { value: string; confidence: string; basis: string } | string[] | string>
  size_passes: Record<
    string,
    {
      target_volume: { min: number; max: number; note: string | null }
      target_length: { min: number; min_display: string; max: number; max_display: string; note: string | null }
    }
  >
}

const rec = recommendationJson as unknown as {
  primary_set: string[]
  pool: string[]
  boards: Record<string, BoardEval>
  replacements: {
    on_reject: Record<string, { in: string; reason: string; delta_in: string; delta_out: string }>
    refine_chips: Record<string, { in: string; reason: string }>
  }
  trait_phrases: Record<string, { plus: string; minus: string } | string>
}

export const recommendation = rec

const sources = (boardsSourceJson as unknown as { models: BoardSource[] }).models

export const boardSource = (id: string): BoardSource => {
  const evalBoard = rec.boards[id]
  const found = sources.find((m) => m.model_name === evalBoard.model_name)
  if (!found) throw new Error(`No source data for ${id}`)
  return found
}

export const boardEval = (id: string): BoardEval => rec.boards[id]

/** The stock dimension matching the recommended size (real data). */
export const recommendedStock = (id: string): StockDimension => {
  const src = boardSource(id)
  const ev = boardEval(id)
  const hit = src.stock_dimensions.find((d) => d.length_display === ev.recommended_size.length_display)
  return hit ?? src.stock_dimensions[Math.floor(src.stock_dimensions.length / 2)]
}

export const TRAIT_KEYS = ['paddling_ease', 'speed_generation', 'maneuverability', 'stability', 'forgiveness'] as const

export const traitValue = (id: string, key: string): number | null => {
  const v = boardSource(id).performance_traits[key]
  return typeof v === 'number' ? v : null
}

/** Qualitative delta phrases for a pair (REAL trait values; phrasing labeled PROTOTYPE ASSUMPTION in data). */
export const traitDeltas = (aId: string, bId: string) => {
  const out: { key: string; winner: 'a' | 'b' | 'tie'; phrase: string }[] = []
  for (const key of TRAIT_KEYS) {
    const a = traitValue(aId, key)
    const b = traitValue(bId, key)
    if (a == null || b == null) continue
    const phrases = rec.trait_phrases[key] as { plus: string; minus: string }
    if (a === b) out.push({ key, winner: 'tie', phrase: 'even' })
    else out.push({ key, winner: a > b ? 'a' : 'b', phrase: phrases.plus })
  }
  return out
}

export const UNCERTAINTY_NOTE =
  'Board dimensions were unknown during onboarding — fit was assessed from feel signals. (insufficient_data flag)'
