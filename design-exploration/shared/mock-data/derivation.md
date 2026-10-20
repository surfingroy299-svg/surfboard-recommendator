# Mock-Data Derivation

Hand-computed trail from protected product rules to `surfer.json` and
`recommendation.json`. Every step cites its rule. Judgment calls (where rules
are ambiguous) are marked **JUDGMENT** and reported; nothing silently invented.

## 1. Surfer profile

Persona (MOCK): Noa, 175cm/72kg — deliberately matched to the documented
reference surfer (surfer-profile-schema.md example; size-calculation-rules.md
Example B) so every downstream number stays citable.

- **Q8 → level**: selections basic/link/smooth, highest `can_link_turns_smoothly`
  → intermediate/upper (translation-layer §6.1 table). Coherent range + Q2
  corroboration → high, consistent_signals (§6.3).
  **Discrepancy (new, #8):** the schema example assigns sub_level `upper` while
  its evidence shows `can_link_turns` ("but not smoothly") — §6.1 maps that to
  `mid`. We use `can_link_turns_smoothly` to make the example's `upper`
  rule-consistent. Reported, not silently resolved.
- **Q7 (+Q5 reinforcer) → wave_context**: weak/baseline/low; Q5
  `cant_generate_speed_weak_waves` reinforces → consistent_signals (§7.2).
- **Axis 3**: Q2 `loses_speed_easily` = 1 moderate negative → `limiting`
  (§8.2). Q5 same-theme signal is a **reinforcing pair** (§5.0.2: does not
  escalate) though §8.3 alone could read as escalation — **JUDGMENT:** the
  §5.0.2 no-escalation rule governs reinforcing pairs; fit stays `limiting`.
  Direction `too_demanding` (§8.4: loses_speed + shortboard + weak waves).
  Cause `category` (§8.5: shortboard + small_weak_waves + speed problem —
  verbatim rule). Confidence medium/data_gap (Q3 gate).
  **Discrepancy (new, #9):** the schema example sets `cause: size` for this
  same surfer, while translation-layer §8.5 and size-calculation Example B
  both say `category`. We follow the rules + Example B. Reported.
- **Axis 4**: Q8-high + speed goal = strong performance signal (§9.1), but
  Axis 3 `too_demanding` = moderate support signal. **JUDGMENT:** mixed
  signals across strengths → `balanced` (consistent with BOTH documented
  examples for this surfer). alignment `aligned` (§9.3 speed-goal row).
- **Axis 5**: Rule A (§10.2) — interpreted intent adds the category-cause
  mechanism; intent_gap `minor` (§10.3).

## 2. Decision signals (decision-layer §11)

- progression `redirect` — P3 (`cause = category`); corroborated (Q1+Q5+Q7) → high.
- size `keep` — P3 (category only). high.
- category `change_likely` — P3; too_demanding → more forgiving category. high.
- challenge `balanced` — P6 (fit limiting + position balanced); axis-4 medium → medium.
- intent_moderation `partially_moderated` — gap minor.
- uncertainty `[insufficient_data]` — axis-3 data_gap (§11.6). Cross-signal
  checks §11.7: rule 3 satisfied (redirect + change_likely).

## 3. Size passes (size-calculation-rules)

72 kg, intermediate/upper → GF 0.37–0.50 → 26.6–36.0 L (§4). Weak/low → ×1.07
→ 28.5–38.5 (§5). Category (§6.1): groveler ×1.06 → **30.2–40.8** (documented
Example B verbatim); hybrid ×1.04 → **29.6–40.0**; shortboard ×1.00 →
**28.5–38.5**. size_direction keep → no bound change, middle emphasis (§7.1).
Lengths (§12): 175cm → 68.9" +1 (int/upper) → 69.9"; category offsets:
groveler −4 → 65.9 ±2 → **5'4"–5'8"**; hybrid/shortboard 0 → 69.9 ±2 →
**5'8"–6'0"**.

**The length–volume tension is real and rule-anticipated:** for groveler and
shortboard passes, no stock size sits inside both windows (e.g. Better
Everyday 5'8" = 27.8L < 30.2; 6'1" = 35.0L > 5'8"). §12.3 says flag it, don't
resolve it — the prototypes surface the flag as designed honesty.

## 4. Board matching (board-matching-layer-rules)

Per-dimension grading for all five boards uses the §4–§10 tables; full results
live in `recommendation.json`. Notable calls:

- **Level vocabulary**: data values `beginner_intermediate`,
  `lower_intermediate`, `upper_intermediate` are not in the §3 mapping table
  (reported discrepancy #1 in the plan). **JUDGMENT (labeled in data):**
  compound values map to their band with sub-level nuance in notes
  (`beginner_intermediate`→rank 1 entry, `lower/upper_intermediate`→rank 2).
- **Requirement vocabulary**: exact-string rule (§7.1) → `basic_*` strings are
  unrecognized → result `unknown`, recorded as data gaps (three boards). Two
  near-matches normalized as labeled PROTOTYPE ASSUMPTION:
  `reading_wave_sections`→`ability_to_read_wave_sections` (Fever),
  `ability_to_generate_speed`→`generating_speed_through_turns` (DD2). This is
  the pain-point/requirement vocabulary drift already reported (#3).
- **Support/Performance both-above-range**: §8.2 table covers "one score
  outside" (moderate) and "opposing extremes" (weak) but not both-above.
  **JUDGMENT:** both-above-same-side → moderate (not opposing).
- **Ride-feel nonstandard values**: `low_entry`→low (beneficial in weak),
  `medium_with_flip_at_tail`/`medium_nose_and_tail`→medium (neutral),
  `contemporary_shortboard` rails→medium (beneficial for balanced),
  `full_medium_to_full`→neutral (conservative), `hip_squash`→squash. All
  **JUDGMENT**, noted; unknowns stay unknown (§10.1 — never penalized).
- **match_strength** (§7 aggregation, unknowns excluded): Better Everyday
  15/6 = 2.50 strong (boundary) · G Skate 17/6 = 2.83 strong · Two Happy
  15/6 = 2.50 strong · DD2 18/7 = 2.57 strong · Fever 17/7 = 2.43 moderate.
- **Size fits**: computed against stock dims (real). G Skate 5'10"/34.5L is
  the only both-windows fit (strong). Others: volume strong, length check
  downgrades to moderate (§9.4 secondary check) with §12.3 flags.

## 5. Presentation layer (labeled PROTOTYPE ASSUMPTION)

Roles, why/advantage/tradeoff copy, replacement reasons, refine chips, trait
phrases: mock agent behavior — the agent spec does not exist. All grounded in
the computed evaluations and real trait values; none assert shape→surfing
effects beyond `helps_with`/traits/condition tags.

## 6. New discrepancies found during derivation (adds to plan §15 list)

8. Schema example sub_level `upper` vs its own `can_link_turns` evidence
   (translation-layer §6.1 says `mid`).
9. Schema example `cause: size` vs translation-layer §8.5 + size-calculation
   Example B `cause: category` for the same reference surfer.
