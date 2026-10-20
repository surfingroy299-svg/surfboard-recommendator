import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LiveRegionProvider } from './shared/a11y'
import { useScenario as useScenarioStore } from './shared/scenarioStore'
import { Launcher } from './launcher/Launcher'

// Directions are lazy-loaded: independent bundles, no shared visual code.
const ShapingBay = lazy(() => import('./directions/d1/ShapingBay'))
const MeasureRoom = lazy(() => import('./directions/d2/MeasureRoom'))
const QuiverDeck = lazy(() => import('./directions/d3/QuiverDeck'))

function useHashRoute(): string {
  const [route, setRoute] = useState(() => window.location.hash)
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

/**
 * Neutral scenario bootstrapping: each direction starts the shared scenario
 * fresh; optional `?step=` deep links jump to review states
 * (focus | compare | swap). Screenshot/deep-link infra, not visual code.
 */
function useScenarioBootstrap(route: string) {
  useEffect(() => {
    if (!route.startsWith('#/direction')) return
    const s = useScenarioStore.getState()
    s.reset()
    const step = new URLSearchParams(route.split('?')[1] ?? '').get('step')
    if (step === 'focus') s.focus('ci_g_skate')
    else if (step === 'compare') s.startCompare('ci_g_skate', 'ci_better_everyday')
    else if (step === 'swap') {
      s.toggleLock('ci_g_skate')
      s.reject('ci_two_happy')
    }
  }, [route])
}

function App() {
  const route = useHashRoute()
  useScenarioBootstrap(route)
  let page = <Launcher />
  if (route.startsWith('#/direction-01')) page = <ShapingBay />
  else if (route.startsWith('#/direction-02')) page = <MeasureRoom />
  else if (route.startsWith('#/direction-03')) page = <QuiverDeck />
  return (
    <LiveRegionProvider>
      <Suspense
        fallback={
          <div style={{ color: '#8a8d93', font: '500 14px Inter, sans-serif', padding: 40 }}>Loading direction…</div>
        }
      >
        {page}
      </Suspense>
    </LiveRegionProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
