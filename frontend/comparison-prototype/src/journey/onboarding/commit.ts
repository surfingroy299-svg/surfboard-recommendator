import type { KeyboardEvent, PointerEvent } from 'react'

/**
 * Distinguishing a deliberate commit from moving through a radio group.
 *
 * The obvious approach — advance on `click`, not on `change` — does not work:
 * Chrome fires a click for arrow-key radio selection as well, so arrowing
 * through the options skips the question. `event.detail` cannot separate them
 * either, because Space and Arrow both report 0.
 *
 * So the two deliberate gestures are handled explicitly instead:
 *   - a pointer release on the option
 *   - Enter or Space on the focused option
 *
 * Arrow keys change the selection and are ignored, which is what keyboard
 * users expect: move freely, commit when you mean to.
 */
export function commitHandlers<T>(value: T, onCommit?: (v: T) => void) {
  if (!onCommit) return {}
  return {
    onPointerUp: (e: PointerEvent) => {
      if (e.button === 0 || e.pointerType !== 'mouse') onCommit(value)
    },
    onKeyUp: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') onCommit(value)
    },
  }
}
