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
| `hero-aerial.jpg` | Intro hero | [unsplash.com/photos/L78RstAZuTY](https://unsplash.com/photos/L78RstAZuTY) | Silas Baisch | Unsplash | `reference` |
| `waves-small-weak.jpg` | Q7 · small, weak waves | [unsplash.com/photos/99PoKoAkMHs](https://unsplash.com/photos/99PoKoAkMHs) | — | Unsplash | `reference` |
| `waves-medium-push.jpg` | Q7 · medium with push | [unsplash.com/photos/yRv2F4NN3BE](https://unsplash.com/photos/yRv2F4NN3BE) | Jeremy Bishop | Unsplash | `reference` |
| `waves-powerful.jpg` | Q7 · steep and powerful | [unsplash.com/photos/6fiRnDWxQMw](https://unsplash.com/photos/6fiRnDWxQMw) | Lisha Riabinina | Unsplash | `reference` |
| `waves-variable.jpg` | Q7 · conditions vary | [unsplash.com/photos/ibeKWxHvems](https://unsplash.com/photos/ibeKWxHvems) | — | Unsplash | `reference` |

All five downloaded at 1400px, q72, from `images.unsplash.com`.

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
