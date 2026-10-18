import { boards } from '../../data/boards'
import { boardAssets } from '../../data/assets'
import { StateSection } from './StateSection'
import { BoardFigure } from '../board/BoardFigure'
import { BoardVisual } from '../board/BoardVisual'
import { FinGlyph } from '../tailfins/FinGlyph'
import { emphasisFor, useComparison } from '../../state/comparisonState'

export function TailFinsState() {
  const { state } = useComparison()
  return (
    <StateSection id="tail-fins" index={3} title="Tail & Fins" lede="The two choices you can see at a glance, and what each one does to a turn.">
      <div className="tailfins">
        {boards.map((board) => (
          <BoardFigure
            key={board.id}
            board={board}
            inspectView="bottom"
            className="tailfins__col"
            visual={
              boardAssets[board.id].tail ? (
                <BoardVisual boardId={board.id} view="tail" emphasis={emphasisFor(state.focusedBoardId, board.id)} decorative />
              ) : (
                <BoardVisual
                  boardId={board.id}
                  view="bottom"
                  crop={boardAssets[board.id].tailCrop}
                  emphasis={emphasisFor(state.focusedBoardId, board.id)}
                  decorative
                />
              )
            }
          >
            <div className="tailfins__text">
              <h3 className="board__name board__name--sm">{board.model}</h3>
              <dl className="facts">
                <div className="fact">
                  <dt className="fact__term">Tail</dt>
                  <dd className="fact__value">{board.tailFins.tail}</dd>
                  <dd className="fact__why">{board.tailFins.tailExplanation}</dd>
                </div>
                <div className="fact">
                  <dt className="fact__term">Fins</dt>
                  <dd className="fact__value fact__value--withglyph">
                    <FinGlyph layout={board.tailFins.finLayout} />
                    <span>{board.tailFins.finSetup}</span>
                  </dd>
                  <dd className="fact__why">{board.tailFins.finExplanation}</dd>
                </div>
              </dl>
            </div>
          </BoardFigure>
        ))}
      </div>
    </StateSection>
  )
}
