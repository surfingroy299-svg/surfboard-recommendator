import { useState } from 'react'
import { useJourney } from '../journeyState'

/**
 * Entry into the experience.
 *
 * Three compositions were built so they could be compared directly rather than
 * argued about; `?intro=a|b|c` still switches between them in dev.
 *
 *   A — Opening spread. Full-bleed photograph, headline set into the quiet
 *       region the frame already has. The most arresting of the three, but it
 *       is text over a photograph, and the type has to leave the house system
 *       to stay legible.
 *   B — Hard split. Image against a hard edge, type in a column beside it.
 *       Weakest: it reads as a two-column layout, not as a composition.
 *   C — Detail at scale. SHIPS. The photograph is presented as a plate with a
 *       margin around it, set against small exact type — the scale contrast
 *       that makes an editorial page feel authored. The type stays ink on
 *       paper, so the typographic quality that already works is untouched.
 *
 * The photograph is a documented reference placeholder and is not committed;
 * see /photography/REGISTER.md. When it is missing the stage falls back to
 * type alone rather than to a grey box — the words have to carry it either
 * way, and a broken image frame is worse than no image.
 */

type Composition = 'a' | 'b' | 'c'

const HERO = `${import.meta.env.BASE_URL}photography/hero-aerial.jpg`

function useComposition(): Composition {
  const param = new URLSearchParams(window.location.search).get('intro')
  return param === 'a' || param === 'b' ? param : 'c'
}

export function IntroStage() {
  const { dispatch } = useJourney()
  const [hasPhoto, setHasPhoto] = useState(true)
  const composition = useComposition()

  const start = (
    <button type="button" className="btn btn--primary btn--lg" onClick={() => dispatch({ type: 'start' })}>
      Start
    </button>
  )

  const eyebrow = (
    <p className="eyebrow">
      <span className="eyebrow__index">—</span>
      <span>Surfboard recommendation</span>
    </p>
  )

  const photo = (
    <img
      className="introshot__img"
      src={HERO}
      alt=""
      draggable={false}
      onError={() => setHasPhoto(false)}
    />
  )

  if (!hasPhoto) {
    return (
      <main className="stage stage--intro">
        <div className="intro">
          {eyebrow}
          <h1 className="intro__title">
            Tell us how you surf.
            <br />
            We will tell you what to ride.
          </h1>
          <p className="intro__lede">
            Nine questions about your surfing, not about surfboards. You get a size, a direction, and three boards
            worth comparing.
          </p>
          {start}
        </div>
      </main>
    )
  }

  if (composition === 'b') {
    return (
      <main className="stage stage--intro intro--split" data-composition="b">
        <div className="isplit">
          <div className="isplit__media">{photo}</div>
          <div className="isplit__text">
            {eyebrow}
            <h1 className="isplit__title">
              Tell us how you surf.
              <br />
              We will tell you what to ride.
            </h1>
            <p className="isplit__lede">
              Nine questions about your surfing, not about surfboards. A size, a direction, and three boards worth
              comparing.
            </p>
            {start}
          </div>
        </div>
      </main>
    )
  }

  if (composition === 'c') {
    return (
      <main className="stage stage--intro intro--detail" data-composition="c">
        <div className="idetail">
          <figure className="idetail__media">
            {photo}
            {/* An editorial caption, which also carries the provenance
                honestly rather than hiding it in a file nobody opens. */}
            <figcaption className="idetail__caption mono">Reference image · not licensed for publication</figcaption>
          </figure>
          <div className="idetail__rail">
            <p className="idetail__kicker mono">Surfboard recommendation</p>
            <h1 className="idetail__title">
              Tell us how you surf.
              <br />
              We will tell you what to ride.
            </h1>
            <p className="idetail__lede">Nine questions about your surfing, not about surfboards.</p>
            {start}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="stage stage--intro intro--spread" data-composition="a">
      <div className="ispread">
        <div className="ispread__media">{photo}</div>
        <div className="ispread__text">
          <p className="eyebrow eyebrow--onphoto">
            <span>Surfboard recommendation</span>
          </p>
          <h1 className="ispread__title">
            Tell us how you surf.
            <br />
            We will tell you what to ride.
          </h1>
          <p className="ispread__lede">
            Nine questions about your surfing, not about surfboards. A size, a direction, and three boards worth
            comparing.
          </p>
          {start}
        </div>
      </div>
    </main>
  )
}
