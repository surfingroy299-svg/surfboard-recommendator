# onboarding-layer.md

## 1. Objective

Define what the onboarding must extract from the user in order to enable accurate, explainable surfboard recommendations.

The onboarding translates user experience, current limitations, and intentions into structured inputs for the system.

The goal is not to collect information, but to enable high-quality decision-making in the recommendation layer.

---

## 2. Information Categories

Each category represents a core dimension of the surfer profile and directly impacts the recommendation.

---

### 2.1 Physical

- Description:  
  The user’s weight and height

- Why It Matters:  
  Weight is critical for volume calculation, while height is used as a secondary factor for length calibration

---

### 2.2 Skill

- Description:  
  What the user is capable of doing in real surfing situations

- Why It Matters:  
  Defines the boundaries of what board types and performance levels are viable

---

### 2.3 Environment

- Description:  
  The typical, day-to-day wave conditions the user surfs in

- Why It Matters:  
  Establishes the default baseline conditions the board must perform in

---

### 2.4 Primary Use Case

- Description:  
  Optional override defining the specific conditions the user wants the new board for (if different from their usual environment)

- Why It Matters:  
  Allows the system to prioritize a different use case (e.g. better waves, bigger surf, travel conditions)

- Relationship to Environment:  
  If defined, Primary Use Case overrides Environment for recommendation purposes.  
  If not defined, Environment remains the default baseline.

---

### 2.5 Current Setup

- Description:  
  The surfboard the user currently rides

- Why It Matters:  
  Provides baseline context, helps identify mismatches, and prevents unrealistic recommendation jumps

---

### 2.6 Pain Points

- Description:  
  The main frustrations or limitations the user experiences

- Why It Matters:  
  Primary driver of the recommendation, identifies what must be improved or fixed

---

### 2.7 Goals

- Description:  
  What the user wants to achieve with the next board

- Why It Matters:  
  Defines direction within the constraints set by skill and limitations

---

## 3. Question Structure

Each question is a functional unit that produces a usable signal for the system.

---

### Question Template

- id: [question_id]  
- category: [category_name]  
- question: [user-facing text]  
- type: [input type]  
- purpose: [what we learn]

---

## 4. Answer Structure

Answer options must map cleanly into system logic.

---

### Answer Template

answers:
  - label: [user-facing text]  
    value: [normalized_value]  
    meaning: [interpretation of the answer]  
    weight: [optional]

---

## 5. Design Principles

- Use human language only (no technical surf terminology)  
- Focus on experience, not knowledge  
- Every question must impact the recommendation  
- Prefer closed questions for consistency  
- Minimize cognitive load  
- Each question captures one signal only  
- Avoid redundancy across questions  
- Extract technical meaning implicitly  
- Keep the flow short and frictionless  

---

### Product-Specific Rules

- Skill defines constraints, not goals  
- Pain Points have higher priority than Goals  
- Goals define direction, not baseline  
- Environment is based on typical conditions  
- Primary Use Case is an optional override  
- Current Setup is used for diagnosis and realism control  

---

## 6. Completion Criteria

### Functional

- Each category produces a clear and distinct signal  
- Each question maps to a category and contributes to the recommendation  
- No duplicate or overlapping signals  

---

### Product

- The onboarding differentiates between users with different:
  - Skill levels  
  - Environments  
  - Pain points and goals  

- The system can:
  - Translate answers into recommendation variables  
  - Generate explainable outputs  
  - Avoid recommending boards that are too advanced or unrealistic for the user’s skill level  

---

### UX

- The onboarding is short and easy to complete  
- The flow is clear and intuitive  
- No technical jargon is exposed to the user  

---

### Quality Bar

The onboarding is complete when:

Two users with different real-world surfing profiles produce clearly different recommendation outputs, and both understand why.
