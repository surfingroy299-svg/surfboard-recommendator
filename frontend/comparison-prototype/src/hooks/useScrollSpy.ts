import { useEffect, useState } from 'react'

/**
 * Returns the id of the section whose top edge is closest to (and above) a
 * reading line ~38% down the viewport. Deterministic for full-height sections.
 */
export function useScrollSpy<T extends string>(ids: readonly T[], initial: T): T {
  const [active, setActive] = useState<T>(initial)
  useEffect(() => {
    // Three rect reads per scroll event: cheap enough to run synchronously,
    // which keeps the value exact right after a programmatic scroll lands.
    const measure = () => {
      const line = window.innerHeight * 0.38
      let current: T = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = id
      }
      // Bottom of page: last section wins even if its top never crosses the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = ids[ids.length - 1]
      }
      setActive((prev) => (prev === current ? prev : current))
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [ids])
  return active
}
