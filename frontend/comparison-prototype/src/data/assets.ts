import type { BoardAssetView, BoardId } from './types'

/**
 * Asset mapping layer. Source: Figma file "surfboaRD-RECCOMENDATOR", page 4
 * (node 21:64), sections Board A / Board B / Board C.
 *
 * Each section holds ONE image carrying three views of one board side by side,
 * already on a transparent background. The four files per board were cut out
 * of that single image rather than exported as separate frames, so every view
 * of a board is guaranteed to be the same board:
 *
 *   left / right outer view  → board-x-bottom.png   (the one with fin boxes)
 *   left / right outer view  → board-x-deck.png
 *   narrow middle view       → board-x-side.png     (quarter-turned to nose-right)
 *   lower third of bottom    → board-x-tail.png
 *
 * Which outer view is the bottom is not consistent between the three sources —
 * Board B's alpha copy is the un-mirrored original and runs the other way
 * round. The fin boxes settle it, since they only ever appear on the bottom.
 *
 * Nothing was stretched, recoloured or redrawn; the only transform applied is
 * the quarter turn on the side profile. Components only read this file.
 */

export interface ViewAssetConfig {
  src: string
  alt: string
}

/**
 * The side files are cut nose-right and rocker-up, so nothing corrects them at
 * render time. An orientation flag used to live here; it is gone deliberately,
 * because the scaleY it drove could not be interpolated against the hover
 * transform and animated through a rotation. Mirror the file, not the pixels
 * on screen.
 */
export type SideAssetConfig = ViewAssetConfig

/**
 * Per-board crop of the bottom image, used when no prepared tail asset exists.
 * focusX/focusY: the point on the bottom image (0–1) that lands at the frame
 * centre; zoom: rendered image width in frame widths. Values below mirror the
 * TAIL&FINS frame geometry in Figma so both paths show the same region.
 */
export interface TailCropConfig {
  focusX: number
  focusY: number
  zoom: number
}

export interface BoardAssetSet {
  deck: ViewAssetConfig
  side: SideAssetConfig
  bottom: ViewAssetConfig
  /** Prepared tail view. When present, Tail & Fins uses it directly. */
  tail?: ViewAssetConfig
  tailCrop: TailCropConfig
}

const base = `${import.meta.env.BASE_URL}boards/`

function set(id: BoardId, label: string, tailCrop: TailCropConfig): BoardAssetSet {
  return {
    deck: { src: `${base}board-${id}-deck.png`, alt: `${label}, deck view` },
    side: { src: `${base}board-${id}-side.png`, alt: `${label}, side profile` },
    bottom: { src: `${base}board-${id}-bottom.png`, alt: `${label}, bottom view with fins` },
    tail: { src: `${base}board-${id}-tail.png`, alt: `${label}, tail and fins` },
    tailCrop,
  }
}

export const boardAssets: Record<BoardId, BoardAssetSet> = {
  a: set('a', 'Tidalform Edge', { focusX: 0.5, focusY: 0.861, zoom: 0.895 }),
  b: set('b', 'Tidecraft Flow', { focusX: 0.5, focusY: 0.86, zoom: 0.935 }),
  c: set('c', 'Saltline Drift', { focusX: 0.5, focusY: 0.861, zoom: 1.005 }),
}

export function assetFor(id: BoardId, view: BoardAssetView): ViewAssetConfig | undefined {
  return boardAssets[id][view]
}

/** Width / height used by the placeholder frame before a real image loads. */
export const PLACEHOLDER_ASPECT: Record<BoardAssetView, number> = {
  deck: 0.27,
  bottom: 0.27,
  side: 7.5,
  tail: 1.07,
}

export function placeholderFileName(id: BoardId, view: BoardAssetView): string {
  return `board-${id}-${view}.png`
}
