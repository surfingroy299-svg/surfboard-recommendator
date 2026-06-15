# Surfboard Recommendator

An explainable surfboard recommendation system for intermediate surfers. This repository contains the full product definition, system architecture, and logic layer specifications. **The system is not yet implemented** — this is a documentation and architecture repository.

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
| Onboarding questions (9 questions) | Complete — display layer only |
| Answer normalization (value mapping) | Not started |
| Surfer Profile schema | Complete |
| Translation Layer (logic contract) | Complete — no rules yet |
| Decision Layer (logic contract) | Complete — no rules yet |
| Size Calculation Step (contract) | Complete — no formula yet |
| Board Matching Layer (contract) | Complete — no evaluation rules yet |
| Agent specification | Not started |
| Board database | 10 boards (Channel Islands only) |
| UI / frontend | Not started |
| Backend / API | Not started |

---

## System Architecture

The system is built as a sequential pipeline of discrete layers. Each layer has a clearly defined role and a documented input/output contract. No layer is implemented yet.

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
│
├── onboarding/
│   ├── onboarding-questions.md    9 questions with answer options (display layer)
│   └── onboarding-layer.md        Design principles, answer template, information categories
│
├── logic/
│   ├── surfer-profile-schema.md   Full schema for the Translation Layer output artifact
│   ├── translation-layer.md       How onboarding answers map to the 5-axis Surfer Profile
│   ├── decision-layer.md          How the Surfer Profile maps to 6 advisory signals
│   ├── size-calculation-step.md   Input/output contract for target volume and length ranges
│   └── board-matching-layer.md    7 evaluation dimensions, exclusion logic, output schema
│
└── boards data/
    ├── board-data-schema.md        Schema definition for all board data
    ├── brands/
    │   └── channel_islands.json    10 Channel Islands models (V1 database)
    └── examples/
        └── example-brand.json      Template for adding new brands
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
- `board-matching-layer.md` — 7 evaluation dimensions, hard exclusion triggers, match_strength aggregation, candidate and excluded-board output schemas

**Board data**
- `board-data-schema.md` — complete schema definition
- `channel_islands.json` — 10 boards (CI 2.Pro, Two Happy, Fever, NeckBeard 3, Better Everyday, Dumpster Diver 2, G Skate, Happy Traveler, CI Pro Step Up, CI Mid)
- `example-brand.json` — template for adding new brands

---

## What Is Not Yet Implemented

**Missing logic (all layers have contracts but no execution rules)**

1. **Answer normalization** — `onboarding-questions.md` has display labels only. Each answer option needs a normalized `value` field (e.g. `loses_speed_easily`) that the Translation Layer can reference as evidence. This is the first implementation prerequisite.

2. **Translation rules** — The logic that maps normalized answer values to axis states is not written. Example: which Q8 answers, combined with which Q2 selections, produce `band = intermediate, sub_level = upper`?

3. **Size calculation formula** — The volume and length calculation rules are not defined. No weight-to-volume table, no level modifier, no condition adjustment.

4. **Board matching evaluation rules** — The rules that produce `strong / moderate / weak` for each of the 7 evaluation dimensions are not defined. Example: given `actual_surfing_level.band = intermediate` and a board with `level_range.min = lower_intermediate, max = upper_intermediate`, what is the Level Fit result?

5. **Agent specification** — Not documented. No prompt structure, context format, output schema, or model selection.

**Missing data**

6. **Board database** — 10 boards from one brand is insufficient for reliable 3-board recommendations across diverse surfer profiles. A minimum of 3–4 brands and 30–40 models is recommended before V1 launch.

7. **Shape profile gaps** — Several Channel Islands models have `"unknown"` values for `tail_shape`, `concave`, and `rails`. These affect the Ride Feel / Shape Fit dimension quality.

**Missing infrastructure**

8. **UI / frontend** — No screens, flows, or components built. A full UX spec and wireframes exist in the project's planning documents.

9. **Backend / API** — No server, endpoints, or data layer.

---

## Recommended Implementation Order

1. **Answer normalization** — Add `value` fields to every answer option in `onboarding-questions.md`. These normalized values become the evidence trail throughout the pipeline. Everything downstream depends on this.

2. **Translation rules** — Write the logic that maps Q1–Q9 normalized values to the 5 Surfer Profile axis states. Start with Actual Surfing Level (Q8 is the primary signal) and Pain Points / User Intent (Q5, Q6).

3. **Size calculation formula** — Define the weight-to-volume lookup rules and modifiers (level, conditions, support/performance position). Test independently with sample physical profiles.

4. **Board matching evaluation rules** — Define the per-dimension scoring rules for all 7 dimensions. Start with Level Fit and Size Fit (the most objective) then move to Condition Fit, Intent Fit, and Ride Feel.

5. **Agent specification** — Define what context the agent receives, what output format it produces, and what model powers it.

6. **Board database expansion** — Add 2–3 more brands with full model data before any end-to-end testing is meaningful.

7. **Backend / API** — Wire the pipeline layers into a runnable system.

8. **UI** — Build the onboarding flow and recommendation output screens.

---

## Design Principles

- **Explainability over accuracy** — A good recommendation must be understood by the user, not just correct.
- **Information preservation** — Raw answers, translated signals, confidence data, and board attributes are preserved through the pipeline. Nothing is compressed or discarded.
- **Hard exclusions for true incompatibility only** — Soft mismatches become evidence, not elimination. Only Level Fit, Requirement Fit, and Size Fit can trigger hard exclusions.
- **Advisory signals, not rigid rules** — The Decision Layer guides the Agent; it does not override it.
- **Ambiguity is valid output** — Unclear or conflicting signals are represented honestly. The system never forces precision it doesn't have.
