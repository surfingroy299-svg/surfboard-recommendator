/**
 * The Surfer Profile artifact.
 *
 * Structure, field names and enum values follow `logic/surfer-profile-schema.md`
 * exactly. This file is types only — the rules that populate it live in
 * translate.ts.
 */

import type { QuestionId } from './questions'

export type Band = 'beginner' | 'intermediate' | 'advanced' | 'pro'
export type SubLevel = 'lower' | 'mid' | 'upper'
export type EdgeFlag = 'leans_beginner' | 'leans_advanced'

export type Conditions = 'weak' | 'balanced' | 'powerful' | 'mixed'
export type UsageMode = 'baseline' | 'override' | 'variable' | 'unclear'
export type DemandLevel = 'low' | 'moderate' | 'high'

export type Fit = 'well_matched' | 'limiting' | 'mismatched' | 'strongly_mismatched' | 'unknown'
export type FitDirection = 'too_supportive' | 'too_demanding' | 'roughly_right'
export type Cause = 'size' | 'category' | 'context' | 'mixed' | 'unclear'

export type Position = 'needs_support' | 'balanced' | 'performance_capable'
export type Alignment = 'aligned' | 'mild_gap' | 'strong_gap'
export type IntentGap = 'none' | 'minor' | 'significant'

export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type ConfidenceType =
  | 'consistent_signals'
  | 'conflicting_signals'
  | 'insufficient_data'
  | 'single_source'
  | 'indirect_inference'
  | 'data_gap'

export type MetaFlagType =
  | 'missing_dimensions'
  | 'no_regular_board'
  | 'conflicting_feel_signals'
  | 'ambiguous_level'
  | 'no_progression_signal'
  | 'limited_profile'

export type CoherenceAssessment = 'consistent' | 'mixed' | 'conflicting'

export interface Confidence {
  level: ConfidenceLevel
  type: ConfidenceType
  basis: string
}

export interface Evidence {
  source: QuestionId
  /** Canonical normalized value from onboarding-questions.md. */
  value: string
  contribution: string
}

export interface Axis<S> {
  state: S
  confidence: Confidence
  evidence: Evidence[]
  summary: string
}

export interface LevelState {
  band: Band
  sub_level: SubLevel
  edge_flags: EdgeFlag[]
}

export interface WaveContextState {
  conditions: Conditions
  usage_mode: UsageMode
  perceived_demand_level: DemandLevel
}

export interface BoardFitState {
  fit: Fit
  direction: FitDirection
  cause: Cause
  competing_causes: Cause[] | null
  conflict_explanation: string | null
}

export interface SupportPerformanceState {
  position: Position
  alignment: Alignment
}

export interface UserIntentState {
  raw_intent: string
  interpreted_intent: string
  intent_gap: IntentGap
}

export interface SurferProfile {
  meta: {
    completeness: {
      questions_answered: number
      questions_total: number
      skipped: QuestionId[]
      skip_reasons: Partial<Record<QuestionId, string>>
      optional_fields_provided: Record<string, boolean>
    }
    coherence: { assessment: CoherenceAssessment; note: string | null }
    flags: { type: MetaFlagType; note: string }[]
  }
  physical: {
    height: { value: number; unit: 'cm' | 'in' }
    weight: { value: number; unit: 'kg' | 'lbs' }
  }
  axes: {
    actual_surfing_level: Axis<LevelState>
    wave_context: Axis<WaveContextState>
    board_fit_mismatch: Axis<BoardFitState>
    support_vs_performance_need: Axis<SupportPerformanceState>
    user_intent: Axis<UserIntentState>
  }
}

/** Ordered weakest → strongest, for comparisons that need an ordinal. */
export const FIT_ORDER: Fit[] = ['well_matched', 'limiting', 'mismatched', 'strongly_mismatched']

/** Escalate `fit` by one tier (translation-layer.md section 8.3). `unknown` never escalates. */
export function escalateFit(fit: Fit): Fit {
  if (fit === 'unknown') return fit
  const i = FIT_ORDER.indexOf(fit)
  return i < 0 || i === FIT_ORDER.length - 1 ? fit : FIT_ORDER[i + 1]
}
