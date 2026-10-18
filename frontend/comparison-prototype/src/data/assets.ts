import type { BoardAssetView, BoardId } from './types'

/**
 * Asset mapping layer. Source of the current temporary assets: Figma file
 * "surfboaRD-RECCOMENDATOR", page MODELS (node 1:71), sections BOARD A / B / C.
 * Frame → file mapping (exported at 2x, trimmed to content; SIDE rotated to nose-right):
 *   BOARD-X/FRONT      → public/boards/board-x-deck.png
 *   BOARD-X/BOTTOM     → public/boards/board-x-bottom.png
 *   BOARD-X/SIDE       → public/boards/board-x-side.png
 *   BOARD-X/TAIL&FINS  → public/boards/board-x-tail.png   (optional; otherwise bottom is cropped)
 * Components only read this file; nothing here identifies a real model.
 */

export interface ViewAssetConfig {
  src: string
  alt: string
}

export interface SideAssetConfig extends ViewAssetConfig {
  /** Which way the nose points in the file. Display always points nose right. */
  noseDirection: 'left' | 'right'
}

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
    side: { src: `${base}board-${id}-side.png`, alt: `${label}, side profile`, noseDirection: 'right' },
    bottom: { src: `${base}board-${id}-bottom.png`, alt: `${label}, bottom view with fins` },
    tail: { src: `${base}board-${id}-tail.png`, alt: `${label}, tail and fins` },
    tailCrop,
  }
}

export const boardAssets: Record<BoardId, BoardAssetSet> = {
  a: set('a', 'Board A', { focusX: 0.5, focusY: 0.861, zoom: 0.895 }),
  b: set('b', 'Board B', { focusX: 0.5, focusY: 0.86, zoom: 0.935 }),
  c: set('c', 'Board C', { focusX: 0.5, focusY: 0.861, zoom: 1.005 }),
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
