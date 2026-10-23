import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { parseCalibration, wouldInvert, type Adjustment, type Derived } from '../../logic/calibrate'
import { useAnnounce } from '../../hooks/a11y'
import { useJourney } from '../journeyState'
import { Icon } from '../../components/ui/Icon'

/**
 * Calibration: the surfer disagreeing with the reading, and the system
 * adjusting.
 *
 * A closed set of six adjustments, parsed conservatively. Anything it cannot
 * parse gets an honest refusal — it never echoes the input back as though it
 * had understood.
 *
 * What makes this feel like a conversation is NOT an assistant persona. There
 * is no avatar, no typing indicator, no streaming, nothing implying it
 * comprehends more than six intents, because it does not. What was missing was
 * simpler: every turn used to REPLACE the previous one, so the surfer could
 * never see they had had an exchange at all. Turns now accumulate.
 *
 * The capability boundary is demonstrated rather than recited. The parser's
 * refusal text used to list all six intents in one 210-character sentence
 * every time; six buttons are faster to read, are self-evidently the whole
 * set, and clicking one is a working correction rather than a description of
 * one.
 */
export function Calibration({ derived }: { derived: Derived }) {
  const { state, dispatch } = useJourney()
  const announce = useAnnounce()
  const [draft, setDraft] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [showAll, setShowAll] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => buildSuggestions(derived), [derived])
  const capabilities = useMemo(() => buildCapabilities(derived), [derived])

  // Keep the newest turn in view without yanking the page on first paint.
  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [turns.length])

  /**
   * An accepted adjustment can still turn out to be unreachable once sizing
   * re-runs, so the last acceptance defers to the zone's explanation rather
   * than claiming a change that did not happen.
   */
  const shown: Turn[] = useMemo(() => {
    if (!derived.unsatisfiable) return turns
    const last = turns.length - 1
    if (last < 0 || turns[last].kind !== 'ok') return turns
    return [
      ...turns.slice(0, last),
      {
        ...turns[last],
        kind: 'no' as const,
        text: 'That limit sits outside the range these answers produce — see the note beside the size.',
      },
    ]
  }, [turns, derived.unsatisfiable])

  const say = (...next: Turn[]) => setTurns((t) => [...t, ...next])

  const submit = (text: string) => {
    const said: Turn = { who: 'you', text }
    const outcome = parseCalibration(text)

    if (!outcome.ok) {
      say(said, { who: 'us', text: outcome.message, kind: 'no', offerHelp: true })
      announce(outcome.message)
      setDraft('')
      return
    }
    if (wouldInvert(state.adjustments, outcome.adjustment)) {
      const msg = 'That would put the floor above the ceiling. Remove the other limit first.'
      say(said, { who: 'us', text: msg, kind: 'no' })
      announce(msg)
      return
    }

    dispatch({ type: 'addAdjustment', adjustment: outcome.adjustment })
    // State the consequence, not the acknowledgement: "ceiling set" says what
    // happened to the recommendation, "updated" says only that we heard.
    const msg = CONSEQUENCE[outcome.adjustment.intent](outcome.adjustment.label)
    say(said, { who: 'us', text: msg, kind: 'ok' })
    announce(msg)
    setDraft('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim()) submit(draft)
  }

  const opened = shown.length > 0

  return (
    <section className="calib" aria-labelledby="calib-title">
      <div className="calib__head">
        <Icon name="message" size={17} className="calib__icon" />
        <div>
          <h2 id="calib-title" className="calib__title">
            Not quite right?
          </h2>
          <p className="calib__lede">Tell me what I got wrong, and I&rsquo;ll take another look.</p>
        </div>
      </div>

      <div className="exchange" role="status" aria-live="polite">
        {shown.map((t, i) => (
          <div key={i} className={`turn turn--${t.who}${t.kind ? ` is-${t.kind}` : ''}`}>
            <p className="turn__text">{t.text}</p>
            {t.offerHelp && (
              <div className="turn__chips">
                {capabilities.map((c) => (
                  <button key={c} type="button" className="chip chip--quiet" onClick={() => submit(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {!opened && suggestions.length > 0 && (
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
        <button type="submit" className="iconbtn iconbtn--solid" aria-label="Send">
          <Icon name="send" />
        </button>
      </form>

      {/* What it can actually change, available before you have guessed wrong
          rather than only after. */}
      <details className="calib__can" open={showAll} onToggle={(e) => setShowAll(e.currentTarget.open)}>
        <summary className="calib__cansum">What can I change?</summary>
        <div className="calib__canchips">
          {capabilities.map((c) => (
            <button key={c} type="button" className="chip chip--quiet" onClick={() => submit(c)}>
              {c}
            </button>
          ))}
        </div>
      </details>

      {state.adjustments.length > 0 && (
        <ul className="calib__list">
          {state.adjustments.map((a: Adjustment) => (
            <li key={a.id} className="calib__item">
              <Icon name="check" size={12} className="calib__itemtick" />
              <span className="calib__itemlabel">{a.label}</span>
              <button
                type="button"
                className="calib__remove"
                aria-label={`Remove: ${a.label}`}
                onClick={() => {
                  dispatch({ type: 'removeAdjustment', id: a.id })
                  say({ who: 'us', text: `Removed ${a.label.toLowerCase()}.`, kind: 'ok' })
                  announce(`Removed ${a.label}.`)
                }}
              >
                <Icon name="close" size={12} />
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
  /** Attach the capability chips under this turn, where attention already is. */
  offerHelp?: boolean
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

/**
 * One worked example per intent, seeded from this profile. Six buttons are the
 * boundary: what is here is what it can do, and nothing else is.
 */
function buildCapabilities(d: Derived): string[] {
  const max = d.size ? Math.max(16, Math.round(d.size.target_volume.max) - 4) : 36
  const min = d.size ? Math.round(d.size.target_volume.min) + 2 : 30
  const kg = d.profile.physical.weight.value ?? 80
  return [
    `No more than ${max} L`,
    `Nothing below ${min} L`,
    'I want something more performance-oriented',
    'I want something easier',
    `I'm ${kg} kg`,
    'Size me for a fish',
  ]
}
