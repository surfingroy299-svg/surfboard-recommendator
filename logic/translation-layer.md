# translation-layer.md

## 1. Purpose

This file defines how the system interprets onboarding answers and turns them into a structured internal surfer profile.

It exists to translate user language into system-understandable meaning.

This layer answers only:

**What does this user profile mean?**

It does **not** answer:

**What should the system recommend?**

---

## 2. Role in the System

The system is built in sequential layers:

1. Onboarding Layer  
2. Translation Layer  
3. Decision Layer  

This file defines the second stage only.

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

Each axis produces:

- Why this axis matters  
- Main inputs  
- What it interprets  
- State structure  
- Confidence  

The output is a structured **surfer profile**, not a decision.

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
- Edge flags: leans beginner / leans advanced  

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
- Environment  
- Use-case override  

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
- Position: needs support / balanced / performance-capable  
- Alignment: aligned / mild gap / strong gap  

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
- Confidence defined  
- Ambiguity preserved  
- Ready for decision layer input  