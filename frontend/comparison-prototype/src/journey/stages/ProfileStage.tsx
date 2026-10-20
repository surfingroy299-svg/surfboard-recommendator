import { useEffect, useRef } from 'react'
import { useJourney } from '../journeyState'
import { BoardDirection, ProfileReading } from '../profile/ProfileReading'
import { SizeZone } from '../profile/SizeZone'
import { Calibration } from '../profile/Calibration'

/**
 * "Here's what we understood about you" — the structure in
 * comparison-experience-spec.md section 4, with calibration in between the
 * reading and the confirmation.
 */
export function ProfileStage() {
  const { derived, dispatch } = useJourney()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const canContinue = derived.size !== null

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
            <ProfileReading derived={derived} />
            <Calibration derived={derived} />
          </div>

          <aside className="profile__side">
            <BoardDirection derived={derived} />
            <SizeZone derived={derived} />
          </aside>
        </div>

        <footer className="profile__foot">
          <div className="profile__actions">
            <button type="button" className="btn btn--quiet" onClick={() => dispatch({ type: 'reviseProfile' })}>
              Revise my answers
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
