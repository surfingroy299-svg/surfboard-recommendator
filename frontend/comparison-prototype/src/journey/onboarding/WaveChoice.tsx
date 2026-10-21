import { useState } from 'react'
import type { AnswerOption, Q7Value } from '../../logic/questions'

/**
 * Q7 asks which waves you surf. You recognise your own conditions on sight and
 * cannot easily describe them, so this is the one question where photography
 * does the work that words cannot.
 *
 * Every frame carries a person, because a wave without a human in it has no
 * size. That is the whole teaching mechanism here: you compare the water to
 * the people in it, not to an adjective.
 *
 * The images are documented reference placeholders and are not committed —
 * see /photography/REGISTER.md. When one is missing the tile falls back to a
 * labelled frame rather than anything imitating a photograph, the same honesty
 * the board placeholders use.
 */

const FILE: Record<Q7Value, string> = {
  small_weak_waves: 'waves-small-weak.jpg',
  medium_waves_with_push: 'waves-medium-push.jpg',
  powerful_steep_waves: 'waves-powerful.jpg',
  variable_conditions: 'waves-variable.jpg',
}

/**
 * Where the subject sits in each frame, as a CSS object-position.
 *
 * Every tile is cropped to one ratio so the four read as a set, which means
 * each source loses something. These keep the people in frame: the person is
 * the scale, and a crop that loses them turns a teaching image into wallpaper.
 */
const FOCUS: Record<Q7Value, string> = {
  small_weak_waves: 'center 38%',
  medium_waves_with_push: 'center 44%',
  powerful_steep_waves: 'center 56%',
  variable_conditions: 'center 66%',
}

/** Short, concrete reading of what the frame shows. */
const READING: Record<Q7Value, string> = {
  small_weak_waves: 'Waist high, crumbling',
  medium_waves_with_push: 'Chest high, clean shoulder',
  powerful_steep_waves: 'Overhead, lip throwing',
  variable_conditions: 'No shape to read',
}

const base = `${import.meta.env.BASE_URL}photography/`

export function WaveChoice({
  options,
  value,
  onChange,
  onCommit,
}: {
  options: AnswerOption[]
  value: Q7Value | null
  onChange: (v: Q7Value) => void
  onCommit?: (v: Q7Value) => void
}) {
  return (
    <fieldset className="waves">
      <legend className="visually-hidden">What kind of waves do you usually surf?</legend>
      {options.map((o) => {
        const v = o.value as Q7Value
        const selected = v === value
        return (
          <label key={v} className="wtile" data-selected={selected || undefined}>
            <input
              type="radio"
              name="Q7"
              className="choice__input"
              checked={selected}
              onChange={() => onChange(v)}
              onClick={() => onCommit?.(v)}
            />
            <WaveFrame value={v} />
            <span className="wtile__text">
              <span className="wtile__reading mono">{READING[v]}</span>
              <span className="wtile__label">{o.label}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

function WaveFrame({ value }: { value: Q7Value }) {
  const [missing, setMissing] = useState(false)
  const file = FILE[value]
  return (
    <span className="wtile__frame">
      {missing ? (
        <span className="wtile__placeholder" role="img" aria-label={`Image pending: ${file}`}>
          <span className="wtile__placeholder-name mono">{file}</span>
          <span className="wtile__placeholder-hint mono">public/photography</span>
        </span>
      ) : (
        <img
          className="wtile__img"
          src={`${base}${file}`}
          alt=""
          loading="lazy"
          draggable={false}
          style={{ objectPosition: FOCUS[value] }}
          onError={() => setMissing(true)}
        />
      )}
    </span>
  )
}
