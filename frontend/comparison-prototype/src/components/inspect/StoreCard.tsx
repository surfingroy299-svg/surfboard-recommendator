import { useComparison } from '../../state/comparisonState'
import type { Board } from '../../data/types'
import { Icon } from '../ui/Icon'

export function StoreCard({ board }: { board: Board }) {
  const { state, dispatch } = useComparison()
  const saved = state.savedBoardIds.includes(board.id)
  const { store } = board
  const toast = (message: string) => dispatch({ type: 'toast', message })
  return (
    <section className="store" aria-labelledby="store-title">
      <div className="store__head">
        <div>
          <p className="eyebrow eyebrow--plain">Available at</p>
          <h3 id="store-title" className="store__name">
            {store.name}
          </h3>
          <p className="store__area">
            {store.area} · {store.note}
          </p>
        </div>
        <p className={`store__availability store__availability--${store.availability === 'In stock' ? 'ok' : 'low'}`}>
          <span className="dot" aria-hidden="true" />
          {store.availability}
        </p>
      </div>
      <p className="store__config mono">
        {board.model} · {board.dimensions.length} · {board.dimensions.volume} · {board.construction}
      </p>
      <div className="store__actions">
        <button type="button" className="btn btn--ghost" onClick={() => toast(`Message to ${store.name} drafted (demo)`)}>
          <Icon name="message" />
          Contact seller
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => toast(`Directions to ${store.name} (demo)`)}>
          <Icon name="directions" />
          Directions
        </button>
        <button
          type="button"
          className={`btn ${saved ? 'btn--saved' : 'btn--primary'}`}
          aria-pressed={saved}
          onClick={() => {
            dispatch({ type: 'toggleSaved', boardId: board.id })
            toast(saved ? `${board.model} removed from saved` : `${board.model} saved`)
          }}
        >
          <Icon name={saved ? 'check' : 'bookmark'} />
          {saved ? 'Saved' : 'Save board'}
        </button>
      </div>
    </section>
  )
}
