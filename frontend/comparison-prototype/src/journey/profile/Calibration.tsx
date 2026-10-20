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
  const [response, setResponse] = useState<{ kind: 'ok' | 'no'; text: string } | null>(null)

  const suggestions = useMemo(() => buildSuggestions(derived), [derived])

  const submit = (text: string) => {
    const outcome = parseCalibration(text)
    if (!outcome.ok) {
      setResponse({ kind: 'no', text: outcome.message })
      announce(outcome.message)
      return
    }
    if (wouldInvert(state.adjustments, outcome.adjustment)) {
      const msg = 'That would put the floor above the ceiling. Remove the other limit first.'
      setResponse({ kind: 'no', text: msg })
      announce(msg)
      return
    }
    dispatch({ type: 'addAdjustment', adjustment: outcome.adjustment })
    const msg = `Updated — ${outcome.adjustment.label.toLowerCase()}.`
    setResponse({ kind: 'ok', text: msg })
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

      {response && (
        <p className={`calib__response calib__response--${response.kind}`} role="status">
          {response.text}
        </p>
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
                  setResponse(null)
                  announce(`Removed ${a.label.toLowerCase()}.`)
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
