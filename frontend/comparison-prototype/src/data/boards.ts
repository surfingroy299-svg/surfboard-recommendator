import type { Board, BoardId } from './types'

/**
 * The three boards on the shortlist — FICTIONAL MODELS for the portfolio demo.
 *
 * Each entry is written against the artwork in `public/boards/`, which comes
 * from the project's Figma file. The three source images are three different
 * fictional brands, and the model names follow the wordmark actually printed
 * on each deck rather than putting one brand's name over another's logo:
 *
 *   a  TIDALFORM EDGE   3 fin boxes, round tail
 *   b  TIDECRAFT FLOW   5 fin boxes, squash tail
 *   c  SALTLINE DRIFT   2 fin boxes, swallow tail
 *
 * Fin boxes and tails here are read off the images, not invented, so the
 * specification and the photograph agree in every view.
 *
 * SIZING. The three volumes sit inside the demo surfer's computed range of
 * 31.7–42.8 L. That is a constraint, not a coincidence: the shortlist is
 * fixed, so a range it falls outside would show the user a recommendation
 * none of their own three boards satisfies. See `demoAnswers.ts` for the one
 * input that was moved to make the two agree; no engine value was touched.
 *
 * Lengths run 6'0" / 5'11" / 5'9" against a recommended 5'10"–6'2". DRIFT is
 * deliberately an inch under: a fish is ridden short, and its Inspect copy
 * says so rather than hiding the difference by rounding it away.
 *
 * Components only read this file.
 */

const boardA: Board = {
  id: 'a',
  slot: 'A',
  model: 'Tidalform Edge',
  brand: 'Tidalform',
  placeholderNote: 'Fictional model for the portfolio demo. Performance shortboard, round tail, thruster.',
  summary:
    'The most demanding board on the shortlist. A narrow outline and a round tail built for precise, driven turns on waves with real push behind them.',
  dimensions: { length: '6’0″', width: '18 3/4″', thickness: '2 7/16″', volume: '31.8 L' },
  construction: 'PU / polyester',
  characteristics: [
    { key: 'waveCatching', label: 'Wave catching', level: 2, note: 'Needs a committed paddle' },
    { key: 'stability', label: 'Stability', level: 2, note: 'Rewards a centred stance' },
    { key: 'responsiveness', label: 'Responsiveness', level: 5, note: 'Changes rail the moment you lean' },
    { key: 'speedGeneration', label: 'Speed generation', level: 3, note: 'Makes speed off the rail, not the foam' },
  ],
  shape: {
    noseRocker: {
      from: 0.68,
      to: 1,
      descriptor: 'Pronounced nose rocker',
      implication: 'Matches the curve of a steeper face, so the nose stays clear on a late drop. The cost is a slower paddle.',
    },
    maxThickness: {
      x: 0.47,
      value: '2 7/16″',
      position: 'Just ahead of centre',
      implication: 'Foam sits under the front foot and thins out behind it, which is what leaves the tail light enough to throw.',
    },
  },
  tailFins: {
    tail: 'Round',
    tailExplanation:
      'A continuous curve with no corner to catch. Water leaves the tail gradually, so the board holds its line through the middle of a turn instead of releasing early.',
    finSetup: 'Thruster · 3 fins · FCS II',
    finLayout: 'thruster',
    finExplanation:
      'Three equal fins. The centre fin supplies hold and drive off the bottom, the side fins steer. The most predictable of the three setups and the least forgiving of a lazy stance.',
  },
  inspect: {
    tags: ['Quick rail response', 'Precise in turns', 'Needs some push'],
    whyItFits:
      'You are surfing with speed and flow on a board that is doing more of the work than you need. This is the shortlist’s answer to that: 31.8 L against the 34–37 L you ride now, a narrow outline, and a tail that responds to your back foot rather than steadying it.',
    whatYoullNotice:
      'It will feel lighter underfoot and far quicker from rail to rail. Turns start from your feet instead of your shoulders, and the board goes exactly where you put it — including where you did not mean to put it.',
    tradeOff:
      'Below waist height it will not reward you. The rocker and the narrow tail both need a wave with some push, and on a small, soft day you will paddle harder for fewer waves than either of the other two.',
  },
  store: { name: 'Northpoint Surf', area: 'Herzliya Marina', availability: 'In stock', note: 'About 12 min from you' },
}

const boardB: Board = {
  id: 'b',
  slot: 'B',
  model: 'Tidecraft Flow',
  brand: 'Tidecraft',
  placeholderNote: 'Fictional model for the portfolio demo. All-round shortboard, squash tail, five-fin convertible.',
  summary:
    'The balanced option. A squash tail and five fin boxes that let the same board be set up two ways, built to work across the range of days you actually get.',
  dimensions: { length: '5’11″', width: '19 1/2″', thickness: '2 1/2″', volume: '33.4 L' },
  construction: 'PU / polyester',
  characteristics: [
    { key: 'waveCatching', label: 'Wave catching', level: 3, note: 'Catches waves at a normal paddle' },
    { key: 'stability', label: 'Stability', level: 4, note: 'Steady enough to trust' },
    { key: 'responsiveness', label: 'Responsiveness', level: 4, note: 'Turns where you put it' },
    { key: 'speedGeneration', label: 'Speed generation', level: 3, note: 'Keeps speed rather than making it' },
  ],
  shape: {
    noseRocker: {
      from: 0.72,
      to: 1,
      descriptor: 'Moderate, continuous rocker',
      implication: 'A steady curve from nose to tail rather than a flat section and a kick. Entry is predictable on most waves and exceptional on none.',
    },
    maxThickness: {
      x: 0.5,
      value: '2 1/2″',
      position: 'At centre',
      implication: 'Foam spread evenly along the board, which is why it paddles respectably without ever feeling corky underfoot.',
    },
  },
  tailFins: {
    tail: 'Squash',
    tailExplanation:
      'A squared-off tail with soft corners. The corners give you an edge to push against in a sharp turn; the width behind your back foot keeps it from feeling nervous when you do.',
    finSetup: 'Five-fin convertible · 5 boxes · Futures',
    finLayout: 'five-fin',
    finExplanation:
      'Five boxes, three or four fins. Run it as a thruster for hold and drive off the bottom, or pull the centre fin and run it as a quad for speed down the line. The boxes are the fixed part; the setup is yours to change by the day.',
  },
  inspect: {
    tags: ['One board for most days', 'Stable through turns', 'Two setups in one'],
    whyItFits:
      'Your sessions are mostly small and soft but not exclusively, and you asked for turn control rather than a specialist. At 33.4 L this sits between the other two, and the five boxes mean you can set it up for the day instead of picking a board for the year.',
    whatYoullNotice:
      'Turns start more easily than on your current board and stay where you put them. As a quad it holds speed through flat sections; as a thruster it feels tighter and more deliberate off the bottom.',
    tradeOff:
      'Being good across the range means being the best at nothing. The Edge turns harder in a wave with push and the Drift makes more speed out of nothing, and this board will feel like the compromise it is on both of those days.',
  },
  store: { name: 'Shoreline Boardroom', area: 'Tel Aviv, Hayarkon St.', availability: 'Only 1 left', note: 'About 20 min from you' },
}

const boardC: Board = {
  id: 'c',
  slot: 'C',
  model: 'Saltline Drift',
  brand: 'Saltline',
  placeholderNote: 'Fictional model for the portfolio demo. Alternative / fish, swallow tail, twin.',
  summary:
    'The different one. A wide, flat twin-fin fish on a swallow tail, built to make its own speed when the wave has none to give.',
  dimensions: { length: '5’9″', width: '20 3/4″', thickness: '2 9/16″', volume: '35.6 L' },
  construction: 'EPS / epoxy',
  characteristics: [
    { key: 'waveCatching', label: 'Wave catching', level: 4, note: 'Early entry into weak waves' },
    { key: 'stability', label: 'Stability', level: 4, note: 'Settled through flat sections' },
    { key: 'responsiveness', label: 'Responsiveness', level: 3, note: 'Turns in long, loose arcs' },
    { key: 'speedGeneration', label: 'Speed generation', level: 5, note: 'Makes speed out of nothing' },
  ],
  shape: {
    noseRocker: {
      from: 0.76,
      to: 1,
      descriptor: 'Low, flat entry rocker',
      implication: 'A flat forward section planes onto a weak wave early and keeps running through the soft part. On a steep face that same flatness is what catches the nose.',
    },
    maxThickness: {
      x: 0.43,
      value: '2 9/16″',
      position: 'Forward of centre',
      implication: 'Thickness under the chest rather than the feet, which is the paddling part of the board doing its job.',
    },
  },
  tailFins: {
    tail: 'Swallow',
    tailExplanation:
      'The split keeps the outline wide for planing speed while giving you two narrow points to turn on. Effectively a wide tail going straight and a narrow one once you are on rail.',
    finSetup: 'Twin · 2 fins · Futures',
    finLayout: 'twin',
    finExplanation:
      'Two fins and nothing in the middle. Without a centre fin there is less drag and far less hold, so the board is fast and slides easily — which is the point, and also the risk in anything steep.',
  },
  inspect: {
    tags: ['Strong weak-wave speed', 'Loose and playful', 'A different ride'],
    whyItFits:
      'Most of your surf is 1 to 3 ft, and this is the board built for exactly that. The extra width and the flat entry get you onto waves the Edge would not catch, and the twin setup turns a soft section into speed instead of a stall.',
    whatYoullNotice:
      'It is a different experience rather than a smaller version of what you ride now. Speed arrives without pumping, the board slides where a thruster would grip, and you steer it from the middle of your stance rather than the back foot.',
    tradeOff:
      'At 5’9″ it sits an inch under your recommended length, which is normal for a fish and still worth knowing. Two fins give up hold: in anything steep or hollow it will let go of the face, and it is the one board here that will not cover a big day.',
  },
  store: { name: 'Backwash Surf Co.', area: 'Netanya', availability: 'In stock', note: 'About 35 min from you' },
}

export const boards: Board[] = [boardA, boardB, boardC]

export const boardById: Record<BoardId, Board> = { a: boardA, b: boardB, c: boardC }
