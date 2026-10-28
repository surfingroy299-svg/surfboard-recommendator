import { Icon } from '../../components/ui/Icon'
import type { Reading } from '../../logic/interpret'

/**
 * What we read, and where it points.
 *
 * One reading used to run as three paragraphs plus a challenge plus an
 * invitation at a 62ch measure — 440px of prose on a screen whose job is to
 * show you yourself at a glance. The same sentences are now two labelled
 * sections, and the invitation has moved to sit with the correction box that
 * answers it.
 *
 * Nothing here is generated. Every line is a field `interpret()` already
 * produced; the split is about where each one belongs.
 */

export function AboutSurfing({ reading }: { reading: Reading }) {
  return (
    <section className="about" aria-labelledby="about-title">
      <h2 id="about-title" className="eyebrow">
        <span>About your surfing</span>
      </h2>
      <p className="about__lede">{reading.paragraphs[0]}</p>
      {reading.paragraphs.slice(1, 2).map((p, i) => (
        <p key={i} className="about__para">
          {p}
        </p>
      ))}
      {reading.uncertainty && <p className="about__caveat">{reading.uncertainty}</p>}
    </section>
  )
}

/**
 * The progression direction, which the Decision Layer has computed since it
 * was written and which has never reached a screen until now. The label is a
 * short restatement; the sentence under it is the basis `decide.ts` wrote.
 *
 * Deliberately not a plan: one direction and one sentence on how hard to
 * push. No step indicator, no horizon, no second board — none of which the
 * engine produces.
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
      {reading.paragraphs[2] && <p className="plan__para">{reading.paragraphs[2]}</p>}
      <p className="plan__push">{reading.challenge}</p>
    </section>
  )
}
