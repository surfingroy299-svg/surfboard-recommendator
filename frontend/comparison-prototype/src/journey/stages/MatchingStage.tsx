import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/a11y'
import { Quiver } from '../../components/surf/Quiver'
import { SURVIVOR_IDS } from '../../components/surf/quiverData'
import { useJourney } from '../journeyState'

/**
 * SIMULATED. A scripted sequence, not a database query.
 *
 * It carries one idea — many shapes exist, and what you told us removes most
 * of them — then gets out of the way. No counts, no percentages, no progress
 * figures: inventing precision here would undercut the honesty of everything
 * before it.
 *
 * Narrowing is expressed by boards leaving the rack rather than by a loader,
 * because the rack is the only thing on screen that means anything.
 *
 * ~2.4s first run, ~0.7s on a revisit, one still frame under reduced motion.
 */
export function MatchingStage() {
  const { state, dispatch, derived } = useJourney()
  const reduced = useReducedMotion()
  const [beat, setBeat] = useState(0)

  // Dev-only: ?hold freezes the sequence so the composition can be reviewed
  // as a still. Never active in a production build.
  const held = import.meta.env.DEV && new URLSearchParams(window.location.search).has('hold')

  const quick = state.seenMatching
  const timings = reduced ? [0, 0, 0, 280] : quick ? [0, 200, 420, 720] : [0, 850, 1650, 2450]

  useEffect(() => {
    if (held) return
    const timers = [
      window.setTimeout(() => setBeat(1), timings[1]),
      window.setTimeout(() => setBeat(2), timings[2]),
      window.setTimeout(() => dispatch({ type: 'matchingDone' }), timings[3]),
    ]
    return () => timers.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const conditions = derived.profile.axes.wave_context.state.conditions
  const conditionWord =
    conditions === 'weak'
      ? 'small, weak surf'
      : conditions === 'powerful'
        ? 'surf with real power'
        : conditions === 'mixed'
          ? 'conditions that keep changing'
          : 'waves with some push'
  const zone = derived.size ? `${derived.size.target_volume.min} – ${derived.size.target_volume.max} L` : null

  const captions = [
    'Every shape we know',
    `Shapes that work in ${conditionWord}`,
    zone ? `Sized ${zone}` : 'Sized for you',
  ]

  return (
    <main className="stage stage--matching" aria-busy={!held}>
      <div className="matching">
        <div className="matching__rack">
          <Quiver keep={beat >= 1 ? SURVIVOR_IDS : null} />
        </div>
        <p className="matching__caption" role="status">
          {captions[beat]}
        </p>
      </div>
    </main>
  )
}
