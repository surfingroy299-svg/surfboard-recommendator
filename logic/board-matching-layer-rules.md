# Board Matching Layer — Evaluation Rules

---

## 1. Purpose

This document defines the per-dimension evaluation rules that produce `strong / moderate / weak / unknown` results for each of the 7 Board Matching Layer dimensions.

It is a companion to `board-matching-layer.md`, which defines the layer's purpose, output structure, match_strength aggregation, and hard exclusion framework. This document fills only the gap in that contract: the specific logic that determines each dimension's result.

**What this document does NOT redefine:**
- The `strong / moderate / weak / unknown` result enum (defined in Section 6 of `board-matching-layer.md`)
- The match_strength aggregation formula (Section 7)
- The three hard exclusion dimensions (Section 4)
- The candidate output structure (Section 8)

---

## 2. Evidence Status

Following the labeling approach used in `size-calculation-rules.md`:

| Label | Meaning |
|---|---|
| Surf-knowledge grounded | Concept has clear real-world basis in surfing; direction is non-arbitrary |
| Industry-informed assumption | Concept is grounded; specific threshold or cutoff is an estimate |
| Product heuristic | No direct industry analogue; logically motivated but unvalidated — mark for calibration |

---

## 3. Vocabulary Mapping

Board data and surfer profile use overlapping but not identical level vocabularies. This table is the canonical mapping for all Level Fit and Requirement Fit evaluation:

| In board data (`level_range`) | Surfer profile equivalent (`band`) | Band rank |
|---|---|---|
| `beginner` | `beginner` | 1 |
| `intermediate` | `intermediate` | 2 |
| `advanced` | `advanced` | 3 |
| `expert` | `advanced` (treated as equivalent) | 3 |
| `pro` | `pro` | 4 |

**Why "expert" = "advanced":** Board databases commonly use "expert" where the system's surfer vocabulary uses "advanced." They refer to the same population. Assigning "expert" a separate rank would create a false precision gap.

Band rank is used for step-count calculations in hard exclusion checks. Sub_level (`lower / mid / upper`) refines notes but does not change the band rank.

---

## 4. Dimension 1 — Level Fit

**Evidence status:** Surf-knowledge grounded (concept: level-appropriate boards are a universal guideline in board selection); sub_level grading within result = product heuristic

---

### 4.1 Hard Exclusion Check

Apply before any grading.

**Condition:** `board.min_band_rank > surfer.band_rank + 1`

If true → board is **HARD EXCLUDED**. Record:
- `exclusion_dimension: "level_fit"`
- `exclusion_reason: "Board minimum level ([board_min]) exceeds surfer band ([surfer_band]) by more than one step"`

If false → proceed to grading.

**Examples:**
- Board min = intermediate (rank 2), surfer = beginner (rank 1) → gap of 1 → NOT excluded
- Board min = advanced (rank 3), surfer = beginner (rank 1) → gap of 2 → HARD EXCLUSION
- Board min = intermediate (rank 2), surfer = intermediate (rank 2) → within range → NOT excluded

---

### 4.2 Result Grading

| Condition | Result | Note guidance |
|---|---|---|
| `surfer.band_rank` is within `[board.min_rank, board.max_rank]` | **strong** | Note sub_level context: if surfer is at lower bound, add "Surfer is at the entry threshold — board will feel demanding"; if well within range, "Comfortably within board's intended level range" |
| `surfer.band_rank = board.min_rank − 1` (one step below min) | **moderate** | Note: "Surfer is one band below board minimum; board is accessible but will feel demanding." If `sub_level = upper`, add "Upper-[band] position means surfer is near the threshold." |
| `surfer.band_rank = board.max_rank + 1` (one step above max) | **moderate** | Note: "Surfer has outgrown board's intended range; board is solidly within their ability but may feel limited" |
| `surfer.band_rank ≥ board.max_rank + 2` (two or more steps above max) | **weak** | Note: "Board is significantly below surfer's current level" |

**Rule:** Sub_level (`lower / mid / upper`) refines the `note` field only. It does not change the result value. All result determination is at band resolution.

---

## 5. Dimension 2 — Condition Fit

**Evidence status:** Surf-knowledge grounded (concept: boards are designed for specific wave conditions); specific overlap rules = industry-informed assumption

No hard exclusion for Condition Fit.

---

### 5.1 Input Fields

| Source | Field | Values |
|---|---|---|
| Surfer Profile | `wave_context.conditions` | `weak / balanced / powerful / mixed` |
| Surfer Profile | `wave_context.perceived_demand_level` | `low / moderate / high` |
| Board | `ideal_conditions.wave_power` | Array of strings |
| Board | `condition_tags` | Array of tags |

---

### 5.2 Condition Alignment Check

| Surfer `conditions` | Board is well-suited if... |
|---|---|
| `weak` | `condition_tags` includes `small_wave`, `weak_wave`, or `mushy_wave` — OR — `ideal_conditions.wave_power` includes `"weak"` or `"small"` |
| `balanced` | `condition_tags` includes `versatile` or `everyday_board` — OR — `ideal_conditions` covers multiple wave power levels |
| `powerful` | `condition_tags` includes `powerful`, `steep`, or `hollow` — OR — board `category` is `step_up` |
| `mixed` | Board has 3+ `condition_tags` — OR — `condition_range` spans 4+ feet |

---

### 5.3 Demand Level Modifier

After the alignment check, apply one penalty if applicable:

- Surfer `perceived_demand_level = low` AND board has no small wave or weak wave tags → drop result one level (strong → moderate, moderate → weak)
- Surfer `perceived_demand_level = high` AND board has only small wave / weak wave tags, no powerful or hollow tags → drop result one level

Only one penalty applies (do not stack multiple penalties).

---

### 5.4 Result Assignment

| Alignment | Demand modifier | Result |
|---|---|---|
| Aligned | No penalty | **strong** |
| Aligned | Penalty applies | **moderate** |
| Not aligned | — | **weak** |
| No condition data on board | — | **unknown** |

---

## 6. Dimension 3 — Intent Fit

**Evidence status:** Product heuristic — concept is logically motivated; the specific signal mapping is unvalidated and agent-dependent

No hard exclusion for Intent Fit.

Intent Fit is the most semantically soft dimension. The rules below define a structured matching approach, but the Agent must apply contextual judgment when signals are ambiguous or absent.

---

### 6.1 Intent Signal Extraction

From surfer profile and evidence trail:
- **Primary pain point**: first Q5 selection (or `user_intent.interpreted_intent` if Q5 unavailable)
- **Secondary pain point**: second Q5 selection (if present)
- **Primary goal**: first Q6 selection
- **Secondary goal**: second Q6 selection (if present)

---

### 6.2 Pain Point → Board Capability Lookup

| Pain point signal | Board is considered capable if (at least one condition) |
|---|---|
| `cant_generate_speed_weak_waves` / `lose_speed_quickly` | `condition_tags` includes `small_wave` AND `performance_tags` includes `fast` or `speed` — OR — `helps_with` includes a speed/paddle signal |
| `struggle_to_catch_waves` | `performance_traits.paddling_ease ≥ 4` — OR — `helps_with` includes paddle or wave-catch signals |
| `hard_to_perform_turns` | `performance_traits.maneuverability ≥ 4` — OR — `performance_tags` includes `skatey`, `loose`, or `pivoty` |
| `feel_unstable` | `performance_traits.stability ≥ 4` — OR — `performance_tags` includes `forgiving` or `stable` |
| `feel_stuck_not_progressing` | `helps_with` includes progression signals — OR — `performance_tags` includes `versatile` or `all_conditions` |

---

### 6.3 Goal → Board Capability Lookup

| Goal signal | Board is considered capable if |
|---|---|
| `speed_and_flow` | `performance_traits.speed_generation ≥ 3` |
| `control_when_turning` | `performance_traits.maneuverability ≥ 3` |
| `stability_and_confidence` | `performance_traits.stability ≥ 3` |
| `freedom_to_move` | `performance_traits.maneuverability ≥ 3` |
| `catch_waves_more_easily` | `performance_traits.paddling_ease ≥ 3` |
| `progress_and_improve` | Board level range is within or one step above surfer band (consistent with Level Fit result) |

---

### 6.4 Result Assignment

| Condition | Result |
|---|---|
| Primary pain point addressed AND primary goal addressed | **strong** |
| Primary pain point addressed BUT primary goal not addressed | **moderate** |
| Primary pain point NOT addressed (regardless of goals) | **weak** |
| No Q5 data available | **unknown** |

The `note` field should name which pain points and goals were and were not addressed, with specific references to board fields that supported the assessment.

---

## 7. Dimension 4 — Requirement Fit

**Evidence status:** Surf-knowledge grounded (concept: some boards genuinely require specific skills); level-to-requirement mapping = industry-informed assumption

---

### 7.1 Requirement-to-Level Mapping

| Requirement string | Minimum `band` required | Minimum `sub_level` required |
|---|---|---|
| `ability_to_read_wave_sections` | `intermediate` | `lower` |
| `solid_pop_and_footwork` | `intermediate` | `lower` |
| `generating_speed_through_turns` | `intermediate` | `mid` |
| `powerful_rail_surfing` | `advanced` | `lower` |
| `powerful_driving_surfing` | `advanced` | `lower` |
| `tube_riding` | `advanced` | `mid` |

**Unrecognized requirements** (strings not in this table): treated as soft evidence only — do not trigger exclusion. Record in `data_gaps` with note: "Requirement string `[value]` not in evaluation vocabulary — cannot assess."

---

### 7.2 Hard Exclusion Check

For each entry in `board.surfer_fit_profile.requires`:
1. Map to minimum band rank using the table above
2. Compare to `surfer.band_rank`
3. If gap ≥ 2 ranks → **HARD EXCLUSION**:
   - `exclusion_dimension: "requirement_fit"`
   - `exclusion_reason: "Board requires [requirement] (minimum: [level]); surfer is [band]"`
4. If gap = exactly 1 rank → NOT excluded — record as **weak** in grading step

---

### 7.3 Result Grading (non-excluded boards)

| Condition | Result |
|---|---|
| All `requires` entries are met at or above surfer level with comfortable margin | **strong** |
| All `requires` met but surfer is at minimum sub_level threshold | **moderate** (note: "Surfer meets requirements at minimum threshold") |
| One `requires` entry is one band below surfer level (gap = 1) | **weak** (note: "Board requires [X] — surfer has not yet demonstrated this level") |
| `requires` array is empty | **strong** (no requirements = no barrier) |
| Only unrecognized requirement strings | **unknown** |

---

## 8. Dimension 5 — Support / Performance Fit

**Evidence status:** Surf-knowledge grounded (concept: boards vary in support-performance balance, and matching this to surfer need is valid); composite score thresholds = product heuristic

No hard exclusion for Support/Performance Fit.

---

### 8.1 Board Composite Scores

Compute from `performance_traits` (scale 1–5, where `unknown` values are excluded from the mean):

```
support_score    = mean(paddling_ease, stability, forgiveness)
performance_score = mean(speed_generation, maneuverability)
```

If all components for a score are `unknown` → that score is undefined.

---

### 8.2 Result Mapping

| Surfer `position` | Condition | Result |
|---|---|---|
| `needs_support` | `support_score ≥ 3.5` | **strong** |
| `needs_support` | `support_score` 2.5–3.4 | **moderate** |
| `needs_support` | `support_score < 2.5` | **weak** |
| `balanced` | Both scores within 2.5–3.5 | **strong** |
| `balanced` | One score outside 2.5–3.5 | **moderate** |
| `balanced` | Both scores outside 2.5–3.5 (opposing extremes) | **weak** |
| `performance_capable` | `performance_score ≥ 3.5` | **strong** |
| `performance_capable` | `performance_score` 2.5–3.4 | **moderate** |
| `performance_capable` | `performance_score < 2.5` | **weak** |
| Any | Composite undefined (all values unknown) | **unknown** |

**Calibration note:** Thresholds (3.5 and 2.5) are product heuristics derived from the scale midpoint (3.0). They should be adjusted once recommendation feedback data is available.

---

## 9. Dimension 6 — Size Fit

**Evidence status:** Surf-knowledge grounded (concept: volume targeting is the foundation of board sizing); ±15% and ±2L margins = industry-informed assumption

---

### 9.1 Inputs

| Source | Field | Role |
|---|---|---|
| Size Calculation Step | `target_volume.min`, `target_volume.max` | Volume matching — primary |
| Size Calculation Step | `target_length.min`, `target_length.max` | Length matching — secondary confirmation |
| Board | `variants[].stock_dimensions[].volume_liters` | Available volumes to check |
| Board | `variants[].stock_dimensions[].length` | Available lengths to check |

---

### 9.2 Step 1 — Hard Exclusion Check

**Condition:** No stock dimension across any variant has `volume_liters` within `[target_volume.min × 0.85, target_volume.max × 1.15]`

If true → **HARD EXCLUSION**:
- `exclusion_dimension: "size_fit"`
- `exclusion_reason: "No available size within ±15% of target volume range ([min]–[max]L)"`

**Calibration note:** The ±15% margin is an industry-informed assumption based on typical volume tolerance in recreational surfing. Adjust if recommendation feedback shows consistent over- or under-sizing.

---

### 9.3 Step 2 — Identify Closest Available Size

For all non-excluded boards, compute:

```
target_volume_center = (target_volume.min + target_volume.max) / 2
target_length_center = (target_length.min + target_length.max) / 2
```

Find the stock dimension with `volume_liters` closest to `target_volume_center`. This is the `best_available_size`.

---

### 9.4 Step 3 — Result Grading

| Condition | Result |
|---|---|
| ≥1 stock dimension has `volume_liters` within `[target_volume.min, target_volume.max]` | **strong** |
| No exact match but `best_available_size.volume_liters` is within `[target_volume.min − 2, target_volume.max + 2]` | **moderate** |
| `best_available_size.volume_liters` is more than 2L outside target range (but within ±15% exclusion boundary) | **weak** |

**Secondary length check:** If volume result is **strong** but `best_available_size.length` falls outside `[target_length.min, target_length.max]` → downgrade result to **moderate** and note the length discrepancy.

---

### 9.5 Recommended Size Assignment

- Result **strong**: `recommended_size` = stock dimension closest to `target_volume_center`
- Result **moderate**: `recommended_size` = closest available size; note it falls outside the target range
- `split_size` active: record both `recommended_size` (from `option_a`) and `alternative_size` (from `option_b`) using the Size Calculation Step output

---

## 10. Dimension 7 — Ride Feel / Shape Fit

**Evidence status:** Surf-knowledge grounded (concept: shape characteristics affect performance in specific conditions); specific signal mappings = industry-informed assumption; aggregation threshold = product heuristic

No hard exclusion for Ride Feel / Shape Fit.

---

### 10.1 Data Gap Handling (read first)

Shape fields frequently have `"unknown"` values in the current database. The rules below apply only to fields with known values.

- A field with value `"unknown"` → produces `data_gap` signal — not `beneficial` or `detrimental`
- `data_gap` signals are excluded from the aggregation denominator
- If fewer than 2 fields produce non-`data_gap` signals → result = **unknown** (not **weak**)
- All `data_gap` fields are recorded in the board's `data_gaps` output array

**The system must never penalize a board for missing shape data.**

---

### 10.2 Individual Shape Field Evaluations

Each known field produces one of: `beneficial` / `neutral` / `detrimental`

#### Rocker vs. Wave Context

| Surfer `conditions` | Board `rocker` | Signal |
|---|---|---|
| `weak` | `low` or `medium_reduced` | beneficial |
| `weak` | `medium` | neutral |
| `weak` | `high` or `steep` | detrimental |
| `balanced` | any value | neutral |
| `powerful` | `medium`, `high`, or `steep` | beneficial |
| `powerful` | `low` or `medium_reduced` | detrimental |
| `mixed` | `medium` | beneficial |
| `mixed` | `low` or `high` | neutral |

#### Tail Shape vs. Support/Performance Need

| Surfer `position` | Board `tail_shape` | Signal |
|---|---|---|
| `needs_support` | `squash` or `round` | beneficial |
| `needs_support` | `swallow` or `pin` | detrimental |
| `balanced` | `squash` | beneficial |
| `balanced` | `round` or `swallow` | neutral |
| `performance_capable` | `squash`, `swallow`, or `diamond` | beneficial |
| `performance_capable` | `round` or `pin` | neutral |

#### Rails vs. Support/Performance Need

| Surfer `position` | Board `rails` | Signal |
|---|---|---|
| `needs_support` | `soft` or `medium` | beneficial |
| `needs_support` | `hard` or `sharp` | detrimental |
| `balanced` | `medium` | beneficial |
| `balanced` | `soft` or `hard` | neutral |
| `performance_capable` | `hard` or `medium` | beneficial |
| `performance_capable` | `soft` | neutral |

#### Concave vs. Primary Intent

Used as a secondary signal only — lower weight in aggregation.

| Primary intent direction | Board `concave` | Signal |
|---|---|---|
| Speed / flow | `single_to_double`, `double`, or `vee` | beneficial |
| Maneuverability | `flat_to_vee` or `subtle_single` | beneficial |
| Other combinations | — | neutral |

**Note:** `outline` is referenced in `board-matching-layer.md` Section 5.7 but is not present in the current board data schema. It is excluded from evaluation until added to the data model. Record as `data_gap` if absent.

---

### 10.3 Aggregation

Count evaluable fields (i.e., all fields with non-`data_gap` signals):

- Evaluable count < 2 → result = **unknown**
- Evaluable count ≥ 2:
  - Majority beneficial (≥50% of evaluable fields are `beneficial`, zero `detrimental`) → **strong**
  - Mix of `beneficial` and `detrimental` present, or mostly `neutral` → **moderate**
  - Majority `detrimental` (>50% of evaluable fields) → **weak**

**Calibration note:** The 50% threshold for "majority beneficial" is a product heuristic. It should be revisited once board shape data is complete enough to produce meaningful Ride Feel evaluations across a diverse candidate set.

---

## 11. Hard Exclusion Summary

All hard exclusion triggers defined in this document, for reference:

| Dimension | Trigger condition | `exclusion_dimension` value |
|---|---|---|
| Level Fit | `board.min_band_rank > surfer.band_rank + 1` | `"level_fit"` |
| Requirement Fit | Any requirement gap ≥ 2 band ranks | `"requirement_fit"` |
| Size Fit | No stock dimension within ±15% of target volume range | `"size_fit"` |

These match the hard exclusion triggers defined in `board-matching-layer.md` Section 4. No additional exclusion triggers are introduced here.

---

## 12. Worked Example

**Surfer profile:**
- `actual_surfing_level`: `band = intermediate`, `sub_level = upper`
- `wave_context`: `conditions = weak`, `perceived_demand_level = low`
- `support_vs_performance_need.position`: `balanced`
- Primary pain point (Q5): `cant_generate_speed_weak_waves`
- Primary goal (Q6): `speed_and_flow`
- Size Calculation output: `target_volume.min = 28`, `target_volume.max = 33`, `target_length.min = 5.75`, `target_length.max = 6.08`

**Board: Channel Islands Better Everyday** (category: `groveler`)
- `level_range`: `{ min: "beginner", max: "intermediate" }` → min rank=1, max rank=2
- `condition_tags`: `["small_wave", "everyday_board"]`
- `performance_traits`: paddling_ease=4, stability=4, forgiveness=4, speed_generation=4, maneuverability=3
- `shape_profile`: rocker=`low`, tail_shape=`squash`, rails=`medium`, concave=`single_to_double`
- `stock_dimensions` (sample): includes 5'10" at 29.5L, 6'0" at 32.1L
- `surfer_fit_profile.requires`: `["ability_to_read_wave_sections"]`
- `helps_with`: `["generating_speed_in_weak_surf", "early_wave_catch"]`
- `performance_tags`: `["speed", "small_wave_specialist", "forgiving"]`

---

**Level Fit:**
- board min_rank = 1, surfer band_rank = 2 → gap of 0 below max, surfer is within range (rank 2 = max rank 2)
- Result: **strong**
- Note: "Surfer is at the top of this board's intended range — fully accessible, may feel slightly easy in well-suited conditions"

**Condition Fit:**
- conditions = `weak` → board has `small_wave` tag → aligned
- perceived_demand_level = `low` → board has `small_wave` tag → no penalty
- Result: **strong**
- Note: "Board is designed for small, weak waves — matches surfer's typical conditions"

**Intent Fit:**
- Primary pain point: `cant_generate_speed_weak_waves` → requires small_wave tag + speed → board has `small_wave` + speed_generation=4 + `speed` tag → addressed
- Primary goal: `speed_and_flow` → speed_generation=4 ≥ 3 → addressed
- Both met → Result: **strong**
- Note: "Board directly addresses primary pain point (speed in weak waves) and primary goal (speed and flow)"

**Requirement Fit:**
- `ability_to_read_wave_sections` → requires intermediate_lower
- Surfer is intermediate_upper → meets with comfortable margin
- Result: **strong**
- Note: "Surfer comfortably meets board's skill requirement"

**Support/Performance Fit:**
- support_score = mean(4, 4, 4) = 4.0
- performance_score = mean(4, 3) = 3.5
- Surfer: `balanced` → check: both scores within 2.5–3.5? support_score = 4.0 is above 3.5 → one score outside range
- Result: **moderate**
- Note: "Board leans support-heavy (support 4.0, performance 3.5) — suits a balanced surfer, slight bias toward ease over responsiveness"

**Size Fit:**
- 5'10" at 29.5L → within [28, 33] → volume match confirmed
- 5'10" = 5.83 decimal → within [5.75, 6.08] → length match confirmed
- Result: **strong**
- recommended_size: "5'10\" (29.5L)"

**Ride Feel / Shape Fit:**
- rocker=`low` + conditions=`weak` → beneficial
- tail_shape=`squash` + position=`balanced` → beneficial
- rails=`medium` + position=`balanced` → beneficial
- concave=`single_to_double` + intent direction=speed → beneficial
- 4 evaluable fields, 4 beneficial, 0 detrimental → majority beneficial → Result: **strong**

**match_strength aggregation:**
Scores: 3, 3, 3, 3, 2, 3, 3 → sum = 20, count = 7 → average = 2.86 → **strong** (≥ 2.5)

---

## 13. Calibration Tracking

All threshold values introduced in this document. Marked by evidence status and flagged for future revision.

| Threshold | Value | Status | What would update it |
|---|---|---|---|
| Level Fit hard exclusion (band gap) | > 1 band | Surf-knowledge grounded | No expected change — principled design decision |
| Requirement Fit hard exclusion (band gap) | ≥ 2 bands | Surf-knowledge grounded | Feedback from boards where requirements were misassessed |
| Size Fit hard exclusion margin | ±15% of target volume | Industry-informed assumption | Volume tolerance data from real recommendations |
| Size Fit moderate margin | ±2L from target range | Industry-informed assumption | Board selection feedback showing acceptable deviation |
| Support/Performance strong threshold | composite ≥ 3.5 | Product heuristic | Match quality feedback from recommendations |
| Support/Performance moderate floor | composite ≥ 2.5 | Product heuristic | Match quality feedback from recommendations |
| Intent Fit minimum score for strong | Primary pain + primary goal both met | Product heuristic | Frequency of intent mismatches in real recommendations |
| Ride Feel aggregation threshold | ≥ 50% beneficial, 0 detrimental | Product heuristic | Board feel feedback from real surfers |
| Ride Feel minimum fields for non-unknown | 2 evaluable fields | Product heuristic | Calibrate once board data is more complete |
