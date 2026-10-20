import { useEffect, useState, type CSSProperties } from 'react'
import { boardAssets, PLACEHOLDER_ASPECT, placeholderFileName, type TailCropConfig } from '../../data/assets'
import type { BoardAssetView, BoardId } from '../../data/types'

export type Emphasis = 'default' | 'focus' | 'dim' | 'hero'

export interface BoardVisualProps {
  boardId: BoardId
  view: BoardAssetView
  emphasis?: Emphasis
  /** When set, renders a configurable crop of the given view (Tail & Fins uses the bottom view). */
  crop?: TailCropConfig
  className?: string
  /** Decorative when the surrounding control already names the board. */
  decorative?: boolean
}

type Status = 'loading' | 'ready' | 'missing'

/**
 * The replaceable board visual boundary.
 * Phase 1: a cut-out product image with an interface-drawn contact shadow.
 * Phase 2: swap the internals for a live 3D renderer; props stay the same.
 */
export function BoardVisual({ boardId, view, emphasis = 'default', crop, className = '', decorative = false }: BoardVisualProps) {
  const asset = boardAssets[boardId][view] ?? boardAssets[boardId].bottom
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    setStatus('loading')
  }, [asset.src])

  const flip = view === 'side' && boardAssets[boardId].side.noseDirection === 'left'
  /**
   * The side assets were exported rotated 180 degrees: the rocker curves down
   * and the deck text reads upside down. Nose direction is already handled by
   * `flip`, so only the vertical axis needs correcting — rocker should rise at
   * nose and tail, the way the board sits on the water.
   */
  const flipY = view === 'side'
  const alt = decorative ? '' : asset.alt
  const classes = `bv bv--${view} bv--${emphasis} bv--${status}${crop || view === 'tail' ? ' bv--crop' : ''} ${className}`.trim()

  if (view === 'tail') {
    return (
      <figure className={classes} data-status={status}>
        <div className="bv__frame">
          <img
            src={asset.src}
            alt={status === 'missing' ? '' : alt}
            className="bv__img bv__img--framed"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('missing')}
            draggable={false}
          />
          {status === 'missing' && (
            <Placeholder label={placeholderFileName(boardId, view)} aspect={1} variant="crop" />
          )}
        </div>
      </figure>
    )
  }

  if (crop) {
    const imgStyle: CSSProperties = {
      width: `${crop.zoom * 100}%`,
      transform: `translate(${-crop.focusX * 100}%, ${-crop.focusY * 100}%)${flip ? ' scaleX(-1)' : ''}`,
    }
    return (
      <figure className={classes} data-status={status}>
        <div className="bv__frame">
          <img
            src={asset.src}
            alt={status === 'missing' ? '' : alt}
            style={imgStyle}
            className="bv__img bv__img--crop"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('missing')}
            draggable={false}
          />
          {status === 'missing' && (
            <Placeholder label={`tail crop · ${placeholderFileName(boardId, view)}`} aspect={1} variant="crop" />
          )}
        </div>
      </figure>
    )
  }

  return (
    <figure className={classes} data-status={status}>
      <div className="bv__stage">
        {/* .bv__object keeps the interface-drawn shadow anchored to the image itself */}
        <div className="bv__object">
          <img
            src={asset.src}
            alt={status === 'missing' ? '' : alt}
            className="bv__img"
            style={
              flip || flipY
                ? { transform: `scale(${flip ? -1 : 1}, ${flipY ? -1 : 1})` }
                : undefined
            }
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('missing')}
            draggable={false}
          />
          {status === 'missing' && (
            <Placeholder label={placeholderFileName(boardId, view)} aspect={PLACEHOLDER_ASPECT[view]} variant={view} />
          )}
          <span className="bv__shadow" aria-hidden="true" />
        </div>
      </div>
    </figure>
  )
}

/**
 * Honest placeholder: a frame with the expected file name, nothing that
 * imitates a surfboard. It reserves the layout until the real asset lands.
 */
function Placeholder({ label, aspect, variant }: { label: string; aspect: number; variant: string }) {
  return (
    <div className={`bv__placeholder bv__placeholder--${variant}`} style={{ aspectRatio: `${aspect}` }} role="img" aria-label={`Image pending: ${label}`}>
      <span className="bv__placeholder-label">{label}</span>
      <span className="bv__placeholder-hint">public/boards</span>
    </div>
  )
}
