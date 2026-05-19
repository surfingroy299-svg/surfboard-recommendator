# decision-layer.md

## 1. Purpose

Defines how the system converts a translated surfer profile into a recommendation direction.

Answers:

**Given this profile, what should the system do?**

---

## 2. Role in the System

Sits between:

Translation Layer → Board Matching Layer

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

### 10.1 Progression Direction
- maintain  
- support more  
- challenge more  
- redirect  
- split / unclear  

---

### 10.2 Size Direction
- keep  
- lean up  
- lean down  
- split  
- unclear  

---

### 10.3 Category Direction
- keep  
- lean change  
- change likely  
- split  
- unclear  

---

### 10.4 Challenge Level

Defines how aggressively the system pushes progression.

Derived from:
- Actual Surfing Level  
- Wave Context  
- Support vs Performance Need  

States:
- conservative  
- balanced  
- progressive  
- mixed  
- unclear  

Must always remain consistent with constraints.

---

### 10.5 Intent Moderation

Describes how much user intent was adjusted.

- preserved  
- partially moderated  
- strongly moderated  

---

### 10.6 Uncertainty Flags

- low confidence  
- conflicting signals  
- no dominant direction  
- insufficient data  

---

## 11. Direction Scope

This layer determines:

- direction  
- allowed range  
- constraint boundaries  

It does NOT:

- select boards  
- choose models  
- rank brands  
- define board attributes  

---

## 12. Guardrails

- No fake certainty  
- No breaking constraints  
- No re-interpretation of user  
- No premature decisions  
- No forcing a single direction when ambiguity exists  

---

## 13. Completion Criteria

- Produces consistent direction outputs  
- Handles conflicts deterministically  
- Supports ambiguity and split states  
- Outputs remain usable for Board Matching Layer  