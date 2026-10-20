# Reference Research

Evidence methods used per entry: `LIVE-FETCH` (site content fetched and read),
`SEARCH-SYNTHESIS` (teardowns, case studies, official docs found via search —
the running experience itself was not driven), or both. No entry pretends to a
method it didn't use. Records follow the 9-field format from the brief.

Sources are linked inline; principle IDs (P1…P16) are consolidated in
`extracted-principles.md`.

---

## 1. Pocket Quiver — https://pocketquiver.com/ · LIVE-FETCH

- **Relevant interaction:** CAD-file → photo-realistic 3D/AR board presentation; "Compare List" for boards; distribution of board visuals to email/social/web.
- **Why it works:** Boards presented as *crafted physical objects* (photo-real renders from real shaping CAD), not product cards. The surf industry itself treats the board's form as the hero.
- **Extracted principle:** P1 (the board's physical form carries credibility — render form first, chrome second). Also: real board geometry originates in shaper CAD (AkuShaper integration) — credible geometry pipelines exist.
- **Application here:** Validates board-as-hero presentation; our product's difference is *decision support* — Pocket Quiver presents and markets, it does not advise. Our explanations layer is the differentiator, not the render.
- **Do not copy:** Manufacturer-centric framing (spec-first, spray customization); it serves shapers, not confused intermediates.
- **Usability risk:** Photo-real 3D without guidance still leaves an intermediate unable to choose — beauty ≠ decision value.
- **Complexity:** High for photo-real CAD rendering; not required for our prototypes.
- **Durability:** Durable product pattern (industry-standard board presentation), not a promo effect.

## 2. IKEA Kreativ — https://www.ikea.com/nl/en/home-design/ · LIVE-FETCH + SEARCH-SYNTHESIS

Sources: [IKEA IE: How does Kreativ work](https://www.ikea.com/ie/en/customer-service/knowledge/articles/b342c501-0026-4d07-gcd3-d359gcc5e0bf.html), [TechCrunch launch coverage](https://techcrunch.com/2022/06/22/ikea-rolls-out-an-ai-powered-interactive-design-experience-for-shoppers/), [New Atlas: erase feature](https://newatlas.com/around-the-home/ikea-kreativ-ai-room-design-app/), [House Digest explainer](https://www.housedigest.com/1491516/tiktok-ikea-kreativ-design-tool-explained/)

- **Relevant interaction:** Scan your room → AI erases existing furniture → place/move/rotate/swap catalog items in the emptied 3D scene; works on web and app; save/share designs.
- **Why it works:** Non-experts succeed because *the environment is theirs* (their room), objects snap plausibly, and destructive-feeling operations (erase sofa) are risk-free and reversible. Controls stay minimal; the scene is the interface.
- **Extracted principle:** P2 (objects primary, controls secondary — manipulate the thing, not a settings panel); P3 (risk-free reversibility invites experimentation).
- **Application here:** Board manipulation should feel like handling, not configuring. Reject/replace must feel as safe as IKEA's erase.
- **Do not copy:** Catalog breadth and open browsing — our product is explicitly curated, not a furniture aisle.
- **Usability risk:** Free 3D placement can degenerate into fiddling; IKEA constrains placement — we should constrain manipulation similarly (no free 6-DOF chaos).
- **Complexity:** Their scene reconstruction is out of scope; the *interaction posture* is cheap to adopt.
- **Durability:** Durable (deployed commerce tool, multi-year investment).

## 3. Bruno Simon portfolio — https://bruno-simon.com/ · LIVE-FETCH + SEARCH-SYNTHESIS

- **Relevant interaction:** Whole site is a drivable physics world (three.js + Rapier per its own credits); WASD/touch/gamepad input; achievements; interaction teaches itself in seconds ("drive around — don't break anything!").
- **Why it works:** Physicality creates *delight and agency*: momentum, collision, sound. The world teaches its own controls by immediate feedback rather than instructions. Playfulness gives visitors a reason to stay.
- **Extracted principle:** P4 (physical response — mass, spring, momentum — makes digital objects feel real and touchable); P5 (teach by doing: the first interaction should demonstrate the control model without text).
- **Application here:** Boards that respond with weight/spring when grabbed; a first-contact moment that teaches "you can grab the board."
- **Do not copy:** Navigation-as-obstacle. Driving to content is friction the moment the novelty fades — our user has a decision to make. Play must never gate information.
- **Usability risk:** Gimmick risk is the highest of all references; physics that fights precision (overshooting, knocking boards around) makes comparison *harder*.
- **Complexity:** High (physics engine, tuning); a constrained spring-response subset is cheap.
- **Durability:** As a portfolio: promotional. The underlying principle (physical feedback) is durable.

## 4. Coolors — https://coolors.co/ · LIVE-FETCH

- **Relevant interaction:** Spacebar regenerates the palette; locked colors survive regeneration; iteration is instant, keyboard-first, infinitely repeatable.
- **Why it works:** It collapses decision friction: you never reject a whole palette, only the parts you haven't committed to. Commitment is granular, iteration is free, and the loop is fast enough to feel like play.
- **Extracted principle:** P6 (lock what you love, regenerate the rest — granular commitment turns choice paralysis into iteration); P7 (iteration speed itself is a feature: sub-second response makes exploration addictive).
- **Application here:** This is the core model for Phase 12: lock boards, reject one, replace only that slot, with a stated reason for what changed. Our version must add *explained* replacement — Coolors regenerates randomly; we replace with reasons (trait-grounded).
- **Do not copy:** Random generation. Replacement must feel connected to recommendation logic or trust dies.
- **Usability risk:** If replacement options are few (small board pool), rapid iteration exposes the pool's limits; the prototype pool must handle ~3 replacement rounds gracefully.
- **Complexity:** Low — state management, not rendering.
- **Durability:** Durable (the tool's identity for a decade).

## 5. Porsche / Polestar car configurators · SEARCH-SYNTHESIS

Sources: [Porsche configurator](https://models.porsche.com/en-US/model-start), [Polestar configurator](https://www.polestar.com/us/configure/), [Ron Design Lab Porsche case study](https://rondesignlab.com/cases/porsche-911-tagra-4-configurator-ux-ui-design), [Smashing Magazine: Designing a Perfect Configurator UX](https://www.smashingmagazine.com/2018/02/designing-a-perfect-responsive-configurator/)

- **Relevant interaction:** High-fidelity product on stage; every selection updates the render instantly; camera moves via designed presets (exterior ¾, side, interior) rather than free orbit; configuration starts from presets, not blank slate.
- **Why it works:** Designed camera presets guarantee the product always looks intentional — the user can never frame the car badly. Instant visual response makes each choice feel consequential. Preset starting points respect that most users can't build from scratch.
- **Extracted principle:** P8 (curated camera presets > free orbit when comprehension matters; free orbit is a bonus, not the backbone); P9 (start from a strong default, refine from there — mirrors our product's curated 3-board start).
- **Application here:** Inspection views (deck/bottom/rail/tail) as designed camera presets; free-ish orbit only within constraints. The "recommended set as starting point" maps directly.
- **Do not copy:** Option overload (hundreds of choices) and price-ladder framing; our product deliberately narrows choice.
- **Usability risk:** Preset-only cameras can feel locked-down for users who want to "pick it up" — pair presets with constrained direct control.
- **Complexity:** Preset camera model is *simpler* to build well than free orbit.
- **Durability:** Durable (automotive standard for a decade+).

## 6. Game inventory & equipment comparison (The Division 2, ESO addons, RPG conventions) · SEARCH-SYNTHESIS

Sources: [Ubisoft: The Division 2 inventory update](https://www.ubisoft.com/en-us/game/the-division/the-division-2/news-updates/VK670n17Zt3ArJetV12j3/user-inventory-interface-in-episode-2), [ESO Harven's Item Stats Comparison](https://www.esoui.com/downloads/info1206-HarvensItemStatsComparison.html), [Game UI Database: Inventory](https://www.gameuidatabase.com/index.php?scrn=71)

- **Relevant interaction:** Hover/select an item → tooltip compares against *equipped* item; per-stat deltas with direction indicators (up/down arrows, green/red); upgrade markers visible at list level; comparison is always contextual (vs what you have), never abstract.
- **Why it works:** Comparison against a *reference point the player owns* answers the only question that matters: "is this better *for me, now*?" Deltas beat absolute values; direction beats magnitude.
- **Extracted principle:** P10 (compare relative to a personal reference — the surfer's current board or the locked board — not spec-vs-spec in a vacuum); P11 (show the *direction and meaning* of each difference, not raw numbers: "+easier paddling / −top-end response").
- **Application here:** Our tradeoff language maps perfectly: each board's dimension assessments are deltas against the surfer's needs; comparison mode can show per-trait direction indicators grounded in `performance_traits`.
- **Do not copy:** Dense stat-sheet aesthetics and color-only encoding (accessibility failure; our skill forbids color-only meaning).
- **Usability risk:** Gamified arrows can imply false precision — our traits are 1–5 coarse; deltas must read as qualitative ("more forgiving"), not numeric superiority.
- **Complexity:** Low — presentation pattern.
- **Durability:** Durable (genre convention for 20 years because it works).

## 7. Cord Surfboards 3D Shaping Bay — https://www.cordsurfboards.com/3d-shaping-bay · LIVE-FETCH

- **Relevant interaction:** Consumer-facing board builder powered by Shape3d: pick a starting model, adjust dims to taste, volume calculator as guidance, order directly.
- **Why it works:** Proves the "shaping bay" metaphor is *native to surf culture* and consumer-legible. Starting from a model (not blank) matches P9.
- **Extracted principle:** Reinforces P1/P9; adds P12 (volume guidance must accompany any dimension control — dims without interpretation are expert-only).
- **Application here:** Direct evidence that a shaping-bay/workshop metaphor reads as credible to surfers. Our product goes further: the *system* fills the interpretation gap Cord leaves to the user.
- **Do not copy:** Self-directed customization — our user explicitly cannot self-spec a board; that's the product's reason to exist.
- **Usability risk:** A builder UI pattern would contradict our guided-decision scope (no open configuration).
- **Complexity:** n/a (metaphor reference).
- **Durability:** Durable (running commerce tool).

## 8. Shaper CAD ecosystem: Shape3d / AkuShaper / BoardCAD · SEARCH-SYNTHESIS

Sources: [Shape3d](https://www.shape3d.com/), [Shape3d web viewer docs](https://www.shape3d.com/Manuals/MyBoardsUpload.aspx), [AkuShaper](https://akushaper.com/software), [BoardCAD](https://www.boardcad.com/)

- **Relevant interaction:** Professional board design: outline/profile/slice curve editing, cross-section study, 3D web viewers, STL/OBJ/IGES export.
- **Why it works:** The professional vocabulary of board form is *2D curves*: outline (top), rocker/foil (side), cross-sections (slices). Shapers reason in orthographic views, not perspective spins.
- **Extracted principle:** P13 (the most information-dense board comparisons are aligned orthographic silhouettes — outline overlay, rocker profile, section stack — which is also exactly what our data can honestly support from L/W/T + display curves).
- **Application here:** Grounds a "precision" direction: silhouette overlays and aligned profile views are the shaper-native comparison idiom. Also an asset pipeline note: AkuShaper exports STL/OBJ — a possible source of *real* board geometry if licensing permits.
- **Do not copy:** Expert CAD density (slice editors, control points) — our audience explicitly lacks this literacy.
- **Usability risk:** Orthographic views without interpretation are just more spec sheet; every silhouette needs a consequence sentence.
- **Complexity:** 2D curve rendering is low; honest curves require care (our rocker data is qualitative → approximations must be labeled).
- **Durability:** Durable (30 years of shaping software converge on these views).

## 9. Apple product-page scrollytelling (AirPods Pro et al.) · SEARCH-SYNTHESIS

Sources: [CSS-Tricks: Apple scroll animations](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/), [Awwwards: AirPods Pro scroll animation](https://www.awwwards.com/inspiration/product-scroll-triggered-animation-apple-airpods-pro), [Medium: recreating AirPods scroll](https://ankittrehan2000.medium.com/creating-scroll-animations-similar-to-apples-airpods-pro-page-bc5c1c0814df)

- **Relevant interaction:** Scroll position drives a pre-rendered image sequence of the product; text reveals sync to product states; user controls *pace*, author controls *framing*.
- **Why it works:** Authored cinematography with user-controlled tempo: every frame is art-directed, nothing can look bad, and the scroll affordance is universally understood — zero learning cost.
- **Extracted principle:** P14 (pre-rendered/authored sequences trade freedom for guaranteed quality and near-zero runtime cost — a legitimate high-fidelity alternative to real-time 3D); P15 (one universally-known input — scroll — can drive a rich spatial experience without teaching anything).
- **Application here:** Candidate technique for a controlled direction (authored board reveals, guaranteed lighting) and the strongest fallback-tier strategy (pre-rendered views when WebGL is absent).
- **Do not copy:** Pure linear narrative — our scenario needs nonlinear inspect/compare/replace loops; scrollytelling alone can't carry lock/replace.
- **Usability risk:** Scroll-hijacking is hostile when overdone; sequences are heavy assets.
- **Complexity:** Authoring cost high (needs rendered frames), runtime cost low.
- **Durability:** Durable (Apple has run this pattern for ~8 years).

## 10. React Three Fiber ecosystem (pmndrs examples, configurator tutorials) · SEARCH-SYNTHESIS

Sources: [R3F docs + examples](https://r3f.docs.pmnd.rs/getting-started/examples), [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber), [Wawa Sensei table configurator tutorial](https://wawasensei.dev/tuto/how-to-use-three-js-to-create-a-3D-product-configurator), [community configurator example](https://github.com/Madewill/3d-product-configurator)

- **Relevant interaction:** Established patterns: `Stage`/`Environment` for studio lighting, `OrbitControls` with constraints, GLTF product loading, React state ↔ scene sync, color/material configurators as the canonical demo genre.
- **Why it works:** The React reconciler makes UI-state-drives-scene trivial (our lock/replace/compare state is plain React state); drei ships the hard parts (soft shadows, environments, camera controls) at prototype speed.
- **Extracted principle:** P16 (synchronized DOM chrome + 3D scene from one state store is the technical backbone that makes explanation-annotated 3D feasible on prototype timelines).
- **Application here:** Strong candidate for directions needing real-time manipulation; the configurator-tutorial genre also warns us: default drei staging *looks like every R3F demo* — visual identity must come from deliberate art direction, not stock `Stage`.
- **Do not copy:** Stock demo aesthetics (gray studio void, default environment presets) — instant genericness.
- **Usability risk:** Free OrbitControls default (violates P8 unless constrained).
- **Complexity:** Low-to-medium for our scope.
- **Durability:** Durable (dominant React 3D stack, active ecosystem).

## 11. Sketchfab model inspection · SEARCH-SYNTHESIS

Source: [Sketchfab surfboard scan example](https://sketchfab.com/3d-models/3d-scan-of-surfboard-0c9d12ff7ef34c039a3a7f7d20b67397)

- **Relevant interaction:** Universal 3D viewer: orbit/zoom/pan, annotations pinned to model surface points that drive the camera when clicked, inspector for materials.
- **Why it works:** Numbered surface annotations are the cleanest known bridge between "look at this region" and "here's what it means" — click annotation → camera flies to the region → text appears in context.
- **Extracted principle:** Reinforces P8; adds the annotation-to-camera pattern as the canonical region-inspection mechanic (tail annotation → tail close-up + tail explanation).
- **Application here:** Direct model for Phase 11 board inspection: annotations on tail/rails/nose that drive camera presets and surface the relevant dimension assessment.
- **Do not copy:** Generic viewer chrome (fullscreen-widget feel); inspection should feel native to the product world.
- **Usability risk:** Annotation clutter at rest; show markers contextually, not permanently.
- **Complexity:** Low-medium (anchor 2D DOM to 3D positions — solved problem).
- **Durability:** Durable (the de-facto 3D sharing standard).

---

## Not reviewed / access notes

- **Bruno Simon**: the fetch returned genuine site content (controls, credits, sections) — but the *felt physics* is documented via its own descriptions and public teardowns, not driven firsthand in this session. Treated accordingly (no claims about feel beyond documented behavior).
- **IKEA Kreativ**: the NL landing page was nearly empty via fetch; all interaction detail comes from IKEA's own support articles and press coverage (linked above).
- **Porsche/Polestar**: configurators are JS-heavy; behavior documented from official pages' descriptions and case studies, not driven firsthand.
- No reference was screenshot-collected; records above are analysis, not a moodboard.
