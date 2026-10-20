// Neutral scenario-state contract shared by all three directions.
// HOLDS NO VISUAL STATE. Camera, motion, layout, styling live per direction.
import { create } from 'zustand'
import { recommendation } from './mockData'

export interface SwapEvent {
  inId: string
  outId: string
  reason: string
  deltaIn: string
  deltaOut: string
  via: 'reject' | 'refine'
  chip?: string
}

interface Snapshot {
  slots: string[]
  locked: string[]
}

export interface ScenarioState {
  slots: string[] // three board ids, stable order
  focusId: string | null
  compareIds: [string, string] | null
  locked: string[]
  lastSwap: SwapEvent | null
  poolExhausted: boolean
  history: Snapshot[]
  focus: (id: string | null) => void
  startCompare: (a: string, b: string) => void
  endCompare: () => void
  toggleLock: (id: string) => void
  reject: (id: string) => void
  refine: (chip: string) => void
  undo: () => void
  reset: () => void
}

const initialSlots = [...recommendation.primary_set]

const pickReplacement = (
  preferred: string,
  slots: string[],
): string | null => {
  if (!slots.includes(preferred)) return preferred
  const alt = [...recommendation.pool, ...recommendation.primary_set].find((id) => !slots.includes(id))
  return alt ?? null
}

export const useScenario = create<ScenarioState>((set, get) => ({
  slots: initialSlots,
  focusId: null,
  compareIds: null,
  locked: [],
  lastSwap: null,
  poolExhausted: false,
  history: [],

  focus: (id) => set({ focusId: id, compareIds: null }),

  startCompare: (a, b) => set({ compareIds: [a, b], focusId: null }),

  endCompare: () => set({ compareIds: null }),

  toggleLock: (id) =>
    set((s) => ({
      locked: s.locked.includes(id) ? s.locked.filter((l) => l !== id) : [...s.locked, id],
    })),

  reject: (id) => {
    const s = get()
    if (s.locked.includes(id)) return // locked boards cannot be rejected (feedback is per-direction)
    const rule = recommendation.replacements.on_reject[id]
    const inId = pickReplacement(rule?.in ?? recommendation.pool[0], s.slots)
    if (!inId) {
      set({ poolExhausted: true })
      return
    }
    const slots = s.slots.map((b) => (b === id ? inId : b))
    set({
      history: [...s.history, { slots: s.slots, locked: s.locked }],
      slots,
      focusId: s.focusId === id ? null : s.focusId,
      compareIds: null,
      lastSwap: rule
        ? { inId, outId: id, reason: rule.reason, deltaIn: rule.delta_in, deltaOut: rule.delta_out, via: 'reject' }
        : { inId, outId: id, reason: 'Alternative from the exploration pool.', deltaIn: '', deltaOut: '', via: 'reject' },
      poolExhausted: false,
    })
  },

  refine: (chip) => {
    const s = get()
    const rule = recommendation.replacements.refine_chips[chip]
    if (!rule) return
    // Refine replaces the first unlocked, unfocused slot that isn't already the target.
    const candidate = s.slots.find((id) => !s.locked.includes(id) && id !== rule.in)
    if (!candidate || s.slots.includes(rule.in)) {
      set({ poolExhausted: true })
      return
    }
    const slots = s.slots.map((b) => (b === candidate ? rule.in : b))
    set({
      history: [...s.history, { slots: s.slots, locked: s.locked }],
      slots,
      focusId: null,
      compareIds: null,
      lastSwap: { inId: rule.in, outId: candidate, reason: rule.reason, deltaIn: '', deltaOut: '', via: 'refine', chip },
      poolExhausted: false,
    })
  },

  undo: () => {
    const s = get()
    const prev = s.history[s.history.length - 1]
    if (!prev) return
    set({
      slots: prev.slots,
      locked: prev.locked,
      history: s.history.slice(0, -1),
      lastSwap: null,
      focusId: null,
      compareIds: null,
      poolExhausted: false,
    })
  },

  reset: () =>
    set({
      slots: initialSlots,
      focusId: null,
      compareIds: null,
      locked: [],
      lastSwap: null,
      poolExhausted: false,
      history: [],
    }),
}))
