# Surfer Profile Schema

---

## Purpose

Defines the structured output of the Translation Layer.

The Surfer Profile is a traceable, machine-readable interpretation of a surfer's onboarding answers. It is not a recommendation. It is not a decision. It is a structured understanding of who the surfer is, what their current situation is, and what signals the system extracted from their answers.

The profile is designed to be consumed by the Decision Layer (for signal generation) and by the Agent (for recommendation and explanation).

---

## Role in the System

```
Onboarding Answers (raw)
         ↓
Translation Layer
         ↓
Surfer Profile   ← this document defines this artifact
         ↓
Decision Layer  +  Agent
```

Raw onboarding answers are preserved alongside the profile. The profile enriches those answers — it does not replace them.

---

## Design Principles

- **Traceable** — every major interpretation references the signals that produced it
- **Descriptive** — the profile describes the surfer; it does not recommend or direct
- **Additive** — adds structured interpretation on top of raw answers; does not compress or replace them
- **Confidence-aware** — every axis carries a confidence assessment including level, type, and basis
- **Ambiguity-preserving** — unclear or conflicting signals are represented honestly, not forced into false certainty

---

## Top-Level Structure

```
Surfer Profile
  ├── meta         quality, completeness, coherence, flags
  ├── physical     height, weight, units
  └── axes         5 independent interpreted axes
```

---

## Meta

Describes the quality, completeness, and coherence of the profile as a whole.

**Meta is descriptive only.** It contains no recommendations or directional conclusions.

### Fields

**completeness**

| Field | Type | Description |
|---|---|---|
| `questions_answered` | integer | Number of questions answered |
| `questions_total` | integer | Total questions in flow (9) |
| `skipped` | string[] | List of skipped question IDs |
| `skip_reasons` | object | Maps skipped question IDs to skip reason |
| `optional_fields_provided` | object | Maps optional field IDs to boolean |

Skip reason values:
- `user_did_not_know_dimensions` — Q3 gate returned negative
- `no_regular_board` — Q1 = "I don't have a regular board"
- `user_skipped` — user explicitly skipped an optional field

---

**coherence**

| Field | Type | Description |
|---|---|---|
| `assessment` | enum | `consistent` / `mixed` / `conflicting` |
| `note` | string \| null | Concise observation, or null if no coherence issues |

---

**flags**

Array of flag objects. Each flag:

| Field | Type | Description |
|---|---|---|
| `type` | enum | Flag type (see reference table) |
| `note` | string | Concise description of the specific observation |

---

## Physical

Stores factual physical data from Q9. Not interpreted — used directly for volume and size calculation.

| Field | Type | Description |
|---|---|---|
| `height.value` | number | Numeric height value |
| `height.unit` | enum | `cm` or `in` |
| `weight.value` | number | Numeric weight value |
| `weight.unit` | enum | `kg` or `lbs` |

---

## Axes

Five independent axes. Each is interpreted separately by the Translation Layer.

### Per-Axis Wrapper Structure

Every axis follows this structural pattern:

```
state:       axis-specific fields (see per-axis definitions below)
confidence:
  level:     low / medium / high
  type:      confidence type enum (see reference)
  basis:     concise note describing what produced this confidence level
evidence:
  - source:       question ID (e.g. Q2)
    value:        normalized answer value (e.g. loses_speed_easily)
    contribution: concise note on why this signal contributed to this axis
summary:     concise machine-readable interpretation of the axis state
```

---

### Axis 1 — Actual Surfing Level

**Purpose:** Interprets what the surfer can actually do in the water, based on behavior rather than self-perception.

**Primary inputs:** Q8 (skill), Q2 (board feel), Q5 (pain points)

**State fields:**

| Field | Type | Values |
|---|---|---|
| `band` | enum | `beginner` / `intermediate` / `advanced` / `pro` |
| `sub_level` | enum | `lower` / `mid` / `upper` |
| `edge_flags` | string[] | e.g. `["leans_advanced"]` — or empty array |

---

### Axis 2 — Wave Context

**Purpose:** Defines the wave conditions the board must perform in.

**Primary inputs:** Q7 (environment), Q5 (pain points — as context signal)

**State fields:**

| Field | Type | Values |
|---|---|---|
| `conditions` | enum | `weak` / `balanced` / `powerful` / `mixed` |
| `usage_mode` | enum | `baseline` / `override` / `variable` / `unclear` |
| `perceived_demand_level` | enum | `low` / `moderate` / `high` |

---

### Axis 3 — Board Fit / Mismatch

**Purpose:** Interprets whether the current board is well-matched, limiting, or mismatched for this surfer.

**Primary inputs:** Q1 (board type), Q2 (board feel), Q4 (dimensions, if available), Q5 (pain points), Q8 (skill)

**State fields:**

| Field | Type | Values |
|---|---|---|
| `fit` | enum | `well_matched` / `limiting` / `mismatched` / `strongly_mismatched` / `unknown` |
| `direction` | enum | `too_supportive` / `too_demanding` / `roughly_right` |
| `cause` | enum | `size` / `category` / `context` / `mixed` / `unclear` |
| `competing_causes` | string[] \| null | Array of cause values, or null |
| `conflict_explanation` | string \| null | Concise note on competing causes, or null |

---

### Axis 4 — Support vs Performance Need

**Purpose:** Defines whether the surfer needs more support (forgiveness, ease) or is ready for more performance-oriented equipment.

**Primary inputs:** Q6 (goals), Q5 (pain points), Q8 (skill), Axis 3 output

**State fields:**

| Field | Type | Values |
|---|---|---|
| `position` | enum | `needs_support` / `balanced` / `performance_capable` |
| `alignment` | enum | `aligned` / `mild_gap` / `strong_gap` |

`alignment` describes the gap between where the surfer is and what they are asking for. A `strong_gap` means the surfer's stated goals outrun what their current profile supports.

---

### Axis 5 — User Intent

**Purpose:** Captures what the surfer wants and how that intent should be interpreted given their profile.

**Primary inputs:** Q6 (goals), Q5 (pain points), Q2 (board feel)

**State fields:**

| Field | Type | Description |
|---|---|---|
| `raw_intent` | string | Plain-language description of what the user expressed |
| `interpreted_intent` | string | Plain-language description of what that intent most likely means given their profile |
| `intent_gap` | enum | `none` / `minor` / `significant` |

`intent_gap` describes the distance between what the surfer asked for and what the system infers they actually need. A `significant` gap does not mean the intent is wrong — it means the agent should be aware of the tension.

---

## Reference Tables

### Confidence Level

| Value | Meaning |
|---|---|
| `high` | Clear and consistent signals; interpretation is well-supported |
| `medium` | Signals present but incomplete, indirect, or partially conflicting |
| `low` | Insufficient or contradictory signals; interpretation is uncertain |

---

### Confidence Type

| Value | Meaning |
|---|---|
| `consistent_signals` | Multiple sources agree; clear picture |
| `conflicting_signals` | Sources contradict each other |
| `insufficient_data` | Too few signals to support a reliable interpretation |
| `single_source` | Only one answer contributed to this axis |
| `indirect_inference` | Axis derived from indirect signals, not direct evidence |
| `data_gap` | Relevant data was unavailable (e.g. dimensions gate was skipped) |

---

### Meta Flag Types

| Value | Meaning |
|---|---|
| `missing_dimensions` | Q3/Q4 skipped or incomplete — board fit axis assessed from feel signals only |
| `no_regular_board` | User has no regular board — board fit axis has limited basis |
| `conflicting_feel_signals` | Q2 selections internally contradict each other |
| `ambiguous_level` | Q8 skill signals are unclear or contradictory |
| `no_progression_signal` | Q6 does not indicate a clear progression direction |
| `limited_profile` | Overall insufficient data — interpret profile with caution |

---

### Coherence Assessment

| Value | Meaning |
|---|---|
| `consistent` | Axes paint a coherent picture of the surfer |
| `mixed` | Some tensions exist but are not irreconcilable |
| `conflicting` | Significant cross-axis contradictions the agent should be aware of |

---

## Example Profile

Surfer profile for a user who:
- Rides a shortboard
- Loses speed easily, can't generate speed in weak waves
- Surfs small, weak waves
- Does not know board dimensions
- Can link turns but not smoothly
- 175cm / 72kg
- Wants more speed and flow

```json
{
  "meta": {
    "completeness": {
      "questions_answered": 8,
      "questions_total": 9,
      "skipped": ["Q4"],
      "skip_reasons": {
        "Q4": "user_did_not_know_dimensions"
      },
      "optional_fields_provided": {
        "Q5_free_text": false,
        "Q6_free_text": false
      }
    },
    "coherence": {
      "assessment": "consistent",
      "note": null
    },
    "flags": [
      {
        "type": "missing_dimensions",
        "note": "Board dimensions unavailable — board fit axis assessed from feel signals only"
      }
    ]
  },

  "physical": {
    "height": { "value": 175, "unit": "cm" },
    "weight": { "value": 72, "unit": "kg" }
  },

  "axes": {
    "actual_surfing_level": {
      "state": {
        "band": "intermediate",
        "sub_level": "upper",
        "edge_flags": []
      },
      "confidence": {
        "level": "high",
        "type": "consistent_signals",
        "basis": "Q8 and Q2 signals are consistent with upper-intermediate ability"
      },
      "evidence": [
        {
          "source": "Q8",
          "value": "can_link_turns",
          "contribution": "primary signal — places surfer in intermediate-to-upper range"
        },
        {
          "source": "Q2",
          "value": "loses_speed_easily",
          "contribution": "supporting signal — consistent with intermediate surfer on a demanding board"
        }
      ],
      "summary": "Upper-intermediate surfer. Can link turns and control direction consistently. No signals suggesting beginner or advanced range."
    },

    "wave_context": {
      "state": {
        "conditions": "weak",
        "usage_mode": "baseline",
        "perceived_demand_level": "low"
      },
      "confidence": {
        "level": "high",
        "type": "consistent_signals",
        "basis": "Q7 clearly indicates small, weak waves as the typical environment"
      },
      "evidence": [
        {
          "source": "Q7",
          "value": "small_weak_waves",
          "contribution": "primary signal — defines baseline wave conditions"
        }
      ],
      "summary": "Surfer primarily operates in small, weak wave conditions. Board must perform in low-power surf."
    },

    "board_fit_mismatch": {
      "state": {
        "fit": "limiting",
        "direction": "too_demanding",
        "cause": "size",
        "competing_causes": null,
        "conflict_explanation": null
      },
      "confidence": {
        "level": "medium",
        "type": "data_gap",
        "basis": "Board dimensions unavailable — fit assessed from feel signals only, no dimensional verification possible"
      },
      "evidence": [
        {
          "source": "Q2",
          "value": "loses_speed_easily",
          "contribution": "primary signal — board not generating sufficient speed for this surfer's weight and conditions"
        },
        {
          "source": "Q1",
          "value": "shortboard",
          "contribution": "supporting signal — shortboard category may be too demanding given conditions and weight"
        }
      ],
      "summary": "Current board appears limiting and likely too demanding. Cannot confirm dimensional mismatch without Q4 data."
    },

    "support_vs_performance_need": {
      "state": {
        "position": "balanced",
        "alignment": "aligned"
      },
      "confidence": {
        "level": "medium",
        "type": "indirect_inference",
        "basis": "Position inferred from level and board fit signals; no direct signal about support vs performance preference"
      },
      "evidence": [
        {
          "source": "Q6",
          "value": "wants_speed_and_flow",
          "contribution": "supporting signal — goal leans toward performance but not definitively"
        },
        {
          "source": "Q8",
          "value": "can_link_turns",
          "contribution": "supporting signal — skill level consistent with a balanced position"
        }
      ],
      "summary": "Balanced between support and performance needs. Goals lean slightly toward performance; skill level does not yet support a strong performance-capable position."
    },

    "user_intent": {
      "state": {
        "raw_intent": "more speed and flow on the wave",
        "interpreted_intent": "improve wave-generation efficiency in weak conditions — likely needs a board better suited to the surf",
        "intent_gap": "minor"
      },
      "confidence": {
        "level": "high",
        "type": "consistent_signals",
        "basis": "Q6 goal and Q5 pain point are aligned and directly reinforce each other"
      },
      "evidence": [
        {
          "source": "Q6",
          "value": "wants_speed_and_flow",
          "contribution": "primary signal — defines stated goal"
        },
        {
          "source": "Q5",
          "value": "cant_generate_speed_weak_waves",
          "contribution": "reinforcing signal — pain point directly corresponds to stated goal"
        }
      ],
      "summary": "Intent is clear and internally consistent. Minor gap: surfer attributes speed problem to themselves; system interprets it as board-condition mismatch."
    }
  }
}
```
