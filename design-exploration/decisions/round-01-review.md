# Round 1 Review — Critical Redesign Plan (feeds Round 2)

Method: every direction driven live in the preview browser at 1440×900 (screenshots
+ scripted interactions + DOM/scene-graph probes). Store-level scenario walk
verified in D2 (steps 1–21 incl. reject→Fever with reason→undo). Findings are
graded against the quality gates.

## Engineering findings (fixed during Round 1 verification, documented)

1. **Inverted normals** in D1's lofted blank (board rendered dark slate) — winding
   flipped; foam-white restored.
2. **D3 camera never aimed** (R3F does not look-at automatically) — CameraAim added.
3. **@react-spring/three 10.1.2 froze its frame loop against fiber 9.6.1** (springs
   stuck at `from`, then total canvas paint death; peer ranges claim compatibility
   but behavior says otherwise in this environment). Removed; replaced with a
   ~20-line damped-spring integrator inside `useFrame`. Dependency to be
   uninstalled; logged in dependency-log.
4. **WebGL context exhaustion in the preview browser** under HMR churn (Context
   Lost → GPU wedge; survives reloads, cured by browser restart). Probe context
   now released via `WEBGL_lose_context`. Not an app bug; noted for reviewers.
5. **preserveDrawingBuffer** enabled on both canvases (screenshot capture).
6. **Coordinate-click race**: D2's plate elevation animation can move buttons
   between hit-test and dispatch of automated clicks — humans are fine, but
   Round 2 stabilizes interactive targets anyway (shorter elevation, no layout
   shift on the action row).

## Cross-direction critique

- **Scenario state leaks between directions** (lock made in D2 appears in D3).
  Each direction must demonstrate the scenario from a fresh state →
  `scenario.reset()` on direction entry (neutral launcher infra).
- All three data surfaces (chalkboard / title blocks / boarding passes) already
  show the honest artifacts (target brackets, ⚑ size flags, unknown-not-guessed)
  — the strongest shared trait of Round 1. Keep and sharpen.
- No direction yet has its **entry moment** working as designed (D1 intro exists
  but is cramped; D3's drop was cut with the spring bug; D2 has none).

## Direction 01 — The Shaping Bay

*Gate failures: visual quality (composition, board form), interaction (hotspot labels).*

1. **Board form reads "kayak"**: mid-body balloons, thickness dome exaggerated,
   nose taper weak. Geometry v2: straighter mid-chord, tauter tail curve, thinner
   dome, gentler rocker.
2. **Stand camera too close** — the board fills the frame edge-to-edge; no air.
   Pull the station back and drop FOV; the room should breathe around the board.
3. **Rack composition broken**: a giant vertical board overlaps the DOM rack
   panel; rack meshes must move deeper into the room and the panel out of their
   sightline.
4. Hotspot chips truncate ("NOS"); auto-width, and hide chips while dragging.
5. Lighting flat: single warm key reads generic. Art-direct: lamp pool
   (spotlight cone), dimmer cool fill, floor vignette, softer contact shadow.
6. Chalkboard reads well (Fraunces italic why-line is the direction's voice) —
   extend: hotspot note should land as a chalk line with a small ✎ animation.

## Direction 02 — The Measure Room

*Gate failures: creative quality (plates read as CARDS — anti-pattern A4/brief),
composition (dead space).*

1. **De-card the plates**: kill white card backgrounds/borders; silhouettes sit
   directly on the light-table as translucent film; title blocks become drafting
   title blocks (hairline rules) in the plate's corner.
2. **Composition**: table fills ~86% width; silhouettes +28% scale (shared scale
   constant); vertical dead bands removed.
3. **Ruler bug**: readout exceeded real max width (20.0″ on a 19.75″ board) —
   clamp interpolation to measured width; label the readout "≈" (sketch-level).
4. Overlay is the strongest moment (blend-multiply divergence works); add outline
   strokes above fills + per-region divergence phrasing tied to ruler position.
5. Profile view: boards need a shared baseline + thickness callout; currently
   floats unanchored.
6. Entry: plates should slide from the archive edge and settle (draft-precise,
   180–260ms), replacing the current pop-in.

## Direction 03 — The Quiver Deck

*Gate failures: visual quality (boards overflow slots; tail chamfer artifact),
layout collision (tags over board), missing entry drop.*

1. **Reframe**: camera up/back with margins; court rescaled so slots contain the
   boards with air; groove visible.
2. **Geometry v2**: rounded tail corners (no chamfer-corner artifact), softer
   nose, tighter bevel; visible cream deck inset (separate thin extrude) +
   painted stringer.
3. **Tags collide with the coral board** — move the boarding-pass column to the
   right edge; face card docks bottom-center when focused.
4. **Entry drop restored** via the integrator (stagger, thud-settle); swap-in
   slides along the groove from the left.
5. Face-off needs its stage: boards lift higher, tilt harder, tug-bars between
   them (DOM aligned to screen center), oversized delta tags.
6. Clamp affordance in-scene is invisible at rest — make the clamp a visible slot
   fixture (open/closed states), not only a conditional torus.

## Verdict

All three pass "walkable scenario" (Round-1 bar) and none passes the visual bar
yet — as expected at this stage. No direction is converging on another; the
palette-swap test holds (station camera vs view flips vs fixed camera; loft vs
vector vs extrude presentation). Round 2 is composition + form + de-carding +
entry moments, per the lists above.
