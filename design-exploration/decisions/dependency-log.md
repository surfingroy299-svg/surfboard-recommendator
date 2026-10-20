# Dependency Log

## Consolidated proposal (pre-install, awaiting approval)

All dependencies live **only** in `design-exploration/prototypes/app/package.json`.
Nothing is installed globally or at repo root. Per-direction needs assessed
*after* experience definitions (see each `technical-model.md`).

| Dependency | Why | Directions | Temporary? | Main alternative considered |
|---|---|---|---|---|
| `vite`, `@vitejs/plugin-react` (dev) | scaffold + dev server, one workspace, three routes + launcher | all | prototype-only | Next.js — no SSR/file-routing need locally; heavier startup |
| `typescript`, `@types/react`, `@types/react-dom`, `@types/three` (dev) | typed prototypes | all | prototype-only | none (untyped rejected — mock-data contracts benefit from types) |
| `react`, `react-dom` | UI runtime; launcher; DOM chrome | all | survives | none serious for this team profile |
| `three` | 3D engine | 01, 03 | survivor candidate | Babylon.js — heavier, no React reconciler; declined after direction needs known |
| `@react-three/fiber` | React ↔ scene state sync (P16) | 01, 03 | survivor candidate | plain three — hand-rolled sync, slower |
| `@react-three/drei` | ContactShadows, text/billboard helpers, GLTF loading if asset upgrade triggers | 01, 03 | survivor candidate | hand-rolled staging — slower, no benefit |
| `@react-spring/three` | grab/spin/eject spring system | 03 | direction-scoped | Rapier physics — declined: fights snap-to-face legibility, tuning cost (see 03 technical-model) |
| `motion` | plate slides, table flip, SVG guide draw-ins | 02 | direction-scoped | CSS-only — possible but SVG path draw + orchestration is materially faster with motion |
| `zustand` | neutral scenario state contract (selection/lock/reject/replace/compare) shared per the visual-independence rule | all | survivor candidate | React context — acceptable fallback; zustand chosen for store-outside-tree access from R3F loops |

**Routing:** hash-based (no `react-router`) — launcher + three routes don't
justify a dependency.

## Evaluated and not included (with reasons, post-concept as required)

- **Spline** — no direction needs editor-composed scenes; both 3D directions
  are procedural-geometry + art-directed lighting. Would add hosted-asset
  workflow without payoff. (Was retained as candidate through research per
  the approved adjustment; declined now on direction needs.)
- **GSAP** — no authored multi-stage timelines in any direction (01's glides
  are damped tweens; 02 uses motion; 03 uses springs). Re-enters only via a
  new approval if a round proves a timeline need.
- **Rapier / cannon-es** — see Direction 03 technical model.
- **Babylon.js** — see table row for `three`.
- **Next.js** — see table row for `vite`.

## Asset-sourcing contingency (not a dependency)

If procedural board geometry fails the Round-1 visual bar in 01/03:
Blender-refined generic blank or a licensed Sketchfab GLB (license verified
and recorded here before use; labeled VISUAL APPROXIMATION / representative
class form, never model-specific shape truth). drei loads GLTF natively — no
new dependency required.

## Install events

- 2026-07-23: approved set installed in `prototypes/app/` (react 19.2.8,
  three 0.178.0, @react-three/fiber 9.6.1, @react-three/drei 10.7.7,
  @react-spring/three 10.1.2, motion 12.x, zustand 5.x, vite 6.x, TS 5.x).
- 2026-07-23: **@react-spring/three removed.** Its peer ranges claim fiber
  compatibility, but in practice its frame loop froze against fiber 9.6.1 /
  React 19.2.8 (springs stuck at `from`; canvas paint death after
  interpolated-prop use). Replaced by a ~25-line fixed-substep damped-spring
  integrator inside `useFrame` (QuiverDeck.tsx) — smaller, stable at any
  frame delta, and production-ownable. No other dependency changes; no new
  dependencies were added beyond the approved set.
