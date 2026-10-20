// Direction 03 — The Quiver Deck (playful · energetic · experimental)
// R3F + hand-rolled damped springs. Fixed camera; the OBJECTS move. Coolors made spatial.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useScenario } from '../../shared/scenarioStore'
import { useAnnounce, useStaticMode } from '../../shared/a11y'
import { boardEval, recommendedStock, surfer, traitDeltas, UNCERTAINTY_NOTE } from '../../shared/mockData'
import { buildPiece, buildDeckInset, buildCourtTexture } from './deckGeometry'
import { clampedDpr, hasWebGL } from '../../shared/perf'
import './deck.css'

const BOARD_COLOR: Record<string, string> = {
  ci_better_everyday: '#ff5a36',
  ci_g_skate: '#173fa6',
  ci_two_happy: '#0c8f5b',
  ci_dumpster_diver_2: '#7a4fd6',
  ci_fever: '#e0357a',
}
const SLOT_X = [-3.4, 0, 3.4]
const FACES = ['deck', 'rail', 'bottom', 'rail'] as const

export default function QuiverDeck() {
  const scenario = useScenario()
  const announce = useAnnounce()
  const reduced = useStaticMode()
  const webgl = useMemo(hasWebGL, [])
  const [face, setFace] = useState(0) // canonical face index of the focused board
  const [showUndo, setShowUndo] = useState(false)

  useEffect(() => {
    if (scenario.lastSwap) {
      setShowUndo(true)
      const t = window.setTimeout(() => setShowUndo(false), 6000)
      announce(
        `${boardEval(scenario.lastSwap.outId).model_name} ejected. In: ${boardEval(scenario.lastSwap.inId).model_name} — ${scenario.lastSwap.reason}`,
      )
      return () => window.clearTimeout(t)
    }
  }, [scenario.lastSwap, announce])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const idx = ['1', '2', '3'].indexOf(e.key)
      if (idx >= 0 && scenario.slots[idx]) {
        scenario.focus(scenario.focusId === scenario.slots[idx] ? null : scenario.slots[idx])
        setFace(0)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (scenario.focusId || scenario.compareIds) {
          setFace((f) => {
            const nf = (f + (e.key === 'ArrowRight' ? 1 : 3)) % 4
            announce(`${FACES[nf]} view`)
            return nf
          })
        }
      } else if ((e.key === 'c' || e.key === 'C') && scenario.focusId) {
        const other = scenario.slots.find((s) => s !== scenario.focusId)
        if (other) {
          scenario.startCompare(scenario.focusId, other)
          setFace(0)
          announce('Face-off')
        }
      } else if ((e.key === 'l' || e.key === 'L') && scenario.focusId) {
        scenario.toggleLock(scenario.focusId)
        announce(scenario.locked.includes(scenario.focusId) ? 'Clamp open' : 'Clamped — locked in')
      } else if ((e.key === 'x' || e.key === 'X')) {
        const target = scenario.focusId ?? scenario.slots.find((s) => !scenario.locked.includes(s))
        if (target) scenario.reject(target)
      } else if (e.key === 'u' || e.key === 'U') {
        scenario.undo()
        announce('Brought back')
      } else if (e.key === 'Escape') {
        scenario.compareIds ? scenario.endCompare() : scenario.focus(null)
        setFace(0)
        announce('Back to the table')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scenario, announce])

  if (!webgl) return <DeckFallback />

  const focusEv = scenario.focusId ? boardEval(scenario.focusId) : null

  return (
    <div className="qd-root">
      <div className="qd-canvas">
        <Canvas
          dpr={clampedDpr()}
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 8.8, 10.4], rotation: [-0.6636, 0, 0], fov: 33 }}
          onPointerMissed={() => scenario.focus(null)}
          onCreated={({ gl, scene, camera }) => {
            const w = window as unknown as { __deckScene?: THREE.Scene; __forceRender?: () => void }
            w.__deckScene = scene
            // capture hook: force one frame when rAF is suspended (hidden tab)
            w.__forceRender = () => gl.render(scene, camera)
          }}
        >
          <Suspense fallback={null}>
            <DeckScene face={face} setFace={setFace} reduced={reduced} />
          </Suspense>
        </Canvas>
      </div>

      <header className="qd-top">
        <a className="qd-back" href="#/">← directions</a>
        <span className="qd-title">QUIVER DECK</span>
        <span className="qd-state">{scenario.compareIds ? 'FACE-OFF' : scenario.focusId ? `IN HAND — ${FACES[face].toUpperCase()}` : 'TABLE'}</span>
      </header>

      {/* slot tags: boarding passes */}
      <div className="qd-tags">
        {scenario.slots.map((id, i) => (
          <SlotTag key={id} id={id} index={i} />
        ))}
      </div>

      {focusEv && !scenario.compareIds && <FaceCard id={scenario.focusId!} face={face} />}
      {scenario.compareIds && <FaceOffPanel a={scenario.compareIds[0]} b={scenario.compareIds[1]} />}

      <div className="qd-chips">
        <span className="qd-chips-label">deal me:</span>
        {[
          ['easier_paddling', 'easier paddling'],
          ['more_forgiving', 'more forgiving'],
          ['more_response', 'more response'],
        ].map(([chip, label]) => (
          <button key={chip} className="qd-chip" onClick={() => scenario.refine(chip)}>
            {label}
          </button>
        ))}
      </div>

      {showUndo && scenario.lastSwap && (
        <div className="qd-toast">
          <strong>IN: {boardEval(scenario.lastSwap.inId).model_name}</strong> — {scenario.lastSwap.reason}
          <button onClick={() => { scenario.undo(); setShowUndo(false) }}>bring it back (U)</button>
        </div>
      )}
      {scenario.poolExhausted && <div className="qd-toast qd-toast-warn">Pool's finite in this prototype — nothing left to deal.</div>}

      <footer className="qd-foot">
        <span>grab a board · flick to spin · 1·2·3 pick · ⇄ faces · C face-off · L clamp · X eject · U undo · Esc table</span>
        <span className="qd-honesty">duotone pieces from real dims — form is approximate · {UNCERTAINTY_NOTE}</span>
      </footer>
    </div>
  )
}

/* ---------- scene ---------- */

function DeckScene({ face, setFace, reduced }: { face: number; setFace: (f: number) => void; reduced: boolean }) {
  const scenario = useScenario()
  const court = useMemo(buildCourtTexture, [])
  return (
    <>
      <ambientLight intensity={1.15} color="#fff6e8" />
      <directionalLight position={[3, 8, 4]} intensity={1.3} color="#ffffff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[17, 11]} />
        <meshBasicMaterial map={court} />
      </mesh>
      {scenario.slots.map((id, i) => (
        <Piece key={id} id={id} slot={i} face={face} setFace={setFace} reduced={reduced} />
      ))}
      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={18} blur={2.2} far={4} color="#4a3b28" />
    </>
  )
}

function Piece({ id, slot, face, setFace, reduced }: { id: string; slot: number; face: number; setFace: (f: number) => void; reduced: boolean }) {
  const scenario = useScenario()
  const stock = useMemo(() => recommendedStock(id), [id])
  const ev = boardEval(id)
  const geo = useMemo(
    () => buildPiece(stock.length, stock.width, stock.thickness, ev.category === 'groveler' || ev.category === 'hybrid' ? ev.category : 'shortboard'),
    [stock, ev.category],
  )
  const insetGeo = useMemo(
    () => buildDeckInset(stock.length, stock.width, stock.thickness, ev.category === 'groveler' || ev.category === 'hybrid' ? ev.category : 'shortboard'),
    [stock, ev.category],
  )
  const color = BOARD_COLOR[id] ?? '#333'
  const { size } = useThree()
  const drag = useRef({ active: false, x: 0, vx: 0 })
  const spinExtra = useRef(0)

  const focused = scenario.focusId === id
  const comparePos = scenario.compareIds ? scenario.compareIds.indexOf(id) : -1
  const inHand = focused || comparePos >= 0
  const locked = scenario.locked.includes(id)

  const targetPos: [number, number, number] = comparePos >= 0
    ? [comparePos === 0 ? -2.2 : 2.2, 2.2, 1.6]
    : focused
      ? [0, 2.4, 2.8]
      : [SLOT_X[slot], 0.16, -0.2]
  // lying flat on table: rotX -90°; in hand: tilted up toward camera
  const targetTilt = inHand ? -0.5 : -Math.PI / 2
  const spinTarget = inHand ? face * (Math.PI / 2) + spinExtra.current : 0

  // Hand-rolled damped springs (see decisions/dependency-log.md: @react-spring/three
  // froze its frame loop against fiber 9.6 here — replaced with ~20 lines of physics).
  const rootRef = useRef<THREE.Group>(null)
  const tiltRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Group>(null)
  // Entry pose: initial set drops from above; a swapped-in board slides along the groove.
  // In static mode (reduced motion / hidden tab) everything starts settled.
  const swappedIn = useScenario.getState().lastSwap?.inId === id
  const staticStart =
    (typeof document !== 'undefined' && document.visibilityState === 'hidden') ||
    (typeof navigator !== 'undefined' && !!navigator.webdriver) ||
    window.location.hash.includes('static=1')
  const sim = useRef({
    pos: staticStart
      ? new THREE.Vector3(SLOT_X[slot], 0.16, -0.2)
      : swappedIn
        ? new THREE.Vector3(-8.5, 0.16, 4.4)
        : new THREE.Vector3(SLOT_X[slot], 5.5 + slot * 1.3, -0.2),
    vel: new THREE.Vector3(),
    tilt: -Math.PI / 2,
    tiltV: 0,
    spin: 0,
    spinV: 0,
    scale: 1,
    scaleV: 0,
  })
  useEffect(() => {
    if (!reduced) return
    // static mode: apply target pose without the frame loop
    const s = sim.current
    s.pos.set(...targetPos)
    s.tilt = targetTilt
    s.spin = spinTarget
    s.scale = inHand ? 1.06 : 1
    if (rootRef.current) {
      rootRef.current.position.copy(s.pos)
      rootRef.current.scale.setScalar(s.scale)
    }
    if (tiltRef.current) tiltRef.current.rotation.x = s.tilt
    if (spinRef.current) spinRef.current.rotation.y = s.spin
  })
  useFrame((_, rawDt) => {
    try {
    if (slot === 0 && window.location.hash.includes('debug=pose')) {
      document.title = `p0 ${sim.current.pos.x.toFixed(1)},${sim.current.pos.y.toFixed(1)},${sim.current.pos.z.toFixed(1)} r:${String(reduced)} dt:${rawDt.toFixed(3)}`
    }
    const frameDt = rawDt > 0 ? Math.min(rawDt, 0.12) : 1 / 10 // virtual-time clocks report 0 and deliver few frames
    const s = sim.current
    const K = 170
    const C = 15
    // fixed-substep semi-implicit integration — stable at any frame delta
    let remaining = reduced ? 0 : frameDt
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 120)
      remaining -= h
      const step = (x: number, v: number, target: number): [number, number] => {
        const nv = v + (K * (target - x) - C * v) * h
        return [x + nv * h, nv]
      }
      ;[s.pos.x, s.vel.x] = step(s.pos.x, s.vel.x, targetPos[0])
      ;[s.pos.y, s.vel.y] = step(s.pos.y, s.vel.y, targetPos[1])
      ;[s.pos.z, s.vel.z] = step(s.pos.z, s.vel.z, targetPos[2])
      ;[s.tilt, s.tiltV] = step(s.tilt, s.tiltV, targetTilt)
      ;[s.spin, s.spinV] = step(s.spin, s.spinV, spinTarget)
      ;[s.scale, s.scaleV] = step(s.scale, s.scaleV, inHand ? 1.06 : 1)
    }
    if (reduced) {
      s.pos.set(...targetPos)
      s.tilt = targetTilt
      s.spin = spinTarget
      s.scale = inHand ? 1.06 : 1
    }
    if (rootRef.current) {
      rootRef.current.position.copy(s.pos)
      rootRef.current.scale.setScalar(s.scale)
    }
    if (tiltRef.current) tiltRef.current.rotation.x = s.tilt
    if (spinRef.current) spinRef.current.rotation.y = s.spin + (drag.current.active ? spinExtra.current : 0)
    } catch (err) {
      document.title = 'FRAME-ERR ' + String(err).slice(0, 120)
    }
  })

  return (
    <group
      ref={rootRef}
      {...(reduced ? { position: targetPos, scale: inHand ? 1.06 : 1 } : {})}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (!inHand) {
          scenario.focus(id)
          setFace(0)
          spinExtra.current = 0
          return
        }
        drag.current = { active: true, x: e.clientX, vx: 0 }
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        const dx = e.clientX - drag.current.x
        drag.current.x = e.clientX
        drag.current.vx = dx
        spinExtra.current += dx * (4 / size.width)
      }}
      onPointerUp={() => {
        if (!drag.current.active) return
        drag.current.active = false
        // momentum → snap to nearest canonical face
        const momentum = drag.current.vx * 0.35
        const raw = face * (Math.PI / 2) + spinExtra.current + momentum
        const snapped = Math.round(raw / (Math.PI / 2))
        spinExtra.current = 0
        setFace(((snapped % 4) + 4) % 4)
      }}
    >
      <group>
        <group ref={tiltRef} {...(reduced ? { rotation: [targetTilt, 0, 0] as [number, number, number] } : {})}>
          <group ref={spinRef} {...(reduced ? { rotation: [0, spinTarget, 0] as [number, number, number] } : {})}>
            <mesh geometry={geo}>
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
            <mesh geometry={insetGeo} position={[0, 0, (stock.thickness / 12) * 0.46]}>
              <meshStandardMaterial color="#f6efdd" roughness={0.72} />
            </mesh>
            <mesh position={[0, 0, (stock.thickness / 12) * 0.5]}>
              <boxGeometry args={[0.02, stock.length * 0.9, 0.004]} />
              <meshBasicMaterial color="#c9ba9a" />
            </mesh>
          </group>
        </group>
        {/* clamp: visible when locked and on table */}
        {locked && !inHand && (
          <mesh position={[0, 0.22, stock.length / 2 - 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.34, 0.09, 10, 24, Math.PI]} />
            <meshStandardMaterial color="#191713" roughness={0.4} />
          </mesh>
        )}
      </group>
    </group>
  )
}

/* ---------- DOM ---------- */

function SlotTag({ id, index }: { id: string; index: number }) {
  const scenario = useScenario()
  const ev = boardEval(id)
  const stock = recommendedStock(id)
  const locked = scenario.locked.includes(id)
  const pass = surfer.size_passes[ev.size_pass]
  return (
    <div className={`qd-tag ${locked ? 'is-locked' : ''}`} style={{ borderTopColor: BOARD_COLOR[id] }}>
      <div className="qd-tag-head">
        <button className="qd-tag-name" onClick={() => scenario.focus(id)}>
          <em>{index + 1}</em> {ev.model_name}
        </button>
        <span className="qd-tag-role">{ev.role ?? 'dealt in'}</span>
      </div>
      <div className="qd-tag-dims">
        {ev.recommended_size.display} · {stock.width_display} × {stock.thickness_display}
        <span className="qd-tag-target">
          target {pass.target_volume.min}–{pass.target_volume.max} L
        </span>
      </div>
      {ev.recommended_size.flag && <div className="qd-tag-flag">⚑ size note</div>}
      <div className="qd-tag-actions">
        <button className={`qd-clamp ${locked ? 'is-on' : ''}`} onClick={() => scenario.toggleLock(id)}>
          {locked ? 'CLAMPED' : 'clamp'}
        </button>
        <button className="qd-eject" disabled={locked} onClick={() => scenario.reject(id)}>
          eject
        </button>
      </div>
    </div>
  )
}

function FaceCard({ id, face }: { id: string; face: number }) {
  const ev = boardEval(id)
  const faceName = FACES[face]
  let title = ''
  let body = ''
  if (faceName === 'deck') {
    title = `${ev.role ?? ev.model_name}`
    body = ev.why
  } else if (faceName === 'bottom') {
    title = 'what the bottom does'
    body = `${ev.dimension_assessments.ride_feel_fit.note} (sketch-level read)`
  } else {
    title = 'feel'
    body = `${ev.dimension_assessments.support_performance_fit.note}`
  }
  return (
    <div className="qd-facecard">
      <div className="qd-facecard-face">{faceName}</div>
      <div className="qd-facecard-title">{title}</div>
      <p>{body}</p>
      <div className="qd-facecard-row">
        <span className="qd-plus">+ {ev.advantage}</span>
        <span className="qd-minus">− {ev.tradeoff}</span>
      </div>
      {ev.data_gaps.length > 0 && <div className="qd-facecard-gaps">unknown: {ev.data_gaps.join(', ')} — we don't guess</div>}
    </div>
  )
}

function FaceOffPanel({ a, b }: { a: string; b: string }) {
  const deltas = traitDeltas(a, b)
  const scenario = useScenario()
  return (
    <div className="qd-faceoff">
      <div className="qd-faceoff-head">
        <span style={{ color: BOARD_COLOR[a] }}>{boardEval(a).model_name}</span>
        <em>vs</em>
        <span style={{ color: BOARD_COLOR[b] }}>{boardEval(b).model_name}</span>
        <button onClick={() => scenario.endCompare()}>done (Esc)</button>
      </div>
      {deltas.map((d) => (
        <div key={d.key} className="qd-tug">
          <span className="qd-tug-label">{d.key.replace(/_/g, ' ')}</span>
          <span className={`qd-tug-bar ${d.winner === 'tie' ? '' : d.winner === 'a' ? 'is-a' : 'is-b'}`}>
            <i style={{ background: BOARD_COLOR[a] }} />
            <i style={{ background: BOARD_COLOR[b] }} />
          </span>
          <span className="qd-tug-phrase">{d.winner === 'tie' ? 'even' : `${boardEval(d.winner === 'a' ? a : b).model_name}: ${d.phrase}`}</span>
        </div>
      ))}
      <p className="qd-tug-note">directions from 1–5 trait data — not magnitudes</p>
    </div>
  )
}

function DeckFallback() {
  const scenario = useScenario()
  return (
    <div className="qd-root qd-fallback">
      <header className="qd-top">
        <a className="qd-back" href="#/">← directions</a>
        <span className="qd-title">QUIVER DECK — flat tier (no WebGL)</span>
      </header>
      <div className="qd-tags" style={{ position: 'static', marginTop: 80 }}>
        {scenario.slots.map((id, i) => (
          <SlotTag key={id} id={id} index={i} />
        ))}
      </div>
      <p style={{ color: '#6d6353', padding: '0 24px', font: '500 13px Space Mono' }}>
        The full scenario (clamp / eject / deal) works from the tags above.
      </p>
    </div>
  )
}
