import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/a11y'
import { buildOutline } from '../../components/outline/outlineGeometry'
import { useJourney } from '../journeyState'

/**
 * SIMULATED. This is a scripted sequence, not a database query.
 *
 * It exists to communicate one idea — many possible shapes, narrowed by what we
 * understood about you — and then get out of the way. No counts, no
 * percentages, no progress figures: inventing precision here would undercut the
 * honesty of everything before it.
 *
 * Roughly 2.4s on a first run, ~0.7s on a revisit, and a single still frame
 * when reduced motion is requested.
 */

const CATEGORIES = [
  { category: 'groveler', tail: 'swallow', l: 5.5, w: 21 },
  { category: 'fish', tail: 'swallow', l: 5.4, w: 20.8 },
  { category: 'shortboard', tail: 'squash', l: 6.1, w: 18.8 },
  { category: 'shortboard', tail: 'round', l: 6.0, w: 19.2 },
  { category: 'hybrid', tail: 'squash', l: 5.9, w: 20 },
  { category: 'step_up', tail: 'pin', l: 6.6, w: 18.5 },
  { category: 'mid_length', tail: 'round', l: 7.4, w: 21.5 },
] as const

const COLS = 8
const ROWS = 5
const COUNT = COLS * ROWS

export function MatchingStage() {
  const { state, dispatch, derived } = useJourney()
  const reduced = useReducedMotion()
  const [beat, setBeat] = useState(0)

  const quick = state.seenMatching
  const timings = reduced ? [0, 0, 0, 260] : quick ? [0, 200, 400, 700] : [0, 800, 1600, 2400]

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setBeat(1), timings[1]),
      window.setTimeout(() => setBeat(2), timings[2]),
      window.setTimeout(() => dispatch({ type: 'matchingDone' }), timings[3]),
    ]
    return () => timers.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A deterministic spread of shapes — breadth, not an inventory.
  const field = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const base = CATEGORIES[i % CATEGORIES.length]
        const jitter = ((i * 37) % 11) / 100
        const spec = buildOutline(base.l * (0.94 + jitter), base.w * (0.97 + jitter / 2), base.tail, base.category)
        // Three survive to the end, spread across the field rather than adjacent.
        const survives = i === 10 || i === 21 || i === 29
        return { i, spec, survives, col: i % COLS, row: Math.floor(i / COLS) }
      }),
    [],
  )

  const conditions = derived.profile.axes.wave_context.state.conditions
  const conditionWord =
    conditions === 'weak' ? 'small, weak surf' : conditions === 'powerful' ? 'powerful surf' : conditions === 'mixed' ? 'conditions that keep changing' : 'waves with some push'
  const zone = derived.size ? `${derived.size.target_volume.min} – ${derived.size.target_volume.max} L` : null

  const captions = ['Every shape we know', `Shapes that work in ${conditionWord}`, zone ? `Sized ${zone}` : 'Sized for you']

  return (
    <main className="stage stage--matching" aria-busy="true">
      <div className="matching">
        <div className="matching__field" aria-hidden="true">
          {field.map((f) => {
            const visible = beat === 0 ? true : beat === 1 ? f.i % 3 === 1 || f.survives : f.survives
            return (
              <motion.svg
                key={f.i}
                className={`mshape${f.survives ? ' is-keeper' : ''}`}
                viewBox={`-6 ${-f.spec.px.W / 2 - 6} ${f.spec.px.L + 12} ${f.spec.px.W + 12}`}
                style={{ gridColumn: f.col + 1, gridRow: f.row + 1 }}
                initial={false}
                animate={{ opacity: visible ? (f.survives && beat === 2 ? 1 : 0.5) : 0 }}
                transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <path d={f.spec.path} />
              </motion.svg>
            )
          })}
        </div>

        <p className="matching__caption" role="status">
          {captions[beat]}
        </p>
      </div>
    </main>
  )
}
