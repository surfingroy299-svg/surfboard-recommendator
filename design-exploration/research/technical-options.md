# Technical Options Survey

Per the approved plan adjustments: **nothing here is selected or rejected yet.**
This is the option landscape; per-direction selection happens after the
concept field (experience before technology), and the consolidated dependency
proposal follows direction definition.

## Rendering approaches

| Option | Strengths | Costs / risks | Likely fit |
|---|---|---|---|
| **React Three Fiber + drei (real-time 3D)** | React state ↔ scene sync (P16); drei ships lighting/shadows/controls; dominant ecosystem; procedural geometry easy | Stock-demo look without deliberate art direction (A4); WebGL a11y/fallback work is on us | Strong candidate for directions with free manipulation + synchronized explanation UI |
| **Plain three.js (no React layer)** | Full control, no reconciler overhead | Hand-rolled state sync; slower prototyping | Only if a direction needs unusual render control |
| **Babylon.js** | Batteries included (GUI, inspector), strong GLB support | Heavier; no React reconciler; duplicates R3F role | Fallback candidate if R3F hits a wall |
| **CSS 3D / DOM transforms** | Zero dependencies; crisp text/vector integration; trivially accessible | No real lighting/materials; perspective artifacts at extreme angles | Candidate for layered/2.5D directions |
| **SVG orthographic (2D vector)** | Perfectly crisp silhouettes; native to P13 (outline/rocker comparison); tiny; fully accessible | Not "3D" — depth must come from composition, motion, layering | Strong candidate for a precision direction; also the universal fallback tier |
| **Pre-rendered image/video sequences** | Guaranteed art direction (P14); near-zero runtime cost | Authoring pipeline (needs renders from somewhere); nonlinear interaction hard (A7) | Candidate for authored reveals + fallback assets |
| **Spline** | Fast spatial composition exploration; visual editor; embeds/exports | Hosted-asset workflow; export weight; data binding limited; license/runtime questions to verify before use | Candidate for *design-phase* composition studies; production embed needs scrutiny |
| **Hybrid DOM + canvas** | Each layer does what it's best at (vector UI + 3D object) | Two coordinate systems to bridge (solved: project 3D→2D anchors) | Likely in *any* 3D direction (annotations are DOM) |

## Geometry / asset strategy

| Option | Notes |
|---|---|
| **Procedural from real dims** | Outline (lathe/loft/extrude or SVG paths) driven by real L/W/T from `boards data/`. Honest by construction; label rocker/rails/foil as VISUAL APPROXIMATION. Starting point for all directions. |
| **GLB/GLTF sourced models** | Sketchfab hosts surfboard scans/models (licenses vary — verify per model, document source + license). Raises fidelity ceiling if procedural looks weak. Risk: a generic scanned board contradicts *specific* model identity (a scanned thruster is not a "Better Everyday") — may be honest only as a *class* representation, labeled. |
| **Shaper-CAD exports** | AkuShaper/Shape3d export STL/OBJ; real board files for our exact models are not publicly available — do not fabricate "official" geometry. If a generic file is used, label as representative form, not the model. |
| **Blender-prepared assets** | Justified if procedural quality fails the visual bar: sculpt a clean generic board form (or refine a licensed base), bake AO, export GLB. Time-boxed; documented. |
| **Pre-rendered stills** | Render the above from fixed angles for authored/fallback tiers. |

## Animation

| Option | Notes |
|---|---|
| **Motion (Framer Motion)** | DOM chrome, layout transitions, springs; `motion` values can drive CSS 3D. |
| **@react-spring/three or maath damping** | In-scene springs/lerp for R3F directions (grab response, camera glides). |
| **GSAP** | Timeline choreography if a direction needs authored multi-stage sequences; license OK for prototypes; only if proven necessary. |
| **CSS transitions/keyframes** | Enough for 2.5D layered directions. |

## State

| Option | Notes |
|---|---|
| **zustand** | Tiny store shared by DOM + scene; fits the neutral-state-contract sharing rule (scenario state only — no visual state shared across directions). |
| **React context/useState** | Enough if the scenario state stays small; zero deps. |

## Scaffold

| Option | Notes |
|---|---|
| **Vite + React + TS** | Fastest credible local workspace; one dev server, per-direction routes. |
| **Next.js** | SSR/file routing unneeded for local prototypes; heavier. Still a candidate if a direction benefits from its image pipeline (unlikely). |

## Fallback ladder (applies to every direction, per skill spatial-3d.md §9)

WebGL2 full → reduced (low DPR, no post) → **SVG/pre-rendered silhouette comparison** → text + dimension table. The SVG orthographic option above doubles as tier 3 for all directions — one reason not to dismiss 2D vector work as "not 3D enough."
