# translation-layer.md

## 1. Purpose

This file defines how the system interprets onboarding answers and produces a structured Surfer Profile.

The Translation Layer is an additive layer. It enriches raw onboarding answers with structured interpretation — it does not replace them or compress them into a single verdict.

This layer answers only:

**What does this user's situation mean, based on what they told us?**

It does **not** answer:

**What should the system recommend?**

---

## 2. Role in the System

```
Raw Answers (preserved alongside profile)
         ↓
Translation Layer
         ↓
Surfer Profile  ← schema defined in surfer-profile-schema.md
         ↓
Decision Layer  +  Agent  (both consume the profile)
```

The Translation Layer produces a Surfer Profile. Raw onboarding answers are preserved and available to the Agent directly — the profile does not replace them.

This file defines the Translation Layer only.

---

## 3. Translation Principles

- Descriptive, not prescriptive
- Interpretive, not decisive
- Preserve traceability from input → interpretation
- Use conservative inference only
- Do not force conclusions when signals are weak
- Preserve ambiguity when necessary
- Confidence reflects support level, not truth

---

## 4. Translation Output

The output is a structured **Surfer Profile**. The schema for this artifact is defined in `surfer-profile-schema.md`.

Each axis in the profile includes:
- `state` — axis-specific interpreted fields
- `confidence` — level / type / basis
- `evidence` — list of contributing signals, each with source, value, and contribution note
- `summary` — concise machine-readable interpretation of the axis state

The profile also includes a `meta` section (completeness, coherence, flags) and a `physical` section (height, weight). These are defined in `surfer-profile-schema.md`.

---

## 5. Input Routing and Cross-Cutting Rules

### 5.0.1 Q9 Routing

Q9 (`height_value`, `weight_value`) does **not** map to any of the 5 axes. It populates the Surfer Profile's `physical` section directly:

```
physical.height.value  ← Q9 height_value
physical.height.unit   ← Q9 unit selection (cm or in)
physical.weight.value  ← Q9 weight_value
physical.weight.unit   ← Q9 unit selection (kg or lbs)
```

Q9 weight may appear as contextual evidence in Axis 3 (`board_fit_mismatch`) when corroborating a size-related cause — but it is never interpreted by the Translation Layer. Volume appropriateness is assessed by the Size Calculation Step, not here.

---

### 5.0.2 Q2 + Q5 Reinforcing Signal Rule

Q2 (board feel) and Q5 (pain points) share semantically related signals. When both flag the same underlying issue, this is **reinforcing evidence from two sources**, not two separate problems.

**Reinforcing pairs:**

| Q2 value | Q5 value | What it reinforces |
|---|---|---|
| `struggles_to_catch_waves` | `struggles_to_catch_waves_consistently` | Paddling barrier — board or conditions limiting entry |
| `loses_speed_easily` | `loses_speed_on_wave` | Speed retention problem |
| `loses_speed_easily` | `cant_generate_speed_weak_waves` | Speed in weak conditions (highest specificity) |
| `feels_too_small_unstable` | `feels_unstable` | Board is too demanding / size mismatch |
| `hard_to_turn` | `cant_perform_turns` | Turn execution problem (direction still ambiguous) |

**How to apply:**
- Both entries appear in the evidence list with their own source, value, and contribution note
- The contribution note for the Q5 entry reads: "reinforcing signal — confirms Q2 observation from a different context"
- The axis state is set once based on the combined weight of the signal — not escalated just because it appears twice
- The confidence type becomes `consistent_signals` when a Q2+Q5 pair reinforces the same issue (even though both come from the same surfer, the two-context confirmation increases reliability)

---

### 5.0.3 Meta Section Rules

The `meta` section is populated during Translation Layer processing, not post-hoc.

**Completeness** — populated from routing:
- `questions_answered` and `skipped` derived from which questions the system received answers for
- `skip_reasons` populated from:
  - Q3 = `does_not_know_dimensions` → Q4 skip reason: `user_did_not_know_dimensions`
  - Q1 = `no_regular_board` → Q2 adapted, Q3/Q4 skipped with reason: `no_regular_board`

**Flags** — set when specific conditions are met:

| Flag | Trigger |
|---|---|
| `missing_dimensions` | Q3 = `does_not_know_dimensions` |
| `no_regular_board` | Q1 = `no_regular_board` |
| `conflicting_feel_signals` | Q2 includes mutually contradictory selections (e.g., `catches_waves_easily` + `struggles_to_catch_waves`) |
| `ambiguous_level` | Not emitted by Axis 1 since Q8 became a single-select ladder — a skipped rung is now inexpressible (see §6.4). Still raised by `wave_context.conditions = mixed` and by a strong intent/ability gap |
| `no_progression_signal` | Q6 = `wants_progression` only, and Q5 provides no specific direction |
| `limited_profile` | Two or more of the following: Q1 = `unsure`, Q3 = `does_not_know_dimensions`, Q8 is a single low-level selection, Q5 and Q6 are both vague |

**Coherence** — assessed after all 5 axes are processed:

| Assessment | When |
|---|---|
| `consistent` | Axes paint a coherent picture (e.g., lower-intermediate skill + board too demanding + wants stability) |
| `mixed` | Some tension but not contradictory (e.g., upper-intermediate skill + wants stability — a gap, but explicable) |
| `conflicting` | Real cross-axis contradictions (e.g., Q2 all positive but Q5 shows strong frustration; or high skill with instability pain and an undersized board) |

---

## 6. Axis 1 — Actual Surfing Level

**Purpose:** Interpret what the surfer can actually do in the water, based on behavior rather than self-perception.

**State fields:** `band`, `sub_level`, `edge_flags[]`
Schema reference: `surfer-profile-schema.md → Axis 1`

---

### 6.1 Primary Input — Q8 (Skill)

Q8 is a single-select ordered ladder, lowest to highest. The surfer picks the **highest rung they hold consistently**, and that answer asserts the whole contiguous ladder beneath it: the implied set is `ladder.slice(0, index + 1)`. The selected rung sets `band` and `sub_level` directly.

Because the implied ladder is contiguous by construction, the number of rungs held is a function of the answer rather than an independent input. It affects confidence, never the band assignment.

**Q8 selected rung → band + sub_level:**

| Highest Q8 value | Band | Sub-level | Notes |
|---|---|---|---|
| `can_stand_ride_straight` | `beginner` | `lower` | Below typical target range; proceed with `leans_beginner` flag |
| `can_ride_face` | `beginner` | `upper` | Lower boundary of target range |
| `can_make_basic_turns` | `intermediate` | `lower` | — |
| `can_link_turns` | `intermediate` | `mid` | — |
| `can_link_turns_smoothly` | `intermediate` | `upper` | — |
| `can_position_strategically` | `advanced` | `lower` | Unusual for the typical target range |

**Edge flags:**
- `leans_advanced`: apply when the selected rung is `can_link_turns_smoothly` — the top of intermediate, reaching into advanced.
  *Under single-select this replaces the former two-rung conjunction (`can_position_strategically` alongside `can_link_turns_smoothly`), which is now vacuous: the top rung implies the one below it, so the old rule would fire for every advanced reading and make the flag a synonym for `band = advanced`. Anchoring it to upper-intermediate is what keeps "spanning the boundary" meaningful — and is the reading `onboarding-questions.md` already gives this rung.*
- `leans_beginner`: apply when the selected rung is `can_stand_ride_straight` or `can_ride_face` (surfer is at or below the lower boundary of the target range)

---

### 6.2 Supporting Inputs — Q2 and Q5

Supporting signals adjust confidence and can add nuance to the evidence trail. They do not override the Q8-derived band.

**Q2 signals and their contribution to Axis 1:**

| Q2 value | Contribution |
|---|---|
| `catches_waves_easily` | Minor confirmation of adequate paddling — consistent with mid+ range |
| `struggles_to_catch_waves` | Ambiguous: could indicate lower skill OR board too demanding for conditions — do not lower band; note in evidence |
| `loses_speed_easily` | Consistent with intermediate ability (speed retention is a mid-range concern) |
| `hard_to_turn` | Ambiguous — could be skill gap OR board too sluggish; resolve with Q1 (see conflict handling below) |
| `feels_stable_comfortable` | Neutral to slightly consistent with adequate skill for the current board |
| `feels_too_small_unstable` | Ambiguous — could be board undersized OR skill deficit; resolve with Q1 and Q9 weight |

**Q5 signals and their contribution to Axis 1:**

| Q5 value | Contribution |
|---|---|
| `struggles_to_catch_waves_consistently` | Consistent with lower-intermediate range; note possible board cause |
| `loses_speed_on_wave` | Consistent with intermediate ability |
| `cant_generate_speed_weak_waves` | Consistent with intermediate ability surfing in weak conditions |
| `cant_perform_turns` | Ambiguous — same as Q2 `hard_to_turn`; resolve with Q1 |
| `feels_unstable` | Suggests board may be beyond current skill or size is wrong; do not lower band without additional support |
| `feels_stuck` | Broad signal; consistent with any intermediate level; no directional value for band placement |

---

### 6.3 Confidence Rules

Confidence turns on **corroboration, not count**: the ladder is always coherent, so the only open question is whether anything else in the answers agrees with it.

| Confidence level | Conditions |
|---|---|
| `high` | The selected rung is above `can_stand_ride_straight` (so it implies a range of 2+ rungs) AND at least one Q2 or Q5 signal is consistent with the inferred level |
| `medium` | Q2/Q5 provide no corroboration (`single_source`); OR the rung is `can_stand_ride_straight`, which implies no range beneath it; OR there is tension between Q8 and the supporting signals |
| `low` | Not reachable from an answered Q8. A single-select ladder cannot express the large unexplained gap this level described. `low` still applies when Q8 is unanswered, as `insufficient_data`. |

**Confidence type mapping:**

| Type | When |
|---|---|
| `consistent_signals` | Q2/Q5 corroborate the inferred level |
| `single_source` | Nothing in Q2 or Q5 confirms the claimed level. Matches the schema's definition — "only one answer contributed to this axis" — which under single-select is literally true |
| `insufficient_data` | Q8 unanswered |
| `conflicting_signals` | The selected rung is high but Q2/Q5 suggest lower ability |
| `indirect_inference` | Band inferred primarily from Q2/Q5 — reachable only when Q8 is unanswered, since an answered rung is always the primary signal |

---

### 6.4 Conflict Handling

**Q8 high skill + Q2/Q5 paddling struggle:**
- Selected rung is `can_link_turns_smoothly` or higher + Q2/Q5 `struggles_to_catch_waves`
- Do NOT lower the band. The paddling barrier is most likely board or conditions, not skill.
- Record both signals in evidence; note the discrepancy in the confidence basis.
- Confidence type: `conflicting_signals`; level: `medium`

**Q8 lower skill + Q2 `feels_stable_comfortable`:**
- `can_make_basic_turns` or lower (Q8) + Q2 `feels_stable_comfortable`
- Do NOT raise the band. The board may be over-supportive, masking actual difficulty.
- Note: may support Axis 3 direction = `too_supportive` (board providing more stability than needed).
- Confidence: `medium`, type `consistent_signals` (the stability is explained, not contradictory)

**Q2 `hard_to_turn` direction ambiguity:**
- Resolve using Q1 and Q8:
  - Q1 = `softboard` or `funboard` + Q8 = `can_link_turns` or higher → board is too sluggish; note this in Axis 3, not Axis 1
  - Q1 = `shortboard` + Q8 = `can_make_basic_turns` or lower → board may be too demanding for current skill; note as possible skill-board mismatch
  - Q1 = `unsure` or no resolution available → record as ambiguous; confidence type: `insufficient_data`

**Large Q8 skill gap — unreachable under single-select.**
- Previously: selections that skipped a rung set the `ambiguous_level` meta flag and dropped confidence to `low`/`conflicting_signals`.
- A single-select ladder cannot express a skipped rung, so this case is designed out of existence rather than left unhandled. The `ambiguous_level` flag is no longer emitted by Axis 1.
- The flag remains defined in the schema and the Decision Layer still tests for it, so the plumbing survives for any future input that could produce it. Its two other triggers — `wave_context.conditions = mixed` and a strong intent/ability gap — are unaffected.
- Retained here as a record of the rule this question used to need.

---

### 6.5 Examples

**Profile A — Clear mid-intermediate:**
- Q8 selected: `can_link_turns` (implies the three rungs beneath it)
- → band: intermediate, sub_level: mid
- Q2 = `loses_speed_easily` → consistent with intermediate; confidence: high, type: consistent_signals

**Profile B — Uncorroborated lower-intermediate:**
- Q8 selected: `can_make_basic_turns` (implies `can_stand_ride_straight`, `can_ride_face`)
- → band: intermediate, sub_level: lower
- No Q2/Q5 corroboration → confidence: medium, type: single_source
- *The rung implies a range, so the ladder is not what limits confidence here — the absence of any second signal is.*

**Profile C — Boundary with edge flag:**
- Q8 selected: `can_link_turns_smoothly` → band: intermediate, sub_level: upper
- Edge flags: [`leans_advanced`] — applied by the rung itself
- Q5 = `cant_perform_turns` absent, Q2 = `feels_stable_comfortable` present → confidence: high, type: consistent_signals

**Profile D — Bottom of the ladder:**
- Q8 selected: `can_stand_ride_straight` → band: beginner, sub_level: lower
- Edge flags: [`leans_beginner`]; contributes to the `limited_profile` meta flag
- Confidence: medium at best, even with corroboration — the bottom rung implies no range beneath it

---

## 7. Axis 2 — Wave Context

**Purpose:** Define the wave conditions the recommended board must perform in.

**State fields:** `conditions`, `usage_mode`, `perceived_demand_level`
Schema reference: `surfer-profile-schema.md → Axis 2`

> **V1 limitation:** `usage_mode = override` is supported architecturally but has no corresponding onboarding question in V1. Q7 captures the surfer's typical environment only. The `override` mode will remain unreachable in V1 and is reserved for a future onboarding expansion where the user can specify a different use case (e.g. travel, bigger waves, specific conditions).

---

### 7.1 Primary Input — Q7 (Environment)

Q7 is a single-choice, direct mapping. Each answer maps to all three state fields simultaneously.

| Q7 value | conditions | usage_mode | perceived_demand_level |
|---|---|---|---|
| `small_weak_waves` | `weak` | `baseline` | `low` |
| `medium_waves_with_push` | `balanced` | `baseline` | `moderate` |
| `powerful_steep_waves` | `powerful` | `baseline` | `high` |
| `variable_conditions` | `mixed` | `variable` | `moderate` |

---

### 7.2 Supporting Input — Q5 (Context Reinforcement Only)

Q5 can add evidence to Axis 2 but cannot change the Q7-derived state. It is a reinforcer, not an override.

**Q5 `cant_generate_speed_weak_waves` as reinforcer:**
- When Q7 = `small_weak_waves`: adds a second evidence entry confirming weak conditions; confidence type becomes `consistent_signals`
- When Q7 = `medium_waves_with_push`: the surfer reports speed problems specifically in weak waves, but describes their typical environment as medium push — possible contradiction. Keep Q7 as primary; note the tension in the confidence basis; reduce confidence to `medium`, type: `conflicting_signals`
- When Q7 = `powerful_steep_waves`: the signal is incongruent with the stated conditions. Note as an unusual combination; do not change state; confidence remains `high` (Q7 is authoritative); note the tension in evidence.

---

### 7.3 Confidence Rules

| Confidence level | Conditions |
|---|---|
| `high` | Q7 = `small_weak_waves`, `medium_waves_with_push`, or `powerful_steep_waves` (clear single signal) |
| `medium` | Q7 = `variable_conditions` (inherent uncertainty in scope); OR Q5 creates a minor contradiction with Q7 |
| `low` | Q7 missing (edge case only; Q7 is not gated) |

**Confidence type mapping:**

| Type | When |
|---|---|
| `single_source` | Q7 only, no Q5 corroboration — applies to all `baseline` answers |
| `consistent_signals` | Q7 `small_weak_waves` + Q5 `cant_generate_speed_weak_waves` both confirm weak conditions |
| `conflicting_signals` | Q5 implies different conditions than Q7 states |

**Note on `variable_conditions`:** The `moderate` perceived_demand_level assigned for this case is a midpoint default, not a precise inference. The confidence basis should note this: "variable conditions reported; perceived_demand_level set to moderate as default midpoint — actual range is unknown."

---

### 7.4 No Conflict Escalation

Q7 is the sole primary source for this axis. There is no input that overrides it. Contradictions from Q5 reduce confidence and are noted in evidence, but do not produce a different `conditions` value. Preserving Q7 as authoritative is intentional — the surfer answered explicitly about their typical environment.

---

## 8. Axis 3 — Board Fit / Mismatch

**Purpose:** Interpret whether the current board is well-matched, limiting, or mismatched for this surfer — and why.

**State fields:** `fit`, `direction`, `cause`, `competing_causes`, `conflict_explanation`
Schema reference: `surfer-profile-schema.md → Axis 3`

This is the most signal-rich axis. Assessment proceeds in five steps.

---

### 8.1 Step 1 — Pre-Condition: No Regular Board

If Q1 = `no_regular_board`:
- `fit`: `unknown`
- `direction`: `roughly_right` (no basis for assessment)
- `cause`: `unclear`
- `competing_causes`: null
- `conflict_explanation`: null
- Confidence: `low`, type: `data_gap`
- Set meta flag: `no_regular_board`
- **Stop; remaining steps do not apply**

If Q1 = `unsure`:
- Board type signal absent; proceed with feel signals only
- Note reduced confidence in Step 5

---

### 8.2 Step 2 — Establish Fit Level from Q2 Feel Signals

**Negative feel signals:** `struggles_to_catch_waves`, `loses_speed_easily`, `feels_too_small_unstable`
**Neutral/ambiguous:** `hard_to_turn`
**Positive feel signals:** `catches_waves_easily`, `feels_stable_comfortable`

| Q2 signal count and type | `fit` |
|---|---|
| Only positive signals; no negative signals | `well_matched` |
| 1 moderate negative signal (`struggles_to_catch_waves` or `loses_speed_easily`) | `limiting` |
| 2+ moderate negative signals; OR 1 strong signal (`feels_too_small_unstable`) | `mismatched` |
| `feels_too_small_unstable` + 1 other negative signal; OR 3 negative signals | `strongly_mismatched` |
| Ambiguous only (`hard_to_turn` alone, no other signals) | `limiting` (conservative; note ambiguity) |
| No Q2 data (Q1 = `no_regular_board` handled above; Q1 = `unsure` proceed) | `unknown` |

---

### 8.3 Step 3 — Q5 Escalation Check

After Step 2, check Q5 pain points for escalation or confirmation.

**Reinforcing Q5 signal (same issue already flagged in Q2):**
- Does not escalate the `fit` tier
- Adds a second evidence entry (see 5.0.2 cross-cutting rule)
- Increases confidence

**New Q5 negative dimension not in Q2:**
- Escalate `fit` tier by one level (e.g., `limiting` → `mismatched`)
- Add Q5 entry to evidence as a new-dimension signal

**Specific escalation rules:**

| Q5 value | Effect on Axis 3 |
|---|---|
| `struggles_to_catch_waves_consistently` | If Q2 doesn't already flag this: escalate `fit` one level; if Q2 does: reinforce only |
| `loses_speed_on_wave` | Same pattern as above |
| `cant_generate_speed_weak_waves` | High-specificity signal; alone can bring `fit` to `mismatched` if Q2 shows any negative signal at all |
| `feels_unstable` | If Q2 = `feels_too_small_unstable`: reinforce only; if Q2 does not flag instability: escalate one level |
| `cant_perform_turns` | Ambiguous (same as Q2 `hard_to_turn`); does not change `fit` alone; resolve direction separately |
| `feels_stuck` | Does not change `fit` tier; no evidence of board-specific mismatch |

---

### 8.4 Step 4 — Determine Direction

**`too_demanding` (current board asks more of the surfer than they can deliver):**

Primary indicators:
- Q2 `struggles_to_catch_waves` + Q1 = `shortboard` or `hybrid` (board requiring active paddle technique)
- Q2 `loses_speed_easily` + Q1 = `shortboard` + Q7 = `small_weak_waves` (shortboard in weak conditions needs active speed generation)
- Q2 `feels_too_small_unstable`
- Q5 `struggles_to_catch_waves_consistently` + Q1 = `shortboard`
- Q5 `feels_unstable`

Supporting indicators:
- Q8 = lower-intermediate (`can_make_basic_turns` or below) + Q1 = `shortboard`
- Q9 weight (high) relative to Q4 volume range (low) — record as potential evidence; do not calculate

---

**`too_supportive` (current board provides more support than the surfer needs, limiting potential):**

Primary indicators:
- Q1 = `softboard` or `funboard` + Q8 = `can_link_turns` or higher (board is below surfer's skill level)
- Q2 `hard_to_turn` + Q1 = `softboard` or `funboard` (board too sluggish for surfer's ability)
- Q5 `cant_perform_turns` + Q1 = `softboard` or `funboard` + Q8 = mid-intermediate or above

Supporting indicators:
- Q6 = `wants_freedom_to_move` or `wants_speed_and_flow` + Q2 = `feels_stable_comfortable` (board is safe but limiting; surfer wants more)
- Q2 `hard_to_turn` + Q1 = `fish` + Q8 = `can_link_turns_smoothly` or above (fish is limiting a capable surfer)

---

**`roughly_right` (board is broadly appropriate):**
- Q2 = positive signals only; no escalating Q5 signals; `fit` = `well_matched`
- OR no clear directional signal from any source

---

**Direction ambiguity (`hard_to_turn` without context):**
- Q2 `hard_to_turn` or Q5 `cant_perform_turns` with Q1 = `unsure` or `hybrid` (could go either direction)
- Do not set direction; leave note in evidence that direction is unresolved
- Confidence type: `insufficient_data`

---

### 8.5 Step 5 — Determine Cause

**Cause = `size`:**
- Q4 volume range appears low relative to Q9 weight (record as evidence; do not calculate a deficit here)
- Q2/Q5 instability signals + Q1 = `shortboard` or `hybrid` → undervolume likely for body weight
- Q2 `struggles_to_catch_waves` + Q1 = `fish` or `hybrid` → fish/hybrid should paddle well; if not, likely undersized for weight

**Cause = `category`:**
- Q1 = `shortboard` + Q7 = `small_weak_waves` + Q2/Q5 speed problem → shortboard category cannot self-generate speed in weak conditions; a different board category is needed
- Q1 = `softboard` or `funboard` + Q8 = mid-upper intermediate + Q2/Q5 turn frustration → board category is too conservative for skill level

**Cause = `context`:**
- Q7 = `small_weak_waves` + Q1 = appropriate small-wave board (fish/hybrid) + no size mismatch evident → conditions are the limiting factor; board is functionally correct but conditions don't allow it to shine
- Use sparingly — context is the least supported cause without additional override data

**Cause = `mixed`:**
- Two causes clearly indicated (e.g., Q1 = `shortboard` + Q4 shows low volume range + Q7 = `small_weak_waves` → size AND category both contributing)
- Use `competing_causes` array to list both; add `conflict_explanation` note

**Cause = `unclear`:**
- Only `hard_to_turn` signal, no supporting context
- Q1 = `unsure`, no feel signals strong enough to determine cause
- `competing_causes`: null

---

### 8.6 Q4 Dimensional Data as Evidence

When Q3 = `knows_dimensions` and Q4 data is provided:
- Add Q4 `board_length` and/or `board_volume_range` as evidence entries
- Contribution note: observe the relationship between Q4 volume and Q9 weight (e.g., "32L reported for a 78kg surfer — Q4 volume is within plausible range; size as sole cause is less certain")
- Do NOT calculate whether the volume is appropriate — that is the Size Calculation Step's job
- If Q4 volume appears clearly low for Q9 weight by surf knowledge norms, note it as supporting evidence for `cause = size` without asserting a deficit

When Q3 = `does_not_know_dimensions`:
- Set meta flag `missing_dimensions`
- Confidence type includes `data_gap` basis note: "Board dimensions unavailable — fit assessed from feel signals only"
- Q4 board_model_brand (if somehow available) is not a substitute for volume data

---

### 8.7 Confidence Rules for Axis 3

| Confidence level | Conditions |
|---|---|
| `high` | Multiple consistent signals from Q1 + Q2 + Q5 + Q7 all pointing the same direction; OR dimensional confirmation from Q4 corroborates the fit diagnosis |
| `medium` | Q2 feel signals present but no dimensional confirmation; OR Q1 = `unsure`; OR Q2 has both positive and negative signals |
| `low` | Q1 = `no_regular_board`; OR only 1 weak Q2 signal with no Q5 support; OR Q2/Q5 directly contradict each other |

**Confidence type mapping:**

| Type | When |
|---|---|
| `consistent_signals` | Q2 + Q5 reinforce the same issue; Q1 and Q7 are consistent with the direction |
| `conflicting_signals` | Q2 positive signals contradict Q5 negative pain points |
| `single_source` | Only Q2 with no Q5 or Q4 corroboration |
| `data_gap` | Q3 = `does_not_know_dimensions` — always noted in basis; accompanies medium confidence when feel signals are not decisive |
| `insufficient_data` | Q1 = `unsure` and Q2 signals are limited or ambiguous |

---

### 8.8 Conflict Handling for Axis 3

**Q2 positive + Q5 negative (the most common conflict):**
- Q2 `catches_waves_easily` + Q5 `struggles_to_catch_waves_consistently`
- Q5 is the primary driver (per `onboarding-layer.md` design principles)
- Set fit based on Q5; note in confidence basis that Q2 didn't corroborate
- Confidence: `medium`, type: `conflicting_signals`
- Set meta flag: `conflicting_feel_signals`

**Q2 `feels_stable_comfortable` + Q5 `feels_unstable`:**
- Same pattern: Q5 overrides Q2
- Possible explanation: board feels stable in calm moments but surfer loses it when riding a wave actively
- Note this tension explicitly in the conflict_explanation or summary

---

## 9. Axis 4 — Support vs Performance Need

**Purpose:** Define whether the surfer needs more support (forgiveness, ease) or is ready for more performance-oriented equipment — and whether that matches what they asked for.

**State fields:** `position`, `alignment`
Schema reference: `surfer-profile-schema.md → Axis 4`

---

### 9.1 Position Signals

Assess position by weighing the signals below. This is a qualitative accumulation, not a point count.

**Signals toward `needs_support`:**

| Signal | Strength | Source |
|---|---|---|
| Q6 = `wants_stability` | Strong | Q6 |
| Q6 = `wants_easier_wave_catch` | Strong | Q6 |
| Q5 = `feels_unstable` | Strong | Q5 |
| Axis 1: band = `beginner` OR sub_level = `lower` | Moderate | Axis 1 |
| Axis 3: direction = `too_demanding` | Moderate | Axis 3 |
| Q5 = `struggles_to_catch_waves_consistently` | Moderate | Q5 |
| Q8 highest = `can_make_basic_turns` or below | Weak | Q8 |

**Signals toward `performance_capable`:**

| Signal | Strength | Source |
|---|---|---|
| Q8 highest = `can_link_turns_smoothly` or `can_position_strategically` + Q6 = `wants_speed_and_flow` or `wants_freedom_to_move` | Strong | Q8 + Q6 |
| Axis 3: direction = `too_supportive` (board is holding surfer back) | Moderate | Axis 3 |
| Q6 = `wants_freedom_to_move` + Axis 1 sub_level = `mid` or above | Moderate | Q6 + Axis 1 |
| Q6 = `wants_speed_and_flow` + Axis 1 sub_level = `mid` or above | Moderate | Q6 + Axis 1 |
| Q2 = `catches_waves_easily` + Q1 = `shortboard` (manages a demanding board's paddle) | Weak | Q2 + Q1 |

**Neutral signals (do not tip either way):**
- Q6 = `wants_turn_control` (direction-ambiguous)
- Q6 = `wants_progression` (direction-ambiguous)
- Q5 = `cant_perform_turns` (direction-ambiguous)
- Q5 = `feels_stuck` (broad; no directional implication)

---

### 9.2 Position Determination

| Position | Conditions |
|---|---|
| `needs_support` | 1+ strong support signal; OR 2+ moderate support signals; AND no strong performance signals |
| `balanced` | Mixed signals; OR only weak signals in one direction; OR no clear Q5/Q6 signals but Axis 1 = intermediate/mid |
| `performance_capable` | 1+ strong performance signal AND Axis 1 = intermediate/upper or above; AND no significant support signals |

When signals conflict across strength levels, prefer the stronger signal. When signals are equal weight, default to `balanced`.

---

### 9.3 Alignment Determination

`alignment` describes the gap between the surfer's stated goals and what their profile suggests they actually need.

**`aligned`:** Stated goals and profile signals point in the same direction.
- Q6 = `wants_stability` + Q5 = `feels_unstable` + position = `needs_support` → aligned
- Q6 = `wants_speed_and_flow` + Q5 = speed frustration + position = `balanced` or `performance_capable` → aligned

**`mild_gap`:** Slight tension; goal is ahead of or behind the inferred need, but not dramatically.
- position = `balanced` + Q6 = `wants_speed_and_flow` (leaning toward performance but not fully supported by skill) → mild_gap
- position = `performance_capable` + Q6 = `wants_stability` (wants slightly more safety than their level requires) → mild_gap

**`strong_gap`:** Significant tension; the stated goal substantially outpaces or underestimates the inferred need.
- position = `needs_support` + Q6 = `wants_speed_and_flow` AND `wants_freedom_to_move` (aspirations significantly outpace current need) → strong_gap
- position = `performance_capable` (board too supportive based on Axis 3 direction = `too_supportive`) + Q6 = `wants_stability` (asking for more safety when they actually need less) → strong_gap (reverse direction)

A `strong_gap` is not a judgment on the surfer. It is information for the Agent: "the surfer's stated aspiration and their current situation are not aligned — the Agent should acknowledge both."

---

### 9.4 Confidence Rules for Axis 4

| Confidence level | Conditions |
|---|---|
| `high` | Q5 and Q6 are aligned and clearly indicate the same direction; OR there is a strong signal + corroboration from Axis 1 or Axis 3 |
| `medium` | Only Q6 or Q5 provides directional signal (not both); OR they mildly diverge |
| `low` | Both Q5 and Q6 are ambiguous or broad (`wants_progression` + `feels_stuck`) with no directional signal |

**Confidence type mapping:**

| Type | When |
|---|---|
| `consistent_signals` | Q5 and Q6 agree; Axis 1 and Axis 3 support the same direction |
| `indirect_inference` | Position inferred primarily from Axis 1 level when Q5/Q6 are neutral |
| `conflicting_signals` | Q5 implies support need; Q6 implies performance aspiration (or vice versa) |
| `single_source` | Only Q6 or only Q5 provides a signal |
| `insufficient_data` | Neither Q5 nor Q6 provide directional signals |

---

## 10. Axis 5 — User Intent

**Purpose:** Capture what the surfer wants and how that intent should be interpreted given their profile.

**State fields:** `raw_intent`, `interpreted_intent`, `intent_gap`
Schema reference: `surfer-profile-schema.md → Axis 5`

---

### 10.1 raw_intent Construction

`raw_intent` is a plain-language synthesis of Q6 (primary) and Q5 (secondary). It describes what the surfer expressed — not what the system infers.

**Single Q6 selection → direct mapping:**

| Q6 value | raw_intent text |
|---|---|
| `wants_speed_and_flow` | "more speed and flow on the wave" |
| `wants_turn_control` | "more control when turning" |
| `wants_stability` | "more stability and confidence" |
| `wants_freedom_to_move` | "more freedom to move and try things" |
| `wants_easier_wave_catch` | "catch waves more easily and consistently" |
| `wants_progression` | "improve and progress my surfing" |

**Two Q6 selections → combine into one sentence:**
- `wants_speed_and_flow` + `wants_freedom_to_move` → "more speed, flow, and freedom to move on the wave"
- `wants_stability` + `wants_easier_wave_catch` → "more stability and easier wave catching"
- `wants_progression` + `wants_speed_and_flow` → "improve my surfing, particularly around speed and flow"
- `wants_progression` + `wants_stability` → "improve my surfing and feel more stable and confident"

**When Q6 = `wants_progression` only (no specificity):**
- Raw intent should reflect Q5 instead if Q5 provides a specific anchor
- Q5 = `loses_speed_on_wave` → raw_intent: "improve my surfing, particularly around generating speed"
- Q5 = `feels_unstable` → raw_intent: "improve my surfing and build more stability"
- Q5 = `feels_stuck` + Q6 = `wants_progression` only → raw_intent: "improve and progress my surfing" (broad; noted in interpreted_intent)

**Q6 free text:** If Q6 free text is present, the Agent may synthesize it with the structured Q6 values. In V1, the Translation Layer does not process free text — include it in the evidence record as `source: Q6, value: free_text_goal` with contribution note: "Agent-only in V1; raw content preserved."

---

### 10.2 interpreted_intent Construction

`interpreted_intent` recontextualizes `raw_intent` based on the full profile. Apply the first applicable rule below.

**Rule A — Aligned pain and goal (same theme):**
- When Q5 pain and Q6 goal address the same surfing problem, interpreted_intent adds causal context
- Pattern: `[raw_intent]` + "— likely achievable through `[inferred mechanism based on Axis 3]`"
- Example: raw_intent = "more speed and flow" + Q5 = `cant_generate_speed_weak_waves` + Axis 3 cause = `category` or `size` → "improve speed and momentum in weak conditions — likely requires a board better suited to generating speed in low-power surf"

**Rule B — Broad progression goal resolved by Q5:**
- When Q6 = `wants_progression` only and Q5 identifies a specific problem
- Pattern: "progress by addressing `[Q5 problem]` — `[inferred mechanism]`"
- Example: Q6 = `wants_progression` + Q5 = `feels_unstable` + Axis 3 direction = `too_demanding` → "progress by addressing instability — a better-matched board is the prerequisite; technique improvements will follow"

**Rule C — Performance goal with support need:**
- When Q6 implies performance but Q5/Axis 4 shows support need
- Pattern: "stated goal is `[Q6]`, but the profile suggests `[support need]` is a prerequisite — recommend addressing stability/access first"
- Example: Q6 = `wants_speed_and_flow` + Q5 = `feels_unstable` + position = `needs_support` → "stated goal is speed and flow, but the profile suggests stability is a prerequisite — a better-matched board will address stability first and enable speed as a result"

**Rule D — Support goal with over-supportive board:**
- When Q6 implies wanting more safety but Axis 3 direction = `too_supportive`
- Pattern: "surfer seeks `[Q6]`, but may be on too supportive a board — a modest step toward performance may improve the surfing feel without reducing safety"
- Example: Q6 = `wants_stability` + Axis 3 = `too_supportive` → "surfer seeks stability, but the board may already be over-supportive — a step toward appropriate volume/category could improve feel without compromising confidence"

**Rule E — No special rule applies (plain restatement):**
- When Q5 and Q6 are aligned and no reframing is needed, interpreted_intent = raw_intent with brief elaboration
- Example: Q6 = `wants_easier_wave_catch` + Q5 = `struggles_to_catch_waves_consistently` → "catch waves more easily and consistently — the profile suggests this is primarily a board-fit issue, not technique"

---

### 10.3 intent_gap Determination

| Value | When |
|---|---|
| `none` | interpreted_intent ≈ raw_intent; no reframing; Rule E applied |
| `minor` | interpreted_intent adds causal context or condition specificity but does not redirect the goal; Rule A or E applied |
| `significant` | interpreted_intent substantially reframes or reorders priorities; Rule B, C, or D applied |

---

### 10.4 Confidence Rules for Axis 5

| Confidence level | Conditions |
|---|---|
| `high` | Q5 and Q6 are aligned and specific; raw_intent is well-defined; interpreted_intent follows clearly |
| `medium` | Q6 selections are broad (`wants_progression` alone); OR only Q5 provides direction with no Q6 specificity; OR Q5 and Q6 are mildly divergent |
| `low` | Both Q5 and Q6 are vague; OR they point in significantly different directions with no clear resolution |

**Confidence type mapping:**

| Type | When |
|---|---|
| `consistent_signals` | Q5 and Q6 are thematically aligned and specific |
| `single_source` | Only Q6 provides signal (Q5 is broad or neutral); or only Q5 with no Q6 specificity |
| `indirect_inference` | Intent constructed primarily from Q5 because Q6 = `wants_progression` without direction |
| `conflicting_signals` | Q5 and Q6 point in notably different directions (e.g., Q5 = instability but Q6 = performance) |
| `insufficient_data` | Both Q5 and Q6 are vague (e.g., `feels_stuck` + `wants_progression` with no elaboration) |

---

## 11. Progression Direction

Handled in the Decision Layer. Not part of the Surfer Profile output.

---

## 12. Handling Ambiguity

Allowed states:
- `unknown` (fit, cause, direction)
- `mixed` (conditions, causes)
- `unclear` (direction, cause)
- `competing_causes` (Axis 3 — use the array field)
- `no dominant explanation` (expressed in summary and confidence basis)

Ambiguity is valid output, not failure. When the Translation Layer cannot resolve a signal, it records the ambiguity explicitly. The Agent and Decision Layer receive the uncertainty and reason about it — the Translation Layer does not resolve it by guessing.

---

## 13. What This Layer Does Not Do

- No decision making
- No prioritization between axes
- No recommendation or board selection
- No volume or size calculation (that belongs to the Size Calculation Step)
- No override of Q7 wave context by Q5 signals
- No escalation of band based on feel signals alone

---

## 14. Completion Criteria

The Translation Layer output is complete when:

- All 5 axes are populated with state, confidence (level / type / basis), evidence[], and summary
- `meta` section is populated with completeness, coherence, and flags
- `physical` section is populated with Q9 values
- No embedded decision logic is present
- Confidence is defined per axis with a specific type and basis note
- Ambiguity is preserved — no axis forces a value when signals are unclear
- All `evidence[].value` fields reference canonical normalized values from `onboarding-questions.md`
- Surfer Profile matches the contract defined in `surfer-profile-schema.md`
- Profile is available to both the Decision Layer and the Agent
