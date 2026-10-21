import { useMemo } from 'react'
import { boards } from '../../data/boards'
import { StateSection } from './StateSection'
import { OutlineOverlay, TailDetail } from '../outline/BoardOutline'
import { outlineFor } from '../outline/boardOutlineData'
import { useComparison } from '../../state/comparisonState'

/**
 * Outline: all three boards overlaid so the difference in shape is a single
 * glance rather than three sets of numbers.
 *
 * Mostly visual on purpose — the shapes carry the comparison, the legend just
 * names them and states where the drawing is exact and where it is not.
 */
export function OutlineState() {
  const { state, dispatch } = useComparison()
  const data = useMemo(() => boards.map(outlineFor), [])

  return (
    <StateSection
      id="outline"
      index={2}
      title="Outline"
      lede="Laid over each other and lined up at the tail, the three shapes stop being specifications."
    >
      <div className="outlines">
        <div className="outlines__stage">
          <OutlineOverlay boards={data} focused={state.focusedBoardId} />
        </div>

        <div className="outlines__side">
          <figure className="outlines__detail">
            <TailDetail boards={data} focused={state.focusedBoardId} />
            <figcaption className="outlines__detailcap mono">Tails, enlarged</figcaption>
          </figure>

          <ul className="outlines__legend">
          {data.map((d) => (
            <li
              key={d.id}
              className="okey"
              data-board={d.id}
              data-emphasis={state.focusedBoardId && state.focusedBoardId !== d.id ? 'dim' : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') dispatch({ type: 'focusBoard', boardId: d.id })
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') dispatch({ type: 'focusBoard', boardId: null })
              }}
            >
              <span className="okey__swatch" aria-hidden="true" />
              <span className="okey__name">{d.label}</span>
              <span className="okey__tail">{d.tailDisplay} tail</span>
              <span className="okey__dims mono">
                {d.lengthDisplay} × {d.widthDisplay} · {d.volume}
              </span>
            </li>
            ))}
          </ul>
        </div>

        <p className="outlines__note mono">
          Length and width to scale · aligned at the tail · curve between those points is drawn, not measured
        </p>
      </div>
    </StateSection>
  )
}
