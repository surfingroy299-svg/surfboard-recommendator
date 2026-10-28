import { BoardForm } from '../../components/surf/BoardForm'
import { WaveGlyph } from '../../components/surf/WaveGlyph'
import { Icon } from '../../components/ui/Icon'
import { SHAPES } from '../onboarding/BoardTypeGrid'
import { FITNESS_OPTIONS, type Answers } from '../../logic/answers'
import { LEVEL_SHORT, levelKey } from '../../logic/levelVocabulary'
import { labelFor, questionById, type Q1Value, type QuestionId } from '../../logic/questions'
import { surfer } from '../../data/surfer'
import type { Derived } from '../../logic/calibrate'
import type { ReactNode } from 'react'

/**
 * Who you are, in one card.
 *
 * This replaces a six-row ledger that ran one fact per 57px. Seven facts now
 * sit in three rows — an identity line, a four-column measurement grid, and
 * the board you ride — at roughly one fact per 29px, while gaining a name, a
 * place and an avatar the ledger never had.
 *
 * Two facts are DRAWN rather than written, because two of them are shapes:
 * the ride line you picked on the skill ladder, and the silhouette of your
 * board. They are the same marks the questions used, so you recognise your own
 * answer instead of reading a description of it.
 *
 * Name and location are demo data — onboarding never asks — and are marked as
 * such rather than quietly passing for real. They also carry no edit control:
 * a pencil beside "Israel" would promise an edit path no question collects.
 */

export function ProfileIdentity({
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
      : 'Not answered'

  const fitness = answers.Q9.fitness
    ? FITNESS_OPTIONS.find((f) => f.value === answers.Q9.fitness)!.short
    : 'Not given'

  const shape = answers.Q1 ? SHAPES[answers.Q1 as Q1Value] : undefined
  const dims = [answers.Q4.length, answers.Q4.volume].filter(Boolean).join(' · ')

  return (
    <section className="pid" aria-labelledby="pid-name">
      <div className="pid__id">
        <span className="pid__avatar" aria-hidden="true">
          {surfer.name.slice(0, 1)}
        </span>

        <div className="pid__who">
          {/* The demo tag is a SIBLING of the heading, not a child: inside it,
              the accessible name of this section becomes "Danieldemo". */}
          <div className="pid__nameline">
            <h2 id="pid-name" className="pid__name">
              {surfer.name}
            </h2>
            <span className="pid__demo">demo</span>
          </div>
          <p className="pid__place">
            <Icon name="location" size={16} />
            {surfer.country}
          </p>
        </div>

        <div className="pid__level">
          <span className="pid__levelkey mono">Surfing</span>
          <span className="pid__levelval">{LEVEL_SHORT[levelKey(level.band, level.sub_level)]}</span>
          {answers.Q8 && <WaveGlyph rung={answers.Q8} className="pid__glyph" />}
        </div>
      </div>

      <dl className="pid__grid">
        <Cell icon="height" label="Height" value={`${height.value} ${height.unit}`} mono question="Q9" onEdit={onEdit} />
        <Cell icon="weight" label="Weight" value={`${weight.value} ${weight.unit}`} mono question="Q9" onEdit={onEdit} />
        <Cell icon="fitness" label="In the water" value={fitness} question="Q9" onEdit={onEdit} />
        <Cell icon="conditions" label="Typical waves" value={conditions} question="Q7" onEdit={onEdit} />
      </dl>

      <div className="pid__board">
        <Cell
          icon="board"
          label="Riding now"
          value={answers.Q1 ? labelFor('Q1', answers.Q1) : 'Not answered'}
          note={dims || 'Dimensions not given'}
          question={answers.Q1 === 'no_regular_board' ? 'Q1' : 'Q4'}
          onEdit={onEdit}
          figure={shape ? <BoardForm {...shape} orient="right" fins={null} className="pid__boardfig" /> : null}
        />
      </div>
    </section>
  )
}

function Cell({
  icon,
  label,
  value,
  note,
  figure,
  question,
  onEdit,
  mono,
}: {
  icon: 'height' | 'weight' | 'fitness' | 'conditions' | 'board'
  label: string
  value: string
  note?: string | null
  figure?: ReactNode
  question: QuestionId
  onEdit: (q: QuestionId) => void
  mono?: boolean
}) {
  return (
    <div className="pid__cell">
      <dt className="pid__key mono">
        <Icon name={icon} size={16} className="pid__icon" />
        <span>{label}</span>
      </dt>
      <dd className="pid__val">
        <span className={`pid__value${mono ? ' mono' : ''}`}>{value}</span>
        {note && <span className="pid__note">{note}</span>}
      </dd>
      {figure}
      <button
        type="button"
        className="pid__edit"
        onClick={() => onEdit(question)}
        aria-label={`Change ${label.toLowerCase()}`}
      >
        <Icon name="pencil" size={14} />
      </button>
    </div>
  )
}
