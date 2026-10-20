import { useJourney } from './journeyState'

/**
 * Portfolio-demo utility, not part of the product.
 *
 * Styled to read as a separate layer — mono, dashed rule, muted — so it never
 * competes with the primary action on any stage. Skip seeds the reference
 * surfer from comparison-experience-spec.md section 3, which is the surfer the
 * fixed comparison copy was written for.
 */
export function PrototypeControls() {
  const { state, dispatch } = useJourney()
  const atStart = state.stage === 'intro'

  return (
    <aside className="protoctl" aria-label="Prototype controls">
      <span className="protoctl__tag mono">Prototype</span>
      <div className="protoctl__actions">
        {state.stage !== 'comparison' && (
          <button type="button" className="protoctl__btn" onClick={() => dispatch({ type: 'skipToRecommendation' })}>
            Skip to recommendation
          </button>
        )}
        {!atStart && (
          <button type="button" className="protoctl__btn" onClick={() => dispatch({ type: 'restart' })}>
            Restart
          </button>
        )}
      </div>
    </aside>
  )
}
