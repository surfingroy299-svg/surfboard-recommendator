// Neutral launcher — deliberately plain so it doesn't bias the comparison.
// No direction imports any of this styling.
export function Launcher() {
  const dirs = [
    {
      href: '#/direction-01',
      num: '01',
      name: 'The Shaping Bay',
      territory: 'warm · spatial · intuitive',
      line: 'A craftsman walks you through your boards under a work lamp.',
    },
    {
      href: '#/direction-02',
      num: '02',
      name: 'The Measure Room',
      territory: 'calm · precise · controlled',
      line: 'Your boards as living measured drawings on a light-table.',
    },
    {
      href: '#/direction-03',
      num: '03',
      name: 'The Quiver Deck',
      territory: 'playful · energetic · experimental',
      line: 'Lock what you love, eject what you don’t — Coolors made spatial.',
    },
  ]
  return (
    <div
      style={{
        minHeight: '100%',
        background: '#101113',
        color: '#e8e6e1',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a8d93', margin: 0 }}>
        Surfboard Recommendator — design exploration
      </p>
      <h1 style={{ font: '600 28px Inter, sans-serif', margin: '12px 0 8px' }}>Three directions, one scenario</h1>
      <p style={{ color: '#9b9ea5', fontSize: 14, maxWidth: 560, textAlign: 'center', lineHeight: 1.6, margin: '0 0 36px' }}>
        Same mock surfer (Noa, 72&nbsp;kg — upper-intermediate, weak waves), same three recommended boards, same 21-step
        scenario. Only the product experience changes. Mock data is source-cited; approximations are labeled in each
        prototype.
      </p>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {dirs.map((d) => (
          <a
            key={d.num}
            href={d.href}
            style={{
              display: 'block',
              width: 280,
              padding: '24px 22px 20px',
              border: '1px solid #2c2e33',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
              background: '#17181b',
            }}
          >
            <div style={{ fontSize: 12, color: '#8a8d93', marginBottom: 14 }}>Direction {d.num}</div>
            <div style={{ font: '600 20px Inter, sans-serif', marginBottom: 6 }}>{d.name}</div>
            <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7d8087', marginBottom: 12 }}>
              {d.territory}
            </div>
            <div style={{ fontSize: 13.5, color: '#b9bcc2', lineHeight: 1.55 }}>{d.line}</div>
          </a>
        ))}
      </div>
      <p style={{ color: '#63666c', fontSize: 12, marginTop: 40, maxWidth: 620, textAlign: 'center', lineHeight: 1.6 }}>
        Review viewport: desktop ≈1440px. Board geometry is a visual approximation from real dimensions — never
        hydrodynamically accurate. Roles and replacement reasoning are prototype assumptions grounded in computed
        evaluations.
      </p>
    </div>
  )
}
