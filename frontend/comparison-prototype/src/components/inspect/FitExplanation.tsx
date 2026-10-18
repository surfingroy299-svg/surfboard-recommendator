import type { InspectContent } from '../../data/types'

export function FitExplanation({ content }: { content: InspectContent }) {
  const blocks: Array<[string, string]> = [
    ['Why it fits you', content.whyItFits],
    ["What you'll notice", content.whatYoullNotice],
    ['Trade-off', content.tradeOff],
  ]
  return (
    <div className="fit">
      {blocks.map(([title, body]) => (
        <section key={title} className="fit__block">
          <h3 className="fit__title">{title}</h3>
          <p className="fit__body">{body}</p>
        </section>
      ))}
    </div>
  )
}
