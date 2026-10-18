import type { ReactNode } from 'react'
import type { StateId } from '../../data/types'

interface Props {
  id: StateId
  index: number
  title: string
  lede: string
  children: ReactNode
  className?: string
}

/** Shared shell for the three comparison states: same header rhythm, same container. */
export function StateSection({ id, index, title, lede, children, className = '' }: Props) {
  return (
    <section id={id} className={`state ${className}`.trim()} aria-labelledby={`${id}-title`}>
      <header className="state__head">
        <p className="eyebrow">
          <span className="eyebrow__index">0{index}</span>
          <span>{title}</span>
        </p>
        <h2 id={`${id}-title`} className="state__title">
          {lede}
        </h2>
      </header>
      {children}
    </section>
  )
}
