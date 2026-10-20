# Round 2 Review — changes made, and the Round-3 punch list

## Changes actually made in Round 2 (all verified by capture)

Cross-cutting
- Scenario resets on direction entry; `?step=focus|compare|swap` deep links
  added (review states + capture determinism).
- `@react-spring/three` removed (frame-loop freeze against fiber 9.6 — see
  dependency-log); D3 runs on a hand-rolled damped-spring integrator.
- Static mode added (`prefers-reduced-motion` OR hidden tab OR automated
  capture OR `static=1`): every direction snaps to settled states with no
  time-based animation. This is simultaneously the reduced-motion
  implementation and the deterministic-capture path.

Direction 01 — Shaping Bay
- Geometry v2: rounded plan nose, straighter mid-chord, tauter tail, thinner
  dome, halved rocker exaggeration.
- Composition: all six camera stations pulled back; rack boards stand on the
  floor leaning on the far wall (they used to pierce the floor); softer
  contact shadows.
- Art direction: lamp-pool spotlight + dim cool fill + darker floor — the
  workshop reads as a lit room, not a texture demo.
- Hotspot chips: pill-shaped, no truncation.

Direction 02 — Measure Room
- De-carded: plates are now film directly on the light-table with drafting
  title blocks (hairline rules) — the anti-card critique resolved.
- Shared scale +25%; table fills the stage; entry slide from the archive edge.
- Ruler readout clamped to real max width (the sketch may not overclaim) and
  marked ≈.

Direction 03 — Quiver Deck
- Geometry v2: rounded tail corners (chamfer artifact gone), cream deck inset
  + stringer (the duotone piece finally reads "surfboard"), softer nose.
- Court repainted to true scale mapping; camera reframed with margins.
- Boarding-pass tags moved to the right edge (no longer covering boards);
  face card docks bottom-center.
- Entry drop restored via the integrator; groove slide-in for dealt-in boards;
  clamp fixture renders on locked boards.

## Engineering findings this round (documented for reviewers)

- **Hidden-tab rAF suspension**: the embedded preview tab reports
  `visibilityState: hidden` with rAF fully stopped; R3F never completes init
  there. Verification moved to Chrome headless.
- **Virtual-time zero-delta**: under `--virtual-time-budget`, R3F reports
  `dt = 0` — the integrator now substitutes a nominal step and integrates in
  fixed substeps (≤1/120s), which also fixed a real numerical instability
  (boards oscillating through the floor at large deltas).
- Capture pipeline: Chrome headless + `?step=` + `static=1` produces
  deterministic key-state screenshots.

## Round-2 verdicts against the gates

- D1: metaphor and light now carry trust; comparison staging was still broken
  (boards overlapped along the camera axis) → Round 3.
- D2: strongest decision-support artifact (overlay + delta rail + ruler Δ all
  functional); overlay too small → Round 3.
- D3: the loop (clamp/eject/deal + reasons + undo) is the direction's promise
  and it works; face-off staging oversized → Round 3.
- Distinctiveness holds after palette-swap re-test: camera logic, arrangement,
  comparison mechanics, and rendering remain direction-specific.

## Round 3 punch list (executed)

1. D1 compare camera raised/lateral so both stands read (done, verified).
2. D1 hotspots hidden during compare (clutter) (done).
3. D2 overlay enlarged to min(760px, 58%) (done).
4. D3 face-off staging calmed (lower, deeper, wider) (done; still reads tall —
   noted honestly in the direction assessment).
5. D3 nose curve softened (done).
