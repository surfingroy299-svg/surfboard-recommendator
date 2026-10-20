// Direction 03 — extruded game-piece board geometry (independent from d1's loft).
// Real length/width/thickness; outline curve + bevel are VISUAL APPROXIMATION,
// deliberately styled as graphic duotone pieces (no surface-detail claims).
import * as THREE from 'three'

const CAT: Record<string, { widePos: number; noseFull: number; tailW: number }> = {
  groveler: { widePos: 0.5, noseFull: 0.86, tailW: 0.62 },
  hybrid: { widePos: 0.52, noseFull: 0.72, tailW: 0.56 },
  shortboard: { widePos: 0.56, noseFull: 0.56, tailW: 0.5 },
}

// Shape space: y = length axis (nose at +L/2), x = halfwidth. 1 unit = 1 ft.
export function buildPiece(lengthFt: number, widthIn: number, thicknessIn: number, category: string): THREE.ExtrudeGeometry {
  const tune = CAT[category] ?? CAT.shortboard
  const L = lengthFt
  const W = widthIn / 12
  const T = thicknessIn / 12

  const half = (t: number): number => {
    // t: 0 nose → 1 tail
    const tip = Math.min(1, Math.min(t, 1 - t) * 26 + 0.02)
    let w: number
    if (t <= tune.widePos) {
      const u = t / tune.widePos
      w = Math.sin((u * Math.PI) / 2) ** (0.95 - tune.noseFull * 0.25)
    } else {
      const u = (t - tune.widePos) / (1 - tune.widePos)
      w = 1 - (1 - tune.tailW) * u ** 1.7
    }
    return (W / 2) * w * tip
  }

  const shape = boardShape(L, half)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: T * 0.5,
    bevelEnabled: true,
    bevelThickness: T * 0.2,
    bevelSize: T * 0.24,
    bevelSegments: 6,
    curveSegments: 32,
  })
  geo.center()
  return geo
}

function boardShape(L: number, half: (t: number) => number): THREE.Shape {
  const shape = new THREE.Shape()
  const N = 46
  const tailStop = 0.965 // stop the side curve short of the tail, then round the corner
  shape.moveTo(0, L / 2)
  for (let i = 1; i <= N; i++) {
    const t = (i / N) * tailStop
    shape.lineTo(half(t), L / 2 - t * L)
  }
  const cornerW = half(tailStop)
  // rounded tail corners through a soft tail edge (no chamfer artifact)
  shape.quadraticCurveTo(cornerW * 0.96, -L / 2, cornerW * 0.45, -L / 2)
  shape.lineTo(-cornerW * 0.45, -L / 2)
  shape.quadraticCurveTo(-cornerW * 0.96, -L / 2, -half(tailStop), L / 2 - tailStop * L)
  for (let i = N; i >= 1; i--) {
    const t = (i / N) * tailStop
    shape.lineTo(-half(t), L / 2 - t * L)
  }
  shape.closePath()
  return shape
}

/** Cream deck inset: same outline scaled inward, extruded thin (sits on the deck). */
export function buildDeckInset(lengthFt: number, widthIn: number, thicknessIn: number, category: string): THREE.ExtrudeGeometry {
  const tune = CAT[category] ?? CAT.shortboard
  const L = lengthFt * 0.94
  const W = (widthIn / 12) * 0.82
  const half = (t: number): number => {
    const tip = Math.min(1, Math.min(t, 1 - t) * 26 + 0.02)
    let w: number
    if (t <= tune.widePos) {
      const u = t / tune.widePos
      w = Math.sin((u * Math.PI) / 2) ** (0.95 - tune.noseFull * 0.25)
    } else {
      const u = (t - tune.widePos) / (1 - tune.widePos)
      w = 1 - (1 - tune.tailW) * u ** 1.7
    }
    return (W / 2) * w * tip
  }
  const geo = new THREE.ExtrudeGeometry(boardShape(L, half), {
    depth: (thicknessIn / 12) * 0.06,
    bevelEnabled: false,
    curveSegments: 28,
  })
  geo.center()
  return geo
}

/** Court texture: painted slots + groove. Plane is 17ft x 11ft ↔ 1400x900 px. */
export function buildCourtTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 1400
  c.height = 900
  const pxX = 1400 / 17 // px per ft
  const pxZ = 900 / 11
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f2e7d3'
  ctx.fillRect(0, 0, c.width, c.height)
  // subtle field tint inside the play area
  ctx.fillStyle = '#eddfc6'
  ctx.fillRect(pxX * 0.8, pxZ * 0.8, c.width - pxX * 1.6, c.height - pxZ * 2.6)
  ctx.strokeStyle = '#191713'
  ctx.lineWidth = 4
  ctx.setLineDash([22, 16])
  const slotW = 2.4 * pxX
  const slotL = 7.3 * pxZ
  const slotCenterZpx = c.height / 2 - 0.2 * pxZ
  ;[-3.4, 0, 3.4].forEach((x) => {
    const cx = c.width / 2 + x * pxX
    ctx.strokeRect(cx - slotW / 2, slotCenterZpx - slotL / 2, slotW, slotL)
  })
  ctx.setLineDash([])
  // replacement groove along the bottom edge of the field
  const grooveZ = c.height - 1.1 * pxZ
  ctx.lineWidth = 7
  ctx.strokeStyle = '#d8c9ab'
  ctx.beginPath()
  ctx.moveTo(pxX * 0.9, grooveZ)
  ctx.lineTo(c.width - pxX * 0.9, grooveZ)
  ctx.stroke()
  ctx.fillStyle = '#b3a487'
  ctx.font = '700 26px Archivo Black, sans-serif'
  ctx.fillText('IN →', pxX * 0.9, grooveZ - 12)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  return tex
}
