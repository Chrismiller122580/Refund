export function getValueAtPath(source: unknown, path: string): unknown {
  if (!path.trim()) return undefined

  const segments = path.split('.').map((segment) => segment.trim()).filter(Boolean)
  let current: unknown = source

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}