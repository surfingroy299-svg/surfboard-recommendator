# onboarding-questions.md

---

## Answer Normalization Format

Each answer option is defined with the following fields:

- **normalized_value** — snake_case identifier used throughout the pipeline
- **meaning** — what this answer represents; what the system learns from it
- **signals** — specific implications for target axes; what the Translation Layer should do with this
- **target_axes** — which Surfer Profile axes this answer contributes to, and in what role (primary / supporting)
- **weight** — diagnostic strength of this answer: `high`, `medium`, `low`, or `—` for non-diagnostic inputs

---

## Q1 – Current Setup (Board Type)

- **id:** current_setup_type
- **category:** Current Setup
- **question:** What board are you usually surfing?
- **type:** single choice
- **purpose:** Establish baseline board category

### answers

**`softboard`** — "Softboard"
- **meaning:** Surfer rides a foam softboard, typically used by beginners or in surf school contexts
- **signals:** Indicates beginner or early-intermediate equipment. If Q8 shows higher skill, board is likely over-supportive and limiting progression. If Q2 feel signals align (stable, catches waves), board may still be appropriate.
- **target_axes:** actual_surfing_level (supporting), board_fit_mismatch (supporting — suggests `too_supportive` direction)
- **weight:** medium

---

**`funboard`** — "Funboard"
- **meaning:** Transitional board (typically 7'0"–8'0", higher volume) between longboard and shortboard
- **signals:** Lower-to-mid intermediate equipment. Provides more stability and paddle power than a shortboard. If Q2/Q5 show speed loss, look at conditions (funboard in powerful waves can lose drive) or progression need (surfer may be ready for a step down in volume).
- **target_axes:** actual_surfing_level (supporting), board_fit_mismatch (supporting)
- **weight:** medium

---

**`fish`** — "Fish"
- **meaning:** Wide, high-volume, small-wave board optimized for weak conditions. Typically twin or quad fin.
- **signals:** Suggests surfer understands their conditions or has been guided toward appropriate equipment. If Q2/Q5 show persistent speed problems with a fish, look to conditions being even weaker than expected, sizing, or skill — not category mismatch.
- **target_axes:** board_fit_mismatch (primary for category assessment), wave_context (supporting — fish ownership implies weak/small wave context)
- **weight:** medium

---

**`hybrid`** — "Hybrid"
- **meaning:** Board combining shortboard outline with fish or groveler volume characteristics. More versatile than a pure fish.
- **signals:** Mid-intermediate equipment. Surfer is likely between small-wave fun and shortboard performance. Speed loss or instability with a hybrid is a stronger signal of size mismatch than category mismatch.
- **target_axes:** board_fit_mismatch (supporting), actual_surfing_level (supporting)
- **weight:** medium

---

**`shortboard`** — "Shortboard"
- **meaning:** Performance-oriented board with lower volume, demanding paddling efficiency and active technique
- **signals:** Most diagnostically significant board type. If Q2/Q5 show speed loss in weak conditions, this is the primary board-condition mismatch signal. If Q8 shows lower-intermediate skill, the board may be too demanding for current ability. This combination (shortboard + weak waves + speed frustration) is the single most common mismatch profile the system will encounter.
- **target_axes:** board_fit_mismatch (primary — the strongest category signal for mismatch detection), actual_surfing_level (supporting — shortboard implies mid-intermediate+ requirement)
- **weight:** high

---

**`unsure`** — "I'm not sure"
- **meaning:** User cannot categorize their board type
- **signals:** Weak board category signal. Reduces confidence on `board_fit_mismatch`. Q2 (feel) and Q4 (dimensions if available) become more important as fallback. System should not assume any category direction from this answer.
- **target_axes:** board_fit_mismatch (confidence reduction), meta (may contribute to `limited_profile` flag if multiple axes are data-poor)
- **weight:** low

---

**`no_regular_board`** — "I don't have a regular board"
- **meaning:** User has no consistent board to assess against
- **signals:** Sets meta flag `no_regular_board`. Q2, Q3, Q4 have no valid basis. `board_fit_mismatch` axis defaults to `fit = unknown`. System relies entirely on Q8 (skill), Q7 (conditions), Q5 (pain points), Q6 (goals), and Q9 (physical) for the profile.
- **target_axes:** meta (sets `no_regular_board` flag), board_fit_mismatch (sets `fit = unknown`)
- **weight:** — (special routing case, not a diagnostic signal)

---

## Q2 – Current Setup (Board Feel)

- **id:** current_setup_feel
- **category:** Current Setup
- **question:** What feels most true about the board you're riding right now?
- **type:** multi-select (max 3)
- **purpose:** Diagnose how the current board performs for the user

### answers

**`catches_waves_easily`** — "It's easy for me to catch waves"
- **meaning:** Board is not creating a paddling barrier; surfer can enter waves without difficulty
- **signals:** Paddle dimension of board_fit_mismatch is adequate or over-supportive. Combined with shortboard, indicates the board provides enough paddle power — mismatch (if any) is mid-ride, not at entry. Combined with `feels_stable_comfortable`, may indicate a well-matched or slightly over-supportive board.
- **target_axes:** board_fit_mismatch (supporting — paddling dimension is adequate)
- **weight:** low — absence of a problem is a weaker signal than presence

---

**`struggles_to_catch_waves`** — "I struggle to catch waves"
- **meaning:** Surfer is experiencing a consistent paddling barrier; cannot enter waves reliably
- **signals:** Strong `board_fit = limiting or mismatched` signal. Board is likely low volume, too narrow, or too demanding for the conditions. Combined with `shortboard` (Q1) + `small_weak_waves` (Q7), this is near-definitive board-condition mismatch. Supports `direction = too_demanding`, `cause = size or category`.
- **target_axes:** board_fit_mismatch (primary — `fit = limiting`, `direction = too_demanding`, `cause = size or category`), actual_surfing_level (supporting — consistent wave catching is an intermediate skill checkpoint)
- **weight:** high

---

**`loses_speed_easily`** — "I lose speed easily on the wave"
- **meaning:** Board loses momentum quickly during the ride; surfer cannot carry speed through flat sections
- **signals:** Primary board-condition mismatch indicator. Most common with shortboards in weak/mushy waves. Combined with `small_weak_waves` (Q7), this strongly supports `board_fit = limiting`, `cause = category or size`. Also a supporting signal for upper-intermediate ability — at this level, speed loss is typically a board/conditions issue, not pure technique.
- **target_axes:** board_fit_mismatch (primary — `cause = size or category`), actual_surfing_level (supporting)
- **weight:** high

---

**`hard_to_turn`** — "It's hard for me to turn the way I want"
- **meaning:** Surfer cannot execute intended turning movements
- **signals:** Ambiguous without cross-referencing Q1 and Q8. If `softboard` or `funboard` (Q1), board is likely too sluggish — over-supportive direction. If `shortboard` + lower Q8 skill, board may be too demanding for current technique. Moderate value until resolved with context.
- **target_axes:** board_fit_mismatch (supporting — direction ambiguous, requires Q1 and Q8 to resolve), actual_surfing_level (supporting)
- **weight:** medium — context-dependent; interpret after Q1 and Q8

---

**`feels_stable_comfortable`** — "It feels stable and comfortable"
- **meaning:** Board provides adequate stability; surfer is not being challenged beyond their ability
- **signals:** Board is not too demanding. May be well-matched, or slightly over-supportive (holding the surfer back). If Q5/Q6 show frustration about progression or speed, board may be too safe. If no progression signals, board may simply be appropriate.
- **target_axes:** board_fit_mismatch (supporting — `fit = well_matched or limiting-toward-over-support`), support_vs_performance_need (supporting)
- **weight:** low-medium — requires Q5 and Q6 to determine whether stability is appropriate or limiting

---

**`feels_too_small_unstable`** — "It feels too small or unstable"
- **meaning:** Board feels physically undersized or too demanding to control
- **signals:** Strong signal for `board_fit = limiting`, `direction = too_demanding`, `cause = size`. Combined with Q9 weight data, likely volume deficit. If surfer is riding a shortboard with this feeling, the size mismatch is highly probable.
- **target_axes:** board_fit_mismatch (primary — `fit = limiting`, `direction = too_demanding`, `cause = size`), actual_surfing_level (supporting — instability suggests board is beyond current skill or body weight)
- **weight:** high

---

## Q3 – Current Setup (Dimensions Gate)

- **id:** current_setup_dimensions_known
- **category:** Current Setup
- **question:** Do you know your board's dimensions?
- **type:** single choice
- **purpose:** Determine whether to collect additional board data

### answers

**`knows_dimensions`** — "Yes"
- **meaning:** User has dimensional data for their board; Q4 will be shown
- **signals:** Activates Q4. If Q4 data is provided, board_fit_mismatch confidence can increase significantly — dimensional data allows direct size verification against Q9 weight data.
- **target_axes:** meta (completeness — Q4 activated), board_fit_mismatch (confidence increase when Q4 follows)
- **weight:** — (routing gate; not diagnostic on its own)

---

**`does_not_know_dimensions`** — "Not sure / I don't know"
- **meaning:** User cannot provide board dimensions; Q4 is skipped
- **signals:** Sets meta flag `missing_dimensions`. Q4 is not shown. `board_fit_mismatch` is assessed from feel signals only. Confidence type for board_fit_mismatch becomes `data_gap`. Translation Layer must rely on Q1 (board type) and Q2 (feel) for fit assessment.
- **target_axes:** meta (sets `missing_dimensions` flag), board_fit_mismatch (reduces confidence — type = `data_gap`)
- **weight:** — (routing gate; not diagnostic on its own)

---

## Q4 – Current Setup (Dimensions – Conditional)

- **id:** current_setup_dimensions
- **category:** Current Setup
- **question:** What are your board's dimensions?
- **type:** structured input (conditional — shown only if Q3 = `knows_dimensions`)
- **purpose:** Refine understanding of current board size

### inputs

**`board_length`** — Length (dropdown)
- **meaning:** Explicit board length in feet and inches
- **signals:** Combined with Q9 weight, enables board-to-body size cross-check. Short length + high weight = likely volume deficit. Very long length = potentially over-supportive. Cross-reference with category from Q1 — a 5'6" shortboard vs a 5'6" fish have very different volume profiles.
- **target_axes:** board_fit_mismatch (primary when available — supports `cause = size`), size_calculation_step (reference baseline for comparison)
- **weight:** high — when provided, dimensional data is more reliable than feel signals alone

---

**`board_volume_range`** — Volume (range dropdown)
- **meaning:** Volume range of the current board in liters
- **signals:** Most precise board fit signal available. Compared directly against Q9 weight to assess volume appropriateness. If volume is significantly below weight-based recommendation, `board_fit = limiting or mismatched`, `cause = size` is strongly supported. If volume is appropriate or above, look to category and conditions as the mismatch source instead.
- **target_axes:** board_fit_mismatch (primary when available — most direct cause evidence), size_calculation_step (reference baseline)
- **weight:** high

---

**`board_model_brand`** — Board model / brand (optional free text)
- **meaning:** Specific board model and brand name
- **signals:** If the model is in the board database, shape profile data can be retrieved for more precise Ride Feel / Shape Fit context. Not required for primary axes.
- **target_axes:** board_fit_mismatch (optional enrichment if model is identifiable in database)
- **weight:** low — optional; valuable if model is in database, otherwise not processed

---

**`board_photo`** — Upload a photo (optional)
- **meaning:** Visual reference of the current board
- **signals:** Not processed in V1 logic. Stored as reference only.
- **target_axes:** none (V1)
- **weight:** — (V1: not processed)

---

## Q5 – Pain Points

- **id:** pain_points
- **category:** Pain Points
- **question:** Thinking about your surfing overall — what's the main thing that holds you back right now?
- **type:** multi-select (max 2) + optional free text
- **purpose:** Identify primary limitations affecting performance

> **Note:** Pain points are the primary driver of the recommendation. All Q5 answers carry high diagnostic weight. When Q5 and Q2 signal the same issue (e.g., speed loss appears in both), this creates a high-confidence, multi-source signal for that interpretation.

### answers

**`struggles_to_catch_waves_consistently`** — "I struggle to catch waves consistently"
- **meaning:** Surfer cannot reliably enter waves; consistency is the key frustration
- **signals:** Board is creating a paddling barrier or conditions are exceeding board capacity. Combined with `shortboard` (Q1) + `small_weak_waves` (Q7), this is near-definitive board-condition-size mismatch. Primary trigger for `board_fit = limiting or mismatched`, `direction = too_demanding`, `cause = size or category`. Intent: needs more wave access.
- **target_axes:** board_fit_mismatch (primary), user_intent (primary — `interpreted_intent` includes easier wave access), support_vs_performance_need (supporting — leans `needs_support`)
- **weight:** high

---

**`loses_speed_on_wave`** — "I lose speed easily on the wave"
- **meaning:** Board loses momentum during the ride; surfer cannot sustain energy through sections
- **signals:** Board-condition mismatch or size mismatch. Most common profile: shortboard in weak/mushy waves. Supports `board_fit = limiting`, `cause = category or size`. If Q2 also shows `loses_speed_easily`, this two-source signal is high confidence. User intent aligns with speed and flow.
- **target_axes:** board_fit_mismatch (primary), user_intent (primary — `raw_intent` leans toward speed and flow), wave_context (reinforcing — consistent with low-demand conditions)
- **weight:** high

---

**`cant_generate_speed_weak_waves`** — "I can't generate speed when the wave is weak"
- **meaning:** Surfer specifically identifies weak conditions as the constraint on speed generation
- **signals:** Most diagnostically specific pain point in the system. Surfer understands the environmental constraint, which rules out pure technique as the explanation. Strongly supports `board_fit = limiting`, `cause = category or size`, `wave_context.conditions = weak`. This answer alone, combined with `shortboard` (Q1), is sufficient to flag a high-confidence board-condition mismatch.
- **target_axes:** board_fit_mismatch (primary — highest specificity of any pain point), wave_context (reinforcing — confirms weak conditions as the baseline), user_intent (primary)
- **weight:** high — most diagnostically specific answer in the question set

---

**`cant_perform_turns`** — "It's hard for me to perform the turns I want"
- **meaning:** Surfer cannot execute intended maneuvers; turning is the primary frustration
- **signals:** Ambiguous direction — board may be too demanding (too narrow/short/stiff for current skill) or too sluggish (too much volume, slow to respond). Resolve with Q1 and Q8: shortboard + lower-intermediate skill → board too demanding. Funboard/softboard + higher skill → board too sluggish. Intent aligns with control and maneuverability.
- **target_axes:** board_fit_mismatch (supporting — direction ambiguous without Q1/Q8), user_intent (primary — `raw_intent = turn control and maneuverability`), actual_surfing_level (supporting)
- **weight:** medium-high — requires Q1 and Q8 to resolve direction

---

**`feels_unstable`** — "I feel unstable or out of control on the wave"
- **meaning:** Surfer experiences instability while riding; board feels unsafe or unpredictable
- **signals:** Board is too demanding relative to current ability or body weight. Primary signal for `board_fit = limiting`, `direction = too_demanding`, `cause = size` (insufficient volume or width). Combined with Q9 weight data and `shortboard` (Q1), likely confirms volume deficit. Also a strong signal for `support_vs_performance_need.position = needs_support`.
- **target_axes:** board_fit_mismatch (primary — `direction = too_demanding`, `cause = size`), support_vs_performance_need (primary — `position = needs_support`), actual_surfing_level (supporting)
- **weight:** high

---

**`feels_stuck`** — "I feel stuck and not progressing"
- **meaning:** Surfer has plateaued and is not improving
- **signals:** Broad signal — direction is ambiguous. Could mean board is too supportive (not challenging enough) or too demanding (surfer spending energy managing the board rather than developing). Requires strong supporting signals from Q6 (goals) to determine direction. If Q6 shows performance goals, board may be too safe. If Q5 also includes stability or speed concerns, direction becomes clearer.
- **target_axes:** user_intent (primary — `raw_intent = progression`), support_vs_performance_need (supporting — direction unclear), actual_surfing_level (supporting)
- **weight:** medium — broad signal; direction determined by Q6 and other Q5 selections

---

### optional

**`free_text_pain`** — free text input
- **meaning:** Surfer's own words about what holds them back
- **signals:** Not processed by structured Translation Layer logic in V1. Available to the Agent directly for contextual interpretation. May surface nuance not captured by the closed options.
- **target_axes:** user_intent (Agent-only in V1)
- **weight:** — (V1: Agent-only signal)

---

## Q6 – Goals

- **id:** goals
- **category:** Goals
- **question:** What would you like to feel more of in your surfing?
- **type:** multi-select (max 2) + optional free text
- **purpose:** Define desired direction for improvement

> **Note:** Goals define direction within constraints. They are weighted lower than pain points (Q5) but are the primary input for `user_intent.raw_intent` and a significant input for `support_vs_performance_need.position`.

### answers

**`wants_speed_and_flow`** — "More speed and flow on the wave"
- **meaning:** Surfer wants momentum, drive, and connected surfing
- **signals:** Performance-leaning intent. Aligns with boards optimized for speed generation (grovelers, fish, higher-volume shortboards) in the surfer's conditions. If Q5 also flags speed as the pain point (`loses_speed_on_wave` or `cant_generate_speed_weak_waves`), goal and problem are coherent — high confidence. `support_vs_performance_need` leans toward `balanced` or `performance_capable`.
- **target_axes:** user_intent (primary — `raw_intent = speed and flow`), support_vs_performance_need (supporting — leans performance)
- **weight:** high

---

**`wants_turn_control`** — "More control when I'm turning"
- **meaning:** Surfer wants better responsiveness and precision in turn execution
- **signals:** Control-oriented intent. Direction ambiguous without Q5 context: if Q5 shows board too sluggish → wants more response (performance direction). If Q5 shows board too demanding → wants more predictability (support direction). Requires cross-referencing to interpret.
- **target_axes:** user_intent (primary — `raw_intent = turn control`), support_vs_performance_need (supporting — direction depends on Q5)
- **weight:** medium-high — direction context-dependent

---

**`wants_stability`** — "More stability and confidence"
- **meaning:** Surfer wants a more forgiving, stable board that feels safe
- **signals:** Strong support-leaning intent. Directly indicates `support_vs_performance_need.position = needs_support`. If Q5 also shows `feels_unstable`, this is a high-confidence coherent signal pair. Intent gap is likely `none` or `minor` — stated intent aligns with actual need.
- **target_axes:** user_intent (primary — `raw_intent = stability and confidence`), support_vs_performance_need (primary — `position = needs_support`)
- **weight:** high

---

**`wants_freedom_to_move`** — "More freedom to move and try things"
- **meaning:** Surfer wants a more playful, responsive board that enables creative surfing
- **signals:** Performance-leaning intent. Current board likely feels sluggish or restricted. Leans toward `support_vs_performance_need.position = balanced or performance_capable`. Often indicates current board is over-supportive for actual ability. If combined with `feels_stuck` (Q5), this is a clear "board is holding me back" profile.
- **target_axes:** user_intent (primary — `interpreted_intent = playfulness and responsiveness`), support_vs_performance_need (supporting — leans performance)
- **weight:** high

---

**`wants_easier_wave_catch`** — "Catch waves more easily and consistently"
- **meaning:** Surfer wants better paddling efficiency and more consistent wave access
- **signals:** Support-leaning intent. Aligns with boards offering more volume, width, and paddle power. Directly indicates `support_vs_performance_need.position = needs_support`. If Q5 also shows `struggles_to_catch_waves_consistently`, intent and problem are coherent — high confidence profile.
- **target_axes:** user_intent (primary — `raw_intent = wave access`), support_vs_performance_need (primary — `position = needs_support`)
- **weight:** high

---

**`wants_progression`** — "Progress and improve my level"
- **meaning:** Surfer has a broad aspiration to improve overall
- **signals:** General progression intent. Direction is ambiguous — some surfers need more support to progress (board too demanding), others need more challenge (board too safe). Requires Q5 to determine direction. If Q5 shows board limitations, progression requires better-matched equipment. If no equipment limitation signals, surfer may need a challenge-more direction.
- **target_axes:** user_intent (primary — `raw_intent = progression`), support_vs_performance_need (low supporting — direction ambiguous)
- **weight:** medium — general goal; direction resolved by Q5 and other Q6 selections

---

### optional

**`free_text_goal`** — free text input
- **meaning:** Surfer's own words about what they want to feel
- **signals:** Not processed by structured Translation Layer logic in V1. Available to the Agent directly for contextual interpretation.
- **target_axes:** user_intent (Agent-only in V1)
- **weight:** — (V1: Agent-only signal)

---

## Q7 – Environment

- **id:** environment
- **category:** Environment
- **question:** What kind of waves do you usually surf?
- **type:** single choice
- **purpose:** Understand typical wave conditions

> **Note:** Q7 is the primary and sole source for `wave_context` in V1. Each answer maps directly to axis state values. See V1 limitation note in `translation-layer.md` regarding `usage_mode = override`.

### answers

**`small_weak_waves`** — "Mostly small waves that are easy to catch but don't have much power"
- **meaning:** Surfer primarily rides small, mushy, low-power waves
- **signals:** Sets `wave_context.conditions = weak`, `usage_mode = baseline`, `perceived_demand_level = low`. Board must self-generate speed rather than rely on wave energy. This is the most common context for board-condition mismatch (shortboard + small weak waves). Combined with Q5 speed frustrations, this creates a high-confidence weak-wave mismatch profile.
- **target_axes:** wave_context (primary — `conditions = weak`, `usage_mode = baseline`, `perceived_demand_level = low`)
- **weight:** high

---

**`medium_waves_with_push`** — "Medium waves with some push and a clear shape you can ride"
- **meaning:** Surfer primarily rides waves with moderate power and a defined, rideable face
- **signals:** Sets `wave_context.conditions = balanced`, `usage_mode = baseline`, `perceived_demand_level = moderate`. Board should work across a range of conditions. Board-condition mismatch is less likely than in weak conditions, but possible if board is undersized for body weight.
- **target_axes:** wave_context (primary — `conditions = balanced`, `usage_mode = baseline`, `perceived_demand_level = moderate`)
- **weight:** high

---

**`powerful_steep_waves`** — "Steeper and more powerful waves with faster drops"
- **meaning:** Surfer regularly surfs waves with significant power, steeper faces, and faster sections
- **signals:** Sets `wave_context.conditions = powerful`, `usage_mode = baseline`, `perceived_demand_level = high`. Board must handle speed and power. Mismatch in this context is less about under-performance and more about board being too small or too demanding for the power level. Shortboard in powerful waves with instability (Q5 `feels_unstable`) may indicate skill gap rather than board-condition mismatch.
- **target_axes:** wave_context (primary — `conditions = powerful`, `usage_mode = baseline`, `perceived_demand_level = high`)
- **weight:** high

---

**`variable_conditions`** — "Conditions vary a lot and I don't usually surf the same kind of waves"
- **meaning:** Surfer surfs across a range of conditions with no dominant wave type
- **signals:** Sets `wave_context.conditions = mixed`, `usage_mode = variable`, `perceived_demand_level = moderate` (default mid-point). Board recommendations lean toward versatility rather than condition-specific optimization. Reduces confidence in any condition-specific inference. Confidence type for wave_context is `single_source` with wider uncertainty.
- **target_axes:** wave_context (primary — `conditions = mixed`, `usage_mode = variable`, `perceived_demand_level = moderate`)
- **weight:** high

### note
Each option should include:
- An image or short video (surfer + wave scale)
- A short descriptive hint (e.g. "easy to catch", "steeper drop")

Purpose:
- Help users recognize their conditions visually
- Reduce ambiguity
- Improve answer accuracy

---

## Q8 – Skill

- **id:** skill
- **category:** Skill
- **question:** What usually happens when you catch a wave?
- **type:** multi-select (max 3)
- **purpose:** Estimate real surfing ability based on actual behavior

> **Translation Layer note:** The answers are ordered from lowest to highest skill. The Translation Layer should treat the **highest-selected skill** as the primary indicator for `band` and `sub_level`. Additional lower selections below the highest add consistency confidence. If a surfer selects only a very high skill without lower confirmations, a mild `single_source` confidence flag may apply.

### answers

**`can_stand_ride_straight`** — "I can stand up and ride straight toward the shore"
- **meaning:** Surfer can get to feet and maintain a direct line toward shore
- **signals:** Lowest skill indicator in the system. Alone, suggests `band = beginner`. In this system's target range (intermediate surfers), this is a baseline confirmation rather than a primary level signal. If selected without any higher skills, surfer is likely outside the intended user range.
- **target_axes:** actual_surfing_level (supporting — baseline confirmation, rarely primary signal for this system's target users)
- **weight:** low

---

**`can_ride_face`** — "I can ride along the face of the wave"
- **meaning:** Surfer can angle across the wave face rather than riding directly to shore
- **signals:** Early-intermediate skill indicator. Supports `band = intermediate, sub_level = lower` boundary. This is the minimum skill for the system's target user range — establishing that the surfer is not a pure beginner.
- **target_axes:** actual_surfing_level (supporting — helps set lower-intermediate boundary)
- **weight:** medium

---

**`can_make_basic_turns`** — "I can make basic turns on the wave"
- **meaning:** Surfer can execute redirectional turns while on the wave
- **signals:** Lower-intermediate skill indicator. Primary signal for `band = intermediate, sub_level = lower`. Establishes foundational wave-riding skill. At this level, the system has a reliable lower bound for board recommendations.
- **target_axes:** actual_surfing_level (primary for lower-intermediate band placement)
- **weight:** medium

---

**`can_link_turns`** — "I can link turns together and control my direction"
- **meaning:** Surfer can connect multiple turns in a single ride without losing the wave
- **signals:** Mid-intermediate skill indicator. Primary signal for `band = intermediate, sub_level = mid`. Linking turns requires active wave reading and body positioning above basic turning — this is a meaningful skill threshold.
- **target_axes:** actual_surfing_level (primary for mid-intermediate band placement)
- **weight:** high

---

**`can_link_turns_smoothly`** — "I can link turns smoothly and control my speed throughout the wave"
- **meaning:** Surfer can connect turns with flow and actively manage wave energy and speed
- **signals:** Upper-intermediate skill indicator. Primary signal for `band = intermediate, sub_level = upper`. Speed control throughout the wave requires advanced wave reading and technique. If this is the highest selected skill, surfer is at the upper end of intermediate and may have `edge_flags = [leans_advanced]` depending on other signals.
- **target_axes:** actual_surfing_level (primary for upper-intermediate band placement)
- **weight:** high

---

**`can_position_strategically`** — "I can choose where to take off and consistently position myself well"
- **meaning:** Surfer can read waves and position for optimal take-off with consistency
- **signals:** Advanced skill indicator. Consistent strategic positioning requires wave reading ability at the advanced level. If this is selected as highest skill, supports `band = advanced` or `edge_flags = [leans_advanced]` if other signals place them at upper-intermediate. Rarely selected by the system's target intermediate user — strong signal if present.
- **target_axes:** actual_surfing_level (primary for advanced boundary / `leans_advanced` edge flag)
- **weight:** high

---

## Q9 – Physical

- **id:** physical
- **category:** Physical
- **question:** What's your height and weight?
- **type:** numeric input
- **purpose:** Calibrate board size recommendations

> **Note:** Q9 inputs are not discrete answer options — they are numeric fields that populate the Surfer Profile `physical` section directly. No translation logic is applied here; values are stored as-is with units and used by the Size Calculation Step.

### inputs

**`height_value`** — Height (cm or ft/in)
- **meaning:** Surfer's height
- **signals:** Secondary sizing factor. Used for board length calibration — taller surfers generally benefit from longer boards within the same volume range. Not a primary volume determinant.
- **target_axes:** physical (`physical.height.value` + `physical.height.unit`), size_calculation_step (length modifier)
- **weight:** medium — secondary to weight for volume; relevant for length upper-bound

---

**`weight_value`** — Weight (kg or lbs)
- **meaning:** Surfer's body weight
- **signals:** Primary determinant for target volume calculation. Combined with `actual_surfing_level` and `wave_context`, this is the core input for the Size Calculation Step. Most precise sizing input in the system — a 10kg weight difference typically moves the target volume range by 5–8 liters.
- **target_axes:** physical (`physical.weight.value` + `physical.weight.unit`), size_calculation_step (primary volume input)
- **weight:** high
