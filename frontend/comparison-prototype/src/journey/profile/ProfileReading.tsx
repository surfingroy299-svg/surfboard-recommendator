import { Icon } from '../../components/ui/Icon'
import type { Reading } from '../../logic/interpret'

/**
 * What we read, and where it points.
 *
 * `AboutSurfing` renders INSIDE the profile card now, under the personal
 * information, so the facts and the interpretation read as one component
 * rather than two stacked blocks with an invisible boundary between them.
 */

export function AboutSurfing({ reading }: { reading: Reading }) {
  return (
    <section className="about" aria-labelledby="about-title">
      <h2 id="about-title" className="eyebrow">
        <span>About your surfing</span>
      </h2>
      <p className="about__lede">{reading.paragraphs[0]}</p>
      {reading.paragraphs[1] && <p className="about__para">{reading.paragraphs[1]}</p>}
      {reading.uncertainty && <p className="about__caveat">{reading.uncertainty}</p>}
    </section>
  )
}

/**
 * The progression direction — computed by the Decision Layer since it was
 * written, and shown on a screen only since the last pass.
 *
 * Three elements, not five. The direction, one explanation, and how hard we
 * would push. `paragraphs[2]` used to sit in the middle restating the Q6
 * goals, which the "What you're looking for" card renders as bullets a few
 * hundred pixels below — so it was duplication, and it is gone.
 *
 * Still deliberately not a plan: no step indicator, no horizon, no second
 * board. The engine produces one direction and one challenge sentence.
 */
export function WhereTaking({ reading }: { reading: Reading }) {
  return (
    <section className="plan" aria-labelledby="plan-title">
      <h2 id="plan-title" className="eyebrow">
        <span>Where we&rsquo;re taking you</span>
      </h2>

      <p className="plan__name">
        <Icon name="directions" size={20} className="plan__icon" />
        {reading.direction.label}
      </p>
      <p className="plan__basis">{reading.direction.basis}</p>
      <p className="plan__push">{reading.challenge}</p>
    </section>
  )
}
