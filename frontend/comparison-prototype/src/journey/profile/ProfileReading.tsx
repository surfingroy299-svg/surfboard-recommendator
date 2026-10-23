import type { Reading } from '../../logic/interpret'

/** Interpretation first: what we understood, in a shaper's voice. */
export function ProfileReading({ reading }: { reading: Reading }) {
  return (
    <div className="reading">
      {reading.paragraphs.map((p, i) => (
        <p key={i} className={i === 0 ? 'reading__lede' : 'reading__para'}>
          {p}
        </p>
      ))}
      <p className="reading__challenge">{reading.challenge}</p>
      {reading.uncertainty && <p className="reading__caveat">{reading.uncertainty}</p>}
      <p className="reading__invite">{reading.invitation}</p>
    </div>
  )
}
