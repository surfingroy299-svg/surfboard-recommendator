/**
 * Deterministic section scroll. Native `scrollIntoView({behavior:'smooth'})`
 * can stall in throttled or hidden tabs and gives no completion signal, so
 * this drives the scroll with animation frames and finishes with a watchdog.
 * User input (wheel, touch, keys) cancels it. Resolves when the scroll ends.
 */
export function scrollToElement(
  el: HTMLElement,
  opts: { offset?: number; instant?: boolean; duration?: number } = {},
): Promise<void> {
  const { offset = 0, instant = false } = opts
  const start = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  const target = Math.max(0, Math.min(max, el.getBoundingClientRect().top + start - offset))
  const distance = target - start

  if (instant || Math.abs(distance) < 2) {
    window.scrollTo(0, target)
    return Promise.resolve()
  }

  const duration = opts.duration ?? Math.min(700, Math.max(380, Math.abs(distance) * 0.35))
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

  return new Promise((resolve) => {
    let done = false
    let raf = 0
    let watchdog = 0
    const t0 = performance.now()

    const finish = (snap: boolean) => {
      if (done) return
      done = true
      window.cancelAnimationFrame(raf)
      window.clearTimeout(watchdog)
      cancelEvents.forEach((ev) => window.removeEventListener(ev, cancel))
      if (snap) window.scrollTo(0, target)
      resolve()
    }
    const cancel = () => finish(false)
    const cancelEvents = ['wheel', 'touchstart', 'keydown'] as const
    cancelEvents.forEach((ev) => window.addEventListener(ev, cancel, { passive: true }))

    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      window.scrollTo(0, start + distance * easeOut(t))
      if (t < 1) raf = window.requestAnimationFrame(frame)
      else finish(true)
    }
    raf = window.requestAnimationFrame(frame)
    // Frames may never arrive (hidden tab, throttled pane): land anyway.
    watchdog = window.setTimeout(() => finish(true), duration + 120)
  })
}
