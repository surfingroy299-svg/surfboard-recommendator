import type { Characteristic, Level } from '../../data/types'

const LEVEL_WORDS: Record<Level, string> = { 1: 'low', 2: 'lower', 3: 'middle', 4: 'higher', 5: 'high' }

/** The board currently acting as the comparison baseline, for one characteristic. */
export interface ScaleBaseline {
  level: Level
  /** Named in the spoken description, so the comparison is not colour-only. */
  model: string
}

/**
 * Shared qualitative scale. Position only, never a number.
 *
 * With a `baseline` it also draws the DIFFERENCE against another board: a
 * translucent band covering only the span between the two values, the
 * existing value fill and marker still on top of it, and a `+` or `−` beside
 * the label. The sign is what makes this readable without colour, and it is
 * why the band is not left to carry the meaning on its own; the spoken
 * description names the other board outright for the same reason.
 *
 * No number is shown for the difference. The scale's whole contract is that a
 * level is a position and not a measurement, and "+2" would quietly break it.
 */
export function CharacteristicScale({
  characteristic,
  baseline = null,
}: {
  characteristic: Characteristic
  baseline?: ScaleBaseline | null
}) {
  const { label, level, note } = characteristic
  const toPct = (l: Level) => ((l - 1) / 4) * 100
  const pct = toPct(level)

  // Equal values produce no band and no sign — there is no difference to show.
  const delta = baseline ? level - baseline.level : 0
  const basePct = baseline ? toPct(baseline.level) : pct
  const bandLeft = Math.min(pct, basePct)
  const bandWidth = Math.abs(pct - basePct)

  const comparison = !baseline
    ? ''
    : delta === 0
      ? ` The same as ${baseline.model}.`
      : ` ${delta > 0 ? 'Higher' : 'Lower'} than ${baseline.model}.`

  return (
    <div
      className="scale"
      role="img"
      aria-label={`${label}: ${LEVEL_WORDS[level]} on the shared scale. ${note}.${comparison}`}
    >
      <div className="scale__head">
        <span className="scale__label">{label}</span>
        {delta !== 0 && (
          <span className="scale__sign mono" data-dir={delta > 0 ? 'up' : 'down'} aria-hidden="true">
            {delta > 0 ? '+' : '−'}
          </span>
        )}
        <span className="scale__note">{note}</span>
      </div>
      <div className="scale__track" aria-hidden="true">
        <span className="scale__end">Low</span>
        <span className="scale__rule">
          {[0, 25, 50, 75, 100].map((p) => (
            <i key={p} className="scale__stop" style={{ left: `${p}%` }} />
          ))}
          {/* First, so the value fill and the marker both draw over it. */}
          {delta !== 0 && (
            <i
              className="scale__delta"
              data-dir={delta > 0 ? 'up' : 'down'}
              style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
            />
          )}
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
