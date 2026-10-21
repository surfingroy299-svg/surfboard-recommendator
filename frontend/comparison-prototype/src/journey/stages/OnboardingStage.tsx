import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/a11y'
import { isAnswered, maxFor, toggleCapped, type Answers } from '../../logic/answers'
import { questionById, type Question } from '../../logic/questions'
import { useAnswerPatch, useJourney } from '../journeyState'
import { ChoiceGroup } from '../onboarding/ChoiceGroup'
import { BoardTypeGrid } from '../onboarding/BoardTypeGrid'
import { SkillLadder } from '../onboarding/SkillLadder'
import { WaveChoice } from '../onboarding/WaveChoice'
import { MultiChoiceGroup } from '../onboarding/MultiChoiceGroup'
import { DimensionsFields } from '../onboarding/DimensionsFields'
import { PhysicalFields } from '../onboarding/PhysicalFields'
import { Progress } from '../onboarding/Progress'

/** One question per screen. Answers persist, so Back is lossless. */
/** Dwell before a single-select question advances itself, in ms. */
const ADVANCE_MS = 280
/** Q7 is four photographs to compare, so it is given longer to be read. */
const ADVANCE_MS_PHOTO = 900

export function OnboardingStage() {
  const { state, dispatch, visible } = useJourney()
  const patch = useAnswerPatch()
  const reduced = useReducedMotion()
  const advanceTimer = useRef<number | undefined>(undefined)
  const id = visible[Math.min(state.step, visible.length - 1)]
  const q = questionById[id]
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the new question so keyboard and screen-reader users are not
  // left at the bottom of the previous one.
  useEffect(() => {
    headingRef.current?.focus()
  }, [id])

  const answered = isAnswered(state.answers, id)
  const last = state.step >= visible.length - 1

  // Cancel any pending advance when the question changes or the stage unmounts,
  // so a fast Back never lands the surfer a question further on than they chose.
  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])
  useEffect(() => {
    window.clearTimeout(advanceTimer.current)
  }, [id])

  const commit = (delay: number) => {
    window.clearTimeout(advanceTimer.current)
    advanceTimer.current = window.setTimeout(() => dispatch({ type: 'next' }), reduced ? 0 : delay)
  }

  // The two visual questions get a wider column; the rest stay a reading width.
  const wide = id === 'Q1' || id === 'Q7'

  return (
    <main className={`stage stage--onboarding${wide ? ' is-wide' : ''}`}>
      <div className={`onboarding${wide ? ' onboarding--wide' : ''}`}>
        <header className="onboarding__head">
          <Progress step={state.step} total={visible.length} />
          <p className="eyebrow">
            <span>{q.category}</span>
          </p>
          <h1 className="onboarding__q" tabIndex={-1} ref={headingRef}>
            {q.prompt}
          </h1>
          <Hint q={q} />
        </header>

        <div className="onboarding__body">
          <QuestionBody q={q} answers={state.answers} patch={patch} commit={commit} />
        </div>

        <footer className="onboarding__foot">
          <button type="button" className="btn btn--quiet" onClick={() => dispatch({ type: 'back' })}>
            Back
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!answered}
            onClick={() => dispatch({ type: 'next' })}
          >
            {last ? 'See what we understood' : 'Continue'}
          </button>
        </footer>
      </div>
    </main>
  )
}

function Hint({ q }: { q: Question }) {
  if (q.kind === 'multi') {
    return <p className="onboarding__hint">Choose up to {q.max} — whichever ring true.</p>
  }
  if (q.id === 'Q9') return <p className="onboarding__hint">Weight sets the volume. Height fine-tunes the length.</p>
  return null
}

function QuestionBody({
  q,
  answers,
  patch,
  commit,
}: {
  q: Question
  answers: Answers
  patch: (p: Partial<Answers>) => void
  commit: (delay: number) => void
}) {
  switch (q.id) {
    case 'Q1':
      return (
        <BoardTypeGrid
          options={q.kind === 'single' ? q.options : []}
          value={answers.Q1}
          onChange={(v) => patch({ Q1: v })}
          onCommit={() => commit(ADVANCE_MS)}
        />
      )
    case 'Q3':
      return (
        <ChoiceGroup
          name="Q3"
          legend={q.prompt}
          options={q.kind === 'single' ? q.options : []}
          value={answers.Q3}
          onChange={(v) => patch({ Q3: v })}
          onCommit={() => commit(ADVANCE_MS)}
        />
      )
    case 'Q7':
      return (
        <WaveChoice
          options={q.kind === 'single' ? q.options : []}
          value={answers.Q7}
          onChange={(v) => patch({ Q7: v })}
          onCommit={() => commit(ADVANCE_MS_PHOTO)}
        />
      )
    case 'Q2':
      return (
        <MultiChoiceGroup
          name="Q2"
          legend={q.prompt}
          options={q.kind === 'multi' ? q.options : []}
          values={answers.Q2}
          max={maxFor('Q2') ?? 3}
          onToggle={(v) => patch({ Q2: toggleCapped(answers.Q2, v, maxFor('Q2') ?? 3) })}
        />
      )
    case 'Q8':
      return (
        <SkillLadder
          options={q.kind === 'multi' ? q.options : []}
          values={answers.Q8}
          max={maxFor('Q8') ?? 3}
          onToggle={(v) => patch({ Q8: toggleCapped(answers.Q8, v, maxFor('Q8') ?? 3) })}
        />
      )
    case 'Q5':
      return (
        <>
          <MultiChoiceGroup
            name="Q5"
            legend={q.prompt}
            options={q.kind === 'multi' ? q.options : []}
            values={answers.Q5}
            max={maxFor('Q5') ?? 2}
            onToggle={(v) => patch({ Q5: toggleCapped(answers.Q5, v, maxFor('Q5') ?? 2) })}
          />
          <FreeText id="Q5" value={answers.Q5FreeText} onChange={(v) => patch({ Q5FreeText: v })} />
        </>
      )
    case 'Q6':
      return (
        <>
          <MultiChoiceGroup
            name="Q6"
            legend={q.prompt}
            options={q.kind === 'multi' ? q.options : []}
            values={answers.Q6}
            max={maxFor('Q6') ?? 2}
            onToggle={(v) => patch({ Q6: toggleCapped(answers.Q6, v, maxFor('Q6') ?? 2) })}
          />
          <FreeText id="Q6" value={answers.Q6FreeText} onChange={(v) => patch({ Q6FreeText: v })} />
        </>
      )
    case 'Q4':
      return <DimensionsFields value={answers.Q4} onChange={(v) => patch({ Q4: v })} />
    case 'Q9':
      return <PhysicalFields value={answers.Q9} onChange={(v) => patch({ Q9: v })} />
  }
}

/** Optional note. Collapsed by default so it never competes with the options. */
function FreeText({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(value.trim().length > 0)
  if (!open) {
    return (
      <button type="button" className="addnote" onClick={() => setOpen(true)}>
        Add a note
      </button>
    )
  }
  return (
    <div className="field field--note">
      <label className="field__label" htmlFor={`${id}-note`}>
        In your own words <span className="field__optional">optional</span>
      </label>
      <textarea
        id={`${id}-note`}
        className="field__control field__control--area"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
