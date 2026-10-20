# Direction 02 — UX Model

## Entry
The table lamp warms up; three board plates slide onto the light-table in
plan view (outlines, true relative scale, drawn stringers), each with a
drafting title block: name, role, one-line why (REAL: mock candidate set).
A scale figure (the surfer's height, from Q9 mock) stands at the table edge —
the P10 personal reference — with the target ranges drawn as a bracket
(REAL: 30.2–40.8 L, 5'4"–5'8").

## Selection
Click a plate (or 1/2/3, Tab) → it rises above the others (depth lift, soft
shadow) and its title block expands: role, why, advantage, tradeoff. The other
plates dim but never leave the table (set state always visible).

## Views instead of camera
A view control (and V key) flips the whole table between **Plan** (outline,
width annotations) and **Profile** (side curve, thickness; rocker curve drawn
in dashed "sketch" line — VISUAL APPROXIMATION, labeled in-legend "profile is
a sketch from thickness data, not a scan"). The flip is one coordinated 3D
rotation of the table surface — orientation is never lost because *everything*
flips together. There is no free camera at all: this direction's spatial
behavior is the table's, not a camera's.

## Inspection & data reveal
On the focused plate, measurement guides draw themselves on hover/focus of a
region: width at wide point, nose/tail widths (REAL where in stock dims),
thickness in profile. Each guide terminates in a consequence sentence, not
just a number ("2 5/16″ thick — easier to press through flat sections",
sentence labeled per source: REAL when from `helps_with`/traits, otherwise
PROTOTYPE ASSUMPTION). A "waterline ruler" can be scrubbed along the length;
it reads local width and, in overlay mode, the local delta.

## Comparison
Drag one plate onto another (or C) → **aligned overlay**: silhouettes stack on
a shared datum (tail), divergence bands shade where outlines differ, and the
delta rail lists qualitative chips with direction ("wider under chest → more
paddle", "narrower tail → holds better when steep"). Scrubbing the ruler
shows local numeric deltas with their consequence line. A small supporting
table (three columns, five rows max) sits in the title block — supporting,
never the main event (product rule: no advanced comparison tables). Exit (Esc
or "unstack") slides plates back to their table positions.

## Lock / reject / replace
Each title block carries a drafting stamp pair: **KEEP** (lock — the block
gets a stamped border) and a discreet reject mark. Rejecting slides the plate
off the table edge; the replacement plate slides in from the archive drawer
with a revision note: "Rev B — same role; traded some glide for looser turns"
(PROTOTYPE ASSUMPTION, trait-grounded), plus a one-line diff vs the rejected
plate. Locked plates are immovable during replacement (visibly stamped).
Refine requests live in the drawer: three printed request slips ("easier
paddling", "more forgiving", "more response").

## Recovery & modes
View name always visible (PLAN / PROFILE / OVERLAY); Esc always de-stacks or
de-focuses one level; the table home state is one "square up" action away.
Mode confusion is structurally impossible: there is no camera and only one
gesture family (slide plates).

## Keyboard & accessibility
Everything is DOM/SVG — the drawing *is* the accessible tree. 1/2/3 select ·
V flip view · C compare · arrows move the ruler · L lock · X reject · Esc
back. Focus outlines follow the drafting aesthetic (dashed ink). Reduced
motion: flips become crossfades, plates teleport with a fade. Screen readers
get the same title blocks and delta chips sighted users read.
