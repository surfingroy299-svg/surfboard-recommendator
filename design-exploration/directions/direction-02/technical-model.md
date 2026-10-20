# Direction 02 — Technical Model

Chosen after the experience definition.

- **Rendering:** hybrid 2.5D — SVG silhouettes and guides inside CSS
  3D-transformed plate layers. **No WebGL.** The table flip is one
  `rotateX`-family coordinated transform; plate lifts are translate+shadow.
  Silhouette paths are generated from real dims (length, width, nose/tail
  width where present, thickness) with class-typical curve interpolation —
  curve *shape* between measured points is VISUAL APPROXIMATION, encoded as
  the dashed sketch line style.
- **Why this tech:** the experience is orthographic truth + controlled depth;
  vector rendering is *more* faithful to it than WebGL (crisper lines, native
  a11y, zero fallback anxiety). Fastest credible by a wide margin. This also
  makes Direction 02 the living proof of the fallback tier all directions
  share.
- **Animation:** Motion (Framer Motion) for plate slides, flips, guide
  draw-ins (SVG path draw), delta band reveals. Motion system unique to this
  direction.
- **State:** the neutral scenario store (same contract as 01/03); view/ruler/
  overlay state local.
- **Performance:** trivial (vector + transforms); `will-change` discipline on
  plates; no canvas at all.
- **Fallback ladder:** effectively starts at tier 3 by construction; the only
  degradation is reduced motion (crossfades) and a no-CSS3D fallback (flat
  view switch). Tier 4 = the title blocks + supporting table, already present.
- **Real vs simulated:** real — outlines' measured anchor points, dims,
  volumes, target bracket, delta numbers at ruler stops (computed from stock
  dims); simulated — curve interpolation (labeled by line style + legend),
  revision reasons, refine slips (PROTOTYPE ASSUMPTION).
- **Production survival:** the silhouette generator, overlay/divergence
  renderer, consequence-sentence pattern, and delta-chip language all port
  directly; this direction's engine could also ship as the universal no-WebGL
  tier of whichever direction wins.
