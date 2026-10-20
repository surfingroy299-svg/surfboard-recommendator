# Direction 01 — UX Model

Mapping to the shared 21-step scenario (see `../../shared/mock-data/`).

## Entry
Fade into the bay: rack on the left holds three boards, each with a small
role tag (Comfortable Choice / Best Match / Progression Option — REAL rule:
roles from `board-matching-layer.md` §3, assignment mocked). A short guided
moment (harvested S9): the Best Match slides onto the stands, camera glides to
it, two pencil notes appear sequentially ("why this board" evidence from the
mock candidate set), then control is handed over — a hand cursor and a one-line
hint ("drag to turn the board — or press 1/2/3 for views").

## Selection
Click/tap a racked board (or keys 1–3, or Tab cycle) → it travels to the
stands; the previous one returns to its rack slot. The rack always shows
where every board is (P9: the curated set is the home state; nothing is ever
lost off-screen).

## Manipulation & camera
- On the stand: **drag rotates the board** around its long axis with damping
  (deck→rail→bottom); vertical drag tilts within ±25°. Constrained, snappy
  release to nearest face.
- **Camera never free-orbits.** It glides between designed stations: Rack,
  Stand (¾), Deck-down, Tail close, Rail profile, Compare. Buttons + hotspots +
  number keys move it; every glide is interruptible; Reset ("back to bench")
  is always visible (skill: home view + reset).
- The user always controls **the board** with drag and **the camera** with
  discrete named views — the two are never bound to the same gesture (mode
  clarity by construction).

## Inspection & data reveal
Hotspot dots on tail / rails / nose / deck center (contextual — appear on
stand focus, not at rest). Clicking one glides the camera to its station and
writes the region's pencil note: dimension assessment text for that region
(REAL where sourced from mock candidate evidence; foil/rocker notes carry the
VISUAL APPROXIMATION tag inline as "sketch, not scan"). The wall chalkboard
holds the persistent layer: role, why-sentence, one advantage, one tradeoff,
volume/length vs the surfer's target range (drawn as a chalk range bar — REAL:
30.2–40.8 L target from size-calculation-rules Example B).

## Comparison
"Compare" pulls a second stand alongside (chosen via rack click). Both boards
share scale and orientation; **synchronized rotation** (dragging one turns
both); the work lamp rakes both equally. Chalk lines project matched
dimensions on the wall behind (length ticks, width at wide point); the
chalkboard switches to a two-column delta view in qualitative language
("paddles in earlier · holds better when it's steep"). Exit returns the
second board to the rack — camera glides home (recovery is one action).

## Lock / reject / replace
Chalk-cross on a rack tag rejects: the board slides toward the bay door, a
replacement is carried in and racked, its tag reading what changed ("same
small-wave role — looser feel", PROTOTYPE ASSUMPTION, trait-grounded). Lock =
wax-pencil check on the tag; locked boards' tags dim their reject affordance.
Replacing never touches locked boards or the board on the stand.

## Recovery & modes
At all times: rack shows the set state (tags = locked/rejected/in-focus),
station name is visible ("Rail profile — Two Happy"), Reset returns to
Stand ¾, Esc exits comparison. Reduced motion: glides become crossfades;
board rotation becomes stepped faces.

## Keyboard & DOM mirror
1/2/3 select board · V cycles views · arrows step rotation faces · C compare ·
L lock · X reject · R reset. A visually-hidden live region (and the chalkboard
itself, which is real DOM) mirrors every state change; the chalkboard is the
canonical accessible surface — the scene illustrates it.
