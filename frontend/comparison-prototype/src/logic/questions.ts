/**
 * The 9 onboarding questions, mirroring `onboarding/onboarding-questions.md`.
 *
 * Labels and normalized values are generated from that document, so they are
 * verbatim. It stays the source of truth: change the question set there first.
 * `meaning`, `signals`, `target_axes` and `weight` live only in the document —
 * they are consumed by translate.ts as rules, not duplicated here as data.
 */

export type QuestionId = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7' | 'Q8' | 'Q9'

export type Q1Value = 'softboard' | 'funboard' | 'fish' | 'hybrid' | 'shortboard' | 'unsure' | 'no_regular_board'
export type Q2Value = 'catches_waves_easily' | 'struggles_to_catch_waves' | 'loses_speed_easily' | 'hard_to_turn' | 'feels_stable_comfortable' | 'feels_too_small_unstable'
export type Q3Value = 'knows_dimensions' | 'does_not_know_dimensions'
export type Q5Value = 'struggles_to_catch_waves_consistently' | 'loses_speed_on_wave' | 'cant_generate_speed_weak_waves' | 'cant_perform_turns' | 'feels_unstable' | 'feels_stuck'
export type Q6Value = 'wants_speed_and_flow' | 'wants_turn_control' | 'wants_stability' | 'wants_freedom_to_move' | 'wants_easier_wave_catch' | 'wants_progression'
export type Q7Value = 'small_weak_waves' | 'medium_waves_with_push' | 'powerful_steep_waves' | 'variable_conditions'
export type Q8Value = 'can_stand_ride_straight' | 'can_ride_face' | 'can_make_basic_turns' | 'can_link_turns' | 'can_link_turns_smoothly' | 'can_position_strategically'

export interface AnswerOption {
  value: string
  label: string
  /** Q7 only: the short descriptive hint the question definition calls for. */
  hint?: string
}

interface Base {
  id: QuestionId
  /** `id` field from the document, e.g. current_setup_type. */
  key: string
  category: string
  prompt: string
}

export type Question =
  | (Base & { kind: 'single'; options: AnswerOption[] })
  | (Base & { kind: 'multi'; max: number; options: AnswerOption[]; freeText: boolean })
  | (Base & { kind: 'dimensions' })
  | (Base & { kind: 'physical' })

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    key: 'current_setup_type',
    category: 'Current Setup',
    prompt: 'What board are you usually surfing?',
    kind: 'single',
    options: [
      { value: 'softboard', label: 'Softboard' },
      { value: 'funboard', label: 'Funboard' },
      { value: 'fish', label: 'Fish' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'shortboard', label: 'Shortboard' },
      { value: 'unsure', label: "I'm not sure" },
      { value: 'no_regular_board', label: "I don't have a regular board" },
    ],
  },
  {
    id: 'Q2',
    key: 'current_setup_feel',
    category: 'Current Setup',
    prompt: "What feels most true about the board you're riding right now?",
    kind: 'multi',
    max: 3,
    freeText: false,
    options: [
      { value: 'catches_waves_easily', label: "It's easy for me to catch waves" },
      { value: 'struggles_to_catch_waves', label: 'I struggle to catch waves' },
      { value: 'loses_speed_easily', label: 'I lose speed easily on the wave' },
      { value: 'hard_to_turn', label: "It's hard for me to turn the way I want" },
      { value: 'feels_stable_comfortable', label: 'It feels stable and comfortable' },
      { value: 'feels_too_small_unstable', label: 'It feels too small or unstable' },
    ],
  },
  {
    id: 'Q3',
    key: 'current_setup_dimensions_known',
    category: 'Current Setup',
    prompt: "Do you know your board's dimensions?",
    kind: 'single',
    options: [
      { value: 'knows_dimensions', label: 'Yes' },
      { value: 'does_not_know_dimensions', label: "Not sure / I don't know" },
    ],
  },
  {
    id: 'Q4',
    key: 'current_setup_dimensions',
    category: 'Current Setup',
    prompt: "What are your board's dimensions?",
    kind: 'dimensions',
  },
  {
    id: 'Q5',
    key: 'pain_points',
    category: 'Pain Points',
    prompt: "Thinking about your surfing overall — what's the main thing that holds you back right now?",
    kind: 'multi',
    max: 2,
    freeText: true,
    options: [
      { value: 'struggles_to_catch_waves_consistently', label: 'I struggle to catch waves consistently' },
      { value: 'loses_speed_on_wave', label: 'I lose speed easily on the wave' },
      { value: 'cant_generate_speed_weak_waves', label: "I can't generate speed when the wave is weak" },
      { value: 'cant_perform_turns', label: "It's hard for me to perform the turns I want" },
      { value: 'feels_unstable', label: 'I feel unstable or out of control on the wave' },
      { value: 'feels_stuck', label: 'I feel stuck and not progressing' },
    ],
  },
  {
    id: 'Q6',
    key: 'goals',
    category: 'Goals',
    prompt: 'What would you like to feel more of in your surfing?',
    kind: 'multi',
    max: 2,
    freeText: true,
    options: [
      { value: 'wants_speed_and_flow', label: 'More speed and flow on the wave' },
      { value: 'wants_turn_control', label: "More control when I'm turning" },
      { value: 'wants_stability', label: 'More stability and confidence' },
      { value: 'wants_freedom_to_move', label: 'More freedom to move and try things' },
      { value: 'wants_easier_wave_catch', label: 'Catch waves more easily and consistently' },
      { value: 'wants_progression', label: 'Progress and improve my level' },
    ],
  },
  {
    id: 'Q7',
    key: 'environment',
    category: 'Environment',
    prompt: 'What kind of waves do you usually surf?',
    kind: 'single',
    options: [
      { value: 'small_weak_waves', label: "Mostly small waves that are easy to catch but don't have much power", hint: 'Easy to catch, little push' },
      { value: 'medium_waves_with_push', label: 'Medium waves with some push and a clear shape you can ride', hint: 'Clean shape, some power' },
      { value: 'powerful_steep_waves', label: 'Steeper and more powerful waves with faster drops', hint: 'Steeper drop, fast sections' },
      { value: 'variable_conditions', label: "Conditions vary a lot and I don't usually surf the same kind of waves", hint: 'No typical day' },
    ],
  },
  {
    id: 'Q8',
    key: 'skill',
    category: 'Skill',
    prompt: 'What usually happens when you catch a wave?',
    kind: 'multi',
    max: 3,
    freeText: false,
    options: [
      { value: 'can_stand_ride_straight', label: 'I can stand up and ride straight toward the shore' },
      { value: 'can_ride_face', label: 'I can ride along the face of the wave' },
      { value: 'can_make_basic_turns', label: 'I can make basic turns on the wave' },
      { value: 'can_link_turns', label: 'I can link turns together and control my direction' },
      { value: 'can_link_turns_smoothly', label: 'I can link turns smoothly and control my speed throughout the wave' },
      { value: 'can_position_strategically', label: 'I can choose where to take off and consistently position myself well' },
    ],
  },
  {
    id: 'Q9',
    key: 'physical',
    category: 'Physical',
    prompt: "What's your height and weight?",
    kind: 'physical',
  },
]

export const questionById = Object.fromEntries(QUESTIONS.map((q) => [q.id, q])) as Record<QuestionId, Question>

/**
 * Q8 answers are an ability ladder, lowest to highest. The Translation Layer
 * keys band and sub_level off the HIGHEST selected rung
 * (translation-layer.md section 6.1).
 */
export const Q8_LADDER: Q8Value[] = [
  'can_stand_ride_straight',
  'can_ride_face',
  'can_make_basic_turns',
  'can_link_turns',
  'can_link_turns_smoothly',
  'can_position_strategically',
]

/** Q4 dropdown choices. Prototype ranges — the document specifies the fields, not the increments. */
export const BOARD_LENGTH_OPTIONS: string[] = [
  '5’2″',
  '5’3″',
  '5’4″',
  '5’5″',
  '5’6″',
  '5’7″',
  '5’8″',
  '5’9″',
  '5’10″',
  '5’11″',
  '6’0″',
  '6’1″',
  '6’2″',
  '6’3″',
  '6’4″',
  '6’5″',
  '6’6″',
  '6’7″',
  '6’8″',
  '6’9″',
  '6’10″',
  '6’11″',
  '7’0″',
  '7’1″',
  '7’2″',
  '7’3″',
  '7’4″',
  '7’5″',
  '7’6″',
]

export const BOARD_VOLUME_OPTIONS: string[] = [
  'Under 25 L',
  '25–28 L',
  '28–31 L',
  '31–34 L',
  '34–37 L',
  '37–40 L',
  '40–45 L',
  'Over 45 L',
]

export function labelFor(id: QuestionId, value: string): string {
  const q = questionById[id]
  if (q.kind !== 'single' && q.kind !== 'multi') return value
  return q.options.find((o) => o.value === value)?.label ?? value
}
