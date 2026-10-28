import { DirectionBoard } from './DirectionBoard'
import { SizeZone } from './SizeZone'
import type { Reading } from '../../logic/interpret'
import type { Derived } from '../../logic/calibrate'

/**
 * The recommendation, as one object rather than three stacked blocks.
 *
 * Category, drawing, measurements and reasoning were already adjacent on this
 * screen but read as separate items in a sidebar. They are one answer — "a
 * groveler, this big, for this reason" — so they are drawn as one card, with
 * the category named, the shape under it, the numbers below that, and the
 * reasoning last.
 *
 * `SizeZone` is nested unchanged. It already handles the clamp notices, the
 * unsatisfiable-limit case and split sizing, and none of that should move.
 */
export function BoardDirection({ derived, reading }: { derived: Derived; reading: Reading }) {
  const { size } = derived

  // Only draw when there is a length to draw at. Falling back to a default
  // length would invent exactly the precision this block must not imply.
  const mid = size ? (size.target_length.min + size.target_length.max) / 2 : null

  // The signals write their own reasoning as sentences. Use the stronger claim
  // rather than generating new copy: the category basis when the category was
  // a positive choice, the sizing basis when it was not.
  const why = reading.categoryCaveat
    ? derived.signals.size_direction.basis
    : derived.signals.category_direction.basis

  return (
    <section className="dirn" aria-labelledby="dirn-title">
      <p className="eyebrow">
        <span>Recommendation</span>
      </p>

      <h2 id="dirn-title" className="dirn__name">
        {reading.categoryLabel}
      </h2>
      <p className="dirn__note">{reading.categoryNote}</p>

      {mid !== null && size && (
        <figure className="dirn__fig">
          <DirectionBoard
            category={derived.category}
            lengthFt={mid}
            label={`Outline of a typical ${reading.categoryLabel.toLowerCase()}, drawn at the recommended length of ${size.target_length.min_display} to ${size.target_length.max_display}.`}
          />
          <figcaption className="dirn__cap mono">
            Typical {reading.categoryLabel.toLowerCase()} proportions at your length. Width, tail and fins are not part
            of this recommendation.
          </figcaption>
        </figure>
      )}

      <SizeZone derived={derived} />

      {why && (
        <p className="dirn__why">
          <span className="dirn__whykey mono">Why</span>
          {why}
        </p>
      )}

      {reading.categoryCaveat && <p className="dirn__caveat">{reading.categoryCaveat}</p>}
    </section>
  )
}
