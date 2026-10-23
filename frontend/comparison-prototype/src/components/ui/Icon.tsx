import type { ReactElement, SVGProps } from 'react'

/**
 * Two kinds of mark live here, and they are not interchangeable.
 *
 * AFFORDANCES mark something you can do — close, send, zoom. They are the
 * original set.
 *
 * MEASURES mark what a fact IS, for the profile's facts block. These are drawn
 * from the things this product actually measures — a rule, a waterline, a
 * swell, a board, a ride — rather than borrowed from a general UI set. A
 * dumbbell beside the word "Fitness" would say nothing the word does not; a
 * rising set of swell lines says "more of this per week" on sight.
 */
type Name =
  | 'close'
  | 'arrow-left'
  | 'chat'
  | 'zoom-in'
  | 'zoom-out'
  | 'check'
  | 'minimize'
  | 'send'
  | 'bookmark'
  | 'directions'
  | 'message'
  | 'pencil'
  | 'height'
  | 'weight'
  | 'fitness'
  | 'conditions'
  | 'board'
  | 'ride'

const paths: Record<Name, ReactElement> = {
  close: <path d="M5 5l10 10M15 5L5 15" />,
  'arrow-left': <path d="M12.5 4.5L7 10l5.5 5.5M7 10h9" />,
  chat: <path d="M4 5.5h12v8H9l-3.5 3v-3H4z" />,
  'zoom-in': <path d="M9 4a5 5 0 100 10A5 5 0 009 4zm3.6 8.6L16 16M9 7v4M7 9h4" />,
  'zoom-out': <path d="M9 4a5 5 0 100 10A5 5 0 009 4zm3.6 8.6L16 16M7 9h4" />,
  check: <path d="M4.5 10.5l3.5 3.5 7.5-8" />,
  minimize: <path d="M5 10h10" />,
  send: <path d="M4 10l12-6-4 12-2.5-4.5L4 10z" />,
  bookmark: <path d="M6 3.5h8v13l-4-3-4 3z" />,
  directions: <path d="M10 3l7 7-7 7-7-7 7-7zm-1.5 5h3.5v3.5M12 8l-4 4" />,
  message: <path d="M3.5 5.5h13v9h-13zM3.5 5.5L10 11l6.5-5.5" />,
  pencil: <path d="M13.5 3.5l3 3-9 9-4 1 1-4 9-9zM12 5l3 3" />,
  // A measuring rule stood on end, with its graduations — height is the one
  // fact here that is literally read off a stick.
  height: <path d="M6.5 2.5h7v15h-7zM6.5 6h3M6.5 10h4M6.5 14h3" />,
  // A waterline with the mass sitting in it. Weight matters here because of
  // what it does to flotation, so it is drawn as displacement, not as a scale.
  weight: <path d="M2.5 13.5c2 0 2-1.4 4-1.4s2 1.4 4 1.4 2-1.4 4-1.4 2 1.4 3 1.4M10 3.5v6M7 6.5l3-3 3 3" />,
  // Swell lines rising left to right: more sessions, more of this.
  fitness: <path d="M3.5 13.5v3M7.5 10.5v6M11.5 7.5v9M15.5 4.5v12" />,
  // One wave with a face and a lip — the shape the conditions question asks
  // you to recognise.
  conditions: <path d="M2 14.5c3.5 0 5-9 9-9 3 0 4.5 2.5 4.5 5 0 1.6-1.2 2.6-2.4 2.6-1.1 0-2.1-.8-2.1-2M2 17h16" />,
  // A board in plan view, nose up, with its stringer.
  board: <path d="M10 2.5c2.6 2.9 3.6 6 3.6 8.2 0 3.6-1.8 5.6-3.6 6.8-1.8-1.2-3.6-3.2-3.6-6.8C6.4 8.5 7.4 5.4 10 2.5zM10 5.5v9" />,
  // The ride line: a turn linked across a face.
  ride: <path d="M2.5 5.5c4.5 0 4 7 8 5.4 3.2-1.3 3 3.1 7 1.6" />,
}

export function Icon({ name, size = 16, ...rest }: { name: Name; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
