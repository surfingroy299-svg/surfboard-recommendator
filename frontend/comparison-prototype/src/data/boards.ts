import type { Board, BoardId } from './types'

/**
 * Board A / B / C — PLACEHOLDER CONTENT.
 * The three entries are deliberately distinct archetypes so the comparison
 * design can be judged (a precise step-down, a small-wave speed shape, a
 * balanced all-rounder). Final models, sizes, constructions, stores and copy
 * will replace these objects one for one. Components only read this file.
 */

const boardA: Board = {
  id: 'a',
  slot: 'A',
  model: 'Board A',
  brand: 'Model to be confirmed',
  placeholderNote: 'Archetype: refined step-down shortboard, squash tail, thruster.',
  summary:
    'A refined shortboard with a narrower outline and a lively tail. Built for precise, driven turns on waves with some push.',
  dimensions: { length: '6’1″', width: '19 1/4″', thickness: '2 1/2″', volume: '31.2 L' },
  construction: 'PU / polyester',
  characteristics: [
    { key: 'waveCatching', label: 'Wave catching', level: 2, note: 'Needs a committed paddle' },
    { key: 'stability', label: 'Stability', level: 2, note: 'Rewards balanced footwork' },
    { key: 'responsiveness', label: 'Responsiveness', level: 5, note: 'Quick rail-to-rail response' },
    { key: 'speedGeneration', label: 'Speed generation', level: 3, note: 'Fast once on the face' },
  ],
  shape: {
    noseRocker: {
      from: 0.7,
      to: 1,
      descriptor: 'Moderate nose rocker',
      implication: 'Fits the curve of steeper, faster faces. A little slower to paddle onto flat ones.',
    },
    maxThickness: {
      x: 0.47,
      value: '2 1/2″',
      position: 'Just ahead of centre',
      implication: 'Foam sits under the front foot, so the tail feels light and quick in turns.',
    },
  },
  tailFins: {
    tail: 'Squash',
    tailExplanation:
      'A squared-off tail with soft corners. The corners bite in sharp turns; the width keeps it from feeling nervous.',
    finSetup: 'Thruster · 3 fins',
    finLayout: 'thruster',
    finExplanation:
      'Three equal fins. The centre fin adds hold and drive, the side fins steer. Predictable and precise.',
  },
  inspect: {
    tags: ['Quick rail response', 'Precise in turns', 'Needs some push'],
    whyItFits:
      'You asked for quicker direction changes without moving to an unforgiving high-performance board. This board sits in between: narrower and nearly 4 L smaller than your current board, but with enough width in the tail to stay predictable.',
    whatYoullNotice:
      'Compared with your current board it will feel lighter underfoot and far quicker from rail to rail. Turns will start from your feet rather than from your shoulders.',
    tradeOff:
      'On the smallest Israeli days it will want a harder paddle and more active surfing to keep speed. Your 35 L board remains the better call below knee height.',
  },
  store: { name: 'Northpoint Surf', area: 'Herzliya Marina', availability: 'In stock', note: 'About 12 min from you' },
}

const boardB: Board = {
  id: 'b',
  slot: 'B',
  model: 'Board B',
  brand: 'Model to be confirmed',
  placeholderNote: 'Archetype: small-wave speed shape, swallow tail, quad.',
  summary:
    'A compact small-wave shape with a wide swallow tail and generous foam under the chest. Built to make speed where there is little.',
  dimensions: { length: '5’11″', width: '19 3/4″', thickness: '2 9/16″', volume: '32.4 L' },
  construction: 'EPS / epoxy',
  characteristics: [
    { key: 'waveCatching', label: 'Wave catching', level: 4, note: 'Early entry into weak waves' },
    { key: 'stability', label: 'Stability', level: 4, note: 'Settled through flat sections' },
    { key: 'responsiveness', label: 'Responsiveness', level: 3, note: 'Turns in longer arcs' },
    { key: 'speedGeneration', label: 'Speed generation', level: 5, note: 'Easy speed in weak surf' },
  ],
  shape: {
    noseRocker: {
      from: 0.76,
      to: 1,
      descriptor: 'Low nose rocker',
      implication: 'A flat entry glides onto weak waves early and holds speed through soft sections.',
    },
    maxThickness: {
      x: 0.43,
      value: '2 9/16″',
      position: 'Forward of centre',
      implication: 'Thickness under the chest helps paddling and keeps the board planing when the wave slows.',
    },
  },
  tailFins: {
    tail: 'Swallow',
    tailExplanation:
      'The split tail keeps the outline wide for speed, while the two points act like a narrow tail once the board is on rail.',
    finSetup: 'Quad · 4 fins',
    finLayout: 'quad',
    finExplanation:
      'Four side fins and no centre fin. Fast down the line and loose off the top, with less hold in steep sections.',
  },
  inspect: {
    tags: ['Strong weak-wave speed', 'Easy transition down', 'Extra forgiving'],
    whyItFits:
      'Most of your sessions are 1 to 3 ft. This board is designed for exactly that range, and its wide tail keeps the stability you are used to while dropping almost 3 L of volume.',
    whatYoullNotice:
      'It will catch waves as easily as your current board but feel shorter and more willing to change direction. Speed through flat sections arrives without pumping.',
    tradeOff:
      'The quad setup and wide tail give up some precision in sharp, vertical turns. If your turns get more critical over the next two years, this is where you may feel limited.',
  },
  store: { name: 'Shoreline Boardroom', area: 'Tel Aviv, Hayarkon St.', availability: 'Only 1 left', note: 'About 20 min from you' },
}

const boardC: Board = {
  id: 'c',
  slot: 'C',
  model: 'Board C',
  brand: 'Model to be confirmed',
  placeholderNote: 'Archetype: balanced all-round shortboard, round tail, thruster.',
  summary:
    'An all-round shortboard with a round tail and continuous rocker. Built for smooth, connected turns across everyday conditions.',
  dimensions: { length: '5’10″', width: '19 1/2″', thickness: '2 1/2″', volume: '32.3 L' },
  construction: 'PU / polyester',
  characteristics: [
    { key: 'waveCatching', label: 'Wave catching', level: 3, note: 'Catches waves at a normal paddle' },
    { key: 'stability', label: 'Stability', level: 3, note: 'Steady enough to trust' },
    { key: 'responsiveness', label: 'Responsiveness', level: 4, note: 'Loose, smooth direction changes' },
    { key: 'speedGeneration', label: 'Speed generation', level: 4, note: 'Holds speed through turns' },
  ],
  shape: {
    noseRocker: {
      from: 0.72,
      to: 1,
      descriptor: 'Medium, continuous rocker',
      implication: 'A steady curve from nose to tail. Predictable entry and smooth, rounded turns.',
    },
    maxThickness: {
      x: 0.5,
      value: '2 1/2″',
      position: 'At centre',
      implication: 'Evenly distributed foam keeps the board balanced between paddle power and sensitivity.',
    },
  },
  tailFins: {
    tail: 'Round',
    tailExplanation:
      'A continuous curve through the tail releases water smoothly, so turns feel drawn out rather than snappy.',
    finSetup: 'Thruster · 3 fins',
    finLayout: 'thruster',
    finExplanation:
      'Three equal fins. The centre fin adds hold and drive, the side fins steer. Predictable and precise.',
  },
  inspect: {
    tags: ['Balanced step down', 'Stable through turns', 'Loose but trustworthy'],
    whyItFits:
      'You described a balanced progression preference and want one board for most days. This outline keeps paddling and stability close to what you know, while the round tail loosens up every turn.',
    whatYoullNotice:
      'The clearest change will be how turns connect: less effort to start them, smoother through the middle. It will feel noticeably less heavy than your current board.',
    tradeOff:
      'It is not the fastest of the three in very weak surf, and its turns are rounded rather than sharp. It asks for a little more wave than Board B to come alive.',
  },
  store: { name: 'Backwash Surf Co.', area: 'Netanya', availability: 'In stock', note: 'About 35 min from you' },
}

export const boards: Board[] = [boardA, boardB, boardC]

export const boardById: Record<BoardId, Board> = { a: boardA, b: boardB, c: boardC }
