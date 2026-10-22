import type { Q8Value } from '../../logic/questions'

/**
 * The second primitive: a wave face and a ride line across it.
 *
 * Q8's answers are an ordered ability ladder — the rung the surfer picks sets
 * band and sub-level — but nothing in the text reveals that ordering. Drawing
 * the line a surfer takes across the face makes the progression visible,
 * because the trajectory *is* the ability: straight to shore, then along the
 * face, then a turn, then turns that link, then turns that flow, then a closed
 * manoeuvre that returns to the power source.
 *
 * Diagrams, not decoration: every line here says what the sentence beside it
 * says.
 */

const FACE = 'M 4 16 Q 44 6 86 24 T 138 52'

/**
 * Ride lines, lowest rung to highest. Same face under all six.
 *
 * Amplitude carries rungs 1–5: each turns more, and more often, than the one
 * below it. Drawn shallow they all read alike at list size, so the differences
 * are deliberately exaggerated — this is a diagram of ability, not a plot of a
 * real ride.
 *
 * The top rung cannot use amplitude, because rung 5 has already spent it: the
 * two were previously the SAME path string, which is why the top of the ladder
 * was illegible. Its distinction is topological instead — a roundhouse reverses
 * and crosses its own track, which is a different KIND of line and stays
 * readable at 66px where one more wiggle would not.
 */
const RIDE: Record<Q8Value, string> = {
  // Straight toward the beach: no use made of the face at all.
  can_stand_ride_straight: 'M 30 26 L 46 70',
  // Angled across the face instead of down it, but still one line.
  can_ride_face: 'M 18 28 L 126 60',
  // One clear change of direction.
  can_make_basic_turns: 'M 16 28 C 42 28 46 60 72 54 Q 94 49 108 62',
  // Two turns joined without losing the wave.
  can_link_turns: 'M 14 27 C 36 27 38 58 60 50 C 82 42 84 66 110 58',
  // Three, with speed held through the middle.
  can_link_turns_smoothly: 'M 12 26 C 32 26 32 56 52 46 C 72 36 72 64 92 55 C 110 47 112 66 132 57',
  // A roundhouse cutback: drive down the line, carve back toward the foam,
  // rebound off it and come out going forward again. The track crosses itself.
  can_position_strategically:
    'M 10 24 C 30 24 48 42 70 48 C 96 54 108 32 86 22 C 66 12 54 32 74 44 C 90 52 106 56 128 60',
}

export function WaveGlyph({ rung, className = '' }: { rung: Q8Value; className?: string }) {
  return (
    <svg className={`wglyph ${className}`.trim()} viewBox="0 0 142 74" aria-hidden="true" focusable="false">
      <path className="wglyph__face" d={FACE} />
      <path className="wglyph__ride" d={RIDE[rung]} />
    </svg>
  )
}
