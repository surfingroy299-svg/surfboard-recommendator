/**
 * Maps a board from the comparison data onto outline geometry.
 *
 * Kept out of the component module so that file exports components only, which
 * is what React Fast Refresh needs to hot-update it.
 */

import { buildOutline, parseLengthFt, parseTail, parseWidthIn, type OutlineSpec } from './outlineGeometry'
import type { Board, BoardId } from '../../data/types'

export interface BoardOutlineData {
  id: BoardId
  label: string
  spec: OutlineSpec
  volume: string
  lengthDisplay: string
  widthDisplay: string
  tailDisplay: string
}

export function outlineFor(board: Board): BoardOutlineData {
  const spec = buildOutline(
    parseLengthFt(board.dimensions.length),
    parseWidthIn(board.dimensions.width),
    parseTail(board.tailFins.tail),
  )
  return {
    id: board.id,
    label: board.model,
    spec,
    volume: board.dimensions.volume,
    lengthDisplay: board.dimensions.length,
    widthDisplay: board.dimensions.width,
    tailDisplay: board.tailFins.tail,
  }
}
