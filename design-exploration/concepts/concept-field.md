# Concept Field — 10 Seeds

Each seed states metaphor, spatial environment, camera model, board arrangement,
comparison method, interaction intensity, role of 3D, tone, and candidate tech.
Scored 1–5 against the ten criteria from the brief; scoring rationale noted
where non-obvious. Principles (P#) and anti-principles (A#) reference
`../research/extracted-principles.md`.

---

## S1 — The Shaping Bay
A shaper's workshop at golden hour. Three recommended boards wait on a wall
rack; pulling one onto the shaping stands puts it under a work lamp. The
recommendation reads as a *craftsman's walkthrough*: annotations appear as
pencil notes near the physical region they describe. Comparison = a second
stand. Camera glides between designed stations (P8); user manipulates the
board on the stand, never walks the room. Warm, trustworthy, tactile.
Tech candidates: real-time 3D (R3F), procedural board + GLB upgrade path.
- Decision value 5 · Explainability 5 (region-anchored evidence) · Clarity 4 ·
  Distinctiveness 4 · Feasibility 4 · Scalability 4 · Accessibility 3 (canvas —
  needs DOM mirror) · Performance 4 · Gimmick-resistance 4 (room dressing must
  stay functional) · Architecture fit 5

## S2 — The Measure Room
A quiet drafting archive: boards as layered translucent plates on a giant
light-table. Plan view (outline) and profile view (rocker, labeled
approximation) are first-class "views," not camera angles. Dimension guides
draw themselves with consequence sentences (P12). Comparison = drag one plate
over another → aligned overlay with divergence shading + qualitative delta
chips (P11, P13). Controlled, calm, precise; deliberately *minimal* 3D —
depth, layering and motion for orientation, orthographic truth for comparison.
Tech candidates: SVG + CSS-3D layering (no WebGL), Motion springs.
- Decision value 5 · Explainability 5 · Clarity 5 · Distinctiveness 4 ·
  Feasibility 5 · Scalability 4 · Accessibility 5 (all DOM/vector) ·
  Performance 5 · Gimmick-resistance 5 · Architecture fit 5

## S3 — The Lineup
Boards float upright in a glassy dawn lineup, seen from water level. The
surfer's own conditions (small weak waves, per profile) shape the environment;
choosing a board planes it forward. Beautiful contextual storytelling —
"in *your* waves."
Tech candidates: R3F + water/sky shaders.
- Decision value 3 (context story strong, comparison weak) · Explainability 3 ·
  Clarity 3 (water occludes half the board) · Distinctiveness 5 · Feasibility 2
  (credible water is expensive; cheap water is ugly) · Scalability 3 ·
  Accessibility 2 · Performance 2 · Gimmick-resistance 2 · Architecture fit 4

## S4 — The Quiver Deck
A bold, flat-color game table: three board slots, boards with springy mass
(P4). Grab to lift and snap-spin between faces; lock a slot with a mechanical
clamp; reject spring-ejects the board and the replacement slides in carrying a
"what changed" tag (P6/P7, A2 honored via trait-grounded reasons). Refine
chips ("more forgiving," "easier paddling") request directional alternatives.
Fixed camera; the *objects* move — Coolors made spatial. Playful, energetic.
Tech candidates: R3F + spring animation (no physics engine).
- Decision value 5 (the lock/replace loop IS the product loop) ·
  Explainability 4 · Clarity 4 (snap-after-fling constrains chaos) ·
  Distinctiveness 5 · Feasibility 4 · Scalability 4 · Accessibility 3 ·
  Performance 4 · Gimmick-resistance 3 (springs must serve iteration, A1) ·
  Architecture fit 5

## S5 — The Tradeoff Field
An abstract spatial field where axes are literal space: support ↔ performance,
weak ↔ powerful waves. Boards sit where their traits place them; distance =
difference. Moving through the field reveals what changes.
- Decision value 3 (spatializes tradeoffs but abstractly) · Explainability 2
  (the mapping itself needs explaining) · Clarity 2 · Distinctiveness 4 ·
  Feasibility 4 · Scalability 3 · Accessibility 3 · Performance 4 ·
  Gimmick-resistance 3 · Architecture fit 2 — **implies system re-ranking and
  positional precision our signals don't support (fake-precision risk)**

## S6 — The Wave Section
A frozen translucent wave cross-section as theater: each board hovers at the
part of the wave where it excels (groveler in the mush, step-up at the peak).
- Decision value 3 · Explainability 4 on conditions, 1 on the rest ·
  Clarity 3 · Distinctiveness 5 · Feasibility 2 · Scalability 2 ·
  Accessibility 2 · Performance 3 · Gimmick-resistance 2 · Architecture fit 2 —
  **placing boards *on the wave* asserts hydrodynamic performance claims the
  data cannot back (violates the no-fake-product-truth rule at the level of
  the core metaphor)**

## S7 — The X-Ray Table
A single lightbox: boards stack as translucent layers, silhouette divergence
auto-highlighted. Pure comparison machine.
- Decision value 4 (comparison only — no presence/role/why layer) ·
  Explainability 3 · Clarity 4 · Distinctiveness 3 (subset of S2) ·
  Feasibility 5 · Scalability 3 · Accessibility 5 · Performance 5 ·
  Gimmick-resistance 5 · Architecture fit 4 — **absorbed into S2 as its
  overlay-comparison mode rather than standing alone**

## S8 — The Turntable Gallery
Three spotlit turntables in a dark void; synchronized rotation; select brings
one to center stage.
- Decision value 3 · Explainability 3 · Clarity 4 · Distinctiveness 1 (**the
  default 3D product-viewer, A4 embodied**) · Feasibility 5 · Scalability 4 ·
  Accessibility 3 · Performance 4 · Gimmick-resistance 4 · Architecture fit 4

## S9 — The Shaper's Walkthrough
Authored, step-driven cinematic: the system walks the user through each board
like a shaper talking — camera moves to the tail as the tail is explained
(P14/P15) — then hands over free inspection.
- Decision value 4 · Explainability 5 (authored narrative is the explanation) ·
  Clarity 5 · Distinctiveness 3 · Feasibility 4 · Scalability 3 ·
  Accessibility 4 · Performance 4 · Gimmick-resistance 4 · Architecture fit 4 —
  **linear spine cannot carry the nonlinear lock/replace loop (A7); harvested
  as the *guided-intro moment* inside S1 instead of standing alone**

## S10 — The Gear Locker
Gaming-inventory homage: boards in equipment slots, stat-delta chips, compare
tooltips (P10/P11).
- Decision value 4 · Explainability 3 · Clarity 5 · Distinctiveness 2 (**slots +
  chips + tooltips = cards + dashboard in costume; boards are icons, not the
  interface**) · Feasibility 5 · Scalability 4 · Accessibility 4 ·
  Performance 5 · Gimmick-resistance 3 · Architecture fit 4 — delta-chip
  language harvested into S2/S4 comparison patterns

---

## Selection

Totals (of 50): S2 **48** · S1 **42** · S4 **41** · S9 39 · S7 41* (subset) ·
S10 39 · S8 35 · S3 28 · S5 28 · S6 24. (*S7 scores well but is a mode, not a
direction.)

Selected three, spanning the mandated behavioral territories:

| Direction | Seed | Territory |
|---|---|---|
| **01 — The Shaping Bay** | S1 (+S9's guided intro) | Warm, spatial, intuitive |
| **02 — The Measure Room** | S2 (+S7 overlay, +S10 delta chips) | Calm, precise, controlled |
| **03 — The Quiver Deck** | S4 (+S10 delta language) | Playful, energetic, experimental |

Distance check (behavioral, pre-palette-swap): camera logic — gliding station
presets (01) vs. no camera/view flips (02) vs. fixed camera + moving objects
(03). Arrangement — rack & stands vs. layered plates vs. slots. Comparison —
side-by-side raking light vs. aligned overlay + divergence shading vs.
face-off with oversized deltas. Interaction rhythm — slow deliberate vs.
precise instrumental vs. springy rapid. Rendering — full real-time 3D vs.
no-WebGL 2.5D vector vs. real-time 3D with spring physics. Palette-swapping
any two cannot make them read as the same product.
