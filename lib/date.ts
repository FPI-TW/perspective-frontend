export function getLocalDateString(date: Date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

export function formatAbsoluteTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const diffMs = Date.now() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) {
    return "剛剛"
  }

  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60)
    return `${minutes} 分鐘前`
  }

  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600)
    return `${hours} 小時前`
  }

  const days = Math.floor(diffSeconds / 86400)
  if (days <= 7) {
    return `${days} 天前`
  }

  return formatAbsoluteTime(value)
}
