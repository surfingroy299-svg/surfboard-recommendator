# Direction 01 — Technical Model

Chosen *after* the experience definition (step 7 of the sequence).

- **Rendering:** React Three Fiber + drei. Real-time 3D is justified: raking
  light over form, damped physical rotation, and camera glides between
  stations are the experience. Camera = preset stations interpolated with
  damped tweens (no OrbitControls); board rotation = quaternion drag with
  damping + face snapping.
- **Geometry:** procedural board v1 — outline curve lofted from real
  length/width/thickness (`boards data/…/channel_islands.json`, cited in mock
  data), rounded rails, pencil stringer texture. Fidelity gate (visual bar
  adjustment): if the lofted blank reads as weak at Round 1 review, upgrade
  path is a Blender-refined generic blank or a licensed GLB (source + license
  documented in `decisions/dependency-log.md`); either remains labeled
  VISUAL APPROXIMATION and represents board *class*, never model-specific
  shape claims.
- **Lighting/staging:** one directional key (lamp) + soft ambient + drei
  ContactShadows; no Environment preset (anti-A4 — art-directed, not stock
  studio).
- **Animation:** camera/board = frame-loop damping (maath-style) — springs not
  required here; DOM chalk/notes = CSS transitions. This direction's motion
  system is its own (no sharing with 02/03).
- **State:** neutral shared scenario store (selection/lock/reject/compare —
  shared contract only); all visual/camera state local to this direction.
- **Performance:** DPR capped at 2, frameloop="demand" when idle, dispose on
  route unmount, single shadow map, no post-processing.
- **Fallback ladder:** WebGL2 full → reduced (no shadows, DPR 1) → no-WebGL:
  static pre-rendered station views (rendered from this scene during build)
  with the chalkboard fully functional → chalkboard + dimension table alone
  still answers the scenario (the chalkboard is real DOM, so tiers 3–4 keep
  lock/reject/replace working).
- **Real vs simulated:** real — board dims/volumes, target ranges, dimension
  assessments (hand-computed per matching rules); simulated — role
  assignment, replacement choice + reasons (labeled), region hotspot copy
  phrasing (labeled where beyond computed evidence).
- **Production survival:** the station-camera model, hotspot-annotation
  system, chalkboard-as-accessible-canonical-surface pattern, and the
  scenario state contract all port directly to a real R3F build fed by the
  live pipeline.
