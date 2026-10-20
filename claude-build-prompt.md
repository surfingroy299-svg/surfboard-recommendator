# Claude Build Prompt — Surfboard Comparison Prototype

You are working inside an existing surfboard recommendation product codebase. The backend / recommendation logic already exists and should be preserved unless a frontend requirement explicitly needs a small integration change.

Your task is to implement the **Phase 1 image-based comparison prototype** described in the attached `comparison-experience-spec.md`.

## First step: inspect before changing anything

Before writing code:

1. Inspect the existing project structure, routes, frontend stack, styling system, shared components, data models, and recommendation flow.
2. Identify the safest place to add this experience without breaking existing work.
3. Reuse the current stack and design system where practical. Do not introduce a new framework or large dependency set unless it is clearly necessary.
4. Do not refactor or replace the backend/recommendation engine as part of this task.
5. Summarize your proposed implementation plan and the files you intend to change before starting the build.

## Build scope

Build a desktop-first interactive frontend experience with three stable comparison states:

- Overview
- Shape
- Tail & Fins

These are **separate stable screens/sections in this phase**. Do not implement the future scroll-driven 3D transformation yet.

Use the attached specification as the source of truth for UX behavior, hierarchy, content depth, Inspect behavior, contextual AI placement, and store actions.

## Board assets

I will provide final 2D board assets. Structure the implementation so each board uses exactly three canonical images:

- `deck`
- `side`
- `bottom`

Recommended file naming:

- `board-a-deck.png`
- `board-a-side.png`
- `board-a-bottom.png`
- `board-b-deck.png`
- `board-b-side.png`
- `board-b-bottom.png`
- `board-c-deck.png`
- `board-c-side.png`
- `board-c-bottom.png`

Do not require separate rail, tail, or fin images:

- Shape uses the `side` image.
- Tail & Fins crops/zooms the relevant area of the `bottom` image.
- Fin setup is shown from the `bottom` image.

If the final assets are not yet present, create a clean asset mapping layer and use temporary placeholders only for layout. Do not generate fake surfboards and do not invent pseudo-3D rotation.

## Interaction requirements

- Persistent compact top navigation with `Overview`, `Shape`, `Tail & Fins`.
- Three boards have equal recommendation status. No default winner or #1 board.
- Hover creates temporary visual focus.
- Clicking any board opens a fullscreen Inspect overlay.
- Inspect must preserve the exact underlying comparison context.
- Closing Inspect returns to the same comparison state and position.
- No previous/next board browsing inside Inspect.
- In Phase 1, Inspect uses 2D deck/side/bottom images with optional view switching and zoom.
- Include the contextual AI trigger/panel described in the spec as a UI interaction. If a real AI endpoint already exists, connect it only if straightforward; otherwise keep the panel interaction-ready with mock conversation data rather than creating new backend architecture.
- Include one simulated store and the secondary actions described in the spec.

## Data

Use one fixed demo surfer: Daniel, as defined in the specification.

Use Board A / Board B / Board C data objects so models, specs, copy, store details, and image paths can be swapped without changing component structure.

Do not build Browse/Replace, checkout, multiple stores, mobile screens, dynamic recommendation generation, or 3D in this phase.

## Visual quality

This is a portfolio prototype, so visual polish matters. Aim for a premium, editorial product experience rather than a generic SaaS dashboard.

Priorities:

- surfboards remain the visual heroes
- strong whitespace and hierarchy
- restrained product shadows/depth
- clear comparison without excessive cards
- technically legible annotations in Shape and Tail & Fins
- responsive desktop layout across common laptop/desktop widths
- animation should support focus and transitions without becoming decorative noise

Avoid generic AI-dashboard styling, excessive pills/cards, neon gradients, or fake glassmorphism unless already justified by the project’s design system.

## Architecture for future 3D

Build the board visual layer as a replaceable component boundary so a later phase can swap the 2D image renderer for live GLB/Three.js boards without rewriting the information architecture.

Do not implement Three.js now.

## Completion criteria

Before declaring the task complete, verify:

- all three states are functional
- top navigation works
- hover/focus works
- Inspect opens from each state
- Inspect closes back to the exact prior context
- deck/side/bottom asset mapping is centralized and replaceable
- Tail & Fins uses the bottom asset rather than requiring a duplicate tail file
- Shape uses the side asset
- contextual AI panel opens/closes correctly
- store actions are represented
- no existing backend logic was broken
- the page works cleanly on desktop widths

When complete, report:

1. what you built
2. files changed
3. where to place the final board image assets
4. any mocked behavior or data
5. any assumptions you made
6. what remains for the future 3D phase

