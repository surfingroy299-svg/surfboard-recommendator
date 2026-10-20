# Design Exploration — Three Spatial Product Directions

Isolated creative exploration for the surfboard recommendator UI. Everything in
this directory is exploration output; **nothing outside `design-exploration/`
is modified by this work.** Protected product files (product definition,
onboarding, logic, board data) are read-only contracts.

## Honesty legend

Every artifact in this exploration labels its content:

| Label | Meaning |
|---|---|
| `REAL PRODUCT RULE` | Sourced from a protected product file; citation includes file + section |
| `MOCK` | Invented content for prototyping (e.g. a mock surfer), derived from documented structures |
| `VISUAL APPROXIMATION` | Geometry/rendering not supported by data precision (rocker, rails, concave, foil, volume distribution are always this unless verified data exists) |
| `PROTOTYPE ASSUMPTION` | Exploratory hypothesis with no product backing (e.g. agent-style copy, replacement heuristics) |

Length, width, thickness may inform simplified silhouettes. Volume is product
data but never determines rendered volume distribution. No hydrodynamic
accuracy is implied anywhere.

## Process constraints (approved plan + adjustments)

- Experience before technology: rendering/tech chosen **per direction, after**
  research and concept selection. No dependencies installed until the
  consolidated dependency proposal is approved.
- No premature tech rejections: Spline, Babylon.js, GLB/Blender, pre-rendered
  and hybrid 2.5D approaches remain candidates until direction needs are known.
- Visual independence: the three directions share only mock data, neutral
  state contracts, launcher/routing, and a11y/perf/fallback utilities. Tokens,
  color, typography, camera models, motion, scene composition, inspection and
  comparison patterns are built **independently per direction**.
- Visual bar: mock geometry may not excuse weak visuals; licensed assets are
  sourced if procedural quality is insufficient (sources documented).
- Screenshots land in `screenshots/`. No git commits unless explicitly asked.
- `--persist` (design skill) is never used during divergence.

## Running the prototypes

```bash
cd design-exploration/prototypes/app
npm install
npm run dev          # → http://localhost:5178
```

The launcher lists the three directions. One shared scenario (mock surfer
Noa + three boards) runs in all of them; each direction resets it on entry.

Review deep links (also used for the screenshot set):
`#/direction-01|02|03` with optional `?step=focus`, `?step=compare`,
`?step=swap`, and `&static=1` (settled states, no animation — also what
`prefers-reduced-motion` gets).

Keyboard (all directions): `1·2·3` select · `C` compare · `L` lock/keep ·
`X` reject · `U` undo · `Esc` back. D1 adds `V` (views) and `R` (bench);
D3 adds arrow keys (faces).

## Structure

```
research/      references, extracted principles, technical options
concepts/      10 concept seeds, scored; rejected concepts with reasons
directions/    per-direction concept, UX model, visual model, technical model, assessment
shared/        mock data (source-cited) + derivation math + the 21-step scenario
prototypes/    app/ — one Vite workspace: launcher + three isolated directions
decisions/     round reviews, dependency log, final review + final comparison
screenshots/   final key states (1440×900), one per direction state
```
