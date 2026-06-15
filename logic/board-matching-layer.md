# Board Matching Layer

---

## 1. Purpose

This layer answers:

**Given a surfer profile and advisory signals, which real surfboards actually fit this surfer — and how well?**

Its role is to:

- Apply hard exclusions for true incompatibilities (with traceable reasons)
- Evaluate remaining candidates across 7 evaluation dimensions
- Aggregate dimension assessments into an equal-weighted match_strength signal
- Return the candidate set with full dimension evidence
- Return excluded boards with traceable exclusion reasons
- Select recommended size and alternative size per matched model (from Size Calculation Step output)

**The output of this layer is structured data — not user-facing copy.**

This layer evaluates which boards fit and returns evidence-rich candidates. It does not assign board roles (Comfortable Choice / Best Match / Progression Option) — role assignment is the Agent's responsibility.

---

## 2. Role in the System

This layer sits between:

- the **Size Calculation Step**, which provides target volume and length ranges
- the **Decision Layer**, which produces advisory signals that inform evaluation
- the **Agent**, which receives the candidate set and produces the final recommendation, role assignments, and user-facing explanation

```
Surfer Profile  +  Decision Signals  +  Size Calculation Output
         ↓
Board Matching Layer  ←  Board Database
         ↓
Candidate Set  +  Excluded Boards List
         ↓
Agent
```

This layer does NOT:
- interpret the surfer
- re-run decision logic
- assign board roles
- generate user-facing copy

Its responsibility is strictly:

**evaluation + hard exclusion + structured output**

---

## 3. Recommendation Agent

The Agent is the layer that operates immediately downstream of this one.

Its sole responsibility is to reason about the candidate set and produce the final recommendation in simple, honest, user-facing language.

**The Agent may:**

- assign board roles (Comfortable Choice / Best Match / Progression Option)
- translate technical board traits into plain language
- explain why a board fits the user's profile
- explain tradeoffs honestly
- compare recommended boards against each other
- connect fit reasons to supporting board data returned by this layer

**The Agent must NOT:**

- select boards independently
- override or modify the Board Matching Layer's candidate set
- invent reasons that were not returned by this layer
- make claims not supported by the structured output
- turn uncertainty into certainty

**Core rule:**

> The agent may explain. It may not decide.

---

## 4. Filtering Principles

**Hard exclusions only for true incompatibility.**

A board is hard-excluded when it is genuinely unsuitable for this surfer — not merely imperfect.

Hard exclusions are triggered by three dimensions only:
- **Level Fit** — board minimum level requirement exceeds surfer's band by more than one step
- **Requirement Fit** — a hard requirement the board demands is clearly unmet by the surfer
- **Size Fit** — the surfer falls significantly outside all available sizes for this model

All other mismatches are soft — they become evidence in the dimension assessment, not grounds for exclusion. A board with weak Condition Fit or weak Ride Feel Fit remains in the candidate set with its weaknesses documented.

Excluded boards are retained in the output as a traceable list. They are not discarded.

---

## 5. Evaluation Dimensions

Every non-excluded board is evaluated across 7 dimensions.

### 5.1 Level Fit

**What it evaluates:** Can this surfer actually ride this board?

Compares the surfer's `actual_surfing_level.band` and `sub_level` against the board's `surfer_fit_profile.level_range`.

Hard exclusion trigger: board's `min` level exceeds surfer's band by more than one step.

---

### 5.2 Condition Fit

**What it evaluates:** Does this board perform in the surfer's conditions?

Compares `wave_context.conditions` and `wave_context.perceived_demand_level` against the board's `ideal_conditions` and `condition_range`.

No hard exclusion. A board poorly matched to the surfer's conditions produces a weak Condition Fit result — this becomes evidence in the dimension assessment, not grounds for exclusion.

---

### 5.3 Intent Fit

**What it evaluates:** Does this board address what the surfer wants?

Compares `user_intent.interpreted_intent` and pain point signals against the board's `surfer_fit_profile.helps_with` and `performance_traits`.

No hard exclusion. Weak intent fit = evidence only.

---

### 5.4 Requirement Fit

**What it evaluates:** Does the surfer meet what this board requires?

Compares the board's `surfer_fit_profile.requires` against the surfer's demonstrated skills (from `actual_surfing_level` evidence).

Hard exclusion trigger: a hard requirement the board demands is clearly unmet.

---

### 5.5 Support / Performance Fit

**What it evaluates:** Does the board's support/performance balance align with the surfer's need?

Compares `support_vs_performance_need.position` and `alignment` against the board's `performance_traits` (paddling_ease, stability, forgiveness vs. speed_generation, maneuverability).

No hard exclusion. Weak fit = evidence only.

---

### 5.6 Size Fit

**What it evaluates:** Is the surfer within the board's valid volume and length range?

Compares the Size Calculation Step output (`target_volume`, `target_length`) against the board's `variants[].stock_dimensions`.

Hard exclusion trigger: surfer falls significantly outside all available sizes for this model (no stock dimension comes within a reasonable margin of the target range).

---

### 5.7 Ride Feel / Shape Fit

**What it evaluates:** How does the board's physical design align with the surfer's style, intent, and conditions?

Evaluates the board's shape attributes against what is likely to work for this surfer:
- `tail_shape` — affects pivot, speed release, and hold
- `rocker` — affects speed in weak waves vs. hold in steep waves
- `concave` — affects drive and lift
- `rails` — affects forgiveness vs. precision
- `outline` — affects speed generation, maneuverability, and width underfoot
- `construction_type` — affects flex, weight, and feel
- `fin_setup` — affects drive, pivot, and release

No hard exclusion. If board shape data is `unknown` for a field, that field is marked as a data gap in the dimension assessment — not assumed favorable or unfavorable.

---

## 6. Dimension Assessment Structure

Each dimension assessment per board follows this structure:

```
dimension_name:
  result:  strong / moderate / weak / unknown
  note:    concise observation specific to this board and this surfer's profile
```

`unknown` is used when board data for this dimension is unavailable. It is not counted in match_strength aggregation.

---

## 7. match_strength Aggregation

`match_strength` is an equal-weighted aggregation of the 7 dimension results.

**Scoring:**
- `strong` = 3
- `moderate` = 2
- `weak` = 1
- `unknown` = not counted (excluded from denominator)

**Thresholds:**
- `strong`: average ≥ 2.5
- `moderate`: average ≥ 1.75
- `weak`: average < 1.75 → board filtered from candidate set output

The `match_strength` is a prioritization signal for the Agent — not a binding recommendation. The Agent sees the full dimension_assessments and may reason about individual dimensions independently.

---

## 8. Output Structure

### Candidate Set

One record per matched board (match_strength = strong or moderate):

| Field | Type | Description |
|---|---|---|
| `brand` | string | Board brand name |
| `model` | string | Board model name |
| `recommended_size` | string \| null | Personalized size for this surfer, from Size Calculation Step |
| `alternative_size` | string \| null | Second valid size if split_size was active; null otherwise |
| `match_strength` | enum | `strong` / `moderate` |
| `match_confidence` | enum | `high` / `medium` / `low` |
| `dimension_assessments` | object | 7 dimension assessments (see structure above) |
| `tradeoffs` | array | Specific tradeoffs for this board given this surfer's profile |
| `data_gaps` | array | Board attributes that were unknown and affected evaluation |

---

### Excluded Boards List

One record per hard-excluded board:

| Field | Type | Description |
|---|---|---|
| `brand` | string | Board brand name |
| `model` | string | Board model name |
| `exclusion_dimension` | enum | `level_fit` / `requirement_fit` / `size_fit` |
| `exclusion_reason` | string | Concise explanation of why this board was excluded |

---

## 9. Core Challenge

This is NOT a simple filter system.

The system must handle:

- partial signals (e.g. `lean_up`)
- conflicting signals
- uncertainty
- variation between boards in the same category
- imperfect but still valid matches
- missing board data (shape fields marked `unknown`)

The system must:

- avoid fake precision
- remain explainable
- reflect real surf knowledge
- avoid forcing matches when no strong candidates exist

---

## 10. Mindset

This layer must:

- remain explainable
- reflect real surf knowledge
- avoid fake precision
- work with imperfect inputs
- stay flexible for future expansion
