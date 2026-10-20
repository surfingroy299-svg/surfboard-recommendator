// Direction 02 — silhouette generation from REAL dims (length/width/thickness).
// Curve shape between measured anchor points is VISUAL APPROXIMATION —
// rendered in the direction's "sketch" line style and stated in the legend.
import { boardSource, recommendedStock, type BoardSource } from '../../shared/mockData'

export interface OutlineSpec {
  id: string
  name: string
  lengthFt: number
  widthIn: number
  thicknessIn: number
  volume: number
  category: string
  tailKnown: boolean
  tailShape: string
  path: string // plan-view outline, viewBox units
  profilePath: string // side view (sketch)
  px: { L: number; W: number } // rendered size in viewBox units
}

// Per-category plan-shape tuning (VISUAL APPROXIMATION — class-typical, not model data)
const CATEGORY_TUNE: Record<string, { widePos: number; noseFull: number; tailW: number }> = {
  groveler: { widePos: 0.5, noseFull: 0.82, tailW: 0.62 },
  hybrid: { widePos: 0.52, noseFull: 0.7, tailW: 0.56 },
  shortboard: { widePos: 0.55, noseFull: 0.55, tailW: 0.5 },
}

export const SCALE = 70 // viewBox units per foot (shared scale across all plates — P13)

export function outlineFor(id: string): OutlineSpec {
  const src: BoardSource = boardSource(id)
  const stock = recommendedStock(id)
  const tune = CATEGORY_TUNE[boardEvalCategory(src)] ?? CATEGORY_TUNE.shortboard
  const L = stock.length * SCALE
  const W = (stock.width / 12) * SCALE
  const half = W / 2
  const wideX = L * tune.widePos
  const tailHalf = half * tune.tailW
  const tail = src.shape_profile?.tail_shape ?? 'unknown'
  const tailKnown = tail !== 'unknown'

  // Plan outline: nose tip → wide point → tail corner, mirrored. Cubic segments.
  const noseCtrl = L * 0.16
  const p = [
    `M 0 0`,
    `C ${noseCtrl} ${-half * tune.noseFull} ${wideX * 0.55} ${-half} ${wideX} ${-half}`,
    `C ${L * 0.78} ${-half * 0.94} ${L * 0.92} ${-tailHalf * 1.15} ${L} ${-tailHalf}`,
    tailEdge(L, tailHalf, tail),
    `C ${L * 0.92} ${tailHalf * 1.15} ${L * 0.78} ${half * 0.94} ${wideX} ${half}`,
    `C ${wideX * 0.55} ${half} ${noseCtrl} ${half * tune.noseFull} 0 0`,
    'Z',
  ].join(' ')

  // Side profile (sketch): thickness real, rocker curvature invented → drawn dashed.
  const T = (stock.thickness / 12) * SCALE * 3.2 // vertically exaggerated for legibility (stated in legend)
  const rockerNose = T * 1.6
  const rockerTail = T * 0.55
  const profile = [
    `M 0 ${-rockerNose}`,
    `C ${L * 0.22} ${-T * 0.62} ${L * 0.4} ${-T * 0.58} ${L * 0.5} ${-T * 0.58}`,
    `C ${L * 0.72} ${-T * 0.58} ${L * 0.9} ${-T * 0.5 - rockerTail * 0.2} ${L} ${-T * 0.42 - rockerTail}`,
    `L ${L} ${-rockerTail}`,
    `C ${L * 0.88} ${-rockerTail * 0.25} ${L * 0.72} ${0} ${L * 0.5} ${0}`,
    `C ${L * 0.34} ${0} ${L * 0.16} ${-rockerNose * 0.28} 0 ${-rockerNose}`,
    'Z',
  ].join(' ')

  return {
    id,
    name: src.model_name,
    lengthFt: stock.length,
    widthIn: stock.width,
    thicknessIn: stock.thickness,
    volume: stock.volume_liters,
    category: boardEvalCategory(src),
    tailKnown,
    tailShape: tail,
    path: p,
    profilePath: profile,
    px: { L, W },
  }
}

function boardEvalCategory(src: BoardSource): string {
  return src.category in CATEGORY_TUNE ? src.category : 'shortboard'
}

function tailEdge(L: number, tailHalf: number, tail: string): string {
  if (tail.includes('swallow')) {
    // swallow: notch into the tail
    return `L ${L} ${-tailHalf} L ${L - tailHalf * 0.85} 0 L ${L} ${tailHalf}`
  }
  // squash/round/unknown: rounded edge (unknown is drawn but flagged by dash style in the component)
  return `Q ${L + tailHalf * 0.5} 0 ${L} ${tailHalf}`
}

/** Local halfwidth at fraction t (0 nose → 1 tail) — used by the ruler. Approximation of the same curve. */
export function halfwidthAt(spec: OutlineSpec, t: number): number {
  const { L, W } = spec.px
  const tune = CATEGORY_TUNE[spec.category] ?? CATEGORY_TUNE.shortboard
  const half = W / 2
  const wide = tune.widePos
  if (t <= wide) {
    const u = t / wide
    return half * Math.sin((u * Math.PI) / 2) ** (1.2 - tune.noseFull * 0.35)
  }
  const u = (t - wide) / (1 - wide)
  const tailHalf = half * tune.tailW
  return half - (half - tailHalf) * u ** 1.6
}

/** Ruler readout: local width in inches at fraction t — clamped to the real
 * measured max width (the curve is a sketch; it may not overclaim). */
export function widthInchesAt(spec: OutlineSpec, t: number): number {
  const w = ((halfwidthAt(spec, t) * 2) / SCALE) * 12
  return Math.min(w, spec.widthIn)
}
