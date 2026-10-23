import { useComparison } from '../../state/comparisonState'
import { useJourney } from '../../journey/journeyState'
import { CATEGORY_LABEL } from '../../logic/categoryContext'
import type { StateId } from '../../data/types'
import { StateNav } from './StateNav'
import { Icon } from '../ui/Icon'

const BAND_LABEL: Record<string, string> = {
  'beginner/lower': 'Beginner',
  'beginner/mid': 'Beginner',
  'beginner/upper': 'Improving beginner',
  'intermediate/lower': 'Early intermediate',
  'intermediate/mid': 'Mid-intermediate',
  'intermediate/upper': 'Upper intermediate',
  'advanced/lower': 'Advanced',
  'advanced/mid': 'Advanced',
  'advanced/upper': 'Advanced',
  'pro/lower': 'Pro',
  'pro/mid': 'Pro',
  'pro/upper': 'Pro',
}

export function TopBar({ activeState, onNavigate }: { activeState: StateId; onNavigate: (s: StateId) => void }) {
  const { state } = useComparison()
  const { derived, dispatch } = useJourney()
  const saved = state.savedBoardIds.length

  const level = derived.profile.axes.actual_surfing_level.state
  const band = BAND_LABEL[`${level.band}/${level.sub_level}`] ?? 'Intermediate'
  const zone = derived.size ? `${derived.size.target_volume.min}–${derived.size.target_volume.max} L` : null

  return (
    <header className="topbar">
      <div className="topbar__side topbar__side--left">
        <button type="button" className="topbar__back" onClick={() => dispatch({ type: 'backToProfile' })}>
          <Icon name="arrow-left" />
          <span>Your profile</span>
        </button>
        <span className="topbar__context" aria-label="Your profile in brief">
          {band} · {CATEGORY_LABEL[derived.category]}
          {zone ? ` · ${zone}` : ''}
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
