# onboarding-questions.md

---

## Q1 – Current Setup (Board Type)

- **id:** current_setup_type  
- **category:** Current Setup  
- **question:** What board are you usually surfing?  
- **type:** single choice  
- **purpose:** Establish baseline board category

### answers:
- Softboard  
- Funboard  
- Fish  
- Hybrid  
- Shortboard  
- I’m not sure  
- I don’t have a regular board  

---

## Q2 – Current Setup (Board Feel)

- **id:** current_setup_feel  
- **category:** Current Setup  
- **question:** What feels most true about the board you’re riding right now?  
- **type:** multi-select (max 3)  
- **purpose:** Diagnose how the current board performs for the user

### answers:
- It’s easy for me to catch waves  
- I struggle to catch waves  
- I lose speed easily on the wave  
- It’s hard for me to turn the way I want  
- It feels stable and comfortable  
- It feels too small or unstable  

---

## Q3 – Current Setup (Dimensions Gate)

- **id:** current_setup_dimensions_known  
- **category:** Current Setup  
- **question:** Do you know your board’s dimensions?  
- **type:** single choice  
- **purpose:** Determine whether to collect additional board data

### answers:
- Yes  
- Not sure / I don’t know  

---

## Q4 – Current Setup (Dimensions – Conditional)

- **id:** current_setup_dimensions  
- **category:** Current Setup  
- **question:** What are your board’s dimensions?  
- **type:** structured input (conditional)  
- **purpose:** Refine understanding of current board size

### inputs:
- Length (dropdown)  
- Volume (range dropdown)  

### optional:
- Board model / brand (free text)  
- Upload a photo  

---

## Q5 – Pain Points

- **id:** pain_points  
- **category:** Pain Points  
- **question:** Thinking about your surfing overall — what’s the main thing that holds you back right now?  
- **type:** multi-select (max 2) + optional free text  
- **purpose:** Identify primary limitations affecting performance

### answers:
- I struggle to catch waves consistently  
- I lose speed easily on the wave  
- I can’t generate speed when the wave is weak  
- It’s hard for me to perform the turns I want  
- I feel unstable or out of control on the wave  
- I feel stuck and not progressing  

### optional:
- Free text input  

---

## Q6 – Goals

- **id:** goals  
- **category:** Goals  
- **question:** What would you like to feel more of in your surfing?  
- **type:** multi-select (max 2) + optional free text  
- **purpose:** Define desired direction for improvement

### answers:
- More speed and flow on the wave  
- More control when I’m turning  
- More stability and confidence  
- More freedom to move and try things  
- Catch waves more easily and consistently  
- Progress and improve my level  

### optional:
- Free text input  

---

## Q7 – Environment

- **id:** environment  
- **category:** Environment  
- **question:** What kind of waves do you usually surf?  
- **type:** single choice  
- **purpose:** Understand typical wave conditions

### answers:
- Mostly small waves that are easy to catch but don’t have much power  
- Medium waves with some push and a clear shape you can ride  
- Steeper and more powerful waves with faster drops  
- Conditions vary a lot and I don’t usually surf the same kind of waves  

### note:
Each option should include:
- An image or short video (surfer + wave scale)  
- A short descriptive hint (e.g. “easy to catch”, “steeper drop”)  

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

### answers:
- I can stand up and ride straight toward the shore  
- I can ride along the face of the wave  
- I can make basic turns on the wave  
- I can link turns together and control my direction  
- I can link turns smoothly and control my speed throughout the wave  
- I can choose where to take off and consistently position myself well  

---

## Q9 – Physical

- **id:** physical  
- **category:** Physical  
- **question:** What’s your height and weight?  
- **type:** numeric input  
- **purpose:** Calibrate board size recommendations

### inputs:
- Height (cm / ft)  
- Weight (kg / lbs)  
