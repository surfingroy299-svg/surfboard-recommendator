# Board Matching Layer

## Suggested Chat Name

Board Matching Layer

---

## 1. Context

We are building a surfboard recommendation system.

This conversation focuses on defining the:

**Board Matching Layer**

---

## 2. System Context

The system is already defined in the existing project files.

Do not redefine or reinterpret the system structure.

Use the provided files as the single source of truth.

---

## 3. Inputs

You will receive:

- `translation-layer.md`
- `decision-layer.md`

You must treat:

- the **Translation Layer** and **Decision Layer** as the only logical inputs describing the user  
- the **board dataset** as the only source of truth for available surfboards  

Do not:
- use raw onboarding answers  
- reinterpret the user  

The layer must assume the existence of a curated surfboard dataset.

The structure of that dataset is not defined yet and will be specified later.

At this stage:
- do not define board attributes yet  
- only acknowledge that a structured dataset will be required  

---

## 4. Purpose

This layer answers:

**Given a decision direction, which real surfboards actually fit it?**

Its role is to:

- search within a curated surfboard dataset  
- evaluate boards against the decision direction  
- filter out irrelevant boards  
- handle partial and imperfect signals  
- narrow results to a small set of strong candidates  

This layer exists to turn decision direction into real board options.

---

## 5. Role in the System

This layer sits between:

- the **Decision Layer**, which defines what kind of recommendation is needed  
- and the **Recommendation Output**, which presents final boards to the user  

This layer does NOT:
- interpret the surfer  
- make decision logic  
- generate UI or copy  

Its responsibility is strictly:

**evaluation + filtering + selection**

---

## 6. Scope Boundaries

### In scope

- receiving decision outputs  
- evaluating boards against those outputs  
- filtering weak matches  
- handling ambiguity  
- selecting a small number of strong candidates  

### Out of scope

This layer must NOT:

- reinterpret the user  
- re-run decision logic  
- invent new reasoning axes  
- depend on raw onboarding answers  
- write recommendation copy  
- define UI behavior  
- handle pricing, inventory, or store logic  

---

## 7. Core Challenge

This is NOT a simple filter system.

The system must handle:

- partial outputs (e.g. “lean up”)  
- conflicting signals  
- uncertainty  
- variation between boards in the same category  
- imperfect but still valid matches  

The system must:

- avoid fake precision  
- remain explainable  
- behave like a reasoning system, not a rigid filter  
- avoid forcing matches when no strong candidates exist  

---

## 8. Working Rule

For this step, define ONLY:

- Purpose  
- Role in the system  
- Scope boundaries  
- File structure  

Do NOT define:

- board attributes  
- filtering rules  
- matching logic  
- ranking logic  
- ambiguity handling in detail  

These will be defined later.

---

## 9. Required Output

Create the structure for:

`board-matching-layer.md`

The file must include:

1. Purpose  
2. Role in the System  
3. Scope Boundaries  
4. Inputs  
5. Required Board Data  
6. Matching Principles  
7. Filtering Logic  
8. Matching Logic  
9. Ranking and Selection Logic  
10. Handling Ambiguity  
11. Guardrails  
12. Completion Criteria  

For this step:

- fully define:
  - Purpose  
  - Role in the System  
  - Scope Boundaries  

- include headings only for all other sections  

---

## 10. Mindset

This layer must:

- remain explainable  
- reflect real surf knowledge  
- avoid fake precision  
- work with imperfect inputs  
- stay flexible for future expansion  

---

## 11. Execution

Start by defining ONLY:

- Purpose  
- Role in the System  
- Scope Boundaries  
- Structure of `board-matching-layer.md`

Do not proceed beyond this step.

Wait for approval before continuing.