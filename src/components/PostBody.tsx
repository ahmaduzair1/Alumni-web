const MARKERS = ['What is being done:', 'What not to do:', 'How to apply:'] as const

export function composePost(parts: {
  intro?: string
  doing?: string
  notDoing?: string
  apply?: string
}): string {
  const blocks: string[] = []
  if (parts.intro?.trim()) blocks.push(parts.intro.trim())
  if (parts.doing?.trim()) blocks.push(`What is being done:\n${parts.doing.trim()}`)
  if (parts.notDoing?.trim()) blocks.push(`What not to do:\n${parts.notDoing.trim()}`)
  if (parts.apply?.trim()) blocks.push(`How to apply:\n${parts.apply.trim()}`)
  return blocks.join('\n\n').slice(0, 4000)
}

export function PostBody({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean)
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
      {blocks.map((block) => {
        const marker = MARKERS.find((item) => block.startsWith(item))
        if (!marker) return <p key={block}>{block}</p>
        const value = block.slice(marker.length).trim()
        return (
          <div key={marker}>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text)]">{marker.replace(':', '')}</p>
            <p className="mt-1">{value}</p>
          </div>
        )
      })}
    </div>
  )
}
