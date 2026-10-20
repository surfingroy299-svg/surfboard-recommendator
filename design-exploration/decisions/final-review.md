# Final Review — Round 3 (design-director pass)

Round-3 changes (each verified by re-capture):
- **D1**: compare camera raised and lateralized — both stands and both blanks
  read under the lamp; hotspots suppressed in compare (clutter); station
  labels/pencil notes re-checked at 1440×900.
- **D2**: overlay stage enlarged (min(760px, 58%)); overlay + delta rail +
  ruler Δ verified together as the direction's signature frame.
- **D3**: face-off pose calmed (lower/deeper/wider), noses softened. Face-off
  still renders taller than the ideal frame — recorded as an open nit in the
  assessment rather than papered over.

## Quality-gate closing pass (summary)

- **Product value:** all three demonstrate the full 21-step scenario against
  the same source-cited mock data; explanations, advantages, tradeoffs, size
  flags and data-gap honesty are visible surfaces in each.
- **Interaction:** every action has a keyboard path; Esc always returns one
  level; undo exists in all three; mode/state is always labeled on screen
  (station name / view name / state chip).
- **Creative:** three distinct experiential territories survive the
  palette-swap test at the end as at the start (glide-camera workshop /
  no-camera instrument table / fixed-camera game table).
- **Visual:** each direction has its own committed system (Fraunces-warm /
  Space-Grotesk-drafting / Archivo-poster). D1's blank form and D3's face-off
  frame are the two weakest visual moments and are named in assessments.
- **Technical credibility:** DPR clamp, dispose-on-unmount (route-level),
  reduced-motion = static mode, no-WebGL fallbacks in both 3D directions,
  D2 needs none. The scenario store is the swap-in point for real pipeline
  data.
- **Honesty:** every prototype carries its approximation labels in the UI
  (sketch legend, "tail: unknown — drawn generic", "we don't guess",
  insufficient_data note, size flags per §12.3).

## Known limits stated plainly

- Pointer-drag gestures (D1 turn, D3 flick-spin) were exercised through their
  keyboard-equivalent state machines and code review in this session — not a
  physical pointer. The interactions are implemented and reviewable locally.
- The verification environment could not run live animation (hidden-tab rAF
  suspension); motion was reviewed via implementation + static endpoints, and
  timing values follow the per-direction motion specs. Animation feel should
  be judged in a normal browser (run instructions in README).
- D1's blank is sketch-grade at close range: a selected-direction build
  should trigger the documented GLB/Blender asset contingency.
- The board pool is 5 models (by design); ~3 replacement rounds exhaust it,
  and the prototype says so honestly when it happens.
