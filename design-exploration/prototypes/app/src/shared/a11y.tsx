// Neutral accessibility utilities shared by all directions.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

const AnnounceContext = createContext<(msg: string) => void>(() => {})

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const announce = useCallback((msg: string) => {
    window.clearTimeout(timer.current)
    setMessage('')
    timer.current = window.setTimeout(() => setMessage(msg), 30)
  }, [])
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div
        aria-live="polite"
        role="status"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {message}
      </div>
    </AnnounceContext.Provider>
  )
}

export const useAnnounce = () => useContext(AnnounceContext)

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * Static mode: prefers-reduced-motion OR a hidden tab (rAF is suspended in
 * hidden tabs, so time-based animation would freeze mid-flight; states snap
 * to their targets instead). Used for entry choreography and transitions.
 */
export function useStaticMode(): boolean {
  const reduced = useReducedMotion()
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.visibilityState === 'hidden')
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  // automated captures get settled states deterministically:
  // navigator.webdriver (driven browsers) or an explicit static=1 URL param
  const automated =
    (typeof navigator !== 'undefined' && !!navigator.webdriver) ||
    (typeof window !== 'undefined' && window.location.hash.includes('static=1'))
  return reduced || hidden || automated
}
