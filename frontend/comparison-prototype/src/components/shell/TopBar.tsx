import { surfer } from '../../data/surfer'
import { useComparison } from '../../state/comparisonState'
import type { StateId } from '../../data/types'
import { StateNav } from './StateNav'
import { Icon } from '../ui/Icon'

export function TopBar({ activeState, onNavigate }: { activeState: StateId; onNavigate: (s: StateId) => void }) {
  const { state, dispatch } = useComparison()
  const saved = state.savedBoardIds.length
  return (
    <header className="topbar">
      <div className="topbar__side topbar__side--left">
        <button
          type="button"
          className="topbar__back"
          onClick={() => dispatch({ type: 'toast', message: 'Profile interpretation is not part of this prototype' })}
        >
          <Icon name="arrow-left" />
          <span>Your profile</span>
        </button>
        <span className="topbar__context" aria-label="Surfer context">
          {surfer.name} · {surfer.level} · {surfer.country}
        </span>
      </div>
      <StateNav activeState={activeState} onNavigate={onNavigate} />
      <div className="topbar__side topbar__side--right">
        <span className="topbar__saved" aria-live="polite">
          {saved > 0 ? `${saved} saved` : ''}
        </span>
      </div>
    </header>
  )
}
