// Direction 01 — procedural lofted board geometry.
// Length/width/thickness are REAL (stock dims). Outline curve between anchors,
// rail roundness, deck dome, and rocker are VISUAL APPROXIMATION (sketch-level
// blank, stated in the chalk legend). Never hydrodynamically accurate.
import * as THREE from 'three'

export interface BlankParams {
  lengthFt: number
  widthIn: number
  thicknessIn: number
  category: string
}

const CAT: Record<string, { widePos: number; noseFull: number; tailW: number; rocker: number }> = {
  groveler: { widePos: 0.5, noseFull: 0.85, tailW: 0.6, rocker: 0.55 },
  hybrid: { widePos: 0.52, noseFull: 0.72, tailW: 0.55, rocker: 0.7 },
  shortboard: { widePos: 0.55, noseFull: 0.58, tailW: 0.5, rocker: 0.9 },
}

// World units: 1 unit = 1 ft.
export function buildBlank({ lengthFt, widthIn, thicknessIn, category }: BlankParams): THREE.BufferGeometry {
  const tune = CAT[category] ?? CAT.shortboard
  const L = lengthFt
  const W = widthIn / 12
  const T = thicknessIn / 12

  const nSeg = 72 // along length
  const nRad = 40 // around section
  const positions: number[] = []
  const indices: number[] = []

  const halfwidth = (t: number): number => {
    // surfboard plan curve: rounded nose, long straight-ish mid chord, taut tail
    const tip = Math.min(1, Math.pow(Math.min(t, 1 - t) * 14, 0.55) + 0.02)
    let w: number
    if (t <= tune.widePos) {
      const u = t / tune.widePos
      // ease-out toward wide point; noseFull controls how early the shoulder fills
      w = 1 - (1 - u) ** (1.9 + tune.noseFull * 1.4)
    } else {
      const u = (t - tune.widePos) / (1 - tune.widePos)
      w = 1 - (1 - tune.tailW) * u ** 2.1
    }
    return (W / 2) * w * tip
  }

  const thickness = (t: number): number => {
    const tip = Math.min(1, Math.min(t, 1 - t) * 20 + 0.02)
    const dome = 0.72 + 0.28 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.04) / 0.92)))
    return (T / 2) * dome * tip
  }

  const rocker = (t: number): number => {
    // gentle nose/tail lift — pure sketch (labeled)
    const nose = Math.max(0, 1 - t / 0.28) ** 2.2 * T * 1.1 * tune.rocker
    const tail = Math.max(0, (t - 0.78) / 0.22) ** 2 * T * 0.5 * tune.rocker
    return nose + tail
  }

  for (let i = 0; i <= nSeg; i++) {
    const t = i / nSeg
    const x = (t - 0.5) * L
    const w = Math.max(halfwidth(t), 0.004)
    const h = Math.max(thickness(t), 0.003)
    const r = rocker(t)
    for (let j = 0; j < nRad; j++) {
      const phi = (j / nRad) * Math.PI * 2
      const c = Math.cos(phi)
      const s = Math.sin(phi)
      // superellipse rails; flatter bottom than deck
      const nExp = s > 0 ? 2.2 : 3.2
      const y = w * Math.sign(c) * Math.abs(c) ** (2 / nExp)
      const zBase = h * Math.sign(s) * Math.abs(s) ** (2 / nExp)
      const z = (s > 0 ? zBase * 0.92 : zBase * 0.78) + r
      positions.push(x, y, z)
    }
  }

  for (let i = 0; i < nSeg; i++) {
    for (let j = 0; j < nRad; j++) {
      const a = i * nRad + j
      const b = i * nRad + ((j + 1) % nRad)
      const c = (i + 1) * nRad + j
      const d = (i + 1) * nRad + ((j + 1) % nRad)
      indices.push(a, b, c, b, d, c)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Stringer line down the deck center (pencil line). */
export function buildStringer(lengthFt: number, thicknessIn: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  const T = thicknessIn / 12
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    pts.push(new THREE.Vector3((t - 0.5) * lengthFt * 0.96, 0, T * 0.52))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}
