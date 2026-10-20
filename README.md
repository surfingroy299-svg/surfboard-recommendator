# Surfboard Recommendator

An explainable surfboard recommendation system for intermediate surfers. This repository contains the full product definition, system architecture, logic layer specifications and rules, a board database, and an interactive frontend prototype of the comparison experience.

**The recommendation pipeline is specified but not yet wired into a running system.** The frontend prototype is real and runnable; it is driven by static mock data rather than by the logic layers. See [How to run](#how-to-run) and [What is real versus simulated](#what-is-real-versus-simulated).

---

## What Is This

A guided recommendation system that asks intermediate surfers 9 questions about their current board, wave conditions, frustrations, goals, and body measurements — then returns 2–3 specific board recommendations with clear explanations for each.

The core design principle is **explainability over accuracy**: every recommendation must be traceable back to the surfer's actual answers, and the system must be able to articulate why each board was recommended.

---

## Who It Is For

**End users:** Intermediate surfers (roughly 1–5 years of experience, past their first board) who want to upgrade or refine their setup but lack the technical knowledge to make that choice without relying on a surf shop or a friend.

**This repository:** Developers, collaborators, or contributors who want to understand the system architecture before building it.

---

## Current Project Status

| Layer | Status |
|---|---|
| Product definition | Complete |
| Onboarding questions (9 questions) | Complete |
| Answer normalization (value mapping) | Complete — normalized values, meanings, signals, axes, weights |
| Surfer Profile schema | Complete |
| Translation Layer (logic contract) | Complete — full mapping rules for all 5 axes |
| Decision Layer (logic contract) | Complete — full mapping rules for all 6 signals |
| Size Calculation Step (contract + rules) | Complete — formula, GF table, modifiers, calibration assumptions defined |
| Board Matching Layer (contract + rules) | Complete — 7 dimensions with scoring rules, hard exclusion thresholds, vocabulary mapping, worked example |
| Agent specification | Not started |
| Board database | 10 boards (Channel Islands only) |
| Comparison experience spec | Complete — `comparison-experience-spec.md` |
| UI / frontend | Comparison prototype built — `frontend/comparison-prototype`, static mock data |
| Logic layers wired into the frontend | Not started |
| Backend / API | Not started |

---

## System Architecture

The system is built as a sequential pipeline of discrete layers. Each layer has a clearly defined role and a documented input/output contract. Every layer through Board Matching now has execution rules documented; none is implemented in code yet.

```
Onboarding (9 questions)
         ↓
Raw Answers  (preserved throughout)
         ↓
Translation Layer
  Interprets answers into a structured Surfer Profile (5 axes)
         ↓
Surfer Profile
  actual_surfing_level / wave_context / board_fit_mismatch
  support_vs_performance_need / user_intent
         ↓
Decision Layer
  Produces 6 advisory signals: Progression Direction, Size Direction,
  Category Direction, Challenge Level, Intent Moderation, Uncertainty Flags
         ↓
Size Calculation Step
  Inputs: physical profile + 3 Surfer Profile axes + Size Direction signal
  Output: target volume range + target length range (split-size aware)
         ↓
Board Matching Layer
  Evaluates every board in the database across 7 dimensions
  Returns candidate set with evidence + excluded boards with reasons
         ↓
Agent
  Assigns board roles, generates recommendation, explains tradeoffs
         ↓
Output: 2–3 boards with explanations and honest tradeoffs
```

**Layer responsibilities in brief:**
- **Translation Layer** = Understanding (descriptive, additive, never prescriptive)
- **Decision Layer** = Guidance (advisory signals, not decisions)
- **Size Calculation Step** = Sizing (isolated and independently testable)
- **Board Matching Layer** = Evaluation (evidence-rich candidates, hard exclusions only for true incompatibility)
- **Agent** = Reasoning (role assignment, explanation, final recommendation)

---

## Repository Structure

```
surfboard-recommendator/
│
├── product-definition.md          Problem, target user, output format, scope, success criteria
├── comparison-experience-spec.md  UX specification for the comparison experience prototype
├── claude-build-prompt.md         Build brief that accompanies the specification above
│
├── onboarding/
│   ├── onboarding-questions.md    9 questions with fully normalized answer definitions
│   └── onboarding-layer.md        Design principles, answer template, information categories
│
├── logic/
│   ├── surfer-profile-schema.md      Full schema for the Translation Layer output artifact
│   ├── translation-layer.md          How onboarding answers map to the 5-axis Surfer Profile
│   ├── decision-layer.md             How the Surfer Profile maps to 6 advisory signals
│   ├── size-calculation-step.md      Input/output contract for target volume and length ranges
│   ├── size-calculation-rules.md     Actual formula, GF table, modifiers, evidence status, worked examples
│   ├── board-matching-layer.md       7 evaluation dimensions, exclusion logic, output schema
│   └── board-matching-layer-rules.md Per-dimension scoring rules, hard exclusion thresholds, vocabulary mapping, worked example
│
├── boards data/
│   ├── board-data-schema.md       Schema definition for all board data
│   ├── brands/
│   │   └── channel_islands.json   10 Channel Islands models (V1 database)
│   └── examples/
│       └── example-brand.json     Template for adding new brands
│
├── frontend/
│   └── comparison-prototype/      Interactive comparison experience (React + Vite)
│                                  See its own README for assets and architecture
│
└── design-exploration/            Project history, kept separate from the active product
    ├── concepts/ · research/      Early concept work and reference research
    ├── directions/                Three explored directions, each with ux / visual /
    │                              technical models and an assessment
    ├── decisions/                 Round reviews and the final comparison
    ├── shared/mock-data/          Scenario and board data used by the explorations
    ├── screenshots/               Review screenshots
    └── prototypes/app/            Source of the three direction prototypes
```

---

## What Is Complete

**Product and onboarding**
- `product-definition.md` — problem, target user, product output, V1 scope, success criteria
- `onboarding-questions.md` — all 9 questions with types and answer options
- `onboarding-layer.md` — design principles, information categories, answer template structure

**Logic layer contracts** (what each layer does, what it receives, what it returns)
- `surfer-profile-schema.md` — complete schema with all 5 axes, meta, physical, confidence structure, evidence format, reference tables, and a full JSON example
- `translation-layer.md` — 5 axes defined with primary inputs, state structure, and confidence basis
- `decision-layer.md` — 6 signals with value enums, per-signal output format, constraint hierarchy, conflict resolution
- `size-calculation-step.md` — full input/output contract including split-size uncertainty handling
- `size-calculation-rules.md` — Guild Factor table, wave conditions adjustment, board category modifiers (labeled by evidence status), size direction range emphasis, worked examples, and calibration tracking
- `board-matching-layer.md` — 7 evaluation dimensions, hard exclusion triggers, match_strength aggregation, candidate and excluded-board output schemas
- `board-matching-layer-rules.md` — per-dimension scoring rules (strong/moderate/weak/unknown), hard exclusion thresholds, vocabulary mapping (expert=advanced), evidence status labels, calibration tracking, worked example

**Board data**
- `board-data-schema.md` — complete schema definition
- `channel_islands.json` — 10 boards (CI 2.Pro, Two Happy, Fever, NeckBeard 3, Better Everyday, Dumpster Diver 2, G Skate, Happy Traveler, CI Pro Step Up, CI Mid)
- `example-brand.json` — template for adding new brands

**Experience**
- `comparison-experience-spec.md` — UX specification for the comparison experience: interaction model, the three comparison states, Inspect, contextual assistant, asset strategy, phasing
- `frontend/comparison-prototype/` — the built prototype of that specification: three comparison states, focus and Inspect interactions, scripted assistant, static mock data
- `design-exploration/` — three explored directions with their models, assessments and reviews, retained as project history

---

## What Is Not Yet Implemented

**Missing logic**

1. **Agent specification** — Not documented. No prompt structure, context format, output schema, or model selection.

2. **Execution code** — Every layer through Board Matching has documented rules, but none has been implemented in code. The frontend prototype does not call them.

**Missing data**

3. **Board database** — 10 boards from one brand is insufficient for reliable 3-board recommendations across diverse surfer profiles. A minimum of 3–4 brands and 30–40 models is recommended before V1 launch.

4. **Shape profile gaps** — Several Channel Islands models have `"unknown"` values for `tail_shape`, `concave`, and `rails`. These affect the Ride Feel / Shape Fit dimension quality.

**Missing infrastructure**

5. **Onboarding and profile UI** — The comparison experience is built; the onboarding flow and profile interpretation screens that precede it are not.

6. **Backend / API** — No server, endpoints, or data layer.

---

## Recommended Implementation Order

1. **Implement the documented layers in code** — Translation, Decision and Size Calculation all have complete rules. Build them against the worked examples in `size-calculation-rules.md` and the conflict cases in `translation-layer.md`.

2. **Build the onboarding and profile interpretation UI** — The questions, their normalized values and the profile schema are all specified; `comparison-experience-spec.md` §4 defines the profile screen.

3. **Agent specification** — Define what context the agent receives, what output format it produces, and what model powers it.

4. **Board database expansion** — Add 2–3 more brands with full model data before any end-to-end testing is meaningful.

5. **Backend / API** — Wire the pipeline layers into a runnable system.

---

<a id="how-to-run"></a>

## How to Run

The interactive comparison prototype:

```bash
npm install --prefix frontend/comparison-prototype
```

```bash
npm run dev --prefix frontend/comparison-prototype
```

Then open http://localhost:5179.

```bash
npm run build --prefix frontend/comparison-prototype
```

`build` runs a TypeScript project build and then Vite, so it typechecks as well as bundles. See `frontend/comparison-prototype/README.md` for board assets, data files and architecture notes.

The prototypes under `design-exploration/` are historical reference and are not maintained.

---

<a id="what-is-real-versus-simulated"></a>

## What Is Real Versus Simulated

The prototype is honest about its own boundaries, and so is this table.

| Area | Status |
|---|---|
| Product definition, logic rules, board schema | **Real** — the specifications in this repository |
| Channel Islands board data | **Real** — 10 models with sourced specifications |
| Comparison, Inspect, focus and navigation interactions | **Real** — fully implemented in the prototype |
| The three compared boards (Board A / B / C) | **Placeholder** — deliberately distinct archetypes; final models not yet selected |
| Board imagery | **Temporary** — reference product images; licensing must be cleared before public use |
| Surfer profile shown in the prototype | **Fixed demo scenario** — one reference surfer, not computed from the logic layers |
| Sizing shown in the prototype | **Mock** — the Size Calculation Step is specified but not wired in |
| Store availability, Contact seller, Directions, Save board | **Simulated** — no inventory integration exists |
| The in-Inspect assistant | **Scripted** — fixed answers per board; no model is called |

---

## Design Principles

- **Explainability over accuracy** — A good recommendation must be understood by the user, not just correct.
- **Information preservation** — Raw answers, translated signals, confidence data, and board attributes are preserved through the pipeline. Nothing is compressed or discarded.
- **Hard exclusions for true incompatibility only** — Soft mismatches become evidence, not elimination. Only Level Fit, Requirement Fit, and Size Fit can trigger hard exclusions.
- **Advisory signals, not rigid rules** — The Decision Layer guides the Agent; it does not override it.
- **Ambiguity is valid output** — Unclear or conflicting signals are represented honestly. The system never forces precision it doesn't have.
