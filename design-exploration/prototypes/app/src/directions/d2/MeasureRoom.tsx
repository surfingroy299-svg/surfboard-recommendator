// Direction 02 — The Measure Room (calm · precise · controlled)
// Hybrid 2.5D: SVG silhouettes + CSS 3D plate layers. No WebGL by design.
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useScenario } from '../../shared/scenarioStore'
import { useAnnounce, useStaticMode } from '../../shared/a11y'
import { boardEval, surfer, traitDeltas, UNCERTAINTY_NOTE } from '../../shared/mockData'
import { outlineFor, widthInchesAt, SCALE } from './outlines'
import './measure.css'

type View = 'plan' | 'profile'

export default function MeasureRoom() {
  const { slots, focusId, compareIds, locked, lastSwap, poolExhausted, focus, startCompare, endCompare, toggleLock, reject, refine, undo } =
    useScenario()
  const [view, setView] = useState<View>('plan')
  const [rulerT, setRulerT] = useState(0.5)
  const announce = useAnnounce()
  const reduced = useStaticMode()

  const specs = useMemo(() => slots.map((id) => outlineFor(id)), [slots])
  const overlay = compareIds ? ([outlineFor(compareIds[0]), outlineFor(compareIds[1])] as const) : null

  // Keyboard: 1/2/3 select · V view · C compare · L lock · X reject · U undo · Esc back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const idx = ['1', '2', '3'].indexOf(e.key)
      if (idx >= 0 && slots[idx]) {
        focus(slots[idx])
        announce(`${boardEval(slots[idx]).model_name} in focus`)
      } else if (e.key === 'v' || e.key === 'V') {
        setView((v) => (v === 'plan' ? 'profile' : 'plan'))
        announce(view === 'plan' ? 'Profile view' : 'Plan view')
      } else if ((e.key === 'c' || e.key === 'C') && focusId) {
        const other = slots.find((s) => s !== focusId)
        if (other) {
          startCompare(focusId, other)
          announce(`Overlay: ${boardEval(focusId).model_name} over ${boardEval(other).model_name}`)
        }
      } else if ((e.key === 'l' || e.key === 'L') && focusId) {
        toggleLock(focusId)
        announce(locked.includes(focusId) ? 'Unlocked' : 'Locked — kept through replacements')
      } else if ((e.key === 'x' || e.key === 'X') && focusId) {
        reject(focusId)
      } else if (e.key === 'u' || e.key === 'U') {
        undo()
        announce('Restored previous set')
      } else if (e.key === 'Escape') {
        if (compareIds) endCompare()
        else focus(null)
        announce('Back to table')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slots, focusId, compareIds, locked, view, focus, startCompare, endCompare, toggleLock, reject, undo, announce])

  const flip = view === 'profile'
  const dur = reduced ? 0 : 0.42

  return (
    <div className="mr-root">
      <header className="mr-header">
        <a className="mr-back" href="#/">
          ← directions
        </a>
        <div className="mr-viewname">{compareIds ? 'OVERLAY' : view.toUpperCase()}</div>
        <div className="mr-context">
          Noa · 72&nbsp;kg · upper-intermediate · weak waves — target {activePass(specs, compareIds, focusId)}
        </div>
        <button className="mr-viewtab" onClick={() => setView((v) => (v === 'plan' ? 'profile' : 'plan'))}>
          view: {view === 'plan' ? 'plan ▸ profile' : 'profile ▸ plan'} (V)
        </button>
      </header>

      <div className="mr-stage">
        <motion.div
          className="mr-table"
          animate={{ rotateX: flip && !compareIds ? 28 : 12 }}
          transition={{ duration: dur, ease: 'easeOut' }}
        >
          {!compareIds && (
            <div className="mr-plates">
              {specs.map((spec, i) => {
                const ev = boardEval(spec.id)
                const isFocus = focusId === spec.id
                const isLocked = locked.includes(spec.id)
                return (
                  <motion.div
                    key={spec.id}
                    className={`mr-plate ${isFocus ? 'is-focus' : ''} ${focusId && !isFocus ? 'is-dim' : ''}`}
                    initial={reduced ? false : { x: 90, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: isFocus ? -22 : 0, scale: isFocus ? 1.03 : 1 }}
                    transition={{ duration: reduced ? 0 : 0.24, ease: 'easeOut', delay: reduced ? 0 : i * 0.06 }}
                    onClick={() => focus(isFocus ? null : spec.id)}
                  >
                    <PlateSvg spec={spec} view={view} rulerT={isFocus ? rulerT : null} />
                    <TitleBlock
                      id={spec.id}
                      expanded={isFocus}
                      locked={isLocked}
                      onLock={() => {
                        toggleLock(spec.id)
                        announce(isLocked ? 'Unlocked' : `${ev.model_name} locked`)
                      }}
                      onReject={() => reject(spec.id)}
                      onCompare={() => {
                        const other = slots.find((s) => s !== spec.id)
                        if (other) startCompare(spec.id, other)
                      }}
                      keyHint={`${i + 1}`}
                    />
                  </motion.div>
                )
              })}
            </div>
          )}

          {overlay && (
            <OverlayView a={overlay[0]} b={overlay[1]} rulerT={rulerT} onExit={endCompare} />
          )}
        </motion.div>

        {(focusId || compareIds) && (
          <div className="mr-ruler">
            <label>
              waterline ruler
              <input
                type="range"
                min={0.02}
                max={0.98}
                step={0.01}
                value={rulerT}
                onChange={(e) => setRulerT(Number(e.target.value))}
              />
            </label>
            <RulerReadout specs={overlay ? [...overlay] : specs.filter((s) => s.id === focusId)} t={rulerT} />
          </div>
        )}
      </div>

      <aside className="mr-drawer">
        <div className="mr-drawer-label">archive drawer — request slips</div>
        {[
          ['easier_paddling', 'easier paddling'],
          ['more_forgiving', 'more forgiving'],
          ['more_response', 'more response'],
        ].map(([chip, label]) => (
          <button key={chip} className="mr-slip" onClick={() => refine(chip)}>
            {label}
          </button>
        ))}
        <button className="mr-slip mr-slip-undo" onClick={undo}>
          restore previous
        </button>
        <AnimatePresence>
          {lastSwap && (
            <motion.div
              className="mr-revision"
              initial={{ opacity: 0, x: reduced ? 0 : 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mr-revision-title">REV — {boardEval(lastSwap.inId).model_name} in</div>
              <p>{lastSwap.reason}</p>
              <p className="mr-revision-out">replaced: {boardEval(lastSwap.outId).model_name}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {poolExhausted && <div className="mr-exhausted">Exploration pool is finite — no further alternative available.</div>}
      </aside>

      <footer className="mr-foot">
        <span className="mr-legend">
          — measured anchors&ensp;<span className="mr-legend-dash">- - profile &amp; curve fill: sketch from real dims, not a scan</span>
          &ensp;·&ensp;{UNCERTAINTY_NOTE}
        </span>
        <span className="mr-keys">1·2·3 select&ensp;V view&ensp;C overlay&ensp;L keep&ensp;X reject&ensp;U restore&ensp;Esc back</span>
      </footer>
    </div>
  )
}

function activePass(specs: ReturnType<typeof outlineFor>[], compareIds: [string, string] | null, focusId: string | null) {
  const id = compareIds?.[0] ?? focusId ?? specs[0]?.id
  if (!id) return ''
  const pass = surfer.size_passes[boardEval(id).size_pass]
  return `${pass.target_volume.min}–${pass.target_volume.max} L · ${pass.target_length.min_display}–${pass.target_length.max_display} (${boardEval(id).size_pass} pass)`
}

function PlateSvg({ spec, view, rulerT }: { spec: ReturnType<typeof outlineFor>; view: View; rulerT: number | null }) {
  const pad = 26
  const H = spec.px.W + pad * 2
  const vb = `${-pad} ${-H / 2} ${spec.px.L + pad * 2} ${H}`
  return (
    <svg className="mr-svg" viewBox={vb} style={{ width: spec.px.L + pad * 2 }} role="img" aria-label={`${spec.name} ${view} silhouette`}>
      {view === 'plan' ? (
        <>
          <path d={spec.path} className={`mr-outline ${spec.tailKnown ? '' : 'mr-outline-unknown-tail'}`} />
          {!spec.tailKnown && (
            <text x={spec.px.L - 4} y={-spec.px.W / 2 - 8} className="mr-gap-label" textAnchor="end">
              tail: unknown — drawn generic
            </text>
          )}
          <line x1={0} y1={0} x2={spec.px.L} y2={0} className="mr-stringer" />
        </>
      ) : (
        <path d={spec.profilePath} className="mr-profile" transform={`translate(0 ${spec.px.W / 4})`} />
      )}
      {rulerT != null && view === 'plan' && (
        <line
          x1={spec.px.L * rulerT}
          y1={-spec.px.W / 2 - 10}
          x2={spec.px.L * rulerT}
          y2={spec.px.W / 2 + 10}
          className="mr-rulerline"
        />
      )}
    </svg>
  )
}

function TitleBlock({
  id,
  expanded,
  locked,
  onLock,
  onReject,
  onCompare,
  keyHint,
}: {
  id: string
  expanded: boolean
  locked: boolean
  onLock: () => void
  onReject: () => void
  onCompare: () => void
  keyHint: string
}) {
  const ev = boardEval(id)
  const pass = surfer.size_passes[ev.size_pass]
  return (
    <div className={`mr-title ${expanded ? 'is-open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="mr-title-row">
        <span className="mr-key">{keyHint}</span>
        <span className="mr-name">{ev.model_name}</span>
        <span className="mr-role">{ev.role}</span>
        {locked && <span className="mr-stamp">KEEP</span>}
      </div>
      <div className="mr-why">{ev.why}</div>
      {expanded && (
        <div className="mr-detail">
          <div className="mr-dims">
            <span>{ev.recommended_size.display}</span>
            <VolumeMeter min={pass.target_volume.min} max={pass.target_volume.max} value={ev.recommended_size.volume_liters} />
          </div>
          {ev.recommended_size.flag && <div className="mr-flag">⚑ {ev.recommended_size.flag}</div>}
          <div className="mr-adv">+ {ev.advantage}</div>
          <div className="mr-trade">− {ev.tradeoff}</div>
          {ev.data_gaps.length > 0 && <div className="mr-gaps">unknowns: {ev.data_gaps.join(', ')} — not guessed</div>}
          <div className="mr-actions">
            <button onClick={onLock}>{locked ? 'unlock' : 'KEEP (L)'}</button>
            <button onClick={onCompare}>overlay (C)</button>
            <button className="mr-reject" onClick={onReject} disabled={locked}>
              reject (X)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function VolumeMeter({ min, max, value }: { min: number; max: number; value: number }) {
  const lo = min - 4
  const hi = max + 4
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100
  return (
    <span className="mr-meter" title={`target ${min}–${max} L`}>
      <span className="mr-meter-range" style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }} />
      <span className="mr-meter-mark" style={{ left: `${pct(value)}%` }} />
      <span className="mr-meter-label">
        {value} L in {min}–{max}
      </span>
    </span>
  )
}

function OverlayView({
  a,
  b,
  rulerT,
  onExit,
}: {
  a: ReturnType<typeof outlineFor>
  b: ReturnType<typeof outlineFor>
  rulerT: number
  onExit: () => void
}) {
  const deltas = traitDeltas(a.id, b.id)
  const pad = 30
  const W = Math.max(a.px.W, b.px.W) + pad * 2
  const L = Math.max(a.px.L, b.px.L) + pad * 2
  // tail datum alignment: translate so tails coincide at x = L - pad
  const tx = (spec: typeof a) => L - pad - spec.px.L
  return (
    <div className="mr-overlay">
      <svg className="mr-svg" viewBox={`0 ${-W / 2} ${L} ${W}`} style={{ width: L }} role="img" aria-label={`Overlay of ${a.name} and ${b.name}, tails aligned`}>
        <g transform={`translate(${tx(a)} 0)`}>
          <path d={a.path} className="mr-fill-a" />
        </g>
        <g transform={`translate(${tx(b)} 0)`}>
          <path d={b.path} className="mr-fill-b" />
        </g>
        <line x1={L - pad} y1={-W / 2} x2={L - pad} y2={W / 2} className="mr-datum" />
        <text x={L - pad + 4} y={W / 2 - 6} className="mr-gap-label">
          tail datum
        </text>
        <line x1={L * rulerT} y1={-W / 2} x2={L * rulerT} y2={W / 2} className="mr-rulerline" />
      </svg>
      <div className="mr-deltarail">
        <div className="mr-deltarail-head">
          <span className="mr-chip-a">{a.name}</span> over <span className="mr-chip-b">{b.name}</span>
          <button className="mr-unstack" onClick={onExit}>
            unstack (Esc)
          </button>
        </div>
        {deltas.map((d) => (
          <div key={d.key} className="mr-delta">
            <span className={`mr-delta-dir ${d.winner === 'tie' ? 'is-tie' : d.winner === 'a' ? 'is-a' : 'is-b'}`}>
              {d.winner === 'tie' ? '=' : d.winner === 'a' ? '◀' : '▶'}
            </span>
            <span className="mr-delta-key">{d.key.replace(/_/g, ' ')}</span>
            <span className="mr-delta-phrase">{d.winner === 'tie' ? 'even' : `${d.winner === 'a' ? a.name : b.name}: ${d.phrase}`}</span>
          </div>
        ))}
        <p className="mr-delta-note">Qualitative reads of 1–5 trait data — direction, not magnitude.</p>
      </div>
    </div>
  )
}

function RulerReadout({ specs, t }: { specs: ReturnType<typeof outlineFor>[]; t: number }) {
  return (
    <span className="mr-ruler-readout">
      {specs.map((s) => (
        <span key={s.id}>
          {s.name}: ≈{widthInchesAt(s, t).toFixed(1)}″ wide here
          {'  '}
        </span>
      ))}
      {specs.length === 2 && (
        <em>Δ {(Math.abs(widthInchesAt(specs[0], t) - widthInchesAt(specs[1], t))).toFixed(1)}″ — wider here means more glide, narrower means more bite (sketch-level read)</em>
      )}
    </span>
  )
}
