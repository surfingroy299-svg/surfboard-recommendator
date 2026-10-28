import type { ReactElement, SVGProps } from 'react'

/**
 * Two kinds of mark live here, and they are not interchangeable.
 *
 * AFFORDANCES mark something you can do — close, send, zoom. They are the
 * original set.
 *
 * MEASURES mark what a fact IS, for the profile's facts block. These are drawn
 * from the things this product actually measures — a rule, a waterline, a
 * swell, a board — rather than borrowed from a general UI set. A
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
  | 'location'

const paths: Record<Name, ReactElement> = {
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'arrow-left': <path d="M15 5.4L8.4 12l6.6 6.6M8.4 12h10.8" />,
  chat: <path d="M4.8 6.6h14.4v9.6H10.8l-4.2 3.6v-3.6H4.8z" />,
  // These two are redrawn rather than rescaled. The originals used SVG's
  // compressed arc-flag form ("100" = flags 1 and 0, then the number 0), which
  // no tokenizer can split safely — so every flag here is written separately.
  'zoom-in': (
    <path d="M4.8 10.8a6 6 0 1 0 12 0 6 6 0 1 0-12 0M15.05 15.05L19.2 19.2M10.8 8.4v4.8M8.4 10.8h4.8" />
  ),
  'zoom-out': <path d="M4.8 10.8a6 6 0 1 0 12 0 6 6 0 1 0-12 0M15.05 15.05L19.2 19.2M8.4 10.8h4.8" />,
  check: <path d="M5.4 12.6l4.2 4.2 9 -9.6" />,
  minimize: <path d="M6 12h12" />,
  send: <path d="M4.8 12l14.4 -7.2 -4.8 14.4 -3 -5.4L4.8 12z" />,
  bookmark: <path d="M7.2 4.2h9.6v15.6l-4.8 -3.6 -4.8 3.6z" />,
  directions: <path d="M12 3.6l8.4 8.4 -8.4 8.4 -8.4 -8.4 8.4 -8.4zm-1.8 6h4.2v4.2M14.4 9.6l-4.8 4.8" />,
  message: <path d="M4.2 6.6h15.6v10.8h-15.6zM4.2 6.6L12 13.2l7.8 -6.6" />,
  pencil: <path d="M16.2 4.2l3.6 3.6 -10.8 10.8 -4.8 1.2 1.2 -4.8 10.8 -10.8zM14.4 6l3.6 3.6" />,
  // A measuring rule stood on end, with its graduations — height is the one
  // fact here that is literally read off a stick.
  height: <path d="M7.8 3h8.4v18h-8.4zM7.8 7.2h3.6M7.8 12h4.8M7.8 16.8h3.6" />,
  // A waterline with the mass sitting in it. Weight matters here because of
  // what it does to flotation, so it is drawn as displacement, not as a scale.
  weight: <path d="M3 16.2c2.4 0 2.4 -1.68 4.8 -1.68s2.4 1.68 4.8 1.68 2.4 -1.68 4.8 -1.68 2.4 1.68 3.6 1.68M12 4.2v7.2M8.4 7.8l3.6 -3.6 3.6 3.6" />,
  // Swell lines rising left to right: more sessions, more of this.
  fitness: <path d="M4.2 16.2v3.6M9 12.6v7.2M13.8 9v10.8M18.6 5.4v14.4" />,
  // One wave with a face and a lip — the shape the conditions question asks
  // you to recognise.
  conditions: <path d="M2.4 17.4c4.2 0 6 -10.8 10.8 -10.8 3.6 0 5.4 3 5.4 6 0 1.92 -1.44 3.12 -2.88 3.12 -1.32 0 -2.52 -0.96 -2.52 -2.4M2.4 20.4h19.2" />,
  // A board in plan view, nose up, with its stringer.
  board: <path d="M12 3c3.12 3.48 4.32 7.2 4.32 9.84 0 4.32 -2.16 6.72 -4.32 8.16 -2.16 -1.44 -4.32 -3.84 -4.32 -8.16C7.68 10.2 8.88 6.48 12 3zM12 6.6v10.8" />,
  /**
   * BORROWED — Heroicons 24/outline "map-pin" (MIT, © Tailwind Labs).
   *
   * The one mark here that is not drawn for this product. No surf-native shape
   * means "a place", and inventing one would read worse than borrowing a
   * familiar one. It needs no adjustment: the house marks were rescaled onto
   * Heroicons' own 24 grid, so this and everything beside it stroke the same.
   */
  location: (
    <>
      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </>
  ),
}

export function Icon({ name, size = 16, ...rest }: { name: Name; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
