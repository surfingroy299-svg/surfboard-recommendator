# Interactive Surfboard Comparison Experience

## 1. Purpose

This document defines the UX specification for the portfolio prototype of the surfboard recommendation product.

The experience is designed to help an intermediate surfer move from a curated recommendation set to a confident choice between a small number of boards. The comparison is not the end product by itself. Its role is to help the user understand meaningful differences, inspect a specific board in depth, and decide whether to take a next step with that board.

The core product principle remains explainability over automation. The user should understand what each board is, how it differs from the alternatives, and what choosing it would mean for them.

This prototype intentionally goes beyond the original V1 scope in a few areas, including interactive comparison, simulated store availability, saving, AI-assisted board questions, and store actions. These are portfolio vision features, not claims about the original production scope.

---

## 2. Product Goal

Help an intermediate surfer answer three questions:

1. What are the meaningful differences between these recommended boards?
2. Which board feels most relevant to me?
3. What would I gain and give up if I chose that board?

The experience should reduce decision anxiety without creating endless exploration.

The user is not expected to browse a large catalog. The system presents three qualified recommendations and gives the user enough understanding to choose which one deserves deeper attention.

---

## 3. Demo Scenario

The portfolio prototype uses one fixed surfer profile and one fixed recommendation outcome.

### Demo surfer

**Daniel, 28 · Israel**

- 180 cm
- 80 kg
- Intermediate
- Surfs approximately 2 to 3 times per week when conditions allow
- Good general fitness
- Current board: 6'2" × 20 1/2" × 2 5/8", approximately 35L, EPS
- Current board is stable, wide, forgiving, and was purchased when Daniel was less skilled
- Main frustration: the current board feels heavy and sluggish through turns
- Progression goal: quicker direction changes, stronger and more precise turns, and a lighter feeling underfoot
- Constraint: Daniel does not want an unforgiving high-performance shortboard
- Wave catching: competent, but not dominant in crowded peaks
- Typical conditions: Israeli surf, approximately 1 to 3 ft
- Progression preference: balanced
- Long-term intention: one main board that can stay relevant for approximately 2 to 3 years
- Old 35L board remains available for very small days

### Recommendation behavior

The system has already completed sizing before the comparison experience begins.

Each recommendation is a specific combination of:

- model
- size
- construction
- store

The user does not select a size inside the comparison experience.

The final three board models are not locked by this specification. UX implementation should support Board A, Board B, and Board C placeholders until the final models are selected.

---

## 4. Experience Entry

The comparison experience follows the onboarding and a short interpretation step.

### High-level flow

`Onboarding → Profile Interpretation → Find My Boards → Interactive Comparison`

The onboarding captures the surfer's real experience rather than requiring technical surfboard knowledge. It collects signals such as current setup, current board feel, pain points, goals, environment, skill, height, and weight.

### Profile Interpretation

Before showing recommendations, the system displays a concise interpretation of what it understood.

Example structure:

**Here’s what we understood about you**

- You’re ready to size down
- You want performance, not punishment
- You need one board for most days
- Your target zone: system-calculated length and volume range

Actions:

- Secondary: `Revise my profile`
- Primary: `Find my boards`

The comparison should not repeatedly justify why the shortlist exists. The Profile Interpretation screen carries most of that responsibility.

---

## 5. Core Interaction Model

The experience is defined around three comparison states:

1. `Overview`
2. `Shape`
3. `Tail & Fins`

The **current implementation phase** should treat these as three separate, fully designed screens. The goal is to validate information hierarchy, composition, board imagery, annotations, hover behavior, Inspect, and the overall visual system before investing in the continuous 3D transition.

### Phase 1: Separate State Screens

For the first build:

- each state is implemented as a separate stable screen or section
- board visuals use high-quality supplied product images with backgrounds removed
- image scale, crop, shadow, and positioning should be controlled so the boards feel dimensional rather than pasted into the layout
- the three screens should share the same header, navigation, interaction language, board order, and content system
- no scroll-linked board transformation is required yet
- the UX should be designed so that the later 3D version can replace the board imagery without requiring a redesign of the information architecture

### Phase 2: Continuous 3D Experience

Once accurate production-quality 3D board models are available, the three stable screens become keyframes inside one continuous scroll-driven comparison experience.

The same three live 3D board objects should then persist throughout the experience while scroll controls properties such as:

- position
- rotation
- scale
- camera framing where necessary

The user should visibly see the boards travel and rotate from one state into the next.

The long-term target is true 3D transformation, not screenshot crossfades. Phase 1 is an intentional prototyping step, not the final interaction model.

---

## 6. State Transition Behavior

### Current build

The initial prototype does **not** need scroll-driven transformation between states.

`Overview`, `Shape`, and `Tail & Fins` are built first as separate stable screens. The user can move between them using the top navigation or straightforward section navigation.

The purpose of this phase is to make each state visually convincing and interaction-ready using image assets before solving the 3D motion system.

### Future 3D build

When accurate 3D assets are available, the three screens become scroll keyframes inside one continuous experience.

The intended future behavior is:

- scroll progress directly controls board transformations
- the boards remain visible during the transition
- scrolling upward reverses the same transformation
- if the user stops between stable states, the experience gently settles toward the nearest relevant state
- the settling behavior should feel like a soft magnetic anchor, not aggressive scroll hijacking

Example:

`Overview 0% → transition → Shape 100%`

If the user stops near 70%, the experience should gently complete toward Shape.

If the user stops near 25%, the experience should gently return toward Overview.

Supporting labels and annotations may fade or slide during the future transition, but the surfboards themselves should ultimately move as live 3D objects.

---

## 7. Top Navigation

The comparison uses a small persistent top navigation element.

### Navigation content

- `Overview`
- `Shape`
- `Tail & Fins`

The current state is visibly highlighted.

Clicking a state moves the user to the corresponding comparison screen. In the future 3D version, the same control will jump to the matching scroll keyframe.

### Additional header context

The same top area may also contain:

- small Daniel profile reference
- country
- Back action

Example:

`Daniel · Intermediate · Israel`

The header should feel compact and lightweight. It is orientation and context, not an application dashboard.

---

## 8. Board Interaction States

There is no permanent default active board.

All three recommendations have equal recommendation status.

The system must not imply that one board is the winner simply because of layout hierarchy.

### Interaction model

`Default → Focus → Inspect`

### Default

- All three boards have equal recommendation status.
- No board is visually labeled as Best Match, #1, Winner, or similar.
- Natural differences in board proportions are preserved.

### Focus

Focus is temporary and triggered by pointer hover on desktop.

Possible visual behavior:

- focused board increases slightly in prominence or scale
- associated information becomes stronger
- other boards reduce slightly in visual weight
- surrounding elements may make limited space for the focused board

When pointer focus ends, the experience returns to the neutral three-board state.

Focus must not be required to access essential information.

### Inspect

Clicking a board opens the fullscreen Inspect overlay for that board.

This interaction is available from all three comparison states.

---

## 9. State 01: Overview

### Objective

Allow the user to understand the three recommendations quickly and compare their overall riding characteristics.

### Board composition

Three surfboards are presented vertically, side by side, using high-quality product imagery in the current build.

The supplied images should be cut out cleanly and treated consistently with controlled scale, spacing, and subtle shadow so they read as physical objects rather than flat ecommerce thumbnails.

No board has a permanent dominant center hierarchy.

Each board column contains:

- board model name
- selected dimensions
- construction
- four relative riding characteristics
- very short descriptive microcopy
- store availability reference may be shown lightly if useful, but deep store actions remain in Inspect

### Comparison characteristics

Exactly four characteristics are shown:

1. `Wave Catching`
2. `Stability`
3. `Responsiveness`
4. `Speed Generation`

### Scale behavior

Characteristics use a shared **qualitative relative scale**, not numeric ratings.

Do not display values such as:

- 7/10
- 8.2
- 82%

The scale should make differences visually understandable without implying false measurement precision.

Example direction:

`Low ━━━━━●━━ High`

Each characteristic includes extremely short explanatory copy, ideally around 3 to 6 words.

Examples:

- `Quick rail-to-rail response`
- `Easy speed in weak surf`
- `Stable through turns`

### Content rule

Overview content describes the **board itself**, not a personalized claim about Daniel.

Preferred:

`Carries speed well through weaker sections.`

Avoid:

`This will help you surf weak waves better.`

The purpose is to establish board character and meaningful differences using information that can be grounded in reliable board data.

---

## 10. State 02: Shape

### Objective

Teach the user how important board geometry differs between the three recommendations without requiring technical prior knowledge.

### Board composition

In the current build, the three boards are shown as a dedicated side-profile screen using supplied side-view assets or the closest available high-quality imagery.

Boards are stacked vertically, nose pointing consistently in the same direction.

In the future 3D version, this screen becomes the Shape keyframe that the live board objects rotate into from Overview.

### Primary geometry callouts

The prototype focuses on two geometry concepts.

#### Nose Rocker

The interface should visually identify the actual rocker region rather than merely placing a label nearby.

The annotation should:

- identify where the relevant rocker begins and ends
- visually wrap or bracket the area
- place the label close to the actual geometry
- use simple qualitative language first
- explain the expected riding implication briefly

#### Max Thickness

The system should mark the actual thickest point of the board profile.

The annotation should:

- identify the exact position of maximum thickness
- show its value or qualitative descriptor
- make the fore/aft position visually understandable
- add a short plain-language riding implication

### Educational principle

Every technical term should connect three things:

`Term → visible geometry → riding consequence`

The user should not need existing surfboard design knowledge to understand what is being shown.

### Optional enhancement

Hovering a board or specific geometry region may reveal an enlarged close-up view.

This is an enhancement, not a dependency of the core flow.

---

## 11. State 03: Tail & Fins

### Objective

Show two highly visible design choices together: tail shape and fin setup.

### Board composition

In the current build, the three boards are shown in a dedicated bottom/tail composition using supplied product imagery or prepared close-up crops.

Tail areas should be shown at a comparable visual scale whenever possible.

In the future 3D version, this screen becomes the Tail & Fins keyframe that the live board objects rotate and reframe into from Shape.

### Information shown per board

- tail type
- fin setup
- one short plain-language explanation for each or a combined concise explanation

Example categories may include:

Tail:

- Squash
- Swallow
- Round

Fin setup:

- Twin
- Thruster
- Five-fin configuration where relevant

### Content rule

This state continues to describe board behavior generally rather than making individualized claims about Daniel.

---

## 12. End of One-Pager

The comparison experience does not require a final conversion screen.

After `Tail & Fins`, the page can simply end.

A lightweight future-facing action such as `Browse more boards` may appear at the end, but browsing or replacement is not part of the current prototype scope.

---

## 13. Browse and Replace Scope

`Browse Boards` and `Replace Board` are explicitly out of the current build scope.

The prototype intentionally limits the user to three recommendations.

This can be defended as a product decision for intermediate surfers: the system reduces choice overload rather than handing the user an open catalog.

The architecture should not prevent future addition of browsing, replacing, or restarting recommendations, but none of those flows need to be implemented now.

---

## 14. Inspect Overlay

### Purpose

Inspect is the deep-dive experience for one board.

Comparison answers:

`How are these boards different?`

Inspect answers:

`What would choosing this board mean for me?`

### Overlay behavior

Inspect opens as a near-fullscreen or fullscreen overlay.

It must be visually obvious that it is a layer over the comparison rather than a new page.

Opening Inspect must not:

- navigate to another route
- reset scroll position
- reset the underlying comparison visual state
- reposition the underlying boards

While Inspect is open:

- the comparison background is visually de-emphasized
- the underlying comparison state remains preserved
- background page scrolling is locked

Closing Inspect through `X` or `Esc` returns the user to the exact comparison state and scroll position they left.

### Single-board rule

Inspect focuses on one board only.

There is no previous/next board navigation inside Inspect.

To inspect another board, the user closes Inspect, returns to Comparison, and chooses another board.

This preserves the distinction between comparison and deep inspection.

---

## 15. Inspect Content Structure

Inspect should deliver clearly different value from Overview.

The four comparison scales are intentionally not repeated in the current version.

### A. Board Hero / Future Interactive 3D

The selected board becomes the visual hero.

For the current image-based build:

- use the highest-quality supplied board image available
- preserve a clean cutout and controlled shadow
- allow image zoom if useful
- do not simulate fake 3D rotation from insufficient image data

For the future 3D build, this exact area becomes the primary free-manipulation surface where the user can:

- rotate
- zoom
- inspect the board freely

The current Inspect layout should therefore reserve enough visual space for a later live 3D replacement without restructuring the screen.

### B. Elevated Dimensions and Specifications

Dimensions should not repeat the small plain-text treatment used in Overview.

They should be more deliberately presented through structured visual units such as spec cards or labeled information blocks.

Possible fields:

- Length
- Width
- Thickness
- Volume
- Construction
- Tail
- Fin setup

Exact visual treatment is a UI decision, but the information should feel easier to scan and more premium than the Overview metadata.

### C. Curated Insight Tags

Inspect includes approximately 2 to 3 short insight tags.

Examples:

- `Extra forgiving`
- `Quick rail response`
- `Strong weak-wave speed`
- `Easy transition down`
- `Stable through turns`

These tags are selected using both:

- real characteristics of the board
- relevance to Daniel's specific needs

However, the interface does not need to explicitly announce that the tags are personalized.

The user should simply feel that the most relevant characteristics are being surfaced.

Tags should usually be 2 to 4 words.

### D. Personalized Explanation

The deeper written explanation is structured, not a single editorial paragraph.

Use three short blocks:

#### Why it fits you

Explain why this board is relevant to Daniel's profile, goals, conditions, and progression direction.

#### What you'll notice

Explain what Daniel is likely to feel differently compared with his current board.

#### Trade-off

Explain what is sacrificed or where this board is less favorable.

The tone should be confident but avoid unsupported certainty.

---

## 16. Content Responsibility: Comparison vs Inspect

This distinction is critical.

### Comparison content

Describes the board.

It should answer:

- What kind of board is this?
- What does it tend to do?
- How does it differ from the other two?

Claims should be grounded in manufacturer information, board specifications, and reliable board data wherever possible.

### Inspect content

Interprets the board relative to the surfer.

It should answer:

- Why is this relevant to me?
- What will feel different from my current board?
- What am I gaining?
- What am I giving up?

This separation prevents the interface from making premature personalized claims during high-level comparison.

---

## 17. Contextual AI Chat

### Role

The AI assistant supports questions that are too specific or contextual to fit comfortably into static board information.

Example questions:

- `Would this still work for me on slightly bigger winter days?`
- `How difficult would the transition from my current board be?`
- `Would this be too loose for the kind of turns I am learning?`

### Context behavior

Inside Inspect, the chat automatically receives context for:

- Daniel's surfer profile
- current board
- typical conditions
- goals and pain points
- the specific board currently being inspected

The user should not need to repeatedly name the board.

The UI should make this context visible enough to build trust, for example:

`Ask about this board`

or

`Context: [Board Model + Size]`

### Interaction model

The chat is not permanently open.

Desktop behavior:

- collapsed trigger anchored near the lower-right area of Inspect
- opens as a floating contextual panel
- may overlap part of the board or information area
- does not reflow the entire Inspect layout
- closes through a minimize control or click outside

The user is not expected to actively inspect the board visualization and use the AI chat at the same time.

---

## 18. Store Availability and Actions

This prototype is not a purchasing application.

There is no checkout, payment, cart, or purchasing funnel.

### Store representation

Each inspected board shows one relevant store only.

The system assumes that the exact recommended board configuration is available there.

Possible availability labels:

- `In stock`
- `Only 1 left`

No multi-store price comparison is required.

### Actions

Possible secondary actions:

- `Contact Seller`
- `Directions`
- `Save Board`

These actions represent the handoff from decision support into the real-world buying process.

### Prototype data rule

Store inventory and availability are simulated for demonstration purposes unless real inventory integration is later implemented.

This statement belongs in product/spec documentation. It does not need to interrupt the visual illusion inside the portfolio prototype UI.

---

## 19. Saving Behavior

The current concept may include a lightweight save action such as:

- `Save Board`
- `Add to Wishlist`

Avoid using `Add to Quiver` for boards the user does not yet own, because quiver terminology typically implies ownership.

A separate My Quiver concept may be introduced in a future version.

Saving is not a core success condition of this prototype.

---

## 20. Recommendation Hierarchy

The three boards are all qualified recommendations.

Do not display:

- Best Match
- Winner
- #1 Recommendation
- ranked positions

The experience is designed to help the surfer make an informed decision rather than make the decision invisibly for them.

Visual focus caused by hover or Inspect should never be confused with recommendation ranking.

---

## 21. Desktop Scope

The portfolio prototype is designed and presented for web desktop only.

There is no requirement to design or showcase mobile screens in the case study.

However, implementation decisions should remain responsive-ready so the experience is not structurally impossible to adapt later.

This means:

- avoid unnecessary fixed assumptions that only work at one viewport
- preserve logical content hierarchy
- avoid interaction logic that fundamentally requires hover as the only method of access

Full mobile UX is not part of the current deliverable.

---

## 22. Asset and 3D Strategy

### Current asset strategy

The current prototype should be built with high-quality supplied 2D product images. The image-based build is the active implementation plan, not a temporary broken state.

Each board requires only three canonical image assets:

- `deck` — top/deck view, used primarily in Overview and as the default Inspect hero
- `side` — side/profile view, used in Shape and for rocker / thickness / rail education
- `bottom` — bottom view, used in Tail & Fins and for fin/tail education

Do **not** require separate tail, rail, or fin files when the information can be derived from these canonical assets:

- Tail & Fins should crop/zoom the relevant tail region from the `bottom` asset.
- Rail / rocker / thickness education should use the `side` asset.
- Fin setup should use the `bottom` asset.

Recommended naming convention:

- `board-a-deck.png`
- `board-a-side.png`
- `board-a-bottom.png`
- `board-b-deck.png`
- `board-b-side.png`
- `board-b-bottom.png`
- `board-c-deck.png`
- `board-c-side.png`
- `board-c-bottom.png`

Asset requirements:

- PNG with transparent background where possible
- high resolution
- clean cutout
- consistent orientation within each view type
- realistic board proportions preserved
- similar photographic treatment where possible
- normalized visual scale and weight across the three boards
- restrained shadows and depth cues added in the interface, not baked aggressively into the source
- no fake AI-generated 3D or pseudo-rotation from a single image

The user will supply the final image assets later. Placeholder imagery may be used only to establish layout, spacing, and interaction logic.

### Inspect image behavior in Phase 1

Inspect remains image-based until real 3D assets exist. The selected board should open with the `deck` image as the primary hero. If useful, the user may switch between `deck`, `side`, and `bottom` views through compact thumbnails or view controls. This is a simple 2D image switch/zoom interaction, not simulated 3D.

### Future 3D target

The long-term target remains accurate live 3D board models.

Preferred pipeline:

`Source 3D model → Blender cleanup/optimization → GLB → Web 3D rendering`

Potential source format:

`OBJ`

Potential web stack:

- Three.js
- React Three Fiber
- Drei

The final implementation stack should be selected after validating the actual 3D assets rather than locking technology prematurely.

### 3D feasibility gate

Before replacing the image-based experience with 3D:

1. Validate one real board asset.
2. Confirm shape fidelity.
3. Confirm materials and textures are acceptable.
4. Confirm web performance.
5. Confirm smooth rotate and zoom behavior.
6. Confirm scroll-linked transformation is viable.
7. Only then scale to three boards.

Do not generate, sculpt, or procedurally invent the final board models as a substitute for accurate source geometry. If real 3D assets are not good enough, retain the image-based experience until a better source is available.

### Licensing

Any downloaded board model or third-party product image must be checked for its actual usage rights before public portfolio publication.

---

## 23. Implementation Phases

### Phase 1: Image-Based State Prototype

Build the product experience now using three separate screens and supplied high-quality board images.

This phase should validate:

- Overview information hierarchy
- board comparison scales
- Shape annotations
- Tail & Fins education
- hover/focus behavior
- fullscreen Inspect
- contextual AI placement
- store actions
- visual direction and overall polish

The experience should already feel complete and portfolio-worthy as a static-state interaction system.

### Phase 2: 3D Replacement

After accurate 3D models are supplied and validated:

- replace image assets with live 3D models
- preserve the existing content hierarchy and screen compositions
- convert the three screens into scroll keyframes
- add continuous board movement between states
- add soft state settling
- enable free 3D rotate/zoom inside Inspect

The objective is to upgrade the presentation layer without redesigning the product logic.

### Phase 3: Optional Expansion

Only after the core experience works:

- Browse more boards
- Replace board
- richer save behavior
- real store/inventory integration
- broader personalization
- responsive/mobile adaptation

---

## 24. Interaction Consistency

The same board interaction grammar should apply throughout the comparison experience.

### Across Overview, Shape, and Tail & Fins

- Hover: temporary Focus
- Click: Inspect
- Current build: top navigation or direct section navigation moves between stable screens
- Future 3D build: scroll becomes continuous state transformation with soft settling
- Top navigation click: jump to the relevant stable state

The user should not need to relearn interaction rules in each section.

---

## 25. Information Hierarchy by Depth

The experience intentionally increases information depth as user intent becomes stronger.

### Level 1: Profile Interpretation

`What does the system understand about me?`

### Level 2: Comparison

`What are these three boards and how are they different?`

### Level 3: Inspect

`What would this specific board mean for me?`

### Level 4: AI Question

`Answer the specific question I still have.`

### Level 5: Store Action

`Help me take the next real-world step.`

This hierarchy should prevent information overload while preserving depth for users who actively seek it.

---

## 26. Non-Goals for the Current Prototype

Do not build the following as part of the initial implementation:

- open board catalog
- browse and replace workflow
- board ranking system
- price comparison
- multiple stores per board
- checkout or purchasing flow
- mobile case-study version
- dynamic recommendation generation for portfolio visitors
- dynamic onboarding personalization for every portfolio visitor
- multiple size choices per recommended model
- previous/next navigation inside Inspect

The portfolio viewer follows one fixed demo scenario.

---

## 27. Future Portfolio Presentation Strategy

This section is not required for the current build phase. It documents how the finished experience may later be presented in the portfolio.

The case study can remain intentionally compact.

Suggested narrative:

1. Problem
2. Product principle and recommendation system
3. Onboarding approach
4. Selected onboarding screens
5. Profile Interpretation
6. Interactive comparison prototype
7. Inspect and contextual AI
8. Short note on future product direction

The interactive comparison is the visual and experiential centerpiece.

It should demonstrate:

- product thinking
- explainability
- information hierarchy
- interaction design
- visual design
- technical ambition
- the ability to translate complex surfboard information into a usable decision experience

---

## 28. Success Criteria for the Prototype

The prototype succeeds if a viewer can quickly understand that:

- the system recommended three boards for a reason
- the three boards are meaningfully different
- the interface teaches those differences rather than simply listing specifications
- the user can inspect one board without losing comparison context
- personalized interpretation becomes deeper only when the user asks for it
- the experience ultimately supports choosing one board rather than encouraging endless comparison

The desired final impression is:

**The product does not merely recommend a surfboard. It helps the surfer understand the decision well enough to make it confidently.**
