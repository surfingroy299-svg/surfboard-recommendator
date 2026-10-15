import { boards } from '../../data/boards'
import { StateSection } from './StateSection'
import { BoardFigure } from '../board/BoardFigure'
import { BoardVisual } from '../board/BoardVisual'
import { CharacteristicScale } from '../overview/CharacteristicScale'
import { emphasisFor, useComparison } from '../../state/comparisonState'

export function OverviewState() {
  const { state } = useComparison()
  return (
    <StateSection id="overview" index={1} title="Overview" lede="Three boards that fit your target zone. Each one rides differently.">
      <div className="overview">
        {boards.map((board) => (
          <BoardFigure
            key={board.id}
            board={board}
            inspectView="deck"
            className="overview__col"
            visual={<BoardVisual boardId={board.id} view="deck" emphasis={emphasisFor(state.focusedBoardId, board.id)} decorative />}
          >
            <div className="overview__text">
              <h3 className="board__name">{board.model}</h3>
              <p className="board__dims mono">
                {board.dimensions.length} × {board.dimensions.width} × {board.dimensions.thickness} · {board.dimensions.volume}
              </p>
              <p className="board__construction">{board.construction}</p>
              <p className="board__summary">{board.summary}</p>
              <div className="overview__scales">
                {board.characteristics.map((c) => (
                  <CharacteristicScale key={c.key} characteristic={c} />
                ))}
              </div>
              <p className="board__availability">
                <span className={`dot dot--${board.store.availability === 'In stock' ? 'ok' : 'low'}`} aria-hidden="true" />
                {board.store.availability} · {board.store.name}
              </p>
            </div>
          </BoardFigure>
        ))}
      </div>
    </StateSection>
  )
}
