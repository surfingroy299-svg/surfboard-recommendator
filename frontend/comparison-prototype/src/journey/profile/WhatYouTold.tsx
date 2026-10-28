import type { ReactNode } from 'react'
import { Icon } from '../../components/ui/Icon'
import type { Answers } from '../../logic/answers'
import { labelFor, type QuestionId } from '../../logic/questions'
import { DEMO_SECOND_CHALLENGE, isDemoChallengeSet } from '../../data/demoPresentation'

/**
 * What is holding you back, and what you are after.
 *
 * Q5 was the one answer the profile never showed back. It is collected, it
 * feeds several axes, and the surfer had no way to see what we heard — so the
 * reading above could not be argued with on its own terms. Q6 did surface, but
 * only dissolved into a sentence about intent.
 *
 * They are drawn as opposites rather than as two lists: what is in the way,
 * and what is wanted. That contrast is the point — a board recommendation is
 * the distance between them — so one is marked as an obstacle and the other as
 * a direction, and they sit side by side so you read them against each other.
 *
 * The free-text notes are shown as quotations, with no claim that they were
 * interpreted: V1 preserves them for the agent and does not parse them.
 */

/**
 * The demo surfer carries one Q5 answer where the question permits two, which
 * left the Challenges card visibly thinner than its pair. The second is
 * supplied as PRESENTATION data — it never reaches the engine, so no number
 * moves — and only while the answers are the untouched demo set. A real
 * surfer's own answers are rendered exactly as given.
 */
function challenges(values: Answers['Q5']): string[] {
  const own = values.map((v) => labelFor('Q5', v))
  return isDemoChallengeSet(values) ? [...own, DEMO_SECOND_CHALLENGE] : own
}

export function WhatYouTold({ answers, onEdit }: { answers: Answers; onEdit: (q: QuestionId) => void }) {
  return (
    <section className="told" aria-label="What you told us">
      <Block
        kind="block"
        title="Challenges"
        lede="What you said is holding you back"
        items={challenges(answers.Q5)}
        note={answers.Q5FreeText}
        question="Q5"
        onEdit={onEdit}
      />
      <Block
        kind="aim"
        title="What you&rsquo;re looking for"
        lede="What you want more of"
        items={answers.Q6.map((v) => labelFor('Q6', v))}
        note={answers.Q6FreeText}
        question="Q6"
        onEdit={onEdit}
      />
    </section>
  )
}

function Block({
  kind,
  title,
  lede,
  items,
  note,
  question,
  onEdit,
}: {
  kind: 'block' | 'aim'
  title: ReactNode
  lede: string
  items: string[]
  note: string
  question: QuestionId
  onEdit: (q: QuestionId) => void
}) {
  return (
    <div className="told__block" data-kind={kind}>
      <div className="told__head">
        <h2 className="told__title">{title}</h2>
        <button
          type="button"
          className="told__edit"
          onClick={() => onEdit(question)}
          aria-label={`Change what you said about ${lede.toLowerCase()}`}
        >
          <Icon name="pencil" size={14} />
        </button>
      </div>
      <p className="told__lede">{lede}</p>

      {items.length > 0 ? (
        <ul className="told__items">
          {items.map((t) => (
            <li key={t} className="told__item">
              <span className="told__bullet" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      ) : (
        <p className="told__empty">Nothing recorded.</p>
      )}

      {note.trim() && (
        <figure className="told__quote">
          <blockquote>{note.trim()}</blockquote>
          <figcaption className="told__quotenote">
            Your own words. Kept with your profile; this prototype does not read them.
          </figcaption>
        </figure>
      )}
    </div>
  )
}
