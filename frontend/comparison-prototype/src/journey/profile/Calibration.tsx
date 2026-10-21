import { useMemo, useState, type FormEvent } from 'react'
import { parseCalibration, wouldInvert, type Adjustment, type Derived } from '../../logic/calibrate'
import { useAnnounce } from '../../hooks/a11y'
import { useJourney } from '../journeyState'
import { Icon } from '../../components/ui/Icon'

/**
 * Calibration: the surfer disagreeing with the reading, and the system
 * adjusting.
 *
 * A closed set of six adjustments, parsed conservatively. Anything it cannot
 * parse gets an honest refusal naming what it can change — it never echoes the
 * input back as though it had understood.
 */
export function Calibration({ derived }: { derived: Derived }) {
  const { state, dispatch } = useJourney()
  const announce = useAnnounce()
  const [draft, setDraft] = useState('')
  const [exchange, setExchange] = useState<Turn[] | null>(null)

  const suggestions = useMemo(() => buildSuggestions(derived), [derived])

  // An accepted adjustment can still turn out to be unreachable once the sizing
  // re-runs, so the reply defers to the zone's explanation rather than
  // claiming a change that did not happen.
  const shown: Turn[] | null =
    derived.unsatisfiable && exchange && exchange[1]?.kind === 'ok'
      ? [
          exchange[0],
          {
            who: 'us',
            kind: 'no',
            text: 'That limit sits outside the range these answers produce — see the note beside the size.',
          },
        ]
      : exchange

  const submit = (text: string) => {
    const said: Turn = { who: 'you', text }
    const outcome = parseCalibration(text)

    if (!outcome.ok) {
      setExchange([said, { who: 'us', text: outcome.message, kind: 'no' }])
      announce(outcome.message)
      return
    }
    if (wouldInvert(state.adjustments, outcome.adjustment)) {
      const msg = 'That would put the floor above the ceiling. Remove the other limit first.'
      setExchange([said, { who: 'us', text: msg, kind: 'no' }])
      announce(msg)
      return
    }

    dispatch({ type: 'addAdjustment', adjustment: outcome.adjustment })
    // State the consequence, not the acknowledgement: "ceiling set" says what
    // happened to the recommendation, "updated" says only that we heard.
    const msg = `${CONSEQUENCE[outcome.adjustment.intent](outcome.adjustment.label)}`
    setExchange([said, { who: 'us', text: msg, kind: 'ok' }])
    announce(msg)
    setDraft('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim()) submit(draft)
  }

  return (
    <section className="calib" aria-labelledby="calib-title">
      <h2 id="calib-title" className="calib__title">
        Not quite right?
      </h2>
      <p className="calib__lede">Tell us what is off and we will re-read it.</p>

      {suggestions.length > 0 && (
        <div className="calib__chips">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => submit(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="calib__form" onSubmit={onSubmit}>
        <label className="visually-hidden" htmlFor="calib-input">
          What should we change?
        </label>
        <input
          id="calib-input"
          className="calib__input"
          value={draft}
          autoComplete="off"
          placeholder="e.g. 40 L is too much for me"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="iconbtn iconbtn--solid" aria-label="Apply">
          <Icon name="send" />
        </button>
      </form>

      {shown && (
        <div className="exchange" role="status">
          {shown.map((t, i) => (
            <p key={i} className={`exchange__turn exchange__turn--${t.who}${t.kind ? ` is-${t.kind}` : ''}`}>
              {t.text}
            </p>
          ))}
        </div>
      )}

      {state.adjustments.length > 0 && (
        <ul className="calib__list">
          {state.adjustments.map((a: Adjustment) => (
            <li key={a.id} className="calib__item">
              <span className="calib__itemlabel">{a.label}</span>
              <button
                type="button"
                className="calib__remove"
                aria-label={`Remove: ${a.label}`}
                onClick={() => {
                  dispatch({ type: 'removeAdjustment', id: a.id })
                  setExchange(null)
                  announce(`Removed ${a.label}.`)
                }}
              >
                <Icon name="close" size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface Turn {
  who: 'you' | 'us'
  text: string
  kind?: 'ok' | 'no'
}

/**
 * What changed, phrased as a consequence for the recommendation. The six
 * intents are unchanged — this only alters how the change is reported.
 */
const CONSEQUENCE: Record<string, (label: string) => string> = {
  volume_cap: (l) => `${l}. The top of your range comes down.`,
  volume_floor: (l) => `${l}. The bottom of your range comes up.`,
  more_performance: () => 'Noted — we will aim at the lower part of your range.',
  more_support: () => 'Noted — we will aim at the upper part of your range.',
  physical_correction: (l) => `${l}. Re-sized from that.`,
  category_preference: (l) => `${l}. The range is recalculated for that board type.`,
}

/** Chips drawn from this profile, so they are always actionable. */
function buildSuggestions(d: Derived): string[] {
  const out: string[] = []
  const position = d.profile.axes.support_vs_performance_need.state.position
  if (d.size) {
    const cap = Math.max(16, Math.round(d.size.target_volume.max) - 4)
    out.push(`No more than ${cap} L`)
  }
  if (position !== 'performance_capable') out.push('I want something more performance-oriented')
  if (position !== 'needs_support') out.push('I want something easier')
  if (d.category !== 'fish') out.push('Keep me closer to a fish')
  return out.slice(0, 3)
}
