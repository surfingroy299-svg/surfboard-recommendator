/**
 * Plan-view board outlines generated from real dimensions.
 *
 * Ported from design-exploration/prototypes/app/src/directions/d2/outlines.ts
 * (the "Measure Room" direction), which that exploration's review rated best
 * for comparison and described as deliberately portable. Same approach here:
 * length and width come from the board data and are drawn to true relative
 * scale; the curve BETWEEN those measured points is a visual approximation and
 * is labelled as such in the legend.
 *
 * Geometry is drawn from the data rather than traced from the product photos.
 * Tracing the deck images disagrees with the stated tails — board A is a squash
 * but its photo tapers almost to a point, and board C is a round but its photo
 * shows a swallow notch — so a traced outline would contradict Tail & Fins.
 *
 * Added over the original: a squash case, so squash, swallow and round each
 * read differently instead of squash and round sharing one rounded edge.
 */

export type TailKind = 'squash' | 'swallow' | 'round' | 'pin' | 'unknown'

/** viewBox units per foot. Shared by every outline so sizes stay comparable. */
export const SCALE = 70

interface Tune {
  /** Where the widest point sits, 0 = nose, 1 = tail. */
  widePos: number
  /** How full the nose is. */
  noseFull: number
  /** Tail width as a fraction of max half-width. */
  tailW: number
}

const CATEGORY_TUNE: Record<string, Tune> = {
  groveler: { widePos: 0.5, noseFull: 0.82, tailW: 0.62 },
  fish: { widePos: 0.5, noseFull: 0.78, tailW: 0.64 },
  hybrid: { widePos: 0.52, noseFull: 0.7, tailW: 0.56 },
  shortboard: { widePos: 0.55, noseFull: 0.55, tailW: 0.5 },
  step_up: { widePos: 0.57, noseFull: 0.48, tailW: 0.44 },
  mid_length: { widePos: 0.5, noseFull: 0.9, tailW: 0.58 },
}

/** Tail shape nudges how much width survives to the very end. */
const TAIL_WIDTH_FACTOR: Record<TailKind, number> = {
  squash: 1.0,
  swallow: 1.08,
  round: 0.92,
  pin: 0.6,
  unknown: 0.95,
}

export interface OutlineSpec {
  lengthFt: number
  widthIn: number
  tail: TailKind
  /** Plan outline in viewBox units: nose at x=0, tail at x=L. */
  path: string
  /** Rendered length and width in viewBox units. */
  px: { L: number; W: number }
}

export function buildOutline(lengthFt: number, widthIn: number, tail: TailKind, category = 'shortboard'): OutlineSpec {
  const tune = CATEGORY_TUNE[category] ?? CATEGORY_TUNE.shortboard
  const L = lengthFt * SCALE
  const W = (widthIn / 12) * SCALE
  const half = W / 2
  const wideX = L * tune.widePos
  const tailHalf = half * tune.tailW * TAIL_WIDTH_FACTOR[tail]
  const noseCtrl = L * 0.16

  const path = [
    `M 0 0`,
    `C ${noseCtrl} ${-half * tune.noseFull} ${wideX * 0.55} ${-half} ${wideX} ${-half}`,
    `C ${L * 0.78} ${-half * 0.94} ${L * 0.92} ${-tailHalf * 1.15} ${L} ${-tailHalf}`,
    tailEdge(L, tailHalf, tail),
    `C ${L * 0.92} ${tailHalf * 1.15} ${L * 0.78} ${half * 0.94} ${wideX} ${half}`,
    `C ${wideX * 0.55} ${half} ${noseCtrl} ${half * tune.noseFull} 0 0`,
    'Z',
  ].join(' ')

  return { lengthFt, widthIn, tail, path, px: { L, W } }
}

function tailEdge(L: number, tailHalf: number, tail: TailKind): string {
  switch (tail) {
    case 'swallow':
      // A notch cut into the tail, leaving two points.
      return `L ${L} ${-tailHalf} L ${L - tailHalf * 0.85} 0 L ${L} ${tailHalf}`
    case 'squash':
      // Nearly flat across the end, with defined corners.
      return `C ${L + tailHalf * 0.2} ${-tailHalf * 0.95} ${L + tailHalf * 0.2} ${tailHalf * 0.95} ${L} ${tailHalf}`
    case 'pin':
      return `Q ${L + tailHalf * 0.3} 0 ${L} ${tailHalf}`
    case 'round':
    case 'unknown':
    default:
      // A continuous curve through the tail.
      return `Q ${L + tailHalf * 0.72} 0 ${L} ${tailHalf}`
  }
}

// ───────────────────────── Parsing the board data's display strings

/** `6’1″` or `6'1"` → decimal feet. */
export function parseLengthFt(display: string): number {
  const m = display.match(/(\d+)\s*[’'`]\s*(\d+(?:\.\d+)?)?/)
  if (!m) return 6
  return Number(m[1]) + Number(m[2] ?? 0) / 12
}

/** `19 1/4″` or `19.25"` → inches. */
export function parseWidthIn(display: string): number {
  const cleaned = display.replace(/[″"]/g, ' ').trim()
  const frac = cleaned.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/)
  if (frac) return Number(frac[1]) + Number(frac[2]) / Number(frac[3])
  const dec = cleaned.match(/^(\d+(?:\.\d+)?)/)
  return dec ? Number(dec[1]) : 19
}

export function parseTail(tail: string): TailKind {
  const t = tail.toLowerCase()
  if (t.includes('swallow')) return 'swallow'
  if (t.includes('squash')) return 'squash'
  if (t.includes('round')) return 'round'
  if (t.includes('pin')) return 'pin'
  return 'unknown'
}
