# Comparison prototype (Phase 1, image-based)

Isolated frontend for the interactive comparison experience described in
`comparison-experience-spec.md`. Static mock data only. Nothing here reads from
or changes the recommendation logic, onboarding, schemas or board database.

## Run

```bash
npm install
npm run dev        # http://localhost:5179
npm run build      # typecheck + production build
```

## Board images

Current temporary assets come from the Figma file "surfboaRD-RECCOMENDATOR",
page MODELS (node 1:71), sections BOARD A / B / C. Each section has four frames:
FRONT, BOTTOM, SIDE, TAIL&FINS. They map to files in `public/boards/`:

```
BOARD-A/FRONT      → board-a-deck.png
BOARD-A/BOTTOM     → board-a-bottom.png
BOARD-A/SIDE       → board-a-side.png   (rotated at export so the nose points right)
BOARD-A/TAIL&FINS  → board-a-tail.png   (same crop as the Figma frame, transparent)
… and the same for b and c
```

Export notes: the image layer inside each frame is exported (not the frame,
whose white fill would break the cutout — verified again in October 2026, when
rendering a frame produced an opaque white corner and the image layer inside it
produced a transparent one), at 2x, trimmed to content. Nothing about the
images is used to infer models or specs; they are Board A / B / C.

Two constraints the side export has to meet, because the app corrects for them
globally rather than per board: the nose must point **right**, and the asset is
expected **vertically inverted** — `BoardVisual` applies `scaleY(-1)` to every
side view. A side asset that arrives the right way up will render upside down.

The `-tail.png` crop should include the actual tail tip. The Figma TAIL&FINS
frame does not always: Board B's frame stopped 75px short of it, which is the
one feature that view exists to show.

If a `-tail.png` file is missing, Tail & Fins falls back to a configurable crop
of the bottom image (`tailCrop` in `src/data/assets.ts`). If a side file points
nose-left, set `noseDirection: 'left'` for that board in the same file.

## Where the content lives

| File | Contents |
|---|---|
| `src/data/boards.ts` | Board A / B / C: model, size, construction, four characteristics, shape annotations, tail & fins, Inspect copy, store |
| `src/data/assets.ts` | Image paths, nose direction, tail crop per board |
| `src/data/surfer.ts` | Daniel |
| `src/data/chat.ts` | Scripted assistant answers per board |

Shape annotation coordinates (`shape.noseRocker.from/to`, `shape.maxThickness.x`)
are normalised across the side image box (0 = tail, 1 = nose). Tune them once
the real side images are in place.

## Architecture notes

- `src/components/board/BoardVisual.tsx` is the replaceable visual boundary.
  Phase 2 swaps its internals for a live 3D renderer; props stay the same.
- The three states are stacked sections with a sticky nav. In Phase 2 they
  become scroll keyframes of one continuous scene.
- Inspect is a Radix Dialog layer over the page: scroll is locked and kept,
  focus returns to the board that opened it, Esc closes chat first, then Inspect.

## Mocked behaviour

Store availability, Contact seller, Directions, Save board, and the assistant
are all simulated. The "Your profile" back action only shows a note.
