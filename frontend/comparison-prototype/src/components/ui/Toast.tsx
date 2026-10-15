import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useComparison } from '../../state/comparisonState'
import { useReducedMotion } from '../../hooks/a11y'

export function Toast() {
  const { state, dispatch } = useComparison()
  const reduced = useReducedMotion()
  const toast = state.toast
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => dispatch({ type: 'clearToast' }), 2600)
    return () => window.clearTimeout(t)
  }, [toast, dispatch])
  return (
    <div className="toast-host" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
