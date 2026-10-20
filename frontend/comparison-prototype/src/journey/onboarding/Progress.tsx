/**
 * Progress through the questions. The denominator is the number of questions
 * actually being asked, which is 7-9 depending on the Q1 and Q3 gates.
 */
export function Progress({ step, total }: { step: number; total: number }) {
  const pct = total > 1 ? (step / (total - 1)) * 100 : 0
  return (
    <div className="progress">
      <span className="progress__count mono">
        {String(step + 1).padStart(2, '0')} <span className="progress__of">/</span> {String(total).padStart(2, '0')}
      </span>
      <span className="progress__rule" aria-hidden="true">
        <span className="progress__fill" style={{ width: `${pct}%` }} />
      </span>
    </div>
  )
}
