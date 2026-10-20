import { rangeEmphasis, type Derived } from '../../logic/calibrate'

/**
 * The size zone. Numbers come second to the reading above it, so this stays a
 * single quiet line of measurement rather than a metrics panel.
 *
 * The emphasis marker carries what size-calculation-rules.md sections 7 and 8
 * put in the output note: where in the range to recommend from.
 */
export function SizeZone({ derived }: { derived: Derived }) {
  const { size, signals, profile, clamped } = derived

  if (!size) {
    return (
      <div className="zone">
        <p className="zone__pending">{derived.sizeError}</p>
      </div>
    )
  }

  const emphasis = rangeEmphasis(signals, profile.axes.support_vs_performance_need.state.position)
  const split = size.split_size.active ? size.split_size : null

  return (
    <div className="zone">
      <div className="zone__row">
        <span className="zone__key mono">Volume</span>
        <span className="zone__value mono">
          {size.target_volume.min} – {size.target_volume.max} L
        </span>
        {emphasis && <Emphasis where={emphasis} />}
      </div>
      <div className="zone__row">
        <span className="zone__key mono">Length</span>
        <span className="zone__value mono">
          {size.target_length.min_display} – {size.target_length.max_display}
        </span>
      </div>

      {(clamped.min || clamped.max) && (
        <p className="zone__clamp">
          {clamped.max && clamped.min
            ? 'Both ends of this range are limits you set.'
            : clamped.max
              ? 'The upper end of this range is a limit you set.'
              : 'The lower end of this range is a limit you set.'}
        </p>
      )}

      {split && (
        <div className="zone__split">
          <p className="zone__splitlede">Two sizes are both defensible here.</p>
          <div className="zone__row">
            <span className="zone__key mono">A</span>
            <span className="zone__value mono">
              {split.option_a!.volume_min} – {split.option_a!.volume_max} L
            </span>
            <span className="zone__note">{split.option_a!.note}</span>
          </div>
          <div className="zone__row">
            <span className="zone__key mono">B</span>
            <span className="zone__value mono">
              {split.option_b!.volume_min} – {split.option_b!.volume_max} L
            </span>
            <span className="zone__note">{split.option_b!.note}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Three ticks, with the recommended part of the range marked. */
function Emphasis({ where }: { where: 'lower' | 'middle' | 'upper' }) {
  const label =
    where === 'upper'
      ? 'Aim at the upper part of this range'
      : where === 'lower'
        ? 'Aim at the lower part of this range'
        : 'Aim at the middle of this range'
  return (
    <span className="emph" role="img" aria-label={label} title={label}>
      <span className="emph__bar" aria-hidden="true">
        <span className={`emph__band emph__band--${where}`} />
      </span>
      <span className="emph__text">{where}</span>
    </span>
  )
}
