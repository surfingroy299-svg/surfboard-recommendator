import type { Characteristic, Level } from '../../data/types'

const LEVEL_WORDS: Record<Level, string> = { 1: 'low', 2: 'lower', 3: 'middle', 4: 'higher', 5: 'high' }

/** Shared qualitative scale. Position only, never a number. */
export function CharacteristicScale({ characteristic }: { characteristic: Characteristic }) {
  const { label, level, note } = characteristic
  const pct = ((level - 1) / 4) * 100
  return (
    <div className="scale" role="img" aria-label={`${label}: ${LEVEL_WORDS[level]} on the shared scale. ${note}.`}>
      <div className="scale__head">
        <span className="scale__label">{label}</span>
        <span className="scale__note">{note}</span>
      </div>
      <div className="scale__track" aria-hidden="true">
        <span className="scale__end">Low</span>
        <span className="scale__rule">
          {[0, 25, 50, 75, 100].map((p) => (
            <i key={p} className="scale__stop" style={{ left: `${p}%` }} />
          ))}
          {/* After the stops, so the fill crosses their middle and leaves the
              nubs above and below legible. Before the marker, so the marker
              still reads as the head of the fill. */}
          <i className="scale__fill" style={{ width: `${pct}%` }} />
          <i className="scale__tick" style={{ left: `${pct}%` }} />
        </span>
        <span className="scale__end">High</span>
      </div>
    </div>
  )
}
