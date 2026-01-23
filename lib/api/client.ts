export type ApiErrorDetail = {
  field?: string
  reason?: string
}

export type ApiErrorPayload = {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: ApiErrorDetail[]

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: ApiErrorDetail[]
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    if (code !== undefined) {
      this.code = code
    }
    if (details !== undefined) {
      this.details = details
    }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    return path
  }
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`
  }
  return `${API_BASE_URL}/${path}`
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined
    try {
      payload = (await response.json()) as ApiErrorPayload
    } catch {
      payload = undefined
    }

    const message = payload?.error?.message ?? response.statusText
    const code = payload?.error?.code
    const details = payload?.error?.details

    throw new ApiError(
      message || "Request failed",
      response.status,
      code,
      details
    )
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}
