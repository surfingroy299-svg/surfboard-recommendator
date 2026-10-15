import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { chatScripts } from '../../data/chat'
import { useComparison } from '../../state/comparisonState'
import { useReducedMotion } from '../../hooks/a11y'
import type { Board } from '../../data/types'
import { Icon } from '../ui/Icon'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

let seq = 0

/**
 * Contextual assistant. MOCK: scripted answers, no network.
 * Collapsed trigger in the lower-right of Inspect; opens as a floating panel
 * that overlaps the layout instead of reflowing it.
 */
export function ChatPanel({ board }: { board: Board }) {
  const { state, dispatch } = useComparison()
  const reduced = useReducedMotion()
  const open = state.chatOpen
  const script = chatScripts[board.id]
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const setOpen = (o: boolean) => dispatch({ type: 'setChatOpen', open: o })

  // Close on click outside the panel and trigger.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, typing])

  const ask = (question: string) => {
    const match = script.suggested.find((s) => s.question === question)
    const answer = match?.answer ?? script.fallback
    setMessages((m) => [...m, { id: ++seq, role: 'user', text: question }])
    setTyping(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(
      () => {
        setTyping(false)
        setMessages((m) => [...m, { id: ++seq, role: 'assistant', text: answer }])
      },
      reduced ? 120 : 700,
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = draft.trim()
    if (!q) return
    setDraft('')
    ask(q)
  }

  const remaining = script.suggested.filter((s) => !messages.some((m) => m.role === 'user' && m.text === s.question))

  return (
    <div className="chat">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            className="chat__panel"
            role="dialog"
            aria-label={`Ask about ${board.model}`}
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <header className="chat__head">
              <div>
                <p className="chat__title">Ask about this board</p>
                <p className="chat__context mono">
                  Context: {board.model} {board.dimensions.length} · your profile
                </p>
              </div>
              <button type="button" className="iconbtn" aria-label="Minimise" onClick={() => setOpen(false)}>
                <Icon name="minimize" />
              </button>
            </header>
            <div className="chat__list" ref={listRef}>
              {messages.length === 0 && (
                <p className="chat__empty">
                  The assistant already knows your profile, your current board, your usual conditions and this board. Ask
                  something specific.
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`msg msg--${m.role}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="msg msg--assistant msg--typing" aria-label="Assistant is typing">
                  <i />
                  <i />
                  <i />
                </div>
              )}
            </div>
            {remaining.length > 0 && (
              <div className="chat__suggestions">
                {remaining.map((s) => (
                  <button key={s.question} type="button" className="chip" onClick={() => ask(s.question)}>
                    {s.question}
                  </button>
                ))}
              </div>
            )}
            <form className="chat__form" onSubmit={onSubmit}>
              <label className="visually-hidden" htmlFor="chat-input">
                Your question
              </label>
              <input
                id="chat-input"
                className="chat__input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about this board…"
                autoComplete="off"
              />
              <button type="submit" className="iconbtn iconbtn--solid" aria-label="Send">
                <Icon name="send" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={triggerRef}
        type="button"
        className={`chat__trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name="chat" />
        <span>Ask about this board</span>
      </button>
    </div>
  )
}
