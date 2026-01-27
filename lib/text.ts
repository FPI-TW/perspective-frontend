export function truncateText(text: string, maxLength: number) {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }
  return `${trimmed.slice(0, maxLength)}...`
}

export function joinViewpoints(values: string[]) {
  return values
    .map(value => value.trim())
    .filter(Boolean)
    .join("\n\n")
}
