import { BoardForm } from '../../components/surf/BoardForm'
import { WaveGlyph } from '../../components/surf/WaveGlyph'
import { Icon } from '../../components/ui/Icon'
import { SHAPES } from '../onboarding/BoardTypeGrid'
import { FITNESS_OPTIONS, type Answers } from '../../logic/answers'
import { LEVEL_SHORT, levelKey } from '../../logic/levelVocabulary'
import { labelFor, questionById, type Q1Value } from '../../logic/questions'
import type { Derived } from '../../logic/calibrate'
import type { QuestionId } from '../../logic/questions'

/**
 * What we have on you — the five facts the reading above is built from,
 * shown back so the interpretation has something to stand on.
 *
 * Two of the five are drawn rather than written, because two of them ARE
 * shapes: the ride line the surfer picked on the skill ladder, and the
 * silhouette of the board they ride. Showing those back in the same marks the
 * questions used closes the loop — you recognise your own answer. The other
 * three are measurements, so they are set as measurements.
 *
 * Every row is editable in place. A fact you cannot correct is a fact you have
 * to accept, and the whole posture of this screen is the opposite.
 */

export function ProfileFacts({
  answers,
  derived,
  onEdit,
}: {
  answers: Answers
  derived: Derived
  onEdit: (q: QuestionId) => void
}) {
  const level = derived.profile.axes.actual_surfing_level.state
  const { height, weight } = derived.profile.physical

  const q7 = questionById['Q7']
  const conditions =
    answers.Q7 && q7.kind === 'single'
      ? (q7.options.find((o) => o.value === answers.Q7)?.hint ?? labelFor('Q7', answers.Q7))
      : null

  const fitness = answers.Q9.fitness
    ? FITNESS_OPTIONS.find((f) => f.value === answers.Q9.fitness)!.short
    : null

  const shape = answers.Q1 ? SHAPES[answers.Q1 as Q1Value] : undefined
  const dims = [answers.Q4.length, answers.Q4.volume].filter(Boolean).join(' · ')

  return (
    <section className="ledger" aria-labelledby="ledger-title">
      <h2 id="ledger-title" className="ledger__title">
        What we have on you
      </h2>

      <dl className="ledger__list">
        <LedgerRow
          icon="ride"
          label="Surfing"
          question="Q8"
          onEdit={onEdit}
          value={LEVEL_SHORT[levelKey(level.band, level.sub_level)]}
          note={answers.Q8 ? labelFor('Q8', answers.Q8) : 'Not answered'}
          figure={answers.Q8 ? <WaveGlyph rung={answers.Q8} className="ledger__glyph" /> : null}
        />

        <LedgerRow
          icon="conditions"
          label="Usual waves"
          question="Q7"
          onEdit={onEdit}
          value={conditions ?? 'Not answered'}
          note={answers.Q7 ? labelFor('Q7', answers.Q7) : null}
        />

        <LedgerRow
          icon="board"
          label="Riding now"
          question={answers.Q1 === 'no_regular_board' ? 'Q1' : 'Q4'}
          onEdit={onEdit}
          value={answers.Q1 ? labelFor('Q1', answers.Q1) : 'Not answered'}
          note={dims || 'Dimensions not given'}
          figure={shape ? <BoardForm {...shape} orient="right" fins={null} className="ledger__board" /> : null}
        />

        <LedgerRow
          icon="height"
          label="Height"
          question="Q9"
          onEdit={onEdit}
          value={`${height.value} ${height.unit}`}
          mono
        />

        <LedgerRow
          icon="weight"
          label="Weight"
          question="Q9"
          onEdit={onEdit}
          value={`${weight.value} ${weight.unit}`}
          note="Sets the volume"
          mono
        />

        <LedgerRow
          icon="fitness"
          label="In the water"
          question="Q9"
          onEdit={onEdit}
          value={fitness ?? 'Not given'}
          note={fitness ? 'Recorded, not used for sizing' : null}
          muted={!fitness}
        />
      </dl>
    </section>
  )
}

function LedgerRow({
  icon,
  label,
  value,
  note,
  figure,
  question,
  onEdit,
  mono,
  muted,
}: {
  icon: 'ride' | 'conditions' | 'board' | 'height' | 'weight' | 'fitness'
  label: string
  value: string
  note?: string | null
  figure?: React.ReactNode
  question: QuestionId
  onEdit: (q: QuestionId) => void
  mono?: boolean
  muted?: boolean
}) {
  return (
    <div className="ledger__row" data-muted={muted || undefined}>
      <dt className="ledger__key">
        <Icon name={icon} size={15} className="ledger__icon" />
        <span>{label}</span>
      </dt>
      <dd className="ledger__val">
        <span className={`ledger__value${mono ? ' mono' : ''}`}>{value}</span>
        {note && <span className="ledger__note">{note}</span>}
      </dd>
      {figure && <div className="ledger__fig">{figure}</div>}
      <button
        type="button"
        className="ledger__edit"
        onClick={() => onEdit(question)}
        aria-label={`Change ${label.toLowerCase()}`}
      >
        <Icon name="pencil" size={13} />
      </button>
    </div>
  )
}
