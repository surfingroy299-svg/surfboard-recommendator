/**
 * Journey stage machine.
 *
 * Stages live in React state, deliberately NOT in the URL: the comparison
 * stage rewrites location.hash on every scroll settle (App.tsx), so a stage
 * kept in the hash would be overwritten by scroll-spy.
 *
 * The derived profile is recomputed from answers + adjustments on every change,
 * so going back and editing an answer re-derives cleanly rather than leaving
 * stale interpretation behind.
 */

import { createContext, useCallback, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { emptyAnswers, visibleQuestionIds, type Answers } from '../logic/answers'
import { addAdjustment, derive, newAdjustmentId, type Adjustment, type Derived } from '../logic/calibrate'
import { demoAnswers } from '../logic/demoAnswers'
import type { QuestionId } from '../logic/questions'

export type Stage = 'intro' | 'onboarding' | 'profile' | 'matching' | 'comparison'

export interface JourneyState {
  stage: Stage
  answers: Answers
  /** Index into the currently visible question list. */
  step: number
  adjustments: Adjustment[]
  /** Lets a revisit of the matching sequence run short rather than in full. */
  seenMatching: boolean
}

export type JourneyAction =
  | { type: 'start' }
  | { type: 'setAnswers'; answers: Answers }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goToStep'; step: number }
  | { type: 'skipToRecommendation' }
  | { type: 'restart' }
  | { type: 'reviseProfile' }
  | { type: 'addAdjustment'; adjustment: Omit<Adjustment, 'id'> }
  | { type: 'removeAdjustment'; id: string }
  | { type: 'findBoards' }
  | { type: 'matchingDone' }
  | { type: 'backToProfile' }

const initial: JourneyState = {
  stage: 'intro',
  answers: emptyAnswers(),
  step: 0,
  adjustments: [],
  seenMatching: false,
}

function reducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'start':
      return { ...state, stage: 'onboarding', step: 0 }

    case 'setAnswers': {
      // Routing can change with the answer (Q1 and Q3 gate later questions), so
      // the step is clamped to whatever is still visible.
      const visible = visibleQuestionIds(action.answers)
      return { ...state, answers: action.answers, step: Math.min(state.step, visible.length - 1) }
    }

    case 'next': {
      const visible = visibleQuestionIds(state.answers)
      if (state.step >= visible.length - 1) return { ...state, stage: 'profile' }
      return { ...state, step: state.step + 1 }
    }

    case 'back': {
      if (state.step === 0) return { ...state, stage: 'intro' }
      return { ...state, step: state.step - 1 }
    }

    case 'goToStep':
      return { ...state, step: Math.max(0, action.step) }

    case 'skipToRecommendation':
      return { ...state, stage: 'profile', answers: demoAnswers(), adjustments: [], step: 0 }

    case 'restart':
      return { ...initial, answers: emptyAnswers() }

    case 'reviseProfile':
      return { ...state, stage: 'onboarding', step: 0 }

    case 'addAdjustment':
      return {
        ...state,
        adjustments: addAdjustment(state.adjustments, { ...action.adjustment, id: newAdjustmentId() }),
      }

    case 'removeAdjustment':
      return { ...state, adjustments: state.adjustments.filter((a) => a.id !== action.id) }

    case 'findBoards':
      return { ...state, stage: 'matching' }

    case 'matchingDone':
      return { ...state, stage: 'comparison', seenMatching: true }

    case 'backToProfile':
      return { ...state, stage: 'profile' }

    default:
      return state
  }
}

interface ContextValue {
  state: JourneyState
  dispatch: Dispatch<JourneyAction>
  /** Profile, signals, category and sizing for the current answers + adjustments. */
  derived: Derived
  visible: QuestionId[]
}

const JourneyContext = createContext<ContextValue | null>(null)

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const derived = useMemo(() => derive(state.answers, state.adjustments), [state.answers, state.adjustments])
  const visible = useMemo(() => visibleQuestionIds(state.answers), [state.answers])
  const value = useMemo(() => ({ state, dispatch, derived, visible }), [state, derived, visible])
  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney(): ContextValue {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourney must be used inside JourneyProvider')
  return ctx
}

/** Convenience for the onboarding screens: patch one field of the answer set. */
export function useAnswerPatch() {
  const { state, dispatch } = useJourney()
  return useCallback(
    (patch: Partial<Answers>) => dispatch({ type: 'setAnswers', answers: { ...state.answers, ...patch } }),
    [state.answers, dispatch],
  )
}
