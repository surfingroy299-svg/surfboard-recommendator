import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { boardById } from '../../data/boards'
import { useComparison } from '../../state/comparisonState'
import { useReducedMotion } from '../../hooks/a11y'
import { InspectHero } from './InspectHero'
import { SpecGrid } from './SpecGrid'
import { InsightTags } from './InsightTags'
import { FitExplanation } from './FitExplanation'
import { StoreCard } from './StoreCard'
import { ChatPanel } from '../chat/ChatPanel'
import { Icon } from '../ui/Icon'

const ease = [0.22, 0.61, 0.36, 1] as const

/**
 * Inspect: a layer over the comparison, never a route. Radix provides the
 * focus trap, aria-modal, Esc, and body scroll lock (scroll position kept).
 * Focus returns to the board that opened it. No previous/next board here.
 */
export function InspectOverlay() {
  const { state, dispatch, inspectTriggerRef } = useComparison()
  const reduced = useReducedMotion()
  const inspect = state.inspect
  const board = inspect ? boardById[inspect.boardId] : null

  return (
    <Dialog.Root
      open={!!inspect}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'closeInspect' })
      }}
    >
      <AnimatePresence>
        {inspect && board && (
          <Dialog.Portal forceMount key={board.id}>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="inspect__backdrop"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.24, ease }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onEscapeKeyDown={(e) => {
                // Esc steps back one level: chat first, then Inspect.
                if (state.chatOpen) {
                  e.preventDefault()
                  dispatch({ type: 'setChatOpen', open: false })
                }
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault()
                inspectTriggerRef.current?.focus()
              }}
            >
              <motion.div
                className="inspect"
                initial={reduced ? false : { opacity: 0, scale: 0.985, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.99, y: 6 }}
                transition={{ duration: reduced ? 0 : 0.26, ease }}
              >
                <header className="inspect__head">
                  <div className="inspect__identity">
                    <p className="eyebrow eyebrow--plain">Inspect</p>
                    <Dialog.Title className="inspect__title">{board.model}</Dialog.Title>
                    <p className="inspect__dims mono">
                      {board.dimensions.length} × {board.dimensions.width} × {board.dimensions.thickness} ·{' '}
                      {board.dimensions.volume} · {board.construction}
                    </p>
                  </div>
                  <Dialog.Close asChild>
                    <button type="button" className="iconbtn iconbtn--lg" aria-label="Close inspect">
                      <Icon name="close" size={18} />
                    </button>
                  </Dialog.Close>
                </header>
                <div className="inspect__body">
                  <div className="inspect__visual">
                    <InspectHero board={board} />
                  </div>
                  <div className="inspect__info">
                    <SpecGrid board={board} />
                    <InsightTags tags={board.inspect.tags} />
                    <FitExplanation content={board.inspect} />
                    <StoreCard board={board} />
                  </div>
                </div>
                <ChatPanel board={board} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
