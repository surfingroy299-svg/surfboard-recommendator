# Size Calculation Step

---

## Purpose

Calculates the target volume range and target length range for a specific surfer.

This is a separate, isolated step — independently testable and not embedded in the Decision Layer or the Board Matching Layer. It takes inputs from the Surfer Profile and the Decision Layer's Size Direction signal, and produces a clean sizing output that the Board Matching Layer uses for Size Fit evaluation.

---

## Role in the System

```
Physical Profile (height, weight)
+ Actual Surfing Level    (Surfer Profile Axis 1)
+ Wave Context            (Surfer Profile Axis 2)
+ Support vs Performance  (Surfer Profile Axis 4)
+ Size Direction Signal   (from Decision Layer)
+ Board category context  (passed per calculation pass)
         ↓
Size Calculation Step
         ↓
Target volume range + target length range
         ↓
Board Matching Layer  →  Size Fit dimension evaluation
```

---

## Inputs

| Input | Source | Description |
|---|---|---|
| `physical.height` | Surfer Profile — physical | Height value + unit |
| `physical.weight` | Surfer Profile — physical | Weight value + unit |
| `actual_surfing_level.band` | Surfer Profile — Axis 1 | beginner / intermediate / advanced / pro |
| `actual_surfing_level.sub_level` | Surfer Profile — Axis 1 | lower / mid / upper |
| `wave_context.conditions` | Surfer Profile — Axis 2 | weak / balanced / powerful / mixed |
| `wave_context.perceived_demand_level` | Surfer Profile — Axis 2 | low / moderate / high |
| `support_vs_performance_need.position` | Surfer Profile — Axis 4 | needs_support / balanced / performance_capable |
| `size_direction.value` | Decision Layer | keep / lean_up / lean_down / split / unclear |
| `board_category_context` | Passed per pass | Category/family being evaluated (e.g. groveler, fish, shortboard) |

---

## Output

```
target_volume:
  min:     number  (liters)
  max:     number  (liters)
  note:    string | null  (concise note if range is wide or uncertainty-driven)

target_length:
  min:         number  (decimal feet, e.g. 5.83)
  min_display: string  (e.g. "5'10\"")
  max:         number
  max_display: string
  note:        string | null

split_size:
  active:   boolean
  reason:   string | null  (if active: explains why two sizes are both valid)
  option_a:
    volume_min:     number
    volume_max:     number
    length_display: string
    note:           string
  option_b:
    volume_min:     number
    volume_max:     number
    length_display: string
    note:           string
```

---

## Key Principles

**Preserve uncertainty.** If two sizes are valid — due to a split size direction, or because the surfer sits on a meaningful size border — output both options with a reason. Do not force a single size when the data does not support one.

**Board category context affects sizing.** Target volume and length ranges differ by category. A groveler sizing pass and a mid-length sizing pass for the same surfer will produce different outputs. The `board_category_context` input ensures the output is relevant to the board being evaluated.

**Output consumed by Board Matching Layer only.** The agent does not receive the raw sizing calculation — it receives the Board Matching Layer's Size Fit assessment, which is derived from this output. The sizing calculation is an internal step, not a user-facing artifact.

**Calculation logic defined separately.** This document defines the input/output contract only. The specific formulas, tables, and rules that translate inputs into volume and length ranges are defined in the implementation layer.

---

## Guardrails

- Do not output a single size when split direction or border conditions apply
- Do not skip board category context — sizing without category context produces unreliable results
- If `size_direction.value` is `unclear`, widen the output range rather than collapsing to a midpoint
- If weight or height is outside normal human ranges (validation failure), do not produce output — flag the error upstream
