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

## 5. Core Axes

### 5.1 Actual Surfing Level

**Why this axis matters**  
Defines what the surfer can actually handle.

**Main inputs**  
- Skill (Q8)  
- Pain Points  
- Current Board Feel  

**What it interprets**  
Actual ability based on behavior, not self-perception.

**State structure**  
- Band: beginner / intermediate / advanced / pro  
- Sub-level: lower / mid / upper  
- Edge flags: leans_beginner / leans_advanced  

**Confidence**  
Based on:
- clarity of skill answers  
- consistency with pain points  
- consistency with board feel  

---

### 5.2 Wave Context

**Why this axis matters**  
Defines real conditions the board must perform in.

**Main inputs**  
- Environment (Q7)  
- Use-case override *(V1 note: not yet captured by onboarding — see below)*

> **V1 limitation:** `usage_mode = override` is supported architecturally but has no corresponding onboarding question in V1. Q7 captures the surfer's typical environment only. The `override` and `variable` modes will remain inferential in V1 and are reserved for a future onboarding expansion where the user can specify a different use case (e.g. travel, bigger waves, specific conditions).

**What it interprets**  
Wave characteristics and how demanding they are.

**State structure**  
- Conditions: weak / balanced / powerful / mixed  
- Usage mode: baseline / override / variable / unclear  
- Perceived demand level: low / moderate / high  

**Confidence**  
Depends on clarity and consistency of environment signal.

---

### 5.3 Current Board Fit / Mismatch

**Why this axis matters**  
Explains whether the current board distorts the surfer experience.

**Main inputs**  
- Board type  
- Board feel  
- Dimensions (if known)  
- Level  
- Pain points  

**What it interprets**  
Fit quality and mismatch source.

**State structure**  
- Fit: well matched / limiting / mismatched / strongly mismatched / unknown  
- Direction: too supportive / too demanding / roughly right  
- Cause: size / category / context / mixed / unclear  
- Optional: competing causes + conflict explanation  

**Confidence**  
Depends on:
- data completeness  
- clarity of feel  
- consistency across signals  

---

### 5.4 Support vs Performance Need

**Why this axis matters**  
Defines whether the surfer needs help or can handle performance.

**Main inputs**  
- Goals  
- Pain Points  
- Level  
- Board Fit  

**What it interprets**  
Support vs performance balance.

**State structure**  
- Position: needs_support / balanced / performance_capable  
- Alignment: aligned / mild_gap / strong_gap  

**Confidence**  
Depends on consistency across signals.

---

### 5.5 User Intent

**Why this axis matters**  
Captures what the surfer wants vs what it likely means.

**Main inputs**  
- Goals  
- Pain Points  
- Board Feel  

**What it interprets**  
Intent and possible mismatch.

**State structure**  
- Raw intent  
- Interpreted intent  
- Intent gap  

**Confidence**  
Depends on clarity and consistency.

---

## 6. Progression Direction

Handled in the Decision Layer.

---

## 7. Handling Ambiguity

Allowed states:
- unknown  
- mixed  
- unclear  
- competing causes  
- no dominant explanation  

Ambiguity is valid output, not failure.

---

## 8. What This Layer Does Not Do

- No decision making  
- No prioritization  
- No recommendation  
- No board selection  

---

## 9. Completion Criteria

- Clear, structured profile  
- No embedded decision logic  
- Confidence defined per axis (level / type / basis)  
- Ambiguity preserved  
- Evidence traceable per axis interpretation  
- Surfer Profile matches the contract defined in `surfer-profile-schema.md`  
- Profile consumed by both the Decision Layer and the Agent  