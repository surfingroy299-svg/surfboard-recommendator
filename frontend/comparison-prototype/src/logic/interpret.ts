/**
 * Turns a Surfer Profile and its signals into the reading shown on the Profile
 * stage — the "here's what we understood about you" moment.
 *
 * Interpretation first, numbers second. Nothing here invents a conclusion: every
 * sentence is selected by an axis state or a decision signal. The tone target is
 * a shaper summarising a conversation, not a report.
 */

import type { Derived } from './calibrate'
import { CATEGORY_NOTE, CATEGORY_LABEL, isFallbackCategory } from './categoryContext'
import type { Band, Conditions, FitDirection, SubLevel } from './profile'

const LEVEL_NAME: Record<string, string> = {
  'beginner/lower': 'a beginner',
  'beginner/mid': 'a beginner',
  'beginner/upper': 'an improving beginner',
  'intermediate/lower': 'an early intermediate',
  'intermediate/mid': 'a mid-intermediate',
  'intermediate/upper': 'an upper intermediate',
  'advanced/lower': 'an advanced surfer',
  'advanced/mid': 'an advanced surfer',
  'advanced/upper': 'an advanced surfer',
  'pro/lower': 'a professional-level surfer',
  'pro/mid': 'a professional-level surfer',
  'pro/upper': 'a professional-level surfer',
}

const LEVEL_DOING: Record<string, string> = {
  'beginner/lower': 'getting to your feet and riding straight',
  'beginner/mid': 'getting to your feet and riding straight',
  'beginner/upper': 'riding along the face rather than straight to shore',
  'intermediate/lower': 'making turns once you are on the wave',
  'intermediate/mid': 'linking turns and holding your line',
  'intermediate/upper': 'linking turns smoothly and managing your own speed',
  'advanced/lower': 'choosing where to take off and surfing with intent',
  'advanced/mid': 'choosing where to take off and surfing with intent',
  'advanced/upper': 'choosing where to take off and surfing with intent',
  'pro/lower': 'surfing at a competitive level',
  'pro/mid': 'surfing at a competitive level',
  'pro/upper': 'surfing at a competitive level',
}

const CONDITIONS_PHRASE: Record<Conditions, string> = {
  weak: 'small, low-power surf, where the board has to make its own speed',
  balanced: 'waves with some push and a face worth riding',
  powerful: 'steeper, faster surf with real power behind it',
  mixed: 'conditions that change from session to session',
}

const DIRECTION_READ: Record<FitDirection, string> = {
  too_supportive: 'is doing more for you than you need',
  too_demanding: 'is asking more of you than it gives back',
  roughly_right: 'is broadly right for you',
}

export interface Reading {
  /** Two or three short paragraphs. */
  paragraphs: string[]
  /** One sentence on how hard the recommendation should push. */
  challenge: string
  /** Present only when the profile is genuinely thin. */
  uncertainty: string | null
  /** Short label for the board direction, e.g. "Groveler". */
  categoryLabel: string
  categoryNote: string
}

const key = (band: Band, sub: SubLevel) => `${band}/${sub}`

export function interpret(d: Derived): Reading {
  const { profile, signals } = d
  const level = profile.axes.actual_surfing_level.state
  const wave = profile.axes.wave_context.state
  const fit = profile.axes.board_fit_mismatch.state
  const intent = profile.axes.user_intent.state
  const k = key(level.band, level.sub_level)

  const paragraphs: string[] = []

  // 1 — who you are, and where you surf.
  const edge = level.edge_flags.includes('leans_advanced')
    ? ' You are close to the next level up.'
    : ''
  paragraphs.push(
    `You are ${LEVEL_DOING[k]} — ${LEVEL_NAME[k]}.${edge} Most of your surfing happens in ${CONDITIONS_PHRASE[wave.conditions]}.`,
  )

  // 2 — the current board.
  if (fit.fit === 'unknown') {
    paragraphs.push(
      'Without a regular board to compare against, we have read this from your surfing and your conditions rather than from what you are riding now.',
    )
  } else {
    const cause =
      fit.cause === 'size'
        ? ' The size looks like the main reason.'
        : fit.cause === 'category'
          ? ' It is the type of board, more than the size.'
          : fit.cause === 'mixed'
            ? ' Both the size and the type of board look involved.'
            : fit.cause === 'context'
              ? ' The board itself is sound; the conditions are what limit it.'
              : ''
    const severity =
      fit.fit === 'strongly_mismatched'
        ? 'The board you are on is clearly the wrong match'
        : fit.fit === 'mismatched'
          ? 'The board you are on is mismatched'
          : fit.fit === 'limiting'
            ? `The board you are on ${DIRECTION_READ[fit.direction]}`
            : 'The board you are on is broadly right'
    paragraphs.push(`${severity}.${cause}`)
  }

  // 3 — what you asked for, and what we think it means.
  //
  // interpreted_intent already opens with the raw intent under Rule A, so the
  // two are stitched rather than concatenated: repeating "more speed and flow
  // on the wave" twice in one sentence reads like a bug.
  const moderation = signals.intent_moderation.value
  const interpreted = intent.interpreted_intent.replace(/^the stated goal is .*?, but /i, '')
  const startsWithRaw = interpreted.toLowerCase().startsWith(intent.raw_intent.toLowerCase())

  if (moderation === 'preserved') {
    paragraphs.push(`You asked for ${intent.raw_intent}, and nothing in your answers argues against it.`)
  } else if (startsWithRaw) {
    const tail = interpreted.slice(intent.raw_intent.length).replace(/^\s*[—-]\s*/, '')
    paragraphs.push(`You asked for ${intent.raw_intent}. Read against the rest of your answers, ${tail}`)
  } else {
    paragraphs.push(`You asked for ${intent.raw_intent}. Read against the rest of your answers, that means ${interpreted}`)
  }

  // Challenge — how hard to push.
  const challengeByLevel: Record<string, string> = {
    conservative: 'We would keep this conservative — the next board should make surfing easier, not harder.',
    balanced: 'We would push you a step, not a leap: enough change to feel it, not enough to set you back.',
    progressive: 'We would push you properly here. You have the ability and the appetite for a more demanding board.',
    mixed: 'We would hold two directions open rather than force one, because your answers point both ways.',
    unclear: 'We would stay cautious until the picture is clearer.',
  }
  const challenge = challengeByLevel[signals.challenge_level.value]

  // Uncertainty — stated once, plainly, only when the profile is genuinely thin.
  const flags = signals.uncertainty_flags
  let uncertainty: string | null = null
  if (flags.length >= 2) {
    uncertainty =
      'Some of this is a read rather than a certainty — a few answers were non-specific, so treat the range below as wide on purpose.'
  } else if (flags.includes('insufficient_data') && profile.meta.flags.some((f) => f.type === 'missing_dimensions')) {
    uncertainty = 'Without your current board’s dimensions we are reading fit from feel alone, so the range stays wide.'
  }

  return {
    paragraphs,
    challenge,
    uncertainty,
    categoryLabel: CATEGORY_LABEL[d.category],
    categoryNote: isFallbackCategory(signals)
      ? 'sized against a standard shortboard, since your answers do not point clearly at one board type'
      : CATEGORY_NOTE[d.category],
  }
}
