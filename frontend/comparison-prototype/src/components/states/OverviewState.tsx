import { boards } from '../../data/boards'
import { StateSection } from './StateSection'
import { BoardFigure } from '../board/BoardFigure'
import { BoardVisual } from '../board/BoardVisual'
import { CharacteristicScale } from '../overview/CharacteristicScale'
import { emphasisFor, useComparison } from '../../state/comparisonState'

/**
 * The shortlist, and how the three boards differ.
 *
 * Reading four scales across three columns means looking away from one board
 * to hold another in your head. So one board at a time becomes the BASELINE,
 * and the other two draw the difference against it directly on their own
 * scales. The baseline comes from whatever the input method already provides:
 * hover for a mouse, focus for a keyboard, and an explicit control for touch,
 * which has neither.
 */
export function OverviewState() {
  const { state, dispatch } = useComparison()

  // A pinned baseline wins over a hovered one: it was chosen deliberately, and
  // on touch it is the only one there is.
  const baselineId = state.baselineBoardId ?? state.focusedBoardId
  const baselineBoard = baselineId ? (boards.find((b) => b.id === baselineId) ?? null) : null

  return (
    <StateSection id="overview" index={1} title="Overview" lede="Three boards on your shortlist. Each one rides differently.">
      <div className="overview" data-comparing={baselineBoard ? 'true' : undefined}>
        {boards.map((board) => {
          const isBaseline = baselineBoard?.id === board.id
          return (
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
                    <CharacteristicScale
                      key={c.key}
                      characteristic={c}
                      baseline={
                        baselineBoard && !isBaseline
                          ? {
                              level: baselineBoard.characteristics.find((x) => x.key === c.key)!.level,
                              model: baselineBoard.model,
                            }
                          : null
                      }
                    />
                  ))}
                </div>
                {/*
                  Touch only — see .overview__pin. A tap anywhere else on this
                  unit opens Inspect, so the baseline needs a control of its
                  own rather than a gesture competing with that one.
                */}
                <button
                  type="button"
                  className="overview__pin mono"
                  aria-pressed={isBaseline}
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: 'setBaseline', boardId: board.id })
                  }}
                >
                  {isBaseline ? 'Comparing to this' : 'Compare to this'}
                </button>
                <p className="board__availability">
                  <span className={`dot dot--${board.store.availability === 'In stock' ? 'ok' : 'low'}`} aria-hidden="true" />
                  {board.store.availability} · {board.store.name}
                </p>
              </div>
            </BoardFigure>
          )
        })}
      </div>
    </StateSection>
  )
}
