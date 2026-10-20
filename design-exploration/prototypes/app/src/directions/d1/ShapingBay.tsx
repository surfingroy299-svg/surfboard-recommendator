// Direction 01 — The Shaping Bay (warm · spatial · intuitive)
// Real-time 3D: R3F. Camera glides between designed stations; the user turns
// the board on the stand. The chalkboard (DOM) is the canonical accessible surface.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useScenario } from '../../shared/scenarioStore'
import { useAnnounce, useStaticMode } from '../../shared/a11y'
import { boardEval, recommendedStock, surfer, traitDeltas, UNCERTAINTY_NOTE } from '../../shared/mockData'
import { buildBlank } from './boardGeometry'
import { clampedDpr, hasWebGL } from '../../shared/perf'
import './bay.css'

type Station = 'stand' | 'deck' | 'tail' | 'rail' | 'rack' | 'compare'
const STATIONS: Record<Station, { pos: [number, number, number]; look: [number, number, number]; label: string }> = {
  rack: { pos: [-2.4, 2.0, 7.6], look: [-5.2, 1.5, 0], label: 'The rack' },
  stand: { pos: [1.8, 2.2, 8.0], look: [0.5, 1.05, 0], label: 'On the stand — ¾' },
  deck: { pos: [0.6, 6.2, 1.6], look: [0.6, 1.0, 0], label: 'Deck down' },
  tail: { pos: [4.4, 1.55, 2.6], look: [2.5, 1.05, 0], label: 'Tail, close' },
  rail: { pos: [0.6, 1.18, 5.2], look: [0.6, 1.05, 0], label: 'Rail profile' },
  compare: { pos: [1.0, 4.9, 8.8], look: [0.6, 0.85, -1.1], label: 'Two stands' },
}
const STATION_ORDER: Station[] = ['stand', 'deck', 'tail', 'rail']

const damp = THREE.MathUtils.damp

export default function ShapingBay() {
  const scenario = useScenario()
  const [station, setStation] = useState<Station>(() => (window.location.hash.includes('step=focus') ? 'stand' : 'rack'))
  const [hotspotNote, setHotspotNote] = useState<string | null>(null)
  const [intro, setIntro] = useState(() => !window.location.hash.includes('step='))
  const announce = useAnnounce()
  const reduced = useStaticMode()
  const webgl = useMemo(hasWebGL, [])

  const focusedId = scenario.focusId
  const compare = scenario.compareIds

  // Guided intro: Best Match to the stand, then hand over control.
  useEffect(() => {
    if (!intro) return
    const t = window.setTimeout(
      () => {
        scenario.focus('ci_g_skate')
        setStation('stand')
        announce('G Skate on the stand. Drag to turn the board; press V to change view.')
      },
      reduced ? 50 : 900,
    )
    const t2 = window.setTimeout(() => setIntro(false), reduced ? 100 : 4200)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const idx = ['1', '2', '3'].indexOf(e.key)
      if (idx >= 0 && scenario.slots[idx]) {
        scenario.focus(scenario.slots[idx])
        setStation('stand')
        setHotspotNote(null)
        announce(`${boardEval(scenario.slots[idx]).model_name} to the stand`)
      } else if (e.key === 'v' || e.key === 'V') {
        setStation((s) => {
          const i = STATION_ORDER.indexOf(s as Station)
          const next = STATION_ORDER[(i + 1) % STATION_ORDER.length]
          announce(STATIONS[next].label)
          return next
        })
      } else if ((e.key === 'c' || e.key === 'C') && focusedId) {
        const other = scenario.slots.find((s) => s !== focusedId)
        if (other) {
          scenario.startCompare(focusedId, other)
          setStation('compare')
          announce(`Comparing ${boardEval(focusedId).model_name} with ${boardEval(other).model_name}`)
        }
      } else if ((e.key === 'l' || e.key === 'L') && focusedId) {
        scenario.toggleLock(focusedId)
      } else if ((e.key === 'x' || e.key === 'X') && focusedId) {
        scenario.reject(focusedId)
        announce('Board carried out. A replacement is on the rack.')
      } else if (e.key === 'u' || e.key === 'U') {
        scenario.undo()
      } else if (e.key === 'r' || e.key === 'R') {
        setStation(focusedId ? 'stand' : 'rack')
        announce('Back to the bench')
      } else if (e.key === 'Escape') {
        if (compare) {
          scenario.endCompare()
          setStation('stand')
        } else {
          scenario.focus(null)
          setStation('rack')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scenario, focusedId, compare, announce])

  if (!webgl) return <BayFallback />

  return (
    <div className="bay-root">
      <div className="bay-canvas">
        <Canvas
          shadows
          dpr={clampedDpr()}
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [-2.2, 2.1, 6.4], fov: 42 }}
          onCreated={({ gl, scene, camera }) => {
            // capture hook: force one frame when rAF is suspended (hidden tab)
            ;(window as unknown as { __forceRender?: () => void }).__forceRender = () => gl.render(scene, camera)
          }}
        >
          <Suspense fallback={null}>
            <BayScene station={station} setStation={setStation} setHotspotNote={setHotspotNote} reduced={reduced} />
          </Suspense>
        </Canvas>
      </div>

      <header className="bay-top">
        <a href="#/" className="bay-back">← directions</a>
        <span className="bay-station">{compare ? STATIONS.compare.label : STATIONS[station].label}</span>
        <span className="bay-hint">{intro ? 'a moment — your best match first…' : 'drag the board to turn it · V changes view · R back to bench'}</span>
      </header>

      <RackPanel station={station} setStation={setStation} />
      <Chalkboard hotspotNote={hotspotNote} />

      <footer className="bay-foot">
        <span>1·2·3 to the stand · V view · C compare · L keep · X reject · U undo · R bench · Esc back</span>
        <span className="bay-honesty">blank is a sketch from real dims — rails &amp; rocker approximate · {UNCERTAINTY_NOTE}</span>
      </footer>
    </div>
  )
}

/* ---------- 3D scene ---------- */

function BayScene({
  station,
  setStation,
  setHotspotNote,
  reduced,
}: {
  station: Station
  setStation: (s: Station) => void
  setHotspotNote: (n: string | null) => void
  reduced: boolean
}) {
  const scenario = useScenario()
  const focusedId = scenario.focusId
  const compare = scenario.compareIds
  const activeStation: Station = compare ? 'compare' : station

  return (
    <>
      <CameraRig station={activeStation} reduced={reduced} />
      <fog attach="fog" args={['#14100c', 12, 24]} />
      <ambientLight intensity={0.38} color="#a8b4c4" />
      <directionalLight
        position={[3.4, 5.2, 3.0]}
        intensity={2.2}
        color="#ffd9a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[1.6, 4.4, 1.8]}
        angle={0.5}
        penumbra={0.7}
        intensity={90}
        decay={1.6}
        color="#ffc98c"
        target-position={[0.6, 1.0, 0]}
      />
      <Room />
      {scenario.slots.map((id, i) => (
        <BayBoard
          key={id}
          id={id}
          slot={i}
          focused={focusedId === id}
          comparePos={compare ? compare.indexOf(id) : -1}
          onSelect={() => {
            scenario.focus(id)
            setStation('stand')
          }}
          onHotspot={(note, st) => {
            setHotspotNote(note)
            if (st) setStation(st)
          }}
          reduced={reduced}
        />
      ))}
      <Stands compare={!!compare} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.32} scale={18} blur={3.2} far={3} color="#241a10" />
    </>
  )
}

function CameraRig({ station, reduced }: { station: Station; reduced: boolean }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3(...STATIONS.rack.look))
  useEffect(() => {
    if (!reduced) return
    const t = STATIONS[station]
    camera.position.set(...t.pos)
    look.current.set(...t.look)
    camera.lookAt(look.current)
  }, [camera, station, reduced])
  useFrame((_, rawDt) => {
    const dt = rawDt > 0 ? rawDt : 1 / 10
    const target = STATIONS[station]
    const lambda = reduced ? 50 : 2.6
    camera.position.x = damp(camera.position.x, target.pos[0], lambda, dt)
    camera.position.y = damp(camera.position.y, target.pos[1], lambda, dt)
    camera.position.z = damp(camera.position.z, target.pos[2], lambda, dt)
    look.current.x = damp(look.current.x, target.look[0], lambda, dt)
    look.current.y = damp(look.current.y, target.look[1], lambda, dt)
    look.current.z = damp(look.current.z, target.look[2], lambda, dt)
    camera.lookAt(look.current)
  })
  return null
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 22]} />
        <meshStandardMaterial color="#4f4234" roughness={0.95} />
      </mesh>
      <mesh position={[0, 4, -4.5]} receiveShadow>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#77603f" roughness={0.9} />
      </mesh>
      <mesh position={[-8, 4, 4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color="#b9a684" roughness={0.95} />
      </mesh>
    </group>
  )
}

function Stands({ compare }: { compare: boolean }) {
  const stand = (x: number, z: number, key: string) => (
    <group key={key} position={[x, 0, z]}>
      {[-1.6, 1.6].map((dx) => (
        <mesh key={dx} position={[dx, 0.5, 0]} castShadow>
          <boxGeometry args={[0.14, 1, 0.6]} />
          <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
  return (
    <>
      {stand(0.6, 0, 'a')}
      {compare && stand(0.6, -1.9, 'b')}
    </>
  )
}

const RACK_X = -6.6
const RACK_Z = [-2.4, -0.1, 2.2]

function BayBoard({
  id,
  slot,
  focused,
  comparePos,
  onSelect,
  onHotspot,
  reduced,
}: {
  id: string
  slot: number
  focused: boolean
  comparePos: number
  onSelect: () => void
  onHotspot: (note: string | null, station?: Station) => void
  reduced: boolean
}) {
  const group = useRef<THREE.Group>(null!)
  const stock = useMemo(() => recommendedStock(id), [id])
  const ev = boardEval(id)
  const geo = useMemo(
    () =>
      buildBlank({
        lengthFt: stock.length,
        widthIn: stock.width,
        thicknessIn: stock.thickness,
        category: ev.category === 'groveler' || ev.category === 'hybrid' ? ev.category : 'shortboard',
      }),
    [stock, ev.category],
  )
  const drag = useRef({ active: false, x: 0, y: 0 })
  const spin = useRef({ roll: 0, pitch: 0, targetRoll: 0, targetPitch: 0 })

  const onStand = focused || comparePos >= 0
  const target = useMemo(() => {
    if (comparePos >= 0) return { pos: new THREE.Vector3(0.6, 1.15, comparePos === 0 ? 0 : -2.2), rot: new THREE.Euler(0, 0, 0) }
    if (focused) return { pos: new THREE.Vector3(0.6, 1.15, 0), rot: new THREE.Euler(0, 0, 0) }
    // standing on the floor, leaning slightly on the wall
    return { pos: new THREE.Vector3(RACK_X, stock.length / 2 + 0.06, RACK_Z[slot]), rot: new THREE.Euler(0, 0.14, Math.PI / 2 - 0.1) }
  }, [focused, comparePos, slot, stock.length])

  useEffect(() => {
    if (!reduced) return
    const g = group.current
    g.position.copy(target.pos)
    const baseX = onStand ? spin.current.roll : target.rot.x
    g.rotation.set(onStand ? baseX : target.rot.x, target.rot.y + (onStand ? spin.current.pitch : 0), onStand ? 0 : target.rot.z)
  }, [reduced, target, onStand])
  useFrame((_, rawDt) => {
    const dt = rawDt > 0 ? rawDt : 1 / 10
    const g = group.current
    const lambda = reduced ? 50 : 3.2
    g.position.x = damp(g.position.x, target.pos.x, lambda, dt)
    g.position.y = damp(g.position.y, target.pos.y, lambda, dt)
    g.position.z = damp(g.position.z, target.pos.z, lambda, dt)
    // damped user spin only on the stand
    spin.current.roll = damp(spin.current.roll, spin.current.targetRoll, reduced ? 50 : 6, dt)
    spin.current.pitch = damp(spin.current.pitch, spin.current.targetPitch, reduced ? 50 : 6, dt)
    const baseX = onStand ? spin.current.roll : target.rot.x
    g.rotation.set(onStand ? baseX : target.rot.x, target.rot.y + (onStand ? spin.current.pitch : 0), onStand ? 0 : target.rot.z)
  })

  const hotspots: { local: [number, number, number]; label: string; note: string; station: Station }[] = focused && comparePos < 0
    ? [
        { local: [stock.length / 2 - 0.35, 0, 0.12], label: 'tail', note: ev.dimension_assessments.ride_feel_fit.note, station: 'tail' },
        { local: [0, stock.width / 24 + 0.06, 0], label: 'rail', note: ev.dimension_assessments.support_performance_fit.note, station: 'rail' },
        { local: [-stock.length / 2 + 0.4, 0, 0.14], label: 'nose', note: ev.dimension_assessments.condition_fit.note, station: 'deck' },
        { local: [0, 0, 0.16], label: 'size', note: ev.dimension_assessments.size_fit.note, station: 'deck' },
      ]
    : []

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation()
        if (!onStand) onSelect()
      }}
      onPointerDown={(e) => {
        if (!onStand) return
        e.stopPropagation()
        drag.current = { active: true, x: e.clientX, y: e.clientY }
        ;(e.target as Element).setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        const dx = e.clientX - drag.current.x
        const dy = e.clientY - drag.current.y
        drag.current.x = e.clientX
        drag.current.y = e.clientY
        spin.current.targetRoll += dx * 0.012
        spin.current.targetPitch = THREE.MathUtils.clamp(spin.current.targetPitch + dy * 0.006, -0.45, 0.45)
      }}
      onPointerUp={() => {
        drag.current.active = false
        // settle roll to the nearest face for legible rest state
        spin.current.targetRoll = Math.round(spin.current.targetRoll / (Math.PI / 2)) * (Math.PI / 2)
      }}
    >
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color="#f4f1e8" roughness={0.82} />
      </mesh>
      {/* pencil stringer */}
      <mesh position={[0, 0, (stock.thickness / 12) * 0.53]}>
        <boxGeometry args={[stock.length * 0.96, 0.012, 0.002]} />
        <meshBasicMaterial color="#9b8f76" />
      </mesh>
      {hotspots.map((h) => (
        <Html key={h.label} position={h.local} center distanceFactor={7}>
          <button
            className="bay-hotspot"
            onClick={(e) => {
              e.stopPropagation()
              onHotspot(`${h.label} — ${h.note}`, h.station)
            }}
            aria-label={`Inspect ${h.label}`}
          >
            {h.label}
          </button>
        </Html>
      ))}
    </group>
  )
}

/* ---------- DOM chrome ---------- */

function RackPanel({ setStation }: { station: Station; setStation: (s: Station) => void }) {
  const scenario = useScenario()
  return (
    <aside className="bay-rack">
      <div className="bay-rack-label">the rack</div>
      {scenario.slots.map((id, i) => {
        const ev = boardEval(id)
        const locked = scenario.locked.includes(id)
        const focused = scenario.focusId === id
        return (
          <div key={id} className={`bay-tag ${focused ? 'is-focus' : ''}`}>
            <button
              className="bay-tag-name"
              onClick={() => {
                scenario.focus(id)
                setStation('stand')
              }}
            >
              <em>{i + 1}</em> {ev.model_name}
            </button>
            <span className="bay-tag-role">{ev.role}</span>
            <span className="bay-tag-actions">
              <button className={`bay-check ${locked ? 'is-on' : ''}`} onClick={() => scenario.toggleLock(id)} aria-label={locked ? 'unlock' : 'keep'}>
                ✓
              </button>
              <button className="bay-cross" onClick={() => scenario.reject(id)} disabled={locked} aria-label="reject">
                ✕
              </button>
            </span>
          </div>
        )
      })}
      {scenario.lastSwap && (
        <div className="bay-swapnote">
          carried in: <strong>{boardEval(scenario.lastSwap.inId).model_name}</strong>
          <p>{scenario.lastSwap.reason}</p>
          <button onClick={scenario.undo}>bring the old one back</button>
        </div>
      )}
      {scenario.poolExhausted && <div className="bay-swapnote">No more alternatives in this exploration set.</div>}
    </aside>
  )
}

function Chalkboard({ hotspotNote }: { hotspotNote: string | null }) {
  const scenario = useScenario()
  const compare = scenario.compareIds
  if (compare) {
    const [a, b] = compare
    const deltas = traitDeltas(a, b)
    return (
      <aside className="bay-board">
        <div className="bay-board-title">
          {boardEval(a).model_name} · {boardEval(b).model_name}
        </div>
        {deltas.map((d) => (
          <div key={d.key} className="bay-delta">
            <span className="bay-delta-key">{d.key.replace(/_/g, ' ')}</span>
            <span>{d.winner === 'tie' ? 'even' : `${boardEval(d.winner === 'a' ? a : b).model_name} ${d.phrase}`}</span>
          </div>
        ))}
        <p className="bay-board-note">chalk reads of 1–5 trait data — direction, not magnitude</p>
        <button className="bay-exit" onClick={scenario.endCompare}>
          back to one stand (Esc)
        </button>
      </aside>
    )
  }
  const id = scenario.focusId
  if (!id) {
    return (
      <aside className="bay-board">
        <div className="bay-board-title">the bay</div>
        <p className="bay-board-why">
          Three boards, picked from your answers. Click one on the rack — or press 1, 2, 3 — and it comes to the stand.
        </p>
      </aside>
    )
  }
  const ev = boardEval(id)
  const pass = surfer.size_passes[ev.size_pass]
  return (
    <aside className="bay-board">
      <div className="bay-board-title">
        {ev.model_name} <span className="bay-board-role">{ev.role}</span>
      </div>
      <p className="bay-board-why">{ev.why}</p>
      <div className="bay-chalkline">
        <span className="bay-chalk-size">{ev.recommended_size.display}</span> · target {pass.target_volume.min}–{pass.target_volume.max} L
      </div>
      {ev.recommended_size.flag && <p className="bay-flagline">⚑ {ev.recommended_size.flag}</p>}
      <p className="bay-adv">+ {ev.advantage}</p>
      <p className="bay-trade">− {ev.tradeoff}</p>
      {hotspotNote && <p className="bay-hotspot-note">✎ {hotspotNote}</p>}
      {ev.data_gaps.length > 0 && <p className="bay-gaps">unknowns: {ev.data_gaps.join(', ')} — left blank, not guessed</p>}
    </aside>
  )
}

function BayFallback() {
  const scenario = useScenario()
  return (
    <div className="bay-root bay-fallback">
      <header className="bay-top">
        <a href="#/" className="bay-back">← directions</a>
        <span className="bay-station">The Shaping Bay — no-WebGL tier</span>
      </header>
      <div className="bay-fallback-body">
        <p>3D isn't available here; the chalkboard still works. Full scenario via the rack list:</p>
        <RackPanel station="rack" setStation={() => {}} />
        <Chalkboard hotspotNote={null} />
      </div>
    </div>
  )
}
