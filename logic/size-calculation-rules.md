# size-calculation-rules.md

## 1. Purpose

This document defines the actual sizing rules behind `size-calculation-step.md`. That document defines the input/output contract — what comes in, what comes out, what the output means. This document defines how the output is computed: the formula, the adjustments, what each adjustment represents, and how confident we are in each component.

**Sizing philosophy:**
Volume is the primary output. Length is secondary. Volume is estimated from body weight multiplied by a skill-level factor (the Guild Factor method, industry-standard across major board brands), then adjusted for wave conditions. Board category provides a contextual frame that interprets the volume convention appropriate for that board type. Two signals — size direction and support/performance need — tell the system where in the computed range to recommend from; they do not add additional multipliers on top of it.

**Formula structure:**
```
1. Baseline volume range    ← GF table × body weight
2. × Wave conditions        ← the only compounding multiplier
= Adjusted volume range     ← primary foundation of the recommendation

3. Board category context   ← reframes the volume convention per category
4. Size direction           ← biases which part of the range to use;
                               optionally extends one bound
5. Support/performance need ← preference guidance in note field only;
                               not a multiplier
```

---

## 2. Evidence Status

Every rule in this document carries one of three labels:

| Label | Meaning |
|---|---|
| **Evidence-backed** | Concept and general direction are both supported by industry calculators or published shaper guidance. The rule is not an invention. |
| **Industry-informed assumption** | The concept is supported — the surfboard industry converges on this direction — but the specific numeric value is estimated from general knowledge. No single source publishes the exact number used here. Should be treated as an initial calibration value, not a validated constant. |
| **Product heuristic** | Introduced by this system; no direct industry analogue. Logically motivated and testable, but not independently validated. Should be revisited when outcome data is available. |

Where a number is labeled as an initial calibration value, it means: use this value to start, and revise it if empirical comparison against real boards and real surfer outcomes shows it is consistently off.

---

## 3. Inputs

| Input | Source | Values |
|---|---|---|
| `physical.height` | Surfer Profile — physical | Height value + unit (cm or in) |
| `physical.weight` | Surfer Profile — physical | Weight value + unit (kg or lbs) |
| `actual_surfing_level.band` | Surfer Profile — Axis 1 | `beginner` / `intermediate` / `advanced` / `pro` |
| `actual_surfing_level.sub_level` | Surfer Profile — Axis 1 | `lower` / `mid` / `upper` |
| `wave_context.conditions` | Surfer Profile — Axis 2 | `weak` / `balanced` / `powerful` / `mixed` |
| `wave_context.perceived_demand_level` | Surfer Profile — Axis 2 | `low` / `moderate` / `high` |
| `support_vs_performance_need.position` | Surfer Profile — Axis 4 | `needs_support` / `balanced` / `performance_capable` |
| `size_direction.value` | Decision Layer | `keep` / `lean_up` / `lean_down` / `split` / `unclear` |
| `board_category_context` | Passed per evaluation pass | see Section 6 |

**Unit normalization (apply before any calculation):**
- `physical.weight.unit = lbs` → `weight_kg = physical.weight.value / 2.2046`
- `physical.weight.unit = kg` → `weight_kg = physical.weight.value`
- `physical.height.unit = in` → `height_cm = physical.height.value × 2.54`
- `physical.height.unit = cm` → `height_cm = physical.height.value`

All subsequent calculations use `weight_kg` and `height_cm`.

---

## 4. Baseline GF Table

**Evidence status: Evidence-backed method. Industry-informed assumptions for specific values.**

The Guild Factor (GF) method is the standard sizing approach used by Channel Islands, Firewire, Lost, and other major brands. The formula — `volume (L) = weight_kg × GF` — is industry consensus. The principle that volume scales with body weight and the appropriate multiplier decreases with skill is not an invention.

The specific GF values in this table are not published by any single source. They are estimated from:
- General industry guidance (beginners near body weight in liters; advanced surfers near 0.30–0.43×)
- A small number of reference data points at the advanced and pro end (CT-level professionals at approximately 0.32–0.36×)
- Calibration to produce plausible volumes at each tier based on board types commonly associated with each level

All values are initial calibration estimates. If comparison against real boards and real surfer outcomes shows they produce systematically off recommendations for a given tier, the values should be revised. See Section 15.

| `band` | `sub_level` | `gf_min` | `gf_max` | Volume range at 75 kg |
|---|---|---|---|---|
| `beginner` | `lower` | 0.87 | 1.00 | 65 – 75 L |
| `beginner` | `mid` | 0.76 | 0.90 | 57 – 68 L |
| `beginner` | `upper` | 0.65 | 0.80 | 49 – 60 L |
| `intermediate` | `lower` | 0.53 | 0.68 | 40 – 51 L |
| `intermediate` | `mid` | 0.45 | 0.58 | 34 – 44 L |
| `intermediate` | `upper` | 0.37 | 0.50 | 28 – 38 L |
| `advanced` | `lower` | 0.32 | 0.43 | 24 – 32 L |
| `advanced` | `mid` | 0.28 | 0.37 | 21 – 28 L |
| `advanced` | `upper` | 0.25 | 0.33 | 19 – 25 L |
| `pro` | — | 0.23 | 0.32 | 17 – 24 L |

**On adjacent overlap:** Adjacent tiers intentionally share a volume zone — e.g., `intermediate/upper` and `advanced/lower` both cover approximately 28–32 L at 75 kg. A surfer at the boundary between tiers receives similar recommendations regardless of which tier they land in. This is correct behavior.

**On the `pro` sub_level:** The system schema supports sub-levels within `pro`, but at this calibration stage, a single range applies to all pro sub-levels. The table can be extended if differentiated calibration data emerges.

**On range width within a tier:** Two surfers at the same weight, band, and sub_level may differ in fitness, surf frequency, and body composition. The range is honest about this uncertainty. Preference signals (Sections 7 and 8) guide which part of the range to recommend from.

---

## 5. Wave Conditions Adjustment

**Evidence status: Evidence-backed concept. Industry-informed assumption for specific percentages.**

The concept that wave energy affects required board volume is not an invention. Firewire explicitly publishes two separate volume recommendations — one for "regular" conditions, one for "better/larger" waves. Channel Islands' calculator asks about typical wave type. The logic is physically grounded: in weak, slow surf, the board must generate its own speed through volume and outline; more float compensates for the wave providing little energy. In powerful surf, the wave provides energy; excess volume reduces rail engagement and control.

The specific percentages are industry-informed assumptions. Firewire does not publish its adjustment math. The values below are estimated from general knowledge and labeled as initial calibration values.

**Primary input:** `wave_context.perceived_demand_level` — the most direct signal for how much energy the wave provides.

**Secondary input:** `wave_context.conditions` — used to confirm the perceived_demand_level signal. When both agree, apply the full adjustment. When they conflict, apply the adjustment at reduced strength and widen the range modestly.

| `perceived_demand_level` | Direction | Initial calibration value |
|---|---|---|
| `low` (weak waves) | Shift range **up** | Multiply both bounds by **1.07** |
| `moderate` | No adjustment | Multiply both bounds by **1.00** |
| `high` (powerful waves) | Shift range **down** | Multiply both bounds by **0.93** |

**When `conditions = mixed`:** After applying the demand-level factor, additionally widen the range: multiply `min` by 0.97 and `max` by 1.03. This reflects genuine uncertainty when conditions vary across sessions.

**When `conditions` and `perceived_demand_level` conflict:** Use the more conservative (higher-volume) direction at half the normal adjustment magnitude.

**When Axis 2 confidence is `low`:** Apply no adjustment (×1.00). Include in the output note: _"Wave conditions confidence insufficient. Volume range is unadjusted for conditions."_

**Formula:**
```
adjusted_min = baseline_min × conditions_factor
adjusted_max = baseline_max × conditions_factor
```

This is the primary adjusted range. All subsequent steps are contextual frames or preference signals — not additional multipliers stacked on top of this one.

---

## 6. Board Category Context

**Evidence status: Evidence-backed concept. Industry-informed assumptions for shortboard-family multipliers. Rough approximation (product heuristic) for mid-length and longboard.**

Different board categories have different volume conventions for the same surfer. All major brand calculators ask about board type and produce category-specific recommendations — the concept is not an invention. The specific multipliers below are initial calibration assumptions. The ordering is correct and cross-referenced with general brand guidance; the exact percentages are estimated and should be revised as the board database grows.

**Application:** Apply to the adjusted range from Section 5.

### 6.1 Shortboard family

The GF table in Section 4 is calibrated for shortboard-category boards. These adjustments reflect how volume conventions shift across related board types within the same design family.

| `board_category_context` | Multiplier range | Initial calibration value |
|---|---|---|
| `shortboard` | ×1.00 | ×1.00 — baseline |
| `performance_shortboard` | ×1.00 | ×1.00 — same convention as shortboard |
| `everyday_shortboard` | ×1.02–1.04 | ×1.03 |
| `groveler` | ×1.04–1.08 | ×1.06 |
| `fish` | ×1.03–1.07 | ×1.05 |
| `hybrid` | ×1.03–1.06 | ×1.04 |
| `step_up` | ×0.94–0.98 | ×0.96 |

The multiplier ranges (not just the single values) reflect genuine uncertainty in these estimates. The initial calibration value is used for computation; the range indicates how much the value might move as calibration data accumulates.

### 6.2 Mid-length and longboard

**Evidence status for this sub-section: Product heuristic (rough approximation only).**

The GF formula was developed for and calibrated against shortboard-category boards. Applying it to mid-lengths and longboards requires a substantially larger adjustment that stretches the formula well outside its calibrated range. The multipliers below are coarse approximations.

| `board_category_context` | Multiplier range | Initial calibration value |
|---|---|---|
| `mid_length` | ×1.35–1.55 | ×1.45 |
| `longboard` | ×1.70–2.00 | ×1.85 |

**For `mid_length` and `longboard` evaluations:** After applying the category multiplier, expand the output range by an additional 10% in each direction (lower bound ×0.90, upper bound ×1.10). Include in the output note: _"Volume range for this category is a GF-based approximation. Precision is lower than for shortboard-family boards."_

These values are placeholders. Revise as soon as mid-length and longboard models are added to the board database and their real volumes can be compared against the computed ranges.

### 6.3 If `board_category_context` is absent

Apply no adjustment (×1.00). Include in the output note: _"No board category context provided. Volume range is shortboard-calibrated. Treat with caution if the board being evaluated is a different type."_

---

## 7. Size Direction — Range Emphasis

**Evidence status: Product heuristic.**

No industry calculator has a direct equivalent to size_direction. The concept is unique to this system: the Decision Layer knows whether the surfer's current board is mismatched in size, and that signal should influence sizing. A standard GF calculation does not have this context.

**What size_direction is not:** An additional multiplier stacked on top of the conditions and category adjustments. Compounding a third multiplicative adjustment without empirical grounding produces volumes that look precise but are not.

**What size_direction is:** A signal that tells the system which part of the already-computed range to emphasize, and optionally to extend one bound modestly in the signaled direction. The range from Section 6 (GF × conditions × category) represents the full valid volume zone for this surfer in this category. Size direction specifies where in that zone to focus.

### 7.1 Rules by value

**`keep`**

The current board size is approximately right. No adjustment to range bounds. Recommend from the middle of the range.

```
output range: [category_min] to [category_max]   (no change)
note: "Recommended emphasis: middle of range."
```

**`lean_up`**

Evidence suggests the surfer's needs are toward the upper end of their valid range. The lower bound is unchanged. The upper bound is extended modestly.

```
output range: [category_min] to ([category_max] × 1.08)
note: "Recommended emphasis: upper portion of range. Board too demanding — prefer toward the higher end."
```

The ×1.08 upper extension is a **provisional calibration value**. It provides a modest upward opening without shifting the entire range. If empirical feedback shows lean_up surfers consistently need more than the GF range predicts, this value should increase. If biasing within the existing range is sufficient, the extension can be removed.

**`lean_down`**

Evidence suggests the surfer's needs are toward the lower end of their valid range. The upper bound is unchanged. The lower bound is extended modestly downward.

```
output range: ([category_min] × 0.92) to [category_max]
note: "Recommended emphasis: lower portion of range. Board too supportive — prefer toward the lower end."
```

Same provisional calibration note applies to the ×0.92 factor.

**`split`** — see Section 9

**`unclear`** — see Section 10

---

## 8. Support vs Performance Need — Range Preference

**Evidence status: Industry-informed concept. Product heuristic for this implementation.**

Firewire and Lost both offer a float-preference option in their calculators. In both cases, it appears to function as a preference within a computed range — not as an additional volume multiplier. This system implements it the same way.

`support_vs_performance_need.position` does **not** modify the computed volume range. It produces preference language added to the output `note` field, which guides the Board Matching Layer and Agent when a board falls at the edge of the range or when a between-sizes choice arises.

| `position` | Text added to output note |
|---|---|
| `needs_support` | "Prefer boards toward the upper portion of the volume range. If a board is available in two sizes, lean toward the larger." |
| `balanced` | (no addition to note) |
| `performance_capable` | "Prefer boards toward the lower portion of the volume range. If a board is available in two sizes, lean toward the smaller." |

This guidance is consumed by the Board Matching Layer's Size Fit dimension and by the Agent during final recommendation. It does not change the numeric range bounds.

---

## 9. Split Behavior

**Evidence status: Product heuristic.**

When `size_direction = split`, the system has identified two distinct size strategies that are both valid for this surfer. The output is two sub-ranges rather than one. This has no direct industry analogue.

**When to activate:** Only when `size_direction.value = split`. The Size Calculation Step does not independently trigger splits.

**Rule:**

Take the range as computed through Section 6 (after GF × conditions × category, before size_direction). Divide at the midpoint:

```
midpoint = (category_min + category_max) / 2

option_a (higher volume — more forgiving):
  volume_min = midpoint − 0.5
  volume_max = category_max

option_b (lower volume — more performance-oriented):
  volume_min = category_min
  volume_max = midpoint + 0.5
```

The 0.5 L overlap at the midpoint is intentional — it represents a zone where either option is valid.

**Length display:** Both option_a and option_b share the same length range, derived from Section 12. Compute the length range once and include it in both options as `length_display`.

**Collapse condition:** If the two sub-ranges overlap by more than 50% of either sub-range's width, do not split. Output the full range with note: _"Range too narrow to produce two distinct size options. Full range applies."_

---

## 10. Unclear Behavior

**Evidence status: Product heuristic.**

When `size_direction = unclear`, the system cannot confidently assign a direction. The output range is widened rather than collapsed to a midpoint.

```
output_min = category_min × 0.92
output_max = category_max × 1.08
```

This expands the range approximately 8% on each side. Any board within the wider range is a valid size candidate. The Board Matching Layer evaluates all boards within this window with equal tolerance — no preference for center or either end.

**Output note:** _"Range widened due to unclear size direction. Any board within this range is a valid size candidate."_

**Why not a midpoint:** A single number under uncertainty implies precision the formula does not have. An honest wide range is more useful than a falsely confident point estimate.

---

## 11. Output Format

This format matches the contract defined in `size-calculation-step.md`. All field names and types are consistent with that contract.

```yaml
target_volume:
  min:  [number — liters, 1 decimal place]
  max:  [number — liters, 1 decimal place]
  note: [string | null — carries: size emphasis, range preference guidance,
                         calibration warnings, approximation flags]

target_length:
  min:         [number — decimal feet, e.g. 5.833]
  min_display: [string — e.g. "5'10\""]
  max:         [number — decimal feet]
  max_display: [string]
  note:        [string | null]

split_size:
  active: [boolean]
  reason: [string | null]
  option_a:
    volume_min:     [number]
    volume_max:     [number]
    length_display: [string — same value as target_length range for this surfer]
    note:           "Higher volume — more float, easier wave catching"
  option_b:
    volume_min:     [number]
    volume_max:     [number]
    length_display: [string — same value as target_length range for this surfer]
    note:           "Lower volume — more responsive, more performance-oriented"
```

Round all volume values to one decimal place. `31.47` becomes `31.5`. Do not report precision the formula does not have.

The `target_volume.note` field carries multiple types of guidance as a single string. Concatenate as applicable:
- Size emphasis from Section 7 (e.g., "Recommended emphasis: upper portion of range.")
- Range preference from Section 8 (e.g., "Prefer boards toward the upper portion of the volume range.")
- Calibration warning for mid-length/longboard from Section 6.2
- Missing-input note if conditions confidence was low
- Width note if `size_direction = unclear`

---

## 12. Length Range

**Evidence status: Industry-informed direction for the approach. Product heuristic for specific offset values.**

Length is a secondary output. Volume is the precision tool; length provides a complementary check, particularly useful when two boards at the same volume come in very different lengths (e.g., a 34 L groveler at 5'6" vs. a 34 L everyday board at 6'1").

Length is not derived algebraically from volume. The volume-to-length relationship is non-linear and varies by category. Instead, length is estimated from height and skill level, then adjusted for board category.

### 12.1 Starting point

```
height_in = height_cm / 2.54
center_length_in = height_in + skill_offset_in + category_offset_in
```

**Skill offset (industry-informed assumption):**

The offset represents the typical difference between a surfer's height in inches and the board length they can effectively ride in a shortboard context. Specific inch values are initial estimates.

| `band` | `sub_level` | Skill offset (inches) |
|---|---|---|
| `beginner` | `lower` | +6 |
| `beginner` | `mid` | +5 |
| `beginner` | `upper` | +4 |
| `intermediate` | `lower` | +3 |
| `intermediate` | `mid` | +2 |
| `intermediate` | `upper` | +1 |
| `advanced` | `lower` | 0 |
| `advanced` | `mid` | −1 |
| `advanced` | `upper` | −2 |
| `pro` | — | −3 |

**Category offset (product heuristic):**

| `board_category_context` | Offset (inches) |
|---|---|
| `shortboard` | 0 |
| `performance_shortboard` | 0 |
| `everyday_shortboard` | +1 |
| `groveler` | −4 |
| `fish` | −3 |
| `hybrid` | 0 |
| `step_up` | +4 |
| `mid_length` | +14 |
| `longboard` | +26 |

### 12.2 Range and display

```
min_length_in = center_length_in − 2
max_length_in = center_length_in + 2

min_length = min_length_in / 12          (decimal feet)
max_length = max_length_in / 12
min_display = [feet' inches"]            (rounded to nearest inch)
max_display = [feet' inches"]
```

The ±2 inch window reflects genuine sizing tolerance in real boards. Do not attempt to narrow the length output further based on volume calculations — the relationship between volume and length is not precise enough to justify it.

### 12.3 Internal consistency check

If the computed length range and volume range appear inconsistent for the category (for example, a very short length combined with a very high volume), include in the length output note:

_"Volume and length targets may be difficult to satisfy simultaneously in this category. Board Matching Layer should flag if no available size falls within both ranges."_

Do not attempt to resolve the inconsistency in this step. Surface it and let the Board Matching Layer handle it.

---

## 13. Worked Examples

### Example A — Lower-intermediate, weak waves, board too demanding

A surfer whose Decision Layer identified their current board as too demanding (`lean_up`), surfing in weak conditions, evaluated for a groveler.

**Inputs:**

| Field | Value |
|---|---|
| `physical.weight` | 74 kg |
| `physical.height` | 178 cm |
| `band / sub_level` | `intermediate / lower` |
| `conditions` | `weak` |
| `perceived_demand_level` | `low` |
| `position` | `needs_support` |
| `size_direction.value` | `lean_up` |
| `board_category_context` | `groveler` |

**Calculation:**

| Step | Operation | Min | Max |
|---|---|---|---|
| 1 — Baseline | 74 × GF (0.53 / 0.68) | 39.2 L | 50.3 L |
| 2 — Conditions (low demand, ×1.07) | | 41.9 L | 53.8 L |
| 3 — Category (groveler, ×1.06) | | 44.4 L | 57.0 L |
| 4 — Size direction (lean_up: upper bound ×1.08) | | 44.4 L | 61.6 L |

**Volume output:** 44.4 – 61.6 L

**Output note:** "Recommended emphasis: upper portion of range. Board too demanding — prefer toward the higher end. Prefer boards toward the upper portion of the volume range. If a board is available in two sizes, lean toward the larger."

**Length:**
- height_in: 178 / 2.54 = 70.1" (5'10.1")
- Skill offset (intermediate/lower): +3" → 73.1" (6'1.1")
- Category offset (groveler): −4" → 69.1" (5'9.1")
- Range ±2": 67.1" – 71.1" → **5'7" – 5'11"**

**Note on range width:** The 17 L span results from weak conditions and lean_up both pushing toward more volume, applied to a groveler category calibrated above the shortboard baseline. A wide range is the honest output here. The Board Matching Layer narrows the recommendation to available groveler sizes within this window, biasing toward the upper portion.

---

### Example B — Upper-intermediate, weak waves, category mismatch (not a size problem)

The reference surfer from the Surfer Profile schema: 72 kg, 175 cm, `intermediate/upper`, small weak waves, wants speed and flow. The Decision Layer identified `cause = category` — the issue is board type, not volume. `size_direction.value = keep`.

**Inputs:**

| Field | Value |
|---|---|
| `physical.weight` | 72 kg |
| `physical.height` | 175 cm |
| `band / sub_level` | `intermediate / upper` |
| `conditions` | `weak` |
| `perceived_demand_level` | `low` |
| `position` | `balanced` |
| `size_direction.value` | `keep` |
| `board_category_context` | `groveler` |

**Calculation:**

| Step | Operation | Min | Max |
|---|---|---|---|
| 1 — Baseline | 72 × GF (0.37 / 0.50) | 26.6 L | 36.0 L |
| 2 — Conditions (low demand, ×1.07) | | 28.5 L | 38.5 L |
| 3 — Category (groveler, ×1.06) | | 30.2 L | 40.8 L |
| 4 — Size direction (keep) | no change | 30.2 L | 40.8 L |

**Volume output:** 30.2 – 40.8 L

**Output note:** "Recommended emphasis: middle of range."

**Length:**
- height_in: 175 / 2.54 = 68.9" (5'8.9")
- Skill offset (intermediate/upper): +1" → 69.9" (5'9.9")
- Category offset (groveler): −4" → 65.9" (5'5.9")
- Range ±2": 63.9" – 67.9" → **5'4" – 5'8"**

**Interpretation:** `size_direction = keep` confirms the volume itself is not the problem — the board type is. The Agent will recommend groveler models in the 30–41 L range and explain that the category shift, not a size change, is what this surfer needs.

---

### Example C — Advanced surfer, powerful waves, performance shortboard

**Inputs:**

| Field | Value |
|---|---|
| `physical.weight` | 82 kg |
| `physical.height` | 182 cm |
| `band / sub_level` | `advanced / lower` |
| `conditions` | `powerful` |
| `perceived_demand_level` | `high` |
| `position` | `performance_capable` |
| `size_direction.value` | `lean_down` |
| `board_category_context` | `shortboard` |

**Calculation:**

| Step | Operation | Min | Max |
|---|---|---|---|
| 1 — Baseline | 82 × GF (0.32 / 0.43) | 26.2 L | 35.3 L |
| 2 — Conditions (high demand, ×0.93) | | 24.4 L | 32.8 L |
| 3 — Category (shortboard, ×1.00) | | 24.4 L | 32.8 L |
| 4 — Size direction (lean_down: lower bound ×0.92) | | 22.4 L | 32.8 L |

**Volume output:** 22.4 – 32.8 L

**Output note:** "Recommended emphasis: lower portion of range. Board too supportive — prefer toward the lower end. Prefer boards toward the lower portion of the volume range. If a board is available in two sizes, lean toward the smaller."

**Length:**
- height_in: 182 / 2.54 = 71.7" (5'11.7")
- Skill offset (advanced/lower): 0" → 71.7"
- Category offset (shortboard): 0" → 71.7"
- Range ±2": 69.7" – 73.7" → **5'10" – 6'2"**

**Interpretation:** The conditions adjustment compresses the range downward; the lean_down extension opens the lower bound further. The `performance_capable` preference note directs the Board Matching Layer and Agent to favor the lower portion (22–27 L) when evaluating specific boards. The upper bound (32.8 L) remains valid but is lower priority for this profile.

---

## 14. Guardrails

**Must not output a single volume.** Always output a `min`/`max` range. If the formula produces a range narrower than 3 L after all adjustments, widen to a minimum of 3 L and document it in the output note: _"Range widened to minimum 3 L."_

**Must not skip the conditions step.** Even when `perceived_demand_level = moderate` and no numerical change applies, the step must be applied explicitly (×1.00 documented). This confirms the step was evaluated, not omitted.

**Must not apply category context without a `board_category_context`.** Every volume output is category-relative. An uncontextualized volume range is ambiguous and should not be output.

**Must not collapse `split` or `unclear` to a single midpoint.** These are honest representations of genuine uncertainty. A falsely confident midpoint is worse than an honest wide range.

**Must not treat calibration values as validated constants.** The GF table, conditions percentages, and category multipliers are initial estimates. They should be updated when comparison data becomes available. See Section 15.

**Must not use `support_vs_performance_need.position` to modify volume bounds.** This field produces preference guidance in the note field only. It does not change the numeric range.

**Must not make board selection decisions.** This step outputs a target range. Whether specific boards in the database match that range is the Board Matching Layer's Size Fit dimension. This step produces inputs to that evaluation — it does not perform the evaluation.

**Must not produce output when physical inputs are invalid.** If `physical.weight` or `physical.height` falls outside plausible human ranges (after unit conversion), do not produce output. Flag the error upstream as specified in the contract.

---

## 15. What Needs Calibration

This section tracks known assumptions explicitly so calibration is never forgotten or treated as complete.

| Component | Current value | What would update it |
|---|---|---|
| GF values per tier | See Section 4 table | Compare against surfers known to be correctly sized; verify their GF falls in the expected tier range |
| Conditions multiplier — low demand | ×1.07 | Compare groveler/everyday recommendations for confirmed weak-wave surfers against boards they actually ride well |
| Conditions multiplier — high demand | ×0.93 | Same, for step-up and performance shortboard in solid surf |
| Category multipliers — shortboard family | ×1.03–1.06 | Compare against brand-published size ranges across categories |
| Category multiplier — mid-length | ×1.45 | Compare against real mid-length model volumes when added to board database |
| Category multiplier — longboard | ×1.85 | Same |
| lean_up extension factor | ×1.08 (upper bound) | Outcome tracking: does the lean_up range include the size the surfer eventually chose? |
| lean_down extension factor | ×0.92 (lower bound) | Same |
| Length skill offsets | See Section 12.1 | Compare against shaper-standard length guidance by ability level |
| Length category offsets | See Section 12.1 | Compare against actual board lengths in the database per category |
