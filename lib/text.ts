export function truncateText(text: string, maxLength: number) {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }
  return `${trimmed.slice(0, maxLength)}...`
}

export function splitViewpoints(content: string) {
  const trimmed = content.trim()
  if (!trimmed) {
    return ["", "", ""]
  }

  const parts = trimmed.split(/\n\s*\n/)
  if (parts.length <= 3) {
    return [parts[0] ?? "", parts[1] ?? "", parts[2] ?? ""]
  }

  return [parts[0] ?? "", parts[1] ?? "", parts.slice(2).join("\n\n")]
}

export function joinViewpoints(values: string[]) {
  return values
    .map(value => value.trim())
    .filter(Boolean)
    .join("\n\n")
}
