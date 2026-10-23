import { useEffect, useMemo, useRef } from 'react'
import { useJourney } from '../journeyState'
import { ProfileReading } from '../profile/ProfileReading'
import { BoardDirection } from '../profile/BoardDirection'
import { ProfileFacts } from '../profile/ProfileFacts'
import { WhatYouTold } from '../profile/WhatYouTold'
import { Calibration } from '../profile/Calibration'
import { interpret } from '../../logic/interpret'
import type { QuestionId } from '../../logic/questions'

/**
 * "Here's what we understood about you" — the structure in
 * comparison-experience-spec.md section 4.
 *
 * Reading order is the argument: the claim, then the facts it rests on, then
 * the answers it read, then the way to argue with it. The recommendation sits
 * alongside the whole column and stays on screen while you read and type,
 * because calibration only works if you can SEE the numbers move — a
 * correction whose result is off-screen is a form submission.
 */
export function ProfileStage() {
  const { state, derived, dispatch } = useJourney()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // Called three times across this stage otherwise; it is pure, but one call
  // and a passed value is clearer about there being one reading.
  const reading = useMemo(() => interpret(derived), [derived])
  const canContinue = derived.size !== null
  const edit = (question: QuestionId) => dispatch({ type: 'editAnswer', question })

  return (
    <main className="stage stage--profile">
      <div className="profile">
        <header className="profile__head">
          <p className="eyebrow">
            <span>Your profile</span>
          </p>
          <h1 className="profile__title" tabIndex={-1} ref={headingRef}>
            Here is what we understood about you
          </h1>
        </header>

        <div className="profile__grid">
          <div className="profile__main">
            <ProfileReading reading={reading} />
            <ProfileFacts answers={state.answers} derived={derived} onEdit={edit} />
            <WhatYouTold answers={state.answers} onEdit={edit} />
            <Calibration derived={derived} />
          </div>

          <aside className="profile__side">
            <BoardDirection derived={derived} reading={reading} />
          </aside>
        </div>

        <footer className="profile__foot">
          <div className="profile__actions">
            <button type="button" className="btn btn--quiet" onClick={() => dispatch({ type: 'reviseProfile' })}>
              Start the questions again
            </button>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={!canContinue}
              onClick={() => dispatch({ type: 'findBoards' })}
            >
              Find my boards
            </button>
          </div>
          <p className="disclosure">
            Your profile and sizing above respond to your answers. The three boards that follow are a fixed example
            set, shown with a reference surfer&rsquo;s explanations — live inventory and real board matching are not
            connected yet.
          </p>
        </footer>
      </div>
    </main>
  )
}
