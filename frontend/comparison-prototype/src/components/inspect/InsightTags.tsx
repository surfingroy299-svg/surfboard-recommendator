export function InsightTags({ tags }: { tags: string[] }) {
  return (
    <ul className="tags" aria-label="What stands out">
      {tags.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
    </ul>
  )
}
