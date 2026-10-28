import type { BoardId, ChatScript } from './types'

/**
 * Scripted contextual chat. MOCK: no model is called. The panel already
 * carries Daniel's profile and the inspected board as context, so answers
 * never need the user to name the board.
 *
 * Answers are written against the specifications in `boards.ts` and must move
 * with them. The numbers quoted here — volume dropped against the 34–37 L
 * board the surfer rides now, width, length — are the ones in that file.
 */
export const chatScripts: Record<BoardId, ChatScript> = {
  a: {
    suggested: [
      {
        question: 'Would this still work on slightly bigger winter days?',
        answer:
          'That is where it is happiest. The pronounced nose rocker and the narrow outline are drawn for 3 to 5 ft faces with push behind them. It is the small days that cost you: under waist height you will work harder on this than on either of the other two.',
      },
      {
        question: 'How hard would the transition from my current board be?',
        answer:
          'Noticeable for a few sessions. You drop to 31.8 L from 34–37, and nearly two inches of width, so takeoffs need a cleaner paddle and your back foot has to land over the fins rather than near them. Most surfers settle it in five to eight sessions.',
      },
      {
        question: 'Would it be too loose for the turns I am learning?',
        answer:
          'Not loose — demanding. A round tail holds through the middle of a turn rather than releasing, so the board will go where you commit. What changes is that a late weight shift gets punished instead of absorbed.',
      },
    ],
    fallback:
      'In this prototype the assistant answers a fixed set of questions. For the Edge, try asking about bigger days, the transition from your current board, or how loose it will feel.',
  },
  b: {
    suggested: [
      {
        question: 'Would this still work on slightly bigger winter days?',
        answer:
          'Up to about head high, comfortably, and that covers most of your winter. Set up as a thruster it holds a steeper face properly; it is only beyond head high that you would want the Edge instead.',
      },
      {
        question: 'How hard would the transition from my current board be?',
        answer:
          'The easiest of the three. You drop to 33.4 L from 34–37, so paddling stays close to what you know. The real adjustment is length: at 5’11″ it pivots under your front foot in a way your 6’2″ does not.',
      },
      {
        question: 'What is the difference between the thruster and quad setup?',
        answer:
          'Same board, different day. Three fins give you hold and drive off the bottom, which is what you want in a wave with shape. Pull the centre fin and the quad runs faster down the line and holds less, which is what you want when the wave is soft. Five boxes, two boards.',
      },
    ],
    fallback:
      'In this prototype the assistant answers a fixed set of questions. For the Flow, try asking about bigger days, the transition from your current board, or the difference between its two fin setups.',
  },
  c: {
    suggested: [
      {
        question: 'Would this still work on slightly bigger winter days?',
        answer:
          'This is the one board here that will not cover a big day. Two fins and a flat entry rocker are fast and loose in small surf and let go of the face in anything steep or hollow. Think of it as the small-wave half of a two-board quiver, not a one-board answer.',
      },
      {
        question: 'How hard would the transition from my current board be?',
        answer:
          'Easy in the water, strange underfoot. At 35.6 L it paddles as well as what you ride now, and the width makes it stable. What is different is that you steer it from the middle of your stance — lean on the back foot the way you do now and it will slide.',
      },
      {
        question: 'Why is it shorter than my recommended length?',
        answer:
          'At 5’9″ it is an inch under the 5’10″ to 6’2″ range, which is normal for a fish rather than a mistake. The width and the flat rocker give it the planing area a longer board gets from length, so it catches waves like something bigger and turns like something shorter.',
      },
    ],
    fallback:
      'In this prototype the assistant answers a fixed set of questions. For the Drift, try asking about bigger days, the transition from your current board, or why it is shorter than your recommended length.',
  },
}
