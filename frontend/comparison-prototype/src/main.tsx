import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/journey.css'
import { App } from './App'
import { reportWorkedExamples } from './logic/workedExamples'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev-only: confirms the sizing implementation still reproduces the worked
// examples in size-calculation-rules.md section 13.
if (import.meta.env.DEV) reportWorkedExamples()
