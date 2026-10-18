import type { BoardId, ChatScript } from './types'

/**
 * Scripted contextual chat. MOCK: no model is called. The panel already
 * carries Daniel's profile and the inspected board as context, so answers
 * never need the user to name the board.
 */
export const chatScripts: Record<BoardId, ChatScript> = {
  a: {
    suggested: [
      {
        question: 'Would this still work on slightly bigger winter days?',
        answer:
          'Yes, and that is where it is happiest. The moderate nose rocker and narrower outline suit 3 to 5 ft faces with some push. In the 1 to 2 ft range you will need to work harder than on Board B.',
      },
      {
        question: 'How hard would the transition from my current board be?',
        answer:
          'Noticeable for a few sessions. You drop almost 4 L and about an inch of width, so takeoffs need a cleaner paddle and your feet have to land closer to the stringer. Most surfers at your level settle it within five to eight sessions.',
      },
      {
        question: 'Would it be too loose for the turns I am learning?',
        answer:
          'Not too loose, but it will show mistakes more than your current board. The squash tail and thruster setup hold well through turns; what changes is that late weight shifts get punished quickly.',
      },
    ],
    fallback:
      'In this prototype the assistant answers a fixed set of questions. For Board A, try asking about bigger days, the transition from your current board, or how loose it will feel.',
  },
  b: {
    suggested: [
      {
        question: 'Would this still work on slightly bigger winter days?',
        answer:
          'Up to about head high, yes. Beyond that the low rocker and wide tail start to skip on steep drops. For most Israeli winter days it will be fine; on the handful of big swells your current board is not better either.',
      },
      {
        question: 'How hard would the transition from my current board be?',
        answer:
          'Easy. Paddling and stability stay close to what you know, and the volume loss is under 3 L. The main adjustment is the shorter length, which makes the board feel like it pivots under your front foot.',
      },
      {
        question: 'Would it be too loose for the turns I am learning?',
        answer:
          'No. The quad setup is fast rather than loose. If anything, you may find it wants to run straight and needs a deliberate push through the back foot to redirect.',
      },
    ],
    fallback:
      'In this prototype the assistant answers a fixed set of questions. For Board B, try asking about bigger days, the transition from your current board, or how loose it will feel.',
  },
  c: {
    suggested: [
      {
        question: 'Would this still work on slightly bigger winter days?',
        answer:
          'Comfortably. The continuous rocker and round tail hold a line on steeper faces, which makes it the most versatile of the three across your year.',
      },
      {
        question: 'How hard would the transition from my current board be?',
        answer:
          'Moderate. You lose 4 inches of length and about 3 L, but the width and thickness stay familiar. Expect two or three sessions of adjusting your paddle position.',
      },
      {
        question: 'Would it be too loose for the turns I am learning?',
        answer:
          'This is the board that matches that concern best. The round tail loosens turns without letting the tail slide out, so you can commit harder to the turn without fear of spinning.',
      },
    ],
    fallback:
      'In this prototype the assistant answers a fixed set of questions. For Board C, try asking about bigger days, the transition from your current board, or how loose it will feel.',
  },
}
