import { useEffect, useMemo, useRef } from 'react'
import { useJourney } from '../journeyState'
import { WhereTaking } from '../profile/ProfileReading'
import { BoardDirection } from '../profile/BoardDirection'
import { ProfileIdentity } from '../profile/ProfileIdentity'
import { WhatYouTold } from '../profile/WhatYouTold'
import { Calibration } from '../profile/Calibration'
import { interpret } from '../../logic/interpret'
import type { QuestionId } from '../../logic/questions'

/**
 * "Here's what we understood about you" — the structure in
 * comparison-experience-spec.md section 4.
 *
 * A dashboard, not a summary. Reading order left to right, top to bottom: who
 * you are, what we read, where that points, what is in the way and what you
 * want — and in parallel on the right, the board and the way to argue with it.
 *
 * Correction lives WITH the recommendation rather than at the bottom of the
 * reading, because it only works if you can see the numbers move while you
 * type. A correction whose result is off-screen is a form submission.
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
          <h1 className="profile__title" tabIndex={-1} ref={headingRef}>
            Your Profile
          </h1>
        </header>

        <div className="profile__grid">
          <div className="profile__main">
            <ProfileIdentity answers={state.answers} derived={derived} reading={reading} onEdit={edit} />
            <WhereTaking reading={reading} />
            <WhatYouTold answers={state.answers} onEdit={edit} />
          </div>

          {/* The recommendation, then the action it leads to, then the way to
              argue with it. The CTA sits between them rather than after both:
              below calibration it falls past the fold on a 900px screen, and
              sticking it there floats it over the very input it is meant to
              sit beside. Here it is always in view and occludes nothing. */}
          <aside className="profile__side">
            <BoardDirection derived={derived} reading={reading} />
            <div className="profile__go">
              <button
                type="button"
                className="btn btn--primary btn--lg profile__gobtn"
                disabled={!canContinue}
                onClick={() => dispatch({ type: 'findBoards' })}
              >
                Find my boards
              </button>
            </div>
            <Calibration derived={derived} />
          </aside>
        </div>

        <footer className="profile__foot">
          <div className="profile__actions">
            <button type="button" className="btn btn--quiet" onClick={() => dispatch({ type: 'reviseProfile' })}>
              Start the questions again
            </button>
          </div>
          <p className="disclosure">
            Your profile and sizing above respond to your answers. The three boards that follow are a fixed example
            set, shown with a reference surfer&rsquo;s explanations — live inventory and real board matching are not
            connected yet. The name, location and avatar above are demo stand-ins — onboarding does not ask for them.
          </p>
        </footer>
      </div>
    </main>
  )
}
