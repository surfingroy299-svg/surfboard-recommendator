# decision-layer.md

## 1. Purpose

Defines how the system produces advisory guidance signals from a structured surfer profile.

Answers:

**Given this profile, what signals should guide the recommendation?**

This layer produces advisory signals — not decisions. The Agent is responsible for the final recommendation. The signals produced here guide that reasoning; they do not replace it.

---

## 2. Role in the System

```
Surfer Profile (from Translation Layer)
         ↓
Decision Layer
         ↓
Advisory Signals → Agent  +  Size Calculation Step
```

The Decision Layer consumes the Surfer Profile and produces advisory signals. Those signals are consumed by the Agent (for reasoning) and the Size Calculation Step (specifically the Size Direction signal).

---

## 3. Decision Principles

- Constraints override preferences  
- Do not force precision  
- Confidence adjusts weight, not truth  
- Avoid dominance of weak signals  
- Always remain realistic  
- Preserve explainability  
- Allow partial direction instead of forcing binary outcomes  

---

## 4. Decision Inputs

- Actual Surfing Level  
- Wave Context  
- Current Board Fit / Mismatch  
- Support vs Performance Need  
- User Intent  
- Confidence per axis  

---

## 5. Axis Roles

### Constraint Axes
- Actual Surfing Level  
- Wave Context  
- Current Board Fit / Mismatch  

### Preference Axes
- User Intent  
- Support vs Performance Need  

---

## 6. Constraint Hierarchy

When constraint axes conflict, use the following priority:

1. **Actual Surfing Level** (hard limit - safety & realism)  
2. **Wave Context** (environmental constraint)  
3. **Current Board Fit / Mismatch** (diagnostic, but less absolute)  

Implications:

- Level cannot be overridden  
- Wave context can restrict performance even if level allows more  
- Board fit can suggest direction, but cannot break level or wave constraints  

---

## 7. Decision Process (Core Flow)

1. Apply constraint hierarchy  
   - eliminate invalid directions  
   - define the **allowed solution space**

2. Validate solution space  
   - if no valid direction → fallback to conservative baseline  
   - if multiple valid directions → keep them as candidates  

3. Evaluate preferences within constraints  
   - adjust direction using intent + support/performance need  
   - do not exceed allowed range  

4. Resolve conflicts  
   - constraint always wins  
   - preference is moderated, not ignored  

5. Apply confidence weighting  
   - high confidence → stronger influence  
   - low confidence → reduce influence  
   - conflicting low-confidence signals → preserve ambiguity  

6. Produce directional outputs  
   - allow **leaning**, not just binary  
   - allow **split direction** when necessary  

---

## 8. Conflict Resolution

When conflict occurs:

- Constraint wins  
- Preference influences only within valid range  
- If conflict remains unresolved → output uncertainty  

Examples:

- High performance intent + low level → moderate progression  
- Powerful waves + weak ability → restrict performance  
- Board mismatch unclear → avoid strong correction  

---

## 9. Confidence Weighting

- High confidence → strong directional signal  
- Medium confidence → soft influence  
- Low confidence → weak influence  

Rules:

- No single low-confidence axis can dominate  
- Multiple weak signals → do not force direction  
- Strong disagreement between axes → allow split output  

---

## 10. Decision Outputs

Signal values use `snake_case` for machine-readability throughout. The per-signal output format is in Section 10a. Progression Direction uses `split / unclear` as a single combined value (written with a slash); Size Direction and Category Direction treat `split` and `unclear` as separate values.

### 10.1 Progression Direction
- `maintain`
- `support_more`
- `challenge_more`
- `redirect`
- `split / unclear`

---

### 10.2 Size Direction
- `keep`
- `lean_up`
- `lean_down`
- `split`
- `unclear`

---

### 10.3 Category Direction
- `keep`
- `lean_change`
- `change_likely`
- `split`
- `unclear`

---

### 10.4 Challenge Level

Defines how aggressively the system pushes progression.

Derived from:
- Actual Surfing Level  
- Wave Context  
- Support vs Performance Need  

States:
- `conservative`
- `balanced`
- `progressive`
- `mixed`
- `unclear`

Must always remain consistent with constraints.

---

### 10.5 Intent Moderation

Describes how much user intent was adjusted.

- `preserved`
- `partially_moderated`
- `strongly_moderated`

---

### 10.6 Uncertainty Flags

An array — multiple flags can apply simultaneously. An empty array is valid.

- `low_confidence`
- `conflicting_signals`
- `no_dominant_direction`
- `insufficient_data`

---

## 10a. Per-Signal Output Format

Each signal produced by this layer follows this structure:

```
signal_name:
  value:        [signal value from the enum defined per signal above]
  confidence:   low / medium / high
  basis:        concise note describing the reasoning behind this signal
  source_axes:  [list of Surfer Profile axes that contributed to this signal]
  flags:        [optional — edge case notes, e.g. moderate_challenge_only]
```

Example:

```
progression_direction:
  value: challenge_more
  confidence: medium
  basis: User intent leans toward progression, but support/performance signals suggest the challenge should stay moderate.
  source_axes:
    - user_intent
    - support_vs_performance_need
    - actual_surfing_level
  flags:
    - moderate_challenge_only
```

---

## 11. Signal Mapping Rules

Defines how each of the 6 advisory signals is produced from the Surfer Profile. Each signal section specifies: primary inputs, a precedence-ordered mapping table, confidence rules, conflict handling, and an example.

---

### 11.1 Progression Direction

**Primary inputs:** `board_fit_mismatch.direction`, `board_fit_mismatch.fit`, `board_fit_mismatch.cause`, `actual_surfing_level.band`, `actual_surfing_level.sub_level`

**Secondary inputs:** `support_vs_performance_need.position`, `support_vs_performance_need.alignment`, `user_intent.intent_gap`, `wave_context.perceived_demand_level`

**Precedence-ordered mapping (apply the first rule that matches):**

| Priority | Condition | Output |
|---|---|---|
| 1 | `board_fit_mismatch.fit = unknown` | `split / unclear` |
| 2 | `fit ∈ {strongly_mismatched}` AND `direction = too_demanding` | `support_more` — overrides all preference signals |
| 3 | `cause = category` (regardless of direction or fit severity) | `redirect` |
| 4 | `cause = mixed` (category + size) AND `direction = too_demanding` | `redirect` — difficulty calibration carried by Challenge Level |
| 5 | `direction = too_demanding` AND `fit ∈ {limiting, mismatched}` AND `cause ≠ category` | `support_more` |
| 6 | `direction = too_supportive` AND `actual_surfing_level.band ≠ beginner` | `challenge_more` |
| 7 | `direction = roughly_right` OR `fit = well_matched` | `maintain` |
| 8 | `cause = context` | `maintain` — board is functionally correct; conditions are the constraint |
| 9 | Conflicting signals without resolution | `split / unclear` |

**Additional constraints on `challenge_more` (Priority 6):**
- Cannot apply when `band = beginner`
- Cannot apply when `wave_context.perceived_demand_level = high` AND `band = intermediate`, `sub_level = lower`

**Confidence rules:**

| Confidence | Conditions |
|---|---|
| `high` | board_fit direction clear; fit and position confidence both medium/high; signals agree |
| `medium` | One contributing axis at low confidence; or `redirect` with only the cause signal, no corroboration |
| `low` | `board_fit.fit = unknown`; or fit confidence = `low`; or competing directions unresolvable |

**Conflict handling:**

`too_demanding` + `performance_capable`:
- board_fit is a constraint; support_vs_performance is a preference
- Output: `support_more`
- Per-signal flag: `user_intent_diverges`
- The Agent must acknowledge the performance aspiration while explaining the mismatch must be fixed first

`too_supportive` + `needs_support` (surfer underestimates their level):
- Use board_fit as primary; output `challenge_more` at medium confidence
- Note the contradiction in `basis`

`redirect` vs `support_more` (cause = mixed, category + too_demanding):
- Output `redirect` as progression signal
- Size Direction carries the lean_up adjustment; Challenge Level is conservative or balanced

**Example:**

Profile: shortboard in weak waves, `board_fit.direction = too_demanding`, `cause = category`, `fit = limiting`, `support_vs_performance.position = balanced`

→ Progression Direction priority 3 matches: `redirect`
→ Basis: "Shortboard in weak conditions is a category mismatch. Difficulty level need not shift dramatically — a wave-appropriate category resolves the issue."

---

### 11.2 Size Direction

**Primary inputs:** `board_fit_mismatch.direction`, `board_fit_mismatch.cause`, `board_fit_mismatch.fit`

**Secondary inputs:** `support_vs_performance_need.position`

Consumed directly by the Size Calculation Step. Signals whether to apply a directional adjustment to the baseline sizing formula, and in which direction.

**Precedence-ordered mapping:**

| Priority | Condition | Output |
|---|---|---|
| 1 | `board_fit_mismatch.fit = unknown` | `unclear` |
| 2 | `cause = unclear` AND board_fit confidence = `low` | `unclear` |
| 3 | `cause = category` only (no size component) | `keep` — size is not the problem; use baseline sizing formula for new category |
| 4 | `cause = context` | `keep` — conditions are the issue, not size |
| 5 | `fit = well_matched` | `keep` |
| 6 | `direction = too_demanding` AND `cause` includes `size` | `lean_up` — severity determined by fit level (limiting → mild; mismatched/strongly_mismatched → firm) |
| 7 | `direction = too_supportive` AND `cause` includes `size` | `lean_down` |
| 8 | `cause = mixed` (size + category) — evaluate which cause dominates | `lean_up`, `lean_down`, or `split` depending on dominant cause and direction |
| 9 | `progression_direction = split / unclear` AND board_fit direction ambiguous | `split` |

**Key rule (priority 3):** When `cause = category` only, Size Direction = `keep`. The category change resolves the issue. The Size Calculation Step applies the standard baseline formula for the new category. No directional size adjustment is warranted.

**Confidence rules:**

| Confidence | Conditions |
|---|---|
| `high` | `cause` clearly includes or excludes `size`; board_fit confidence = medium/high |
| `medium` | `cause = mixed`; OR board_fit confidence = `medium` with no Q4 dimensional data |
| `low` | `fit = unknown`; OR `cause = unclear` with low board_fit confidence |

**Example:**

Profile: cause = `size`, direction = `too_demanding`, fit = `mismatched`
→ Priority 6: `lean_up` (firm, because fit = mismatched)
→ Basis: "Board is too demanding primarily due to size. Recommend a notable volume increase over baseline."

---

### 11.3 Category Direction

**Primary inputs:** `board_fit_mismatch.cause`, `board_fit_mismatch.direction`, `wave_context.conditions`

**Secondary inputs:** `actual_surfing_level.band`, `actual_surfing_level.sub_level`, Q1 board type (from board_fit_mismatch evidence)

**Precedence-ordered mapping:**

| Priority | Condition | Output |
|---|---|---|
| 1 | `board_fit_mismatch.fit = unknown` | `unclear` |
| 2 | `cause = unclear` | `unclear` |
| 3 | `cause = category` | `change_likely` — direction clarifies which way: too_demanding → more forgiving category; too_supportive → more performance category |
| 4 | `cause = context` | `keep` — category is appropriate; conditions are the limiting factor |
| 5 | `cause = size` only AND `fit = well_matched` | `keep` |
| 6 | `cause = mixed` (size + category) | `lean_change` or `split` (see conflict handling) |
| 7 | `cause = size` only + `direction = too_demanding` + Q1 = `shortboard` + `band = intermediate`, `sub_level = lower` | `lean_change` — within-shortboard size increase may be insufficient |
| 8 | `cause = size` only + `wave_context.conditions = weak` + Q1 = `shortboard` | `lean_change` — a wave-appropriate category is worth considering alongside the size adjustment |
| 9 | `cause = size` only (no special pattern) | `keep` |
| 10 | `wave_context.conditions = mixed` with no clear single category | `split` |

**For `change_likely` (priority 3), direction patterns:**
- `direction = too_demanding` + `cause = category` → move to more forgiving category (e.g., shortboard → fish, hybrid, or groveler)
- `direction = too_supportive` + `cause = category` → move to more performance-oriented category (e.g., softboard/funboard → fish, hybrid, or shortboard)

**Confidence rules:**

| Confidence | Conditions |
|---|---|
| `high` | `cause = category` clearly identified; Q1 board type and Q7 wave context both support the direction |
| `medium` | `cause = mixed`; OR Q1 = `unsure` in evidence; OR wave_context confidence = `medium` |
| `low` | `cause = unclear`; `fit = unknown`; wave_context and board_fit confidence both `low` |

**Conflict handling (`cause = mixed`):**
- If size cause is clearly more prominent: `lean_change` (category change is part of the answer but not the whole story)
- If causes are equally weighted: `split` (both a size adjustment and category change are valid parallel paths)
- Size Direction handles the size component; Category Direction handles the category component independently

---

### 11.4 Challenge Level

**Primary inputs:** `actual_surfing_level.band`, `actual_surfing_level.sub_level`, `support_vs_performance_need.position`, `board_fit_mismatch.fit`, `board_fit_mismatch.direction`

**Secondary inputs:** `wave_context.perceived_demand_level`, `user_intent.intent_gap`, axis confidence levels

**Hard ceiling rules (applied before any mapping):**
- If `band = beginner` → maximum output is `balanced`; never `progressive`
- If `fit = strongly_mismatched` AND `direction = too_demanding` → maximum output is `balanced`; never `progressive`

**Precedence-ordered mapping:**

| Priority | Condition | Output |
|---|---|---|
| 1 | `band = beginner` | `conservative` — always, regardless of other signals |
| 2 | `fit = strongly_mismatched` AND `direction = too_demanding` | `conservative` — fix the mismatch before applying challenge |
| 3 | `position = needs_support` AND `wave_context.perceived_demand_level = high` | `conservative` — conditions exceed current comfort level |
| 4 | Any axis contributing to this signal has `confidence.level = low` | `conservative` — when uncertain, default conservative |
| 5 | `band = intermediate`, `sub_level ∈ {lower, mid}` AND `position = balanced` AND no strong directional pressure | `balanced` |
| 6 | `fit = limiting` (mildly wrong, not dramatically off) AND `position = balanced` | `balanced` |
| 7 | `band = intermediate/upper` OR `band = advanced` AND `direction = too_supportive` AND `position = performance_capable` | `progressive` |
| 8 | `wave_context.conditions = mixed` OR `support_vs_performance_need.alignment = strong_gap` OR `meta.flags` includes type `ambiguous_level` | `mixed` |
| 9 | `actual_surfing_level.confidence = low` AND `position.confidence = low` simultaneously | `unclear` |

**Confidence rules:**

| Confidence | Conditions |
|---|---|
| `high` | actual_surfing_level confidence = high; support_vs_performance confidence medium/high; signals agree |
| `medium` | One primary axis at low/medium confidence; or signals mildly conflict |
| `low` | Both primary axes at low confidence; or `meta.limited_profile` flag set |

**Cross-signal note for Rule 5 of Section 11.7:** If `challenge_level = conservative` AND `size_direction = lean_down` appear together, this indicates an unusual edge case (e.g., a beginner on an oversized board). Flag it in uncertainty_flags as `conflicting_signals`. The Agent must reason about the tension explicitly.

---

### 11.5 Intent Moderation

**Primary inputs:** `user_intent.intent_gap`, `support_vs_performance_need.alignment`

**Cross-check:** whether Progression Direction aligns with what the user expressed

This signal tells the Agent how much user intent was preserved, adjusted, or substantially reframed. It is information for how the Agent frames the recommendation — not a quality judgment.

**Mapping:**

| Condition | Output |
|---|---|
| `intent_gap = none` AND `alignment = aligned` | `preserved` |
| `intent_gap = minor` OR `alignment = mild_gap` | `partially_moderated` |
| `intent_gap = significant` OR `alignment = strong_gap` | `strongly_moderated` |

**Conflict handling:**
- `intent_gap = none` BUT `alignment = strong_gap` → `strongly_moderated` (alignment is the stronger cross-axis signal)
- `intent_gap = significant` BUT `alignment = aligned` → `partially_moderated` (system agrees directionally even if intent was reframed)

**Agent obligation when `strongly_moderated`:** explicitly acknowledge the user's stated goal before explaining why the recommendation addresses a prerequisite first.

**Confidence:** always medium or high. Intent Moderation is directly derived from Translation Layer outputs and inherits their confidence.

---

### 11.6 Uncertainty Flags

`uncertainty_flags` is an array. Multiple flags can apply simultaneously. An empty array is valid and indicates a clean, high-confidence profile.

**`low_confidence` — trigger: ANY of:**
- `actual_surfing_level.confidence.level = low`
- `board_fit_mismatch.confidence.level = low`
- Any other Surfer Profile axis contributing to a primary signal has `confidence.level = low`

**`conflicting_signals` — trigger: ANY of:**
- Any Surfer Profile axis has `confidence.type = conflicting_signals`
- Cross-axis conflict: `board_fit_mismatch.direction = too_demanding` AND `support_vs_performance_need.position = performance_capable`
- Cross-axis conflict: `user_intent.intent_gap = significant` AND `support_vs_performance_need.alignment = strong_gap`
- Internal signal conflict: `challenge_level = conservative` AND `size_direction = lean_down` co-occur

**`no_dominant_direction` — trigger: ANY of:**
- `progression_direction.value = split / unclear`
- Both `category_direction` and `size_direction` are `split` or `unclear` simultaneously
- `challenge_level.value ∈ {mixed, unclear}`

**`insufficient_data` — trigger: ANY of:**
- Any Surfer Profile axis has `confidence.type ∈ {insufficient_data, data_gap}`
- `meta.flags` includes `limited_profile`
- `board_fit_mismatch.fit = unknown` (Q1 = `no_regular_board`)
- `meta.completeness.skipped` includes questions beyond the Q3/Q4 conditional gate

**Agent use of uncertainty flags:**
- 0 flags → present recommendations with full confidence
- 1 flag → note the specific uncertainty; recommendations remain valid
- 2+ flags → qualify the recommendation; invite the user to interpret tradeoffs themselves
- `no_dominant_direction` + `insufficient_data` together → name the uncertainty explicitly before presenting boards

---

### 11.7 Cross-Signal Consistency Rules

These rules define required relationships between the 6 output signals. Any output set that violates these is internally inconsistent.

1. `progression_direction = support_more` → `challenge_level` must be `conservative` or `balanced`; never `progressive`
2. `progression_direction = challenge_more` → `challenge_level` must be `progressive` or `balanced`; never `conservative`
3. `progression_direction = redirect` → `category_direction` must be `change_likely` or `lean_change`; never `keep`
4. `size_direction = keep` AND `category_direction = keep` → `progression_direction` must be `maintain` or `split / unclear`
5. `challenge_level = conservative` AND `size_direction = lean_down` → `uncertainty_flags` must include `conflicting_signals`; Agent handles explicitly
6. `progression_direction = split / unclear` → `uncertainty_flags` must include `no_dominant_direction`
7. `board_fit_mismatch.fit = unknown` in the Surfer Profile input → `uncertainty_flags` must include `insufficient_data`

---

## 12. Signal Scope

This layer advises on:

- direction  
- allowed range  
- constraint boundaries  

It does NOT:

- select boards  
- choose models  
- rank brands  
- define board attributes  
- make final recommendation decisions — those belong to the Agent

---

## 13. Guardrails

- No fake certainty  
- No breaking constraints  
- No re-interpretation of user  
- No premature decisions  
- No forcing a single direction when ambiguity exists  

---

## 14. Completion Criteria

- Produces consistent direction outputs  
- Handles conflicts deterministically  
- Supports ambiguity and split states  
- Advisory signals consumed by: Agent (all 6 signals), Size Calculation Step (Size Direction only), Board Matching Layer (all signals, advisory)
- All 6 signals have defined mapping rules with explicit precedence ordering (see Section 11)
- Cross-signal consistency rules are satisfied for every output set (see Section 11.7)