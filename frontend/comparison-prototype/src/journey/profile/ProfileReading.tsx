import { interpret } from '../../logic/interpret'
import type { Derived } from '../../logic/calibrate'

/** Interpretation first: what we understood, in a shaper's voice. */
export function ProfileReading({ derived }: { derived: Derived }) {
  const reading = interpret(derived)
  return (
    <div className="reading">
      {reading.paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? 'reading__lede' : 'reading__para'}>
          {p}
        </p>
      ))}
      <p className="reading__challenge">{reading.challenge}</p>
      {reading.uncertainty && <p className="reading__caveat">{reading.uncertainty}</p>}
    </div>
  )
}

/** The board direction, shown above the measurements it makes sense of. */
export function BoardDirection({ derived }: { derived: Derived }) {
  const reading = interpret(derived)
  return (
    <div className="direction">
      <p className="eyebrow">
        <span>Board direction</span>
      </p>
      <p className="direction__name">{reading.categoryLabel}</p>
      <p className="direction__note">{reading.categoryNote}</p>
    </div>
  )
}
