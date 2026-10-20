import { useJourney } from '../journeyState'

/**
 * Entry into the experience. Deliberately not a landing page: one idea, one
 * action. Everything that explains the product is the product itself.
 */
export function IntroStage() {
  const { dispatch } = useJourney()
  return (
    <main className="stage stage--intro">
      <div className="intro">
        <p className="eyebrow">
          <span className="eyebrow__index">—</span>
          <span>Surfboard recommendation</span>
        </p>
        <h1 className="intro__title">
          Tell us how you surf.
          <br />
          We will tell you what to ride.
        </h1>
        <p className="intro__lede">
          Nine questions about your surfing, not about surfboards. You get a size, a direction, and three boards worth
          comparing.
        </p>
        <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'start' })}>
          Start
        </button>
      </div>
    </main>
  )
}
