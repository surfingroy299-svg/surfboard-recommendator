// Ported from design-exploration/prototypes/app/src/shared/a11y.tsx (neutral utilities).
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
      <div aria-live="polite" role="status" className="visually-hidden">
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
