/**
 * A small two-or-three way switch sitting beside a field label, for choosing
 * how to answer rather than what to answer: pick a length or type one, give an
 * exact volume or a range, centimetres or inches.
 *
 * Same control as `PhysicalFields`' unit switch, lifted out so the dimensions
 * and physical screens share one affordance instead of two that look alike.
 */
export function ModeToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="units units--mode" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="units__item mono"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
