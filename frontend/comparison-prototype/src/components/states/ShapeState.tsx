import { useState } from 'react'
import { boards } from '../../data/boards'
import { StateSection } from './StateSection'
import { BoardFigure } from '../board/BoardFigure'
import { BoardVisual } from '../board/BoardVisual'
import { GeometryAnnotation } from '../shape/GeometryAnnotation'
import { emphasisFor, useComparison } from '../../state/comparisonState'
import type { BoardId } from '../../data/types'

type Callout = 'rocker' | 'thickness'

export function ShapeState() {
  const { state } = useComparison()
  const [hot, setHot] = useState<{ id: BoardId; callout: Callout } | null>(null)

  return (
    <StateSection
      id="shape"
      index={3}
      title="Rocker"
      lede="Seen from the side, two things decide how each board enters a wave and carries foam."
    >
      <div className="shape">
        {boards.map((board) => (
          <BoardFigure
            key={board.id}
            board={board}
            inspectView="side"
            className="shape__row"
            header={
              <header className="shape__head">
                <h3 className="board__name board__name--sm">{board.model}</h3>
                <p className="board__dims mono">
                  {board.dimensions.length} · {board.dimensions.thickness} thick
                </p>
              </header>
            }
            visual={
              <div className="shape__stage">
                <BoardVisual boardId={board.id} view="side" emphasis={emphasisFor(state.focusedBoardId, board.id)} decorative />
                <GeometryAnnotation shape={board.shape} active={hot?.id === board.id ? hot.callout : null} />
              </div>
            }
          >
            <div className="shape__rail">
              <dl className="callouts">
                <div
                  className="callout"
                  onPointerEnter={() => setHot({ id: board.id, callout: 'rocker' })}
                  onPointerLeave={() => setHot(null)}
                >
                  <dt className="callout__term">Nose rocker</dt>
                  <dd className="callout__value">{board.shape.noseRocker.descriptor}</dd>
                  <dd className="callout__why">{board.shape.noseRocker.implication}</dd>
                </div>
                <div
                  className="callout"
                  onPointerEnter={() => setHot({ id: board.id, callout: 'thickness' })}
                  onPointerLeave={() => setHot(null)}
                >
                  <dt className="callout__term">Max thickness</dt>
                  <dd className="callout__value">
                    <span className="mono">{board.shape.maxThickness.value}</span> · {board.shape.maxThickness.position}
                  </dd>
                  <dd className="callout__why">{board.shape.maxThickness.implication}</dd>
                </div>
              </dl>
            </div>
          </BoardFigure>
        ))}
        <p className="shape__legend mono">
          <span className="shape__legend-mark shape__legend-mark--bracket" aria-hidden="true" /> rocker region
          <span className="shape__legend-mark shape__legend-mark--tick" aria-hidden="true" /> thickest point · nose points right
        </p>
      </div>
    </StateSection>
  )
}
