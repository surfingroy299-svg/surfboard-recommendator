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
 * but its photo tapers almost to a point, board C is a round but its photo
 * shows a swallow notch, and board B is a stated swallow/quad whose October
 * 2026 photo shows a round tail with five boxes — so a traced outline would
 * contradict Tail & Fins.
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
  // A soft-top carries its width further in every direction than a mid-length:
  // the nose stays full almost to the tip and the tail is broad and round.
  // Its own key rather than a retune of mid_length, which funboard shares.
  softboard: { widePos: 0.5, noseFull: 0.97, tailW: 0.76 },
  fish: { widePos: 0.48, noseFull: 0.78, tailW: 0.7 },
  hybrid: { widePos: 0.52, noseFull: 0.7, tailW: 0.56 },
  shortboard: { widePos: 0.55, noseFull: 0.55, tailW: 0.5 },
  performance_shortboard: { widePos: 0.57, noseFull: 0.46, tailW: 0.46 },
  everyday_shortboard: { widePos: 0.54, noseFull: 0.6, tailW: 0.52 },
  step_up: { widePos: 0.58, noseFull: 0.42, tailW: 0.42 },
  mid_length: { widePos: 0.5, noseFull: 0.9, tailW: 0.58 },
  longboard: { widePos: 0.48, noseFull: 0.95, tailW: 0.66 },
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
  /**
   * A window onto just the tail, for the small tail glyphs.
   *
   * `x0` / `yHalf` are a point that lies exactly ON the rail, so a viewBox
   * starting there has the rails meeting its corners rather than floating
   * inside it. `x1` is where the drawn tail actually ends, which is PAST the
   * measured length `L` by an amount that depends on the tail shape — see
   * `tailOverhang`.
   */
  tailBox: { x0: number; yHalf: number; x1: number }
}

/**
 * How far past the measured length `L` a tail's curve actually reaches.
 *
 * A cubic whose two control points share an x peaks at three quarters of the
 * distance to that x, which is where the round and squash numbers come from.
 * The swallow's leading quadratic peaks at t = 0.4545, giving 0.0455 — the
 * notch means a swallow is the SHORTEST of the three, not the longest.
 */
function tailOverhang(tailHalf: number, tail: TailKind): number {
  switch (tail) {
    case 'swallow':
      return tailHalf * 0.0455
    case 'squash':
      return tailHalf * 0.195
    case 'pin':
      return tailHalf * 1.125
    default:
      return tailHalf * 0.645
  }
}

export function buildOutline(lengthFt: number, widthIn: number, tail: TailKind, category = 'shortboard'): OutlineSpec {
  const tune = CATEGORY_TUNE[category] ?? CATEGORY_TUNE.shortboard
  const L = lengthFt * SCALE
  const W = (widthIn / 12) * SCALE
  const half = W / 2
  const wideX = L * tune.widePos
  const tailHalf = half * tune.tailW * TAIL_WIDTH_FACTOR[tail]

  // No surfboard comes to a point at the nose — even a pintail shortboard has a
  // small radius there. A true point is the main thing that makes a drawn
  // outline read as a leaf.
  const noseR = half * (0.05 + tune.noseFull * 0.1)
  const nx = noseR * 0.85

  const path = [
    `M ${nx} ${-noseR}`,
    // nose shoulder out to the wide point
    `C ${nx + L * 0.1} ${-half * tune.noseFull * 0.92} ${wideX * 0.52} ${-half} ${wideX} ${-half}`,
    // wide point back to the tail corner
    `C ${L * 0.79} ${-half * 0.93} ${L * 0.93} ${-tailHalf * 1.12} ${L} ${-tailHalf}`,
    tailEdge(L, tailHalf, tail),
    `C ${L * 0.93} ${tailHalf * 1.12} ${L * 0.79} ${half * 0.93} ${wideX} ${half}`,
    `C ${wideX * 0.52} ${half} ${nx + L * 0.1} ${half * tune.noseFull * 0.92} ${nx} ${noseR}`,
    // the rounded tip itself
    `C ${nx - noseR * 1.1} ${noseR * 0.6} ${nx - noseR * 1.1} ${-noseR * 0.6} ${nx} ${-noseR}`,
    'Z',
  ].join(' ')

  // A point on the wide-point-to-tail cubic, evaluated directly from the
  // Bernstein basis — no curve solving, and the result is guaranteed to lie on
  // the rail rather than near it. 0.62 is far enough back that both rails are
  // visibly converging and close enough that the tail, not the rail, is the
  // subject of the crop.
  const t = 0.62
  const u = 1 - t
  const on = (a: number, b: number, c: number, d: number) =>
    u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
  const tailBox = {
    x0: on(wideX, L * 0.79, L * 0.93, L),
    yHalf: on(half, half * 0.93, tailHalf * 1.12, tailHalf),
    x1: L + tailOverhang(tailHalf, tail),
  }

  return { lengthFt, widthIn, tail, path, px: { L, W }, tailBox }
}

function tailEdge(L: number, tailHalf: number, tail: TailKind): string {
  switch (tail) {
    case 'swallow':
      // A shallow rounded V between two corners — roughly a third of the tail
      // width deep. Cutting deeper produces a forked ribbon, not a swallow.
      return [
        `Q ${L + tailHalf * 0.1} ${-tailHalf * 0.55} ${L - tailHalf * 0.02} ${-tailHalf * 0.34}`,
        `Q ${L - tailHalf * 0.34} ${-tailHalf * 0.06} ${L - tailHalf * 0.36} 0`,
        `Q ${L - tailHalf * 0.34} ${tailHalf * 0.06} ${L - tailHalf * 0.02} ${tailHalf * 0.34}`,
        `Q ${L + tailHalf * 0.1} ${tailHalf * 0.55} ${L} ${tailHalf}`,
      ].join(' ')
    case 'squash':
      // Nearly flat across the end with defined, softly rounded corners.
      return `C ${L + tailHalf * 0.26} ${-tailHalf * 0.74} ${L + tailHalf * 0.26} ${tailHalf * 0.74} ${L} ${tailHalf}`
    case 'pin':
      // Converges toward a point; tailHalf is already small for a pin.
      return `C ${L + tailHalf * 1.5} ${-tailHalf * 0.45} ${L + tailHalf * 1.5} ${tailHalf * 0.45} ${L} ${tailHalf}`
    case 'round':
    case 'unknown':
    default:
      return `C ${L + tailHalf * 0.86} ${-tailHalf * 0.8} ${L + tailHalf * 0.86} ${tailHalf * 0.8} ${L} ${tailHalf}`
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

// ───────────────────────── Fins and stringer
//
// A plan-view board without fins reads as a leaf. Fin cluster, placement and
// rake are what make it read as equipment, so they are generated from the same
// geometry rather than drawn by hand per board.

export type FinLayout = 'single' | 'twin' | 'thruster' | 'quad' | 'five'

export interface Fin {
  /** Centre of the fin base, in board coordinates (nose at x=0). */
  x: number
  y: number
  /** -1 for the left rail, +1 for the right, 0 for a centre fin. */
  side: -1 | 0 | 1
  /** Base length and height, in viewBox units. */
  base: number
  height: number
}

/**
 * Fin positions for a layout, scaled to the board.
 * Distances from the tail follow normal placement: centre fins sit closest to
 * the tail, side fins further up and out toward the rails.
 */
export function finsFor(spec: OutlineSpec, layout: FinLayout): Fin[] {
  const { L, W } = spec.px
  const half = W / 2
  // Proportions of a real cluster: a fin is a small sliver, not a wing.
  const base = W * 0.075
  const len = L * 0.055
  const centre = (fromTail: number): Fin => ({
    x: L - L * fromTail,
    y: 0,
    side: 0,
    base: base * 1.05,
    height: len * 1.1,
  })
  const pair = (fromTail: number, out: number, scale = 1): Fin[] =>
    [-1, 1].map((s) => ({
      x: L - L * fromTail,
      y: half * out * s,
      side: s as -1 | 1,
      base: base * scale,
      height: len * scale,
    }))

  switch (layout) {
    case 'single':
      return [centre(0.17)]
    case 'twin':
      return pair(0.15, 0.6, 1.2)
    case 'quad':
      return [...pair(0.19, 0.6), ...pair(0.115, 0.42, 0.85)]
    case 'five':
      return [...pair(0.19, 0.6), ...pair(0.115, 0.42, 0.85), centre(0.1)]
    case 'thruster':
    default:
      return [...pair(0.185, 0.58), centre(0.1)]
  }
}

/**
 * One fin seen from below: a narrow sliver swept back toward the tail, with
 * side fins toed slightly outward. Always ends short of the tail edge.
 */
export function finPath(fin: Fin): string {
  const { x, y, side, base, height } = fin
  const tipX = x + height
  const tipY = y + side * height * 0.16
  return [
    `M ${x - base * 0.5} ${y}`,
    `Q ${x + height * 0.4} ${y - side * base * 0.3} ${tipX} ${tipY}`,
    `Q ${x + height * 0.32} ${y + base * 0.5} ${x + base * 0.5} ${y}`,
    'Z',
  ].join(' ')
}

/** The stringer: a single line down the centre, stopping short of both tips. */
export function stringerPath(spec: OutlineSpec): string {
  const { L } = spec.px
  return `M ${L * 0.045} 0 L ${L * 0.965} 0`
}
