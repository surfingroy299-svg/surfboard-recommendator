import type { Board } from '../../data/types'

export function SpecGrid({ board }: { board: Board }) {
  const cells: Array<[string, string]> = [
    ['Length', board.dimensions.length],
    ['Width', board.dimensions.width],
    ['Thickness', board.dimensions.thickness],
    ['Volume', board.dimensions.volume],
    ['Construction', board.construction],
    ['Tail', board.tailFins.tail],
    ['Fin setup', board.tailFins.finSetup],
  ]
  return (
    <dl className="specgrid" aria-label="Specifications">
      {cells.map(([term, value]) => (
        <div key={term} className="specgrid__cell">
          <dt className="specgrid__term">{term}</dt>
          <dd className="specgrid__value mono">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
