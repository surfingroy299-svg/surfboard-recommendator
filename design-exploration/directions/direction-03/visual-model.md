# Direction 03 — Visual Model

Independent visual system (no sharing with 01/02).

- **Palette:** sun-bleached court colors — sand field `#F2E7D3`, hot coral
  `#FF5A36` (eject, energy), deep water blue `#173FA6` (lock, structure),
  lime chalk `#D6F25F` (swap-in highlights); boards in saturated duotones
  (each board gets one color + cream deck) so they read as *pieces*, not
  products. Ink `#191713`. Contrast pairs verified in build.
- **Typography:** Archivo Black for slot roles, stamps, and delta tags
  (oversized, poster-like); Space Mono for the boarding-pass dims (tabular);
  short punchy copy everywhere — this direction talks in tags, not
  paragraphs.
- **Environment:** a flat color field table seen slightly from above; slots
  drawn as painted court markings; the groove along one edge is where
  replacements arrive. No room, no horizon — graphic space, not a place.
- **Lighting:** flat and bright with one strong soft shadow per board (mass
  cue); no atmospheric lighting — form reads via duotone shading + shadow,
  and via *motion* (the spin shows the outline; honesty note: duotone
  deliberately avoids implying surface detail we don't have).
- **Materials:** matte toy-like finish; clamps and eject rings are chunky
  graphic hardware; tags are printed cardstock.
- **Controls:** court markings, clamps, rings, chips — hardware on the table,
  never floating panels. The only floating DOM is the face card, which docks
  to the table edge.
- **Motion language:** springy and fast — grabs 250ms spring with slight
  overshoot, spins with momentum→snap, ejects ~500ms arc off-screen, swap-ins
  slide with a single bounce. Exit animations shorter than entries. Nothing
  idles or floats at rest (calm-enough-to-use rule). Reduced motion: all
  springs → 150ms fades, spins → stepped faces.
- **DOM ↔ boards relationship:** boards are the pieces, DOM is the printed
  matter *on* the game (tags, cards, stamps). The game furniture is the
  interface.
