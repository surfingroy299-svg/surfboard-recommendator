# Direction 03 — Technical Model

Chosen after the experience definition.

- **Rendering:** React Three Fiber. Real-time 3D justified: spin-with-
  momentum-then-snap and mass/spring feedback are the experience; duotone
  boards need real silhouette rotation. Fixed camera (one dolly on focus) —
  zero camera controls.
- **Physics:** **no physics engine.** Rapier/cannon evaluated and declined:
  full simulation fights snap-to-face legibility and costs tuning time.
  Springs + momentum + snap implemented with spring animation
  (@react-spring/three) and simple velocity→face resolution. This is the
  fastest credible path to "feels physical, stays legible" (A1 guard).
- **Geometry:** same procedural loft approach as Direction 01 but styled flat
  (duotone material, no surface detail) — the honesty posture is *graphic*
  abstraction rather than 01's sketch-realism. Same fidelity gate: if the
  form reads weak, Blender-refined blank or licensed GLB (documented), still
  duotone-styled.
- **Animation:** @react-spring/three in-scene; face cards/tags via CSS
  transitions (motion lib not needed here — motion systems stay per-
  direction).
- **State:** neutral scenario store (shared contract); spin/face/clamp state
  local. Undo = scenario-store history (one step).
- **Performance:** DPR ≤ 2, three low-poly boards, one soft shadow blob each,
  frameloop demand at rest (post-settle), dispose on unmount.
- **Fallback ladder:** full → reduced (no shadows, stepped motion) → no-WebGL:
  flat SVG board pieces on the same court with stepped face swaps (the court
  is DOM already) → tags/cards alone (tier 4, scenario complete).
- **Real vs simulated:** real — dims, volumes, target bracket, trait values
  behind tug-of-war bars and delta tags; simulated — trait pairings,
  swap/refine selection + reasons (labeled PROTOTYPE ASSUMPTION,
  trait-grounded), face-card feel lines (labeled).
- **Production survival:** the lock/eject/replace state machine with reasons,
  undo pattern, tug-of-war qualitative comparison, and face-card content
  model port directly; springs and court styling are the direction's
  identity, kept if chosen.
