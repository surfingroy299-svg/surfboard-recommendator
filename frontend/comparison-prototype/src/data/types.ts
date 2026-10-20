/**
 * Data contracts for the comparison prototype.
 * Everything here is static mock data. Board A / B / C are placeholders:
 * swap the contents of boards.ts and assets.ts without touching components.
 */

export type BoardId = 'a' | 'b' | 'c'
export type BoardSlot = 'A' | 'B' | 'C'
export type BoardView = 'deck' | 'side' | 'bottom'
/** Asset-level views: the three canonical views plus an optional prepared tail crop. */
export type BoardAssetView = BoardView | 'tail'
export type StateId = 'overview' | 'outline' | 'shape' | 'tail-fins'

/** Qualitative level on the shared relative scale. Never rendered as a number. */
export type Level = 1 | 2 | 3 | 4 | 5

export type CharacteristicKey = 'waveCatching' | 'stability' | 'responsiveness' | 'speedGeneration'

export interface Characteristic {
  key: CharacteristicKey
  label: string
  level: Level
  /** 3–6 words, describes the board, not the surfer. */
  note: string
}

export interface Dimensions {
  length: string
  width: string
  thickness: string
  volume: string
}

/**
 * Shape annotations use normalised coordinates (0–1) across the displayed side
 * image box, in display orientation: 0 = tail end, 1 = nose end.
 * They describe where the geometry is, so they will need a one-time tune when
 * the real side images arrive.
 */
export interface RockerAnnotation {
  from: number
  to: number
  descriptor: string
  implication: string
}

export interface ThicknessAnnotation {
  x: number
  value: string
  position: string
  implication: string
}

export interface ShapeAnnotations {
  noseRocker: RockerAnnotation
  maxThickness: ThicknessAnnotation
}

export type FinLayout = 'twin' | 'thruster' | 'quad' | 'twin-plus-one' | 'five-fin'

export interface TailFins {
  tail: string
  tailExplanation: string
  finSetup: string
  finLayout: FinLayout
  finExplanation: string
}

export interface InspectContent {
  /** 2–3 tags, 2–4 words each. */
  tags: string[]
  whyItFits: string
  whatYoullNotice: string
  tradeOff: string
}

export type Availability = 'In stock' | 'Only 1 left'

export interface Store {
  name: string
  area: string
  availability: Availability
  note: string
}

export interface Board {
  id: BoardId
  slot: BoardSlot
  model: string
  brand: string
  /** Shown nowhere in the UI; documents that the model is a placeholder. */
  placeholderNote?: string
  /** One or two sentences about the board itself (Overview microcopy). */
  summary: string
  dimensions: Dimensions
  construction: string
  characteristics: Characteristic[]
  shape: ShapeAnnotations
  tailFins: TailFins
  inspect: InspectContent
  store: Store
}

export interface SurferProfile {
  name: string
  age: number
  country: string
  level: string
  heightCm: number
  weightKg: number
  sessions: string
  fitness: string
  currentBoard: {
    dimensions: string
    volume: string
    construction: string
    feel: string
  }
  frustration: string
  goal: string
  constraint: string
  waveCatching: string
  conditions: string
  progressionPreference: string
  horizon: string
  /** MOCK: the sizing step is assumed to have produced this already. */
  targetZone: { length: string; volume: string }
}

export interface ChatExchange {
  question: string
  answer: string
}

export interface ChatScript {
  suggested: ChatExchange[]
  fallback: string
}
