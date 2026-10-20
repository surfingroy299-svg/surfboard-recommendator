import { useCallback, useEffect, useState } from 'react'
import { LiveRegionProvider, useAnnounce, useReducedMotion } from './hooks/a11y'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { scrollToElement } from './hooks/scrollToElement'
import { ComparisonProvider, STATE_LABEL, STATE_ORDER, useComparison } from './state/comparisonState'
import type { StateId } from './data/types'
import { TopBar } from './components/shell/TopBar'
import { OverviewState } from './components/states/OverviewState'
import { OutlineState } from './components/states/OutlineState'
import { ShapeState } from './components/states/ShapeState'
import { TailFinsState } from './components/states/TailFinsState'
import { EndNote } from './components/states/EndNote'
import { InspectOverlay } from './components/inspect/InspectOverlay'
import { Toast } from './components/ui/Toast'
import { JourneyProvider, useJourney } from './journey/journeyState'
import { PrototypeControls } from './journey/PrototypeControls'
import { IntroStage } from './journey/stages/IntroStage'
import { OnboardingStage } from './journey/stages/OnboardingStage'
import { ProfileStage } from './journey/stages/ProfileStage'
import { MatchingStage } from './journey/stages/MatchingStage'

const TOPBAR_OFFSET = 56

function Comparison() {
  const { state } = useComparison()
  const reduced = useReducedMotion()
  const announce = useAnnounce()
  const scrolledState = useScrollSpy(STATE_ORDER, 'overview')
  // A nav click highlights its target at once; scroll-spy takes over when the scroll lands.
  const [pending, setPending] = useState<StateId | null>(null)
  const activeState = pending ?? scrolledState

  useEffect(() => {
    if (pending && pending === scrolledState) setPending(null)
  }, [pending, scrolledState])

  useEffect(() => {
    if (!pending) return
    const t = window.setTimeout(() => setPending(null), 1800)
    return () => window.clearTimeout(t)
  }, [pending])

  const goTo = useCallback(
    (id: StateId) => {
      const el = document.getElementById(id)
      if (!el) return
      setPending(id)
      window.history.replaceState(null, '', `#${id}`)
      announce(`${STATE_LABEL[id]} view`)
      const instant = reduced || document.visibilityState === 'hidden'
      void scrollToElement(el, { offset: TOPBAR_OFFSET, instant }).then(() => {
        // Re-measure before releasing the pending highlight so nav, hash and scroll agree in one render.
        window.dispatchEvent(new Event('scroll'))
        setPending(null)
      })
    },
    [reduced, announce],
  )

  // The comparison mounts fresh when the journey reaches it, so start at the
  // top unless a deep link names a section.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as StateId
    const el = STATE_ORDER.includes(hash) ? document.getElementById(hash) : null
    if (el) void scrollToElement(el, { offset: TOPBAR_OFFSET, instant: true })
    else window.scrollTo(0, 0)
    window.dispatchEvent(new Event('scroll'))
  }, [])

  useEffect(() => {
    if (pending) return
    if (window.location.hash.replace('#', '') !== scrolledState) {
      window.history.replaceState(null, '', `#${scrolledState}`)
    }
  }, [scrolledState, pending])

  useKeyboardShortcuts({ activeState, inspectOpen: !!state.inspect, goTo })

  return (
    <>
      <TopBar activeState={activeState} onNavigate={goTo} />
      <main id="comparison" className="page">
        <OverviewState />
        <OutlineState />
        <ShapeState />
        <TailFinsState />
        <EndNote />
      </main>
      <InspectOverlay />
      <Toast />
    </>
  )
}

function Stage() {
  const { state } = useJourney()
  switch (state.stage) {
    case 'intro':
      return <IntroStage />
    case 'onboarding':
      return <OnboardingStage />
    case 'profile':
      return <ProfileStage />
    case 'matching':
      return <MatchingStage />
    case 'comparison':
      return <Comparison />
  }
}

export function App() {
  return (
    <LiveRegionProvider>
      <JourneyProvider>
        <ComparisonProvider>
          <Stage />
          <PrototypeControls />
        </ComparisonProvider>
      </JourneyProvider>
    </LiveRegionProvider>
  )
}
