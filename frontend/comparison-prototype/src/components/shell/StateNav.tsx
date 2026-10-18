import { STATE_LABEL, STATE_ORDER } from '../../state/comparisonState'
import type { StateId } from '../../data/types'

export function StateNav({ activeState, onNavigate }: { activeState: StateId; onNavigate: (s: StateId) => void }) {
  return (
    <nav className="statenav" aria-label="Comparison views">
      {STATE_ORDER.map((id, i) => {
        const current = id === activeState
        return (
          <button
            key={id}
            type="button"
            className="statenav__item"
            aria-current={current ? 'true' : undefined}
            onClick={() => onNavigate(id)}
          >
            <span className="statenav__index">0{i + 1}</span>
            <span className="statenav__label">{STATE_LABEL[id]}</span>
          </button>
        )
      })}
    </nav>
  )
}
