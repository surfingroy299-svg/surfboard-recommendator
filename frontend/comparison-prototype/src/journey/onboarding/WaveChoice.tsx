import { useState } from 'react'
import type { AnswerOption, Q7Value } from '../../logic/questions'
import { commitHandlers } from './commit'

/**
 * Q7 asks which waves you surf.
 *
 * The photograph used to be the card and the words were its caption, which got
 * the hierarchy backwards: you cannot choose between four conditions by
 * looking at four pretty waves, because what separates them is POWER, and
 * power does not photograph. "Small and weak" and "small but punchy" look
 * identical in a frame.
 *
 * So the text decides and the photograph confirms. Three readings per card:
 * the category, the height in feet, and the one-line `hint` the question
 * definition has always specified. Height and power sit in separate elements
 * on purpose — the number is only ever a number.
 *
 * Every frame still carries a person, because a wave without a human in it has
 * no size. The images are documented reference placeholders and are not
 * committed — see /photography/REGISTER.md. When one is missing the tile falls
 * back to a labelled frame rather than anything imitating a photograph.
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
  small_weak_waves: 'center 50%',
  medium_waves_with_push: 'center 44%',
  powerful_steep_waves: 'center 56%',
  // A larger percentage shows a LOWER slice of the source, which lifts the
  // subject up the frame. The surfers sat in the bottom third at 66%; 84%
  // puts them in the upper middle, where you read them before the water.
  variable_conditions: 'center 84%',
}

/** The category, said in two or three words. */
const NAME: Record<Q7Value, string> = {
  small_weak_waves: 'Small and weak',
  medium_waves_with_push: 'Medium, with push',
  powerful_steep_waves: 'Powerful and steep',
  variable_conditions: 'Variable',
}

/**
 * Height, where height means something — and only height.
 *
 * Splitting the card into "how big" and "what the water does" is what keeps
 * size and power apart: this row is a number, and the row under it is the
 * behaviour. A surfer who reads only the numbers still cannot mistake small
 * for weak, because the number never claims to describe power.
 *
 * "Conditions vary" has no height, and saying one would be the exact error
 * the question warns against.
 */
const SIZE: Record<Q7Value, string | null> = {
  small_weak_waves: '1–2 ft',
  medium_waves_with_push: '2–4 ft',
  powerful_steep_waves: '5 ft +',
  variable_conditions: null,
}

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
          <label key={v} className="wtile" data-selected={selected || undefined} {...commitHandlers(v, onCommit)}>
            <input
              type="radio"
              name="Q7"
              className="choice__input"
              checked={selected}
              onChange={() => onChange(v)}
            />
            {/* Three elements, not four. The full answer sentence (`o.label`)
                is no longer shown here — the one-line `hint` says the same
                thing faster. It stays in questions.ts as the normalized
                answer label, and the profile reads it back from there. */}
            <span className="wtile__text">
              <span className="wtile__head">
                <span className="wtile__name">{NAME[v]}</span>
                {SIZE[v] && <span className="wtile__size mono">{SIZE[v]}</span>}
              </span>
              <span className="wtile__hint">{o.hint}</span>
            </span>
            <WaveFrame value={v} />
            <span className="choice__mark" aria-hidden="true" />
          </label>
        )
      })}
    </fieldset>
  )
}

function WaveFrame({ value }: { value: Q7Value }) {
  const [missing, setMissing] = useState(false)
  const file = FILE[value]
  const base = `${import.meta.env.BASE_URL}photography/`
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
