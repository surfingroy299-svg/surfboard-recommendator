# Photography register

Every photograph used by the prototype, where it came from, and what still has
to happen before it can be published.

**The image files are deliberately not in this repository.** They live in
`frontend/comparison-prototype/public/photography/`, which is gitignored. This
repo carries the *intent* — what each slot needs and which frame currently
fills it — so the art direction is reviewable and reproducible without
redistributing anyone's work. The app degrades to a labelled placeholder when a
file is absent, so a fresh clone builds and runs.

## Status key

| Status | Meaning |
|---|---|
| `reference` | A documented placeholder, used locally to establish direction. **Not cleared for publication.** |
| `cleared` | Rights confirmed for this project's public use. Safe to commit. |
| `gap` | No frame yet meets the brief. Documented rather than filled with something mediocre. |

## Slots

| File | Slot | Source | Photographer | Licence | Status |
|---|---|---|---|---|---|
| `hero-barrel.jpg` | Intro hero | Supplied by the project owner | unknown | **to confirm** | `reference` |
| `waves-small-weak.jpg` | Q7 · small and weak, 1–2 ft | Supplied by the project owner — Figma `xXrzNJb56TNBy3IxffjG2R`, node `15:10` ("small 1-2 ft") | unknown | **to confirm** | `reference` |
| `waves-medium-push.jpg` | Q7 · medium with push, 2–4 ft | Supplied by the project owner — Figma `xXrzNJb56TNBy3IxffjG2R`, node `15:11` ("medium 2-4 ft") | unknown | **to confirm** | `reference` |
| `waves-powerful.jpg` | Q7 · powerful and steep, 5 ft + | Supplied by the project owner — Figma `xXrzNJb56TNBy3IxffjG2R`, node `15:12` ("big 5+ ft") | unknown | **to confirm** | `reference` |
| `waves-variable.jpg` | Q7 · conditions vary | [unsplash.com/photos/ibeKWxHvems](https://unsplash.com/photos/ibeKWxHvems) | — | Unsplash | `reference` |

`waves-variable.jpg` was downloaded at 1400px, q72, from `images.unsplash.com`.
The three Q7 frames were exported from the Figma file above and resampled to
the same 1400px / q72 to match. `hero-barrel.jpg` arrived at 1333px wide, near
enough to 1400 that resampling up would only invent detail, so it keeps its
native size and is re-encoded at the same q72.

### On the hero

It replaced `hero-aerial.jpg` (Silas Baisch, Unsplash, `L78RstAZuTY`), which
was an aerial frame — hence the old slot name, which is why the file is now
called `hero-barrel.jpg` rather than keeping a name that describes a picture
that is no longer there.

The replacement came straight from the project owner with no source attached,
so its licence column says **to confirm** for the same reason the three Q7
frames do: someone has to establish where it came from before it is published.
It is treated exactly like the other placeholders in the meantime — local and
gitignored. The on-image caption that used to carry this provenance in the
interface has been removed at the owner's request, so **this register is now
the only place it is recorded.**

### On the three supplied frames

They arrived through the project owner's Figma file rather than from a named
source, and their layer names — `beautiful-girl-riding-surf-board-waves`,
`female-surfer-amazing-blue-wave-bali-island`,
`surfer-riding-large-ocean-wave` — read like stock-library filenames. So the
licence column says **to confirm** rather than naming one: someone has to
establish which library they came from and under what terms before these are
published. They are treated exactly like the Unsplash placeholders in the
meantime — local, gitignored, not cleared.

## What the three new frames fixed

The previous Q7 set was four frames from four different shoots, unified only
by a CSS filter — the register's own standing complaint. These three share one
blue-green register, each carries a person at a readable scale, and each one
shows its own size unambiguously: a longboarder on a waist-high wall, a surfer
on a head-high green face, and a crowd under something clearly overhead.

The wave-height ranges on the cards come from the Figma frame names, which is
also where `5 ft +` for the powerful option came from.

## Why these frames

The brief is a rejection tool, not a wish list. Each frame had to carry
negative space for the typography that sits on it, read as lyrical rather than
documentary, avoid the canonical surf frame every surf site already runs, and —
for the four wave tiles — show a human so the wave has a scale.

- **Intro hero.** A top-down aerial of one surfer paddling, with a large quiet
  field of water for the headline. Unexpected framing, and the opposite of the
  centred barrel.
- **Small, weak.** Five surfers sitting in a lineup against a waist-high
  crumbling wave. The people *are* the measurement — the clearest teaching
  frame of the four.
- **Medium with push.** Three surfers riding one clean green shoulder. Shows
  exactly what "some push and a clear shape you can ride" means.
- **Steep and powerful.** A surfer dropping into a bigger, steeper face with
  the lip already breaking. Size legible against the rider.

## Known gaps

1. **`waves-variable.jpg` is the weak link.** "Conditions vary a lot" is not a
   single visual state, and the current frame honestly reads as *waiting on
   flat water* rather than *inconsistent*. It is beautiful and it holds the
   slot, but a frame showing genuinely disordered surf — wind texture, no clean
   shape, sets arriving at different sizes — would teach better. Flagged rather
   than quietly accepted.
2. **Grades differ across the four tiles** (blue midday, golden hour, gold,
   pale dawn). A shared treatment is applied in CSS so they read as a set, but
   four frames from one shoot would beat four frames unified by filter.
3. **Model releases are not verified.** Unsplash does not guarantee them and
   people are identifiable in several frames. Fine for a local prototype;
   a blocker for publication.

## Before publishing

Replace every `reference` row with a `cleared` one — commissioned work, the
project owner's own photography, or a frame licensed directly from the
photographer — then drop `public/photography/` from `.gitignore` and commit the
cleared files. Nothing else in the build changes: the slots, crops and
treatment stay as they are.
